import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateQrCodeDataUrl, getSurveyUrl } from "@/lib/qr";

export async function GET() {
  try {
    const user = await getUser();

    const practice = await db.query.practices.findFirst({
      where: eq(practices.email, user.email!),
    });

    if (!practice) {
      return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.practiceId, practice.id),
    });

    if (!survey) {
      return NextResponse.json({ error: "Keine Umfrage gefunden" }, { status: 404 });
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
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
