import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

/**
 * Stripe Webhook Handler
 * Verifies signature and processes subscription lifecycle events.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      }

      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }

      default:
        // Unhandled event type – ignore silently
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ============================================================
// Event Handlers
// ============================================================

/**
 * checkout.session.completed → Activate plan, store Stripe IDs
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const practiceId = session.metadata?.practiceId;
  if (!practiceId) {
    console.error("Checkout session missing practiceId in metadata");
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!subscriptionId || !customerId) {
    console.error("Checkout session missing subscription or customer");
    return;
  }

  // Fetch subscription to determine which plan was purchased
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = getPlanFromSubscription(subscription);

  await db
    .update(practices)
    .set({
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(practices.id, practiceId));

  console.log(
    `Practice ${practiceId} upgraded to ${plan} (subscription: ${subscriptionId})`
  );
}

/**
 * customer.subscription.updated → Plan change (up/downgrade)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const plan = getPlanFromSubscription(subscription);

  const [practice] = await db
    .select()
    .from(practices)
    .where(eq(practices.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (!practice) {
    console.error(
      `No practice found for subscription ${subscription.id}`
    );
    return;
  }

  await db
    .update(practices)
    .set({
      plan,
      updatedAt: new Date(),
    })
    .where(eq(practices.id, practice.id));

  console.log(`Practice ${practice.id} plan updated to ${plan}`);
}

/**
 * customer.subscription.deleted → Downgrade to free
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const [practice] = await db
    .select()
    .from(practices)
    .where(eq(practices.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (!practice) {
    console.error(
      `No practice found for subscription ${subscription.id}`
    );
    return;
  }

  await db
    .update(practices)
    .set({
      plan: "free",
      stripeSubscriptionId: null,
      updatedAt: new Date(),
    })
    .where(eq(practices.id, practice.id));

  console.log(`Practice ${practice.id} downgraded to free`);
}

/**
 * invoice.payment_failed → Log warning (email handled by Stripe)
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  console.warn(
    `Payment failed for customer ${customerId}, invoice ${invoice.id}`
  );
}

// ============================================================
// Helpers
// ============================================================

/**
 * Determine plan tier from Stripe subscription price ID
 */
function getPlanFromSubscription(
  subscription: Stripe.Subscription
): string {
  const priceId = subscription.items.data[0]?.price?.id;

  if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) {
    return "starter";
  }
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY) {
    return "professional";
  }

  // Fallback: check price amount (cents)
  const amount = subscription.items.data[0]?.price?.unit_amount;
  if (amount === 4900) return "starter";
  if (amount === 9900) return "professional";

  return "starter";
}
