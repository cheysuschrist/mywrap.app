import { createClient } from '@vercel/kv';
import { getCurrentUser, FREE_TIER_LIMIT } from '../lib/auth.js';

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!kv) {
      return res.status(503).json({ error: 'Storage not configured' });
    }

    // Get user's wrap IDs (sorted by createdAt descending - newest first)
    const wrapIds = await kv.zrange(`user:${user.id}:wraps`, 0, -1, { rev: true });

    // Fetch wrap details for each ID
    const wraps = await Promise.all(
      wrapIds.map(async (wrapId) => {
        const wrapData = await kv.get(`wrap:${wrapId}`);
        if (!wrapData) {
          // Wrap might have expired, remove from index
          await kv.zrem(`user:${user.id}:wraps`, wrapId);
          return null;
        }
        // Return minimal data for list view
        return {
          id: wrapData.id,
          title: wrapData.title,
          dateRange: wrapData.dateRange,
          selectedMood: wrapData.selectedMood,
          coverImage: wrapData.coverImage,
          createdAt: wrapData.createdAt,
        };
      })
    );

    // Filter out nulls (expired wraps)
    const validWraps = wraps.filter(Boolean);

    return res.status(200).json({
      wraps: validWraps,
      count: validWraps.length,
      limit: user.tier === 'premium' ? null : FREE_TIER_LIMIT,
      tier: user.tier,
    });
  } catch (error) {
    console.error('[My Wraps] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch wraps' });
  }
}
