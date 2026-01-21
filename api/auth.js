import { createClient } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { createToken, setAuthCookie, clearAuthCookie, getCurrentUser } from './lib/auth.js';

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

// Routes: /api/auth?action=google|callback|me|logout
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  switch (action) {
    case 'google':
      return handleGoogleRedirect(req, res);
    case 'callback':
      return handleGoogleCallback(req, res);
    case 'me':
      return handleMe(req, res);
    case 'logout':
      return handleLogout(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Initiate Google OAuth flow
async function handleGoogleRedirect(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('[Auth] Missing GOOGLE_CLIENT_ID');
    return res.status(500).json({ error: 'OAuth not configured' });
  }

  const state = nanoid(32);
  if (kv) {
    await kv.set(`oauth_state:${state}`, { created: Date.now() }, { ex: 600 });
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.PRODUCTION_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth?action=callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

// Handle Google OAuth callback
async function handleGoogleCallback(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error } = req.query;
  const frontendUrl = process.env.PRODUCTION_URL || 'http://localhost:5173';

  if (error) {
    console.error('[Auth Callback] OAuth error:', error);
    return res.redirect(302, `${frontendUrl}?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    console.error('[Auth Callback] Missing code or state');
    return res.redirect(302, `${frontendUrl}?auth_error=missing_params`);
  }

  if (kv) {
    const storedState = await kv.get(`oauth_state:${state}`);
    if (!storedState) {
      console.error('[Auth Callback] Invalid or expired state');
      return res.redirect(302, `${frontendUrl}?auth_error=invalid_state`);
    }
    await kv.del(`oauth_state:${state}`);
  }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.PRODUCTION_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth?action=callback`;

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

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('[Auth Callback] Failed to get user info');
      return res.redirect(302, `${frontendUrl}?auth_error=user_info_failed`);
    }

    const googleUser = await userInfoResponse.json();
    const userId = googleUser.id;
    const now = Date.now();

    let existingUser = null;
    if (kv) {
      existingUser = await kv.hgetall(`user:${userId}`);
    }

    if (existingUser) {
      await kv.hset(`user:${userId}`, {
        name: googleUser.name,
        picture: googleUser.picture,
        updatedAt: now,
      });
    } else {
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
        await kv.set(`email:${googleUser.email.toLowerCase()}`, userId);
      }
    }

    const finalUser = kv ? await kv.hgetall(`user:${userId}`) : {
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      tier: 'free',
    };

    const token = await createToken({
      sub: userId,
      email: finalUser.email,
      name: finalUser.name,
      picture: finalUser.picture,
      tier: finalUser.tier || 'free',
    });

    setAuthCookie(res, token);
    return res.redirect(302, `${frontendUrl}?auth_success=true`);

  } catch (error) {
    console.error('[Auth Callback] Error:', error);
    return res.redirect(302, `${frontendUrl}?auth_error=server_error`);
  }
}

// Get current user
async function handleMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      tier: user.tier,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    console.error('[Auth /me] Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Logout
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearAuthCookie(res);
  return res.status(200).json({ success: true });
}
