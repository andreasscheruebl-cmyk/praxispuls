import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { responses, alerts, surveys } from "@/lib/db/schema";
import { surveyResponseSchema } from "@/lib/validations";
import { getNpsCategory } from "@/lib/utils";
import { routeByNps } from "@/lib/review-router";
import { eq, and } from "drizzle-orm";
import { getMonthlyResponseCount } from "@/lib/db/queries/dashboard";
import { PLAN_LIMITS } from "@/types";
import type { PlanId } from "@/types";
import { sendDetractorAlert } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = surveyResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Daten", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Get survey + practice info
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, data.surveyId),
      with: { practice: true },
    });

    if (!survey || !survey.isActive) {
      return NextResponse.json(
        { error: "Umfrage nicht gefunden", code: "SURVEY_NOT_FOUND" },
        { status: 404 }
      );
    }

    const practice = survey.practice;

    // Session deduplication (same device + survey within 24h)
    if (data.sessionHash) {
      const existing = await db.query.responses.findFirst({
        where: and(
          eq(responses.sessionHash, data.sessionHash),
          eq(responses.surveyId, data.surveyId)
        ),
      });
      if (existing) {
        return NextResponse.json(
          {
            error: "Sie haben diese Umfrage bereits ausgefüllt. Vielen Dank!",
            code: "DUPLICATE_RESPONSE",
          },
          { status: 409 }
        );
      }
    }

    // Check plan limits
    const planId = (practice.plan || "free") as PlanId;
    const limits = PLAN_LIMITS[planId];
    const monthlyCount = await getMonthlyResponseCount(practice.id);

    if (monthlyCount >= limits.maxResponsesPerMonth) {
      return NextResponse.json(
        {
          error: "Das monatliche Antwort-Limit dieser Praxis wurde erreicht.",
          code: "LIMIT_REACHED",
        },
        { status: 429 }
      );
    }

    const npsCategory = getNpsCategory(data.npsScore);
    const routeResult = routeByNps(
      data.npsScore,
      practice.googlePlaceId,
      practice.npsThreshold ?? 9,
      practice.googleRedirectEnabled ?? true
    );

    // Insert response
    const [response] = await db
      .insert(responses)
      .values({
        surveyId: data.surveyId,
        practiceId: practice.id,
        npsScore: data.npsScore,
        npsCategory,
        ratingWaitTime: data.ratingWaitTime,
        ratingFriendliness: data.ratingFriendliness,
        ratingTreatment: data.ratingTreatment,
        ratingFacility: data.ratingFacility,
        freeText: data.freeText,
        channel: data.channel,
        deviceType: data.deviceType,
        sessionHash: data.sessionHash,
        routedTo: routeResult.routedTo,
        googleReviewShown: routeResult.showGooglePrompt,
      })
      .returning();

    // Create alert + send email for detractors
    if (routeResult.alertRequired && response) {
      await db.insert(alerts).values({
        practiceId: practice.id,
        responseId: response.id,
        type: "detractor",
      });

      // Send email alert (only for paid plans with alerts enabled, or all plans with alertEmail)
      const alertEmail = practice.alertEmail || practice.email;
      if (alertEmail && limits.hasAlerts) {
        sendDetractorAlert({
          to: alertEmail,
          practiceName: practice.name,
          npsScore: data.npsScore,
          freeText: data.freeText,
          responseDate: new Date(),
        }).catch((err) => {
          console.error("Failed to send detractor alert email:", err);
        });
      }
    }

    // Send upgrade reminder when approaching limit (at 80% and 100%)
    const newCount = monthlyCount + 1;
    const limitThreshold = Math.floor(limits.maxResponsesPerMonth * 0.8);
    if (
      limits.maxResponsesPerMonth < Infinity &&
      (newCount === limitThreshold || newCount === limits.maxResponsesPerMonth)
    ) {
      const { sendUpgradeReminder } = await import("@/lib/email");
      sendUpgradeReminder({
        to: practice.email,
        practiceName: practice.name,
        currentCount: newCount,
        limit: limits.maxResponsesPerMonth,
      }).catch((err) => {
        console.error("Failed to send upgrade reminder:", err);
      });
    }

    return NextResponse.json({
      success: true,
      routing: {
        category: routeResult.category,
        showGooglePrompt: routeResult.showGooglePrompt,
        googleReviewUrl: routeResult.googleReviewUrl,
      },
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Interner Fehler", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
