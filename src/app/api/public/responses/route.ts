import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { responses, alerts, surveys } from "@/lib/db/schema";
import { surveyResponseSchema } from "@/lib/validations";
import { getNpsCategory } from "@/lib/utils";
import { routeByNps } from "@/lib/review-router";
import { eq } from "drizzle-orm";

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
    const npsCategory = getNpsCategory(data.npsScore);
    const routeResult = routeByNps(
      data.npsScore,
      practice.googlePlaceId,
      practice.npsThreshold ?? 9
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

    // Create alert for detractors
    if (routeResult.alertRequired && response) {
      await db.insert(alerts).values({
        practiceId: practice.id,
        responseId: response.id,
        type: "detractor",
      });

      // TODO: Send email alert via Resend (Sprint 5-6)
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
