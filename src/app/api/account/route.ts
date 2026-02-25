import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { getPracticesForUser } from "@/lib/practice";

export async function DELETE(request: Request) {
  try {
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const userPractices = await getPracticesForUser(user.id);
    if (userPractices.length === 0) {
      return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });
    }

    const meta = getRequestMeta(request);
    const now = new Date();

    // Soft-delete all practices and cancel subscriptions
    for (const practice of userPractices) {
      // Cancel Stripe subscription if active
      if (practice.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(practice.stripeSubscriptionId);
          logAudit({
            practiceId: practice.id,
            action: "subscription.cancelled",
            entity: "subscription",
            entityId: practice.stripeSubscriptionId,
            before: { plan: practice.plan },
            after: { plan: "cancelled" },
            ...meta,
          });
        } catch (err) {
          console.error("Failed to cancel Stripe subscription:", err);
        }
      }

      // Soft-delete surveys
      await db
        .update(surveys)
        .set({ deletedAt: now, isActive: false })
        .where(eq(surveys.practiceId, practice.id));

      // Soft-delete practice
      await db
        .update(practices)
        .set({ deletedAt: now })
        .where(eq(practices.id, practice.id));

      // Audit log
      logAudit({
        practiceId: practice.id,
        action: "practice.soft_deleted",
        entity: "practice",
        entityId: practice.id,
        before: { email: practice.email, name: practice.name, plan: practice.plan },
        after: { deletedAt: now.toISOString() },
        ...meta,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Accounts" },
      { status: 500 }
    );
  }
}
