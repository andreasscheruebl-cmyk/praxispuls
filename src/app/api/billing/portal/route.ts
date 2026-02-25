import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { getActivePracticeForUser } from "@/lib/practice";

export async function POST() {
  try {
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const practice = await getActivePracticeForUser(user.id);
    if (!practice?.stripeCustomerId) {
      return NextResponse.json({ error: "Kein Abo vorhanden" }, { status: 400 });
    }

    const session = await createPortalSession({
      customerId: practice.stripeCustomerId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json({ error: "Fehler beim Öffnen des Kundenportals" }, { status: 500 });
  }
}
