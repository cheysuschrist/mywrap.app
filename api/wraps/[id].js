import { createClient } from '@vercel/kv';

// Create KV client - supports both standard and prefixed env var names
const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;

const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  console.log('[API /wraps/[id]] Fetching wrap:', id);
  console.log('[API /wraps/[id]] KV configured:', !!kv);

  if (!id) {
    console.log('[API /wraps/[id]] Error: No wrap ID provided');
    return res.status(400).json({ error: 'Wrap ID is required' });
  }

  if (!kv) {
    console.error('[API /wraps/[id]] Error: KV not configured - missing env vars');
    return res.status(503).json({
      error: 'Storage not configured',
      message: 'Please ensure KV_REST_API_URL and KV_REST_API_TOKEN are set in your Vercel environment variables.'
    });
  }

  try {
    const wrap = await kv.get(`wrap:${id}`);
    console.log('[API /wraps/[id]] Wrap found:', !!wrap);

    if (!wrap) {
      console.log('[API /wraps/[id]] Wrap not found for id:', id);
      return res.status(404).json({ error: 'Wrap not found' });
    }

    // Return the wrap data
    return res.status(200).json(wrap);
  } catch (error) {
    console.error('[API /wraps/[id]] Error retrieving wrap:', error.message, error.stack);
    return res.status(500).json({
      error: 'Failed to retrieve wrap',
      message: error.message,
    });
  }
}
