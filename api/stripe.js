import Stripe from 'stripe';
import { createClient } from '@vercel/kv';
import { getCurrentUser } from './lib/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export const config = {
  api: {
    bodyParser: false, // Required for webhook signature verification
  },
};

// Helper to read raw body for webhook
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Helper to parse JSON body
async function parseJsonBody(req) {
  const raw = await getRawBody(req);
  return JSON.parse(raw.toString());
}

// Routes: /api/stripe?action=checkout|portal|webhook
export default async function handler(req, res) {
  const { action } = req.query;

  // Webhook doesn't need CORS
  if (action === 'webhook') {
    return handleWebhook(req, res);
  }

  // Set CORS headers for other actions
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  switch (action) {
    case 'checkout':
      return handleCheckout(req, res);
    case 'portal':
      return handlePortal(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

// Create Stripe Checkout session
async function handleCheckout(req, res) {
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

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      if (kv) {
        await kv.hset(`user:${user.id}`, { stripeCustomerId: customerId });
      }
    }

    const baseUrl = process.env.PRODUCTION_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}?upgrade=success`,
      cancel_url: `${baseUrl}?upgrade=canceled`,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

// Create Stripe Billing Portal session
async function handlePortal(req, res) {
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

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: baseUrl,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('[Stripe Portal] Error:', error);
    return res.status(500).json({ error: 'Failed to create portal session' });
  }
}

// Handle Stripe webhooks
async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  console.log('[Stripe Webhook] Received event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (!userId) break;

        console.log('[Stripe Webhook] Activating premium for user:', userId);

        if (kv) {
          await kv.hset(`user:${userId}`, {
            tier: 'premium',
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: 'active',
            updatedAt: Date.now(),
          });

          const wrapIds = await kv.zrange(`user:${userId}:wraps`, 0, -1);
          for (const wrapId of wrapIds) {
            await kv.persist(`wrap:${wrapId}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        console.log('[Stripe Webhook] Subscription updated for user:', userId, 'Status:', subscription.status);

        if (kv) {
          const updates = { subscriptionStatus: subscription.status, updatedAt: Date.now() };
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            updates.tier = 'free';
          } else if (subscription.status === 'active') {
            updates.tier = 'premium';
          }
          if (subscription.current_period_end) {
            updates.subscriptionEndDate = subscription.current_period_end * 1000;
          }
          await kv.hset(`user:${userId}`, updates);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        console.log('[Stripe Webhook] Subscription canceled for user:', userId);

        if (kv) {
          await kv.hset(`user:${userId}`, {
            tier: 'free',
            subscriptionStatus: 'canceled',
            updatedAt: Date.now(),
          });

          const wrapIds = await kv.zrange(`user:${userId}:wraps`, 0, -1);
          const oneYearInSeconds = 60 * 60 * 24 * 365;
          for (const wrapId of wrapIds) {
            await kv.expire(`wrap:${wrapId}`, oneYearInSeconds);
          }
        }
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
