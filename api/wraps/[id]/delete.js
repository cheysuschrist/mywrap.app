import { createClient } from '@vercel/kv';
import { getCurrentUser } from '../../lib/auth.js';

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Wrap ID required' });
  }

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!kv) {
      return res.status(503).json({ error: 'Storage not configured' });
    }

    // Get the wrap to verify ownership
    const wrapData = await kv.get(`wrap:${id}`);

    if (!wrapData) {
      return res.status(404).json({ error: 'Wrap not found' });
    }

    // Check ownership
    if (wrapData.userId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this wrap' });
    }

    // Delete the wrap
    await kv.del(`wrap:${id}`);

    // Remove from user's wrap index
    await kv.zrem(`user:${user.id}:wraps`, id);

    console.log('[Delete Wrap] Deleted wrap:', id, 'for user:', user.id);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Delete Wrap] Error:', error);
    return res.status(500).json({ error: 'Failed to delete wrap' });
  }
}
