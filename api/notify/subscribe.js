import { kv } from '@vercel/kv';

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
    const { email } = req.body;

    if (!email || !email.includes('@')) {
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

    return res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error subscribing email:', error);
    return res.status(500).json({
      error: 'Failed to subscribe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
