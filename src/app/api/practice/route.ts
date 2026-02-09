import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { practiceUpdateSchema } from "@/lib/validations";
import { getGoogleReviewLink } from "@/lib/google";
import { slugify } from "@/lib/utils";
import { SURVEY_TEMPLATES } from "@/lib/survey-templates";

export async function GET() {
  try {
    const user = await getUser();
    const practice = await db.query.practices.findFirst({
      where: eq(practices.email, user.email!),
    });
    if (!practice) return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });
    return NextResponse.json(practice);
  } catch {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    const body = await request.json();
    const { name, postalCode, googlePlaceId, surveyTemplate, logoUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
    }

    const slug = slugify(name);
    const googleReviewUrl = googlePlaceId ? getGoogleReviewLink(googlePlaceId) : null;
    const templateId = surveyTemplate || "zahnarzt_standard";
    const template = SURVEY_TEMPLATES.find(t => t.id === templateId) || SURVEY_TEMPLATES[0]!;

    const [practice] = await db.insert(practices).values({
      name: name.trim(),
      slug,
      email: user.email!,
      postalCode,
      googlePlaceId,
      googleReviewUrl,
      logoUrl: logoUrl || null,
      alertEmail: user.email!,
      surveyTemplate: templateId,
    }).returning();

    await db.insert(surveys).values({
      practiceId: practice!.id,
      title: "Patientenbefragung",
      slug: `${slug}-umfrage`,
      questions: template.questions,
      isActive: true,
    });

    return NextResponse.json(practice, { status: 201 });
  } catch (err) {
    console.error("Create practice error:", err);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    const body = await request.json();
    const parsed = practiceUpdateSchema.parse(body);

    const practice = await db.query.practices.findFirst({
      where: eq(practices.email, user.email!),
    });
    if (!practice) return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });

    const googleReviewUrl = parsed.googlePlaceId
      ? getGoogleReviewLink(parsed.googlePlaceId)
      : practice.googleReviewUrl;

    await db.update(practices)
      .set({ ...parsed, googleReviewUrl, updatedAt: new Date() })
      .where(eq(practices.id, practice.id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
