import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { surveys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateQrCodeDataUrl, getSurveyUrl } from "@/lib/qr";
import { getActivePracticeForUser } from "@/lib/practice";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;

    const { surveyId } = await params;

    const practice = await getActivePracticeForUser(auth.user.id);
    if (!practice) {
      return NextResponse.json(
        { error: "Praxis nicht gefunden", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, surveyId),
    });

    if (!survey || survey.practiceId !== practice.id) {
      return NextResponse.json(
        { error: "Umfrage nicht gefunden", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const qrCodeDataUrl = await generateQrCodeDataUrl(survey.slug, {
      color: practice.primaryColor || "#000000",
    });

    return NextResponse.json({
      qrCodeDataUrl,
      surveyUrl: getSurveyUrl(survey.slug),
      surveySlug: survey.slug,
    });
  } catch (error) {
    console.error("[QR-Code API]", error);
    return NextResponse.json(
      { error: "QR-Code konnte nicht generiert werden", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
