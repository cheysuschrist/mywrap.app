import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb', // Allow larger individual images
    },
  },
};

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
    const { image, prefix = 'img' } = req.body;

    if (!image || !image.startsWith('data:')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    // Extract content type and data
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid base64 format' });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const extension = contentType.split('/')[1] || 'jpg';
    const filename = `uploads/${prefix}-${nanoid(10)}.${extension}`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('[API /upload] Error:', error.message);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}
