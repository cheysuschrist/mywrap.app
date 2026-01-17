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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple API key auth - set ADMIN_API_KEY in Vercel env vars
  const authHeader = req.headers.authorization;
  const apiKey = process.env.ADMIN_API_KEY;

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all emails from the set
    const emails = await kv.smembers('notify:emails');

    // Get details for each email
    const emailDetails = await Promise.all(
      emails.map(async (email) => {
        const details = await kv.hgetall(`notify:email:${email}`);
        return details || { email };
      })
    );

    // Sort by subscription date (newest first)
    emailDetails.sort((a, b) => (b.subscribedAt || 0) - (a.subscribedAt || 0));

    return res.status(200).json({
      count: emails.length,
      emails: emailDetails,
    });
  } catch (error) {
    console.error('Error listing emails:', error);
    return res.status(500).json({ error: 'Failed to list emails' });
  }
}
