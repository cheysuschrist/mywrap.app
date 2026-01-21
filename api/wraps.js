import { createClient } from '@vercel/kv';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { getCurrentUser, getUserWrapCount, FREE_TIER_LIMIT } from './lib/auth.js';

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Helper to extract content type from base64 data URL
function getContentType(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

// Helper to upload a base64 image to Vercel Blob
async function uploadImage(dataUrl, wrapId, prefix) {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  const contentType = getContentType(dataUrl);
  const base64Data = dataUrl.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const extension = contentType.split('/')[1] || 'jpg';
  const filename = `wraps/${wrapId}/${prefix}-${nanoid(6)}.${extension}`;

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType,
  });

  return blob.url;
}

// Routes: /api/wraps?action=create|get|list|delete&id=xxx
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, id } = req.query;

  switch (action) {
    case 'create':
      return handleCreate(req, res);
    case 'get':
      return handleGet(req, res, id);
    case 'list':
      return handleList(req, res);
    case 'delete':
      return handleDelete(req, res, id);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Create a new wrap
async function handleCreate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[API /wraps/create] Starting wrap creation');

  if (!kv) {
    console.error('[API /wraps/create] Error: KV not configured');
    return res.status(503).json({ error: 'Storage not configured' });
  }

  const user = await getCurrentUser(req);
  let userId = null;
  let userTier = 'free';

  if (user) {
    userId = user.id;
    userTier = user.tier || 'free';

    if (userTier === 'free') {
      const wrapCount = await getUserWrapCount(userId);
      if (wrapCount >= FREE_TIER_LIMIT) {
        console.log('[API /wraps/create] Free user at limit:', userId, wrapCount);
        return res.status(403).json({
          error: 'Wrap limit reached',
          limitReached: true,
          count: wrapCount,
          limit: FREE_TIER_LIMIT,
        });
      }
    }
  }

  try {
    const { title, dateRange, selectedMood, stats, moments, badges, reflection, contentOrder, coverImage, selectedMusic, transitions } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = nanoid(10);

    let processedCoverImage = null;
    if (coverImage) {
      processedCoverImage = await uploadImage(coverImage, id, 'cover');
    }

    const processedStats = await Promise.all(
      (stats || []).map(async (stat, index) => {
        if (stat.image) {
          const imageUrl = await uploadImage(stat.image, id, `stat-${index}`);
          return { ...stat, image: imageUrl };
        }
        return stat;
      })
    );

    const processedMoments = await Promise.all(
      (moments || []).map(async (moment, index) => {
        if (moment.image) {
          const imageUrl = await uploadImage(moment.image, id, `moment-${index}`);
          return { ...moment, image: imageUrl };
        }
        return moment;
      })
    );

    const wrapData = {
      id,
      title,
      dateRange,
      selectedMood,
      stats: processedStats,
      moments: processedMoments,
      badges: badges || [],
      reflection: reflection || '',
      contentOrder: contentOrder || [],
      coverImage: processedCoverImage,
      selectedMusic: selectedMusic || '',
      transitions: transitions || {},
      createdAt: Date.now(),
      userId: userId,
      isPublic: true,
    };

    const ttlSeconds = (userId && userTier === 'premium') ? null : 60 * 60 * 24 * 365;

    if (ttlSeconds) {
      await kv.set(`wrap:${id}`, wrapData, { ex: ttlSeconds });
    } else {
      await kv.set(`wrap:${id}`, wrapData);
    }

    if (userId) {
      await kv.zadd(`user:${userId}:wraps`, { score: Date.now(), member: id });
    }

    const baseUrl = process.env.PRODUCTION_URL || 'https://mywrap.app';
    const shareUrl = `${baseUrl}/w/${id}`;

    return res.status(200).json({ success: true, id, url: shareUrl });
  } catch (error) {
    console.error('[API /wraps/create] Error:', error);
    return res.status(500).json({ error: 'Failed to save wrap', message: error.message });
  }
}

// Get a wrap by ID
async function handleGet(req, res, id) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Wrap ID is required' });
  }

  if (!kv) {
    return res.status(503).json({ error: 'Storage not configured' });
  }

  try {
    const wrap = await kv.get(`wrap:${id}`);

    if (!wrap) {
      return res.status(404).json({ error: 'Wrap not found' });
    }

    return res.status(200).json(wrap);
  } catch (error) {
    console.error('[API /wraps/get] Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve wrap' });
  }
}

// List user's wraps
async function handleList(req, res) {
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

    const wrapIds = await kv.zrange(`user:${user.id}:wraps`, 0, -1, { rev: true });

    const wraps = await Promise.all(
      wrapIds.map(async (wrapId) => {
        const wrapData = await kv.get(`wrap:${wrapId}`);
        if (!wrapData) {
          await kv.zrem(`user:${user.id}:wraps`, wrapId);
          return null;
        }
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

    const validWraps = wraps.filter(Boolean);

    return res.status(200).json({
      wraps: validWraps,
      count: validWraps.length,
      limit: user.tier === 'premium' ? null : FREE_TIER_LIMIT,
      tier: user.tier,
    });
  } catch (error) {
    console.error('[API /wraps/list] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch wraps' });
  }
}

// Delete a wrap
async function handleDelete(req, res, id) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const wrapData = await kv.get(`wrap:${id}`);

    if (!wrapData) {
      return res.status(404).json({ error: 'Wrap not found' });
    }

    if (wrapData.userId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this wrap' });
    }

    await kv.del(`wrap:${id}`);
    await kv.zrem(`user:${user.id}:wraps`, id);

    console.log('[Delete Wrap] Deleted wrap:', id, 'for user:', user.id);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Delete Wrap] Error:', error);
    return res.status(500).json({ error: 'Failed to delete wrap' });
  }
}
