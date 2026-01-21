import { createClient } from '@vercel/kv';
import { createToken, setAuthCookie } from '../../lib/auth.js';

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error } = req.query;

  // Determine frontend URL for redirects
  const frontendUrl = process.env.PRODUCTION_URL || 'http://localhost:5173';

  // Handle OAuth errors
  if (error) {
    console.error('[Auth Callback] OAuth error:', error);
    return res.redirect(302, `${frontendUrl}?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    console.error('[Auth Callback] Missing code or state');
    return res.redirect(302, `${frontendUrl}?auth_error=missing_params`);
  }

  // Verify state token
  if (kv) {
    const storedState = await kv.get(`oauth_state:${state}`);
    if (!storedState) {
      console.error('[Auth Callback] Invalid or expired state');
      return res.redirect(302, `${frontendUrl}?auth_error=invalid_state`);
    }
    // Delete used state
    await kv.del(`oauth_state:${state}`);
  }

  try {
    // Exchange code for tokens
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.PRODUCTION_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[Auth Callback] Token exchange failed:', errorData);
      return res.redirect(302, `${frontendUrl}?auth_error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('[Auth Callback] Failed to get user info');
      return res.redirect(302, `${frontendUrl}?auth_error=user_info_failed`);
    }

    const googleUser = await userInfoResponse.json();
    const userId = googleUser.id;

    // Check if user exists in Redis
    let existingUser = null;
    if (kv) {
      existingUser = await kv.hgetall(`user:${userId}`);
    }

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await kv.hset(`user:${userId}`, {
        name: googleUser.name,
        picture: googleUser.picture,
        updatedAt: now,
      });
    } else {
      // Create new user
      const userData = {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        tier: 'free',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
        createdAt: now,
        updatedAt: now,
      };

      if (kv) {
        await kv.hset(`user:${userId}`, userData);
        // Also store email lookup
        await kv.set(`email:${googleUser.email.toLowerCase()}`, userId);
      }
    }

    // Get final user data for JWT
    const finalUser = kv ? await kv.hgetall(`user:${userId}`) : {
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      tier: 'free',
    };

    // Create JWT
    const token = await createToken({
      sub: userId,
      email: finalUser.email,
      name: finalUser.name,
      picture: finalUser.picture,
      tier: finalUser.tier || 'free',
    });

    // Set cookie and redirect
    setAuthCookie(res, token);
    return res.redirect(302, `${frontendUrl}?auth_success=true`);

  } catch (error) {
    console.error('[Auth Callback] Error:', error);
    return res.redirect(302, `${frontendUrl}?auth_error=server_error`);
  }
}
