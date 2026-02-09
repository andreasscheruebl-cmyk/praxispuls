import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices, surveys, responses, alerts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function DELETE() {
  try {
    const user = await getUserOptional();
    if (!user?.email) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    // Find practice
    const practice = await db.query.practices.findFirst({
      where: eq(practices.email, user.email),
    });

    if (practice) {
      // Cancel Stripe subscription if active
      if (practice.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(practice.stripeSubscriptionId);
        } catch (err) {
          console.error("Failed to cancel Stripe subscription:", err);
        }
      }

      // Get all survey IDs for this practice
      const practicesSurveys = await db.query.surveys.findMany({
        where: eq(surveys.practiceId, practice.id),
        columns: { id: true },
      });
      const surveyIds = practicesSurveys.map((s) => s.id);

      // Delete responses for all surveys
      for (const surveyId of surveyIds) {
        await db.delete(responses).where(eq(responses.surveyId, surveyId));
      }

      // Delete alerts
      await db.delete(alerts).where(eq(alerts.practiceId, practice.id));

      // Delete surveys
      await db.delete(surveys).where(eq(surveys.practiceId, practice.id));

      // Delete practice
      await db.delete(practices).where(eq(practices.id, practice.id));
    }

    // Delete Supabase auth user (requires service role)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Accounts" },
      { status: 500 }
    );
  }
}
