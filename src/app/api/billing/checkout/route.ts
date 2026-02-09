import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const user = await getUserOptional();
    if (!user?.email) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan as "starter" | "professional";

    if (!["starter", "professional"].includes(plan)) {
      return NextResponse.json({ error: "Ungültiger Plan" }, { status: 400 });
    }

    const practice = await db.query.practices.findFirst({
      where: eq(practices.email, user.email),
    });

    if (!practice) {
      return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });
    }

    const session = await createCheckoutSession({
      practiceId: practice.id,
      email: user.email,
      plan,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: `Fehler beim Erstellen der Checkout-Session: ${message}` },
      { status: 500 }
    );
  }
}
