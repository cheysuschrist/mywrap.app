import { getCurrentUser } from '../lib/auth.js';

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
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      tier: user.tier,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    console.error('[Auth /me] Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
