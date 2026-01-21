import { createClient } from '@vercel/kv';
import { nanoid } from 'nanoid';

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('[Auth] Missing GOOGLE_CLIENT_ID');
    return res.status(500).json({ error: 'OAuth not configured' });
  }

  // Generate state token for CSRF protection
  const state = nanoid(32);

  // Store state in Redis with 10-minute TTL
  if (kv) {
    await kv.set(`oauth_state:${state}`, { created: Date.now() }, { ex: 600 });
  }

  // Determine redirect URI based on environment
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.PRODUCTION_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  // Build Google OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'offline',
    prompt: 'consent',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Redirect to Google
  res.redirect(302, googleAuthUrl);
}
