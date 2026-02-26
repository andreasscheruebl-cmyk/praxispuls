import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { surveys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateQrCodeDataUrl, getSurveyUrl } from "@/lib/qr";
import { getActivePracticeForUser } from "@/lib/practice";

export async function GET() {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) {
      return NextResponse.json({ error: "Praxis nicht gefunden", code: "NOT_FOUND" }, { status: 404 });
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.practiceId, practice.id),
    });

    if (!survey) {
      return NextResponse.json({ error: "Keine Umfrage gefunden", code: "NOT_FOUND" }, { status: 404 });
    }

    const qrCodeDataUrl = await generateQrCodeDataUrl(survey.slug, {
      color: practice.primaryColor || "#000000",
    });

    return NextResponse.json({
      qrCodeDataUrl,
      surveyUrl: getSurveyUrl(survey.slug),
      surveySlug: survey.slug,
    });
  } catch {
    return NextResponse.json({ error: "Interner Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
