import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

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
    return dataUrl; // Return as-is if not a base64 data URL
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

  try {
    const {
      title,
      dateRange,
      selectedMood,
      stats,
      moments,
      badges,
      reflection,
      contentOrder,
      coverImage,
      selectedMusic,
      transitions,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Generate unique ID (10 chars, URL-safe)
    const id = nanoid(10);

    // Upload cover image if present
    let processedCoverImage = null;
    if (coverImage) {
      processedCoverImage = await uploadImage(coverImage, id, 'cover');
    }

    // Process stats - upload any images
    const processedStats = await Promise.all(
      (stats || []).map(async (stat, index) => {
        if (stat.image) {
          const imageUrl = await uploadImage(stat.image, id, `stat-${index}`);
          return { ...stat, image: imageUrl };
        }
        return stat;
      })
    );

    // Process moments - upload any images
    const processedMoments = await Promise.all(
      (moments || []).map(async (moment, index) => {
        if (moment.image) {
          const imageUrl = await uploadImage(moment.image, id, `moment-${index}`);
          return { ...moment, image: imageUrl };
        }
        return moment;
      })
    );

    // Store wrap data in KV
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
    };

    // Store with 1 year TTL (in seconds)
    await kv.set(`wrap:${id}`, wrapData, { ex: 60 * 60 * 24 * 365 });

    // Build the shareable URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const shareUrl = `${baseUrl}/w/${id}`;

    return res.status(200).json({
      success: true,
      id,
      url: shareUrl,
    });
  } catch (error) {
    console.error('Error creating wrap:', error);
    return res.status(500).json({
      error: 'Failed to save wrap',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
