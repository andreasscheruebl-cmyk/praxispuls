import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getActivePracticeForUser } from "@/lib/practice";

export async function GET() {
  try {
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

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
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
