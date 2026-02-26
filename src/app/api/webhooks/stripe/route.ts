import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";
import { logAudit } from "@/lib/audit";
import { getPracticesForUser, getLocationCountForUser } from "@/lib/practice";
import { PLAN_LIMITS } from "@/types";
import type { PlanId } from "@/types";

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
 * checkout.session.completed → Activate plan, store Stripe IDs, sync plan to all practices
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

  // Update the checkout practice with Stripe IDs
  await db
    .update(practices)
    .set({
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(practices.id, practiceId));

  logAudit({
    practiceId,
    action: "plan.upgraded",
    entity: "subscription",
    entityId: subscriptionId,
    after: { plan, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId },
  });

  // Sync plan to all other practices of the same owner
  await syncPlanToAllPractices(practiceId, plan);
}

/**
 * customer.subscription.updated → Plan change (up/downgrade), sync to all practices
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

  logAudit({
    practiceId: practice.id,
    action: "plan.changed",
    entity: "subscription",
    entityId: subscription.id,
    before: { plan: practice.plan },
    after: { plan },
  });

  // Sync plan to all other practices of the same owner
  await syncPlanToAllPractices(practice.id, plan);
}

/**
 * customer.subscription.deleted → Downgrade to free, sync to all practices
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

  logAudit({
    practiceId: practice.id,
    action: "plan.downgraded",
    entity: "subscription",
    entityId: subscription.id,
    before: { plan: practice.plan },
    after: { plan: "free" },
  });

  // Sync plan to all other practices of the same owner
  await syncPlanToAllPractices(practice.id, "free");
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

/**
 * Sync plan to all practices owned by the same user.
 * The "source" practice (where subscription lives) is already updated.
 * This updates all sibling practices to the same plan.
 */
async function syncPlanToAllPractices(sourcePracticeId: string, plan: string) {
  // Find the source practice to get the owner
  const sourcePractice = await db.query.practices.findFirst({
    where: eq(practices.id, sourcePracticeId),
    columns: { ownerUserId: true },
  });

  if (!sourcePractice) return;

  // Downgrade protection: warn if user has more locations than new plan allows
  const locationCount = await getLocationCountForUser(sourcePractice.ownerUserId);
  const maxLocations = PLAN_LIMITS[plan as PlanId]?.maxLocations ?? 1;

  if (locationCount > maxLocations) {
    console.warn(
      `Downgrade warning: User ${sourcePractice.ownerUserId} has ${locationCount} locations but new plan "${plan}" only allows ${maxLocations}. No auto-deletion — manual action required.`
    );
    logAudit({
      practiceId: sourcePracticeId,
      action: "plan.downgrade_warning",
      entity: "practice",
      entityId: sourcePracticeId,
      after: { plan, locationCount, maxLocations },
    });
  }

  // Get all practices for this owner
  const allPractices = await getPracticesForUser(sourcePractice.ownerUserId);

  // Batch update siblings (skip source + already-correct plans)
  const toUpdate = allPractices.filter(
    (p) => p.id !== sourcePracticeId && p.plan !== plan
  );

  if (toUpdate.length > 0) {
    await db
      .update(practices)
      .set({ plan, updatedAt: new Date() })
      .where(inArray(practices.id, toUpdate.map((p) => p.id)));

    // Audit logs remain individual for traceability
    for (const p of toUpdate) {
      logAudit({
        practiceId: p.id,
        action: "plan.synced",
        entity: "practice",
        entityId: p.id,
        before: { plan: p.plan },
        after: { plan },
      });
    }
  }
}
