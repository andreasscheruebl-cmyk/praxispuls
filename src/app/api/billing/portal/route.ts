import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { getActivePracticeForUser } from "@/lib/practice";

export async function POST() {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const practice = await getActivePracticeForUser(user.id);
    if (!practice?.stripeCustomerId) {
      return NextResponse.json({ error: "Kein Abo vorhanden", code: "BAD_REQUEST" }, { status: 400 });
    }

    const session = await createPortalSession({
      customerId: practice.stripeCustomerId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json({ error: "Fehler beim Öffnen des Kundenportals", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
