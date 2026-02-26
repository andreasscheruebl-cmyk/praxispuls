import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getActivePracticeForUser } from "@/lib/practice";

export async function GET() {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const practice = await getActivePracticeForUser(user.id);
    if (!practice?.stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: practice.stripeCustomerId,
      limit: 12,
    });

    const formatted = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      date: inv.created,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));

    return NextResponse.json({ invoices: formatted });
  } catch (err) {
    console.error("Invoices error:", err);
    return NextResponse.json({ error: "Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
