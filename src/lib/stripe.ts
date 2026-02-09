import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

const PRICES = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
  professional_monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY!,
} as const;

/**
 * Create a Stripe Checkout Session for plan upgrade
 */
export async function createCheckoutSession(params: {
  practiceId: string;
  email: string;
  plan: "starter" | "professional";
  returnUrl: string;
}) {
  const priceId = params.plan === "starter"
    ? PRICES.starter_monthly
    : PRICES.professional_monthly;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${params.returnUrl}?success=true`,
    cancel_url: `${params.returnUrl}?canceled=true`,
    metadata: {
      practiceId: params.practiceId,
    },
    locale: "de",
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
}
