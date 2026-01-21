import Stripe from 'stripe';
import { getCurrentUser, kv } from '../lib/auth.js';

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

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    console.error('[Stripe] Missing Stripe configuration');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already has a Stripe customer ID
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Store customer ID in Redis
      if (kv) {
        await kv.hset(`user:${user.id}`, { stripeCustomerId: customerId });
      }
    }

    // Determine URLs
    const baseUrl = process.env.PRODUCTION_URL || 'http://localhost:5173';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}?upgrade=success`,
      cancel_url: `${baseUrl}?upgrade=canceled`,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
