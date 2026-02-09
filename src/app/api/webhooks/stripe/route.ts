import { NextResponse } from "next/server";

// TODO: Implement Stripe webhook handling (Sprint 9-10)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request) {
  // Will handle:
  // - checkout.session.completed → activate plan
  // - customer.subscription.updated → plan change
  // - customer.subscription.deleted → downgrade to free
  // - invoice.payment_failed → notify

  return NextResponse.json({ received: true });
}
