import { createClient } from '@vercel/kv';

// Create KV client - supports both standard and prefixed env var names
const kv = createClient({
  url: process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN,
});

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

  if (!id) {
    return res.status(400).json({ error: 'Wrap ID is required' });
  }

  try {
    const wrap = await kv.get(`wrap:${id}`);

    if (!wrap) {
      return res.status(404).json({ error: 'Wrap not found' });
    }

    // Return the wrap data
    return res.status(200).json(wrap);
  } catch (error) {
    console.error('Error retrieving wrap:', error);
    return res.status(500).json({
      error: 'Failed to retrieve wrap',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
