// @ts-nocheck
// Subscription API endpoints
import Stripe from 'stripe';
import { sql } from './db/client.js';

export const config = { runtime: 'nodejs' };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/subscriptions/packages - Get available subscription packages
export async function getPackages(req, res) {
  try {
    const packages = await sql`
      SELECT id, name, price, billing_period, description, stripe_price_id
      FROM subscription_packages
      WHERE active = true
      ORDER BY price ASC
    `;

    res.status(200).json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription packages',
    });
  }
}

// POST /api/subscriptions/create-checkout - Create Stripe checkout session
export async function createCheckoutSession(req, res) {
  try {
    const { userId, packageId } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId or packageId',
      });
    }

    // Get package info
    const packageInfo = await sql`
      SELECT stripe_price_id, name, price
      FROM subscription_packages
      WHERE id = ${packageId} AND active = true
    `;

    if (packageInfo.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Package not found',
      });
    }

    const stripePriceId = packageInfo[0].stripe_price_id;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/subscription/cancelled`,
      client_reference_id: userId,
      customer_email: req.body.email,
      metadata: {
        userId,
        packageId,
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
    });
  }
}

// POST /api/subscriptions/restore - Restore user's existing subscription
export async function restorePurchases(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId',
      });
    }

    // Check if user has active subscription
    const subscription = await sql`
      SELECT * FROM user_subscriptions
      WHERE user_id = ${userId}
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (subscription.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    res.status(200).json({
      success: true,
      subscription: subscription[0],
    });
  } catch (error) {
    console.error('Error restoring purchases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore purchases',
    });
  }
}

// POST /api/subscriptions/webhook - Handle Stripe webhooks
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}

// Handle subscription update
async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  try {
    await sql`
      INSERT INTO user_subscriptions (
        user_id, stripe_subscription_id, status, 
        current_period_start, current_period_end, stripe_customer_id
      ) VALUES (
        ${userId}, ${subscription.id}, ${subscription.status},
        ${new Date(subscription.current_period_start * 1000)},
        ${new Date(subscription.current_period_end * 1000)},
        ${subscription.customer}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_subscription_id = ${subscription.id},
        status = ${subscription.status},
        current_period_end = ${new Date(subscription.current_period_end * 1000)}
    `;

    console.log(`Subscription updated for user: ${userId}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  try {
    await sql`
      UPDATE user_subscriptions
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE user_id = ${userId}
      AND stripe_subscription_id = ${subscription.id}
    `;

    console.log(`Subscription cancelled for user: ${userId}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// Handle payment success
async function handlePaymentSucceeded(invoice) {
  const userId = invoice.metadata?.userId;

  if (!userId) return;

  try {
    await sql`
      INSERT INTO subscription_payments (
        user_id, stripe_invoice_id, amount, currency, paid_at
      ) VALUES (
        ${userId}, ${invoice.id}, ${invoice.amount_paid}, 
        ${invoice.currency}, NOW()
      )
    `;

    console.log(`Payment recorded for user: ${userId}`);
  } catch (error) {
    console.error('Error recording payment:', error);
  }
}
