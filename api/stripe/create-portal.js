import Stripe from 'stripe';
import { getCurrentUser } from '../lib/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe Portal] Missing Stripe configuration');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const baseUrl = process.env.PRODUCTION_URL || 'http://localhost:5173';

    // Create Billing Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: baseUrl,
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe Portal] Error:', error);
    return res.status(500).json({ error: 'Failed to create portal session' });
  }
}
