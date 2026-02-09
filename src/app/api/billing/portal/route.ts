import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPortalSession } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await getUserOptional();
    if (!user?.email) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const practice = await db.query.practices.findFirst({
      where: eq(practices.email, user.email),
    });

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
