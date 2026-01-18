import { createClient } from '@vercel/kv';

// Create KV client - supports both standard and prefixed env var names
const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;

const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[API /notify/subscribe] Starting email subscription');
  console.log('[API /notify/subscribe] KV configured:', !!kv);

  if (!kv) {
    console.error('[API /notify/subscribe] Error: KV not configured');
    return res.status(503).json({
      error: 'Storage not configured',
      message: 'Please ensure KV environment variables are set.'
    });
  }

  try {
    const { email } = req.body;
    console.log('[API /notify/subscribe] Email received:', email ? email.substring(0, 3) + '***' : 'none');

    if (!email || !email.includes('@')) {
      console.log('[API /notify/subscribe] Invalid email');
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const exists = await kv.sismember('notify:emails', normalizedEmail);
    if (exists) {
      return res.status(200).json({ success: true, message: 'Already subscribed' });
    }

    // Add email to the set
    await kv.sadd('notify:emails', normalizedEmail);

    // Also store with timestamp for reference
    await kv.hset(`notify:email:${normalizedEmail}`, {
      email: normalizedEmail,
      subscribedAt: Date.now(),
    });

    console.log('[API /notify/subscribe] Email saved successfully');
    return res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('[API /notify/subscribe] Error:', error.message, error.stack);
    return res.status(500).json({
      error: 'Failed to subscribe',
      message: error.message,
    });
  }
}
