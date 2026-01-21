import Stripe from 'stripe';
import { createClient } from '@vercel/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body for webhook verification
  },
};

// Helper to read raw body
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
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

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
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

        if (!userId) {
          console.error('[Stripe Webhook] No userId in session metadata');
          break;
        }

        console.log('[Stripe Webhook] Activating premium for user:', userId);

        if (kv) {
          await kv.hset(`user:${userId}`, {
            tier: 'premium',
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: 'active',
            updatedAt: Date.now(),
          });

          // Remove TTL from user's existing wraps (make them permanent)
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

        if (!userId) {
          console.error('[Stripe Webhook] No userId in subscription metadata');
          break;
        }

        console.log('[Stripe Webhook] Subscription updated for user:', userId, 'Status:', subscription.status);

        if (kv) {
          const updates = {
            subscriptionStatus: subscription.status,
            updatedAt: Date.now(),
          };

          // If subscription is no longer active, downgrade to free
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

        if (!userId) {
          console.error('[Stripe Webhook] No userId in subscription metadata');
          break;
        }

        console.log('[Stripe Webhook] Subscription canceled for user:', userId);

        if (kv) {
          await kv.hset(`user:${userId}`, {
            tier: 'free',
            subscriptionStatus: 'canceled',
            updatedAt: Date.now(),
          });

          // Re-add 1-year TTL to user's wraps (free tier expiration)
          const wrapIds = await kv.zrange(`user:${userId}:wraps`, 0, -1);
          const oneYearInSeconds = 60 * 60 * 24 * 365;
          for (const wrapId of wrapIds) {
            await kv.expire(`wrap:${wrapId}`, oneYearInSeconds);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        console.log('[Stripe Webhook] Payment failed for customer:', customerId);

        // Find user by Stripe customer ID
        if (kv) {
          // We'd need to search for the user, but for now just log
          // In production, consider storing a reverse lookup: stripe_customer:{customerId} -> userId
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
