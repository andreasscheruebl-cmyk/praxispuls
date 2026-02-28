import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db";
import { responses, alerts, surveys } from "@/lib/db/schema";
import { surveyResponseSchema } from "@/lib/validations";
import { getNpsCategory } from "@/lib/utils";
import { routeByNps, noRouting } from "@/lib/review-router";
import { validateAnswers } from "@/lib/survey-validation";
import { eq, and } from "drizzle-orm";
import { getMonthlyResponseCount } from "@/lib/db/queries/dashboard";
import { PLAN_LIMITS } from "@/types";
import type { SurveyQuestion } from "@/types";
import { getEffectivePlan } from "@/lib/plans";
import { sendDetractorAlert } from "@/lib/email";

/**
 * Extract NPS/eNPS score from answers based on survey question definitions.
 * Returns 0 if no NPS/eNPS question is defined (DB column is NOT NULL).
 */
function extractNpsScore(
  questions: SurveyQuestion[],
  answers: Record<string, number | string | boolean>
): number {
  const npsQuestion = questions.find((q) => q.type === "nps" || q.type === "enps");
  if (!npsQuestion) return 0;
  const value = answers[npsQuestion.id];
  if (typeof value !== "number") {
    console.warn(`NPS question "${npsQuestion.id}" has non-numeric answer: ${typeof value}`);
    return 0;
  }
  return value;
}

/**
 * Extract first freetext answer from answers based on survey question definitions.
 */
function extractFreeText(
  questions: SurveyQuestion[],
  answers: Record<string, number | string | boolean>
): string | undefined {
  const ftQuestion = questions.find((q) => q.type === "freetext");
  if (!ftQuestion) return undefined;
  const value = answers[ftQuestion.id];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

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

    if (!survey || survey.status !== "active") {
      return NextResponse.json(
        { error: "Umfrage nicht gefunden", code: "SURVEY_NOT_FOUND" },
        { status: 404 }
      );
    }

    const practice = survey.practice;
    const questions = (survey.questions ?? []) as SurveyQuestion[];
    const isEmployee = survey.respondentType === "mitarbeiter";

    // Reject submissions for surveys without question definitions
    if (questions.length === 0) {
      console.error(`Survey ${survey.id} has no question definitions but received a submission`);
      return NextResponse.json(
        { error: "Umfrage ist nicht konfiguriert.", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    // Server-side answer validation against question definitions
    const validationErrors = validateAnswers(questions, data.answers);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0], code: "VALIDATION_ERROR", details: validationErrors },
        { status: 400 }
      );
    }

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
    const planId = getEffectivePlan(practice);
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

    // Extract NPS + freeText from answers (Clean Break)
    const npsScore = extractNpsScore(questions, data.answers);
    const freeText = extractFreeText(questions, data.answers);
    const npsCategory = getNpsCategory(npsScore);

    // Employee surveys: no Google routing, no detractor alerts
    const routeResult = isEmployee
      ? noRouting(npsScore)
      : routeByNps(
          npsScore,
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
        npsScore,
        npsCategory,
        answers: data.answers,
        freeText,
        channel: data.channel,
        deviceType: data.deviceType,
        sessionHash: data.sessionHash,
        routedTo: routeResult.routedTo,
        googleReviewShown: routeResult.showGooglePrompt,
      })
      .returning();

    // Create alert + send email for detractors (not for employees)
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
          npsScore,
          freeText,
          responseDate: new Date(),
        }).catch((err) => {
          console.error("Failed to send detractor alert email:", err);
          Sentry.captureException(err, {
            tags: { feature: "detractor-alert" },
            extra: { practiceId: practice.id, responseId: response.id },
          });
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
        Sentry.captureException(err, { tags: { feature: "upgrade-reminder" } });
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
    Sentry.captureException(error, { tags: { endpoint: "public-responses" } });
    return NextResponse.json(
      { error: "Interner Fehler", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
