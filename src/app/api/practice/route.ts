import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { eq, and, ne, isNull } from "drizzle-orm";
import { practiceUpdateSchema } from "@/lib/validations";
import { getGoogleReviewLink, getPlaceDetails } from "@/lib/google";
import { slugify } from "@/lib/utils";
import { SURVEY_TEMPLATES } from "@/lib/survey-templates";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { getActivePracticeForUser, getLocationCountForUser } from "@/lib/practice";
import { PLAN_LIMITS } from "@/types";
import type { PlanId } from "@/types";

export async function GET() {
  try {
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });

    const locationCount = await getLocationCountForUser(user.id);
    const plan = (practice.plan ?? "free") as PlanId;
    const maxLocations = PLAN_LIMITS[plan].maxLocations;

    return NextResponse.json({ ...practice, locationCount, maxLocations });
  } catch {
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    const body = await request.json();
    const { name, postalCode, googlePlaceId, surveyTemplate, logoUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
    }

    // Check location limit against user's plan
    const userPractices = await db.query.practices.findMany({
      where: and(eq(practices.ownerUserId, user.id), isNull(practices.deletedAt)),
      columns: { id: true, plan: true },
    });
    const currentCount = userPractices.length;
    const userPlan = (userPractices[0]?.plan ?? "free") as PlanId;
    const maxLocations = PLAN_LIMITS[userPlan].maxLocations;

    if (currentCount >= maxLocations) {
      return NextResponse.json(
        {
          error: `Ihr aktueller Plan (${userPlan}) erlaubt maximal ${maxLocations} Standort${maxLocations === 1 ? "" : "e"}. Bitte upgraden Sie Ihren Plan, um weitere Standorte hinzuzufügen.`,
          code: "LOCATION_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }

    // Generate unique slug (append random suffix on collision)
    let slug = slugify(name);
    const existingSlug = await db.query.practices.findFirst({
      where: eq(practices.slug, slug),
      columns: { id: true },
    });
    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    // Verify Google Place ID is real before saving
    let googleReviewUrl: string | null = null;
    if (googlePlaceId) {
      const placeDetails = await getPlaceDetails(googlePlaceId);
      if (!placeDetails) {
        return NextResponse.json(
          { error: "Ungültige Google Place ID. Bitte wählen Sie Ihre Praxis erneut aus." },
          { status: 400 }
        );
      }
      googleReviewUrl = getGoogleReviewLink(googlePlaceId);

      // Check if Place ID is already used by another practice
      const existing = await db.query.practices.findFirst({
        where: eq(practices.googlePlaceId, googlePlaceId),
        columns: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Diese Google-Praxis ist bereits mit einem anderen Konto verknüpft.", code: "PLACE_ID_TAKEN", warning: true },
          { status: 409 }
        );
      }
    }
    const templateId = surveyTemplate || "zahnarzt_standard";
    const template = SURVEY_TEMPLATES.find(t => t.id === templateId) || SURVEY_TEMPLATES[0]!;

    const [practice] = await db.insert(practices).values({
      ownerUserId: user.id,
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

    const surveySlug = `${slug}-umfrage`;
    await db.insert(surveys).values({
      practiceId: practice!.id,
      title: "Patientenbefragung",
      slug: surveySlug,
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
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = practiceUpdateSchema.parse(body);
    const meta = getRequestMeta(request);

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });

    // Verify Google Place ID if changed
    let googleReviewUrl = practice.googleReviewUrl;
    if (parsed.googlePlaceId && parsed.googlePlaceId !== practice.googlePlaceId) {
      const placeDetails = await getPlaceDetails(parsed.googlePlaceId);
      if (!placeDetails) {
        return NextResponse.json(
          { error: "Ungültige Google Place ID. Bitte wählen Sie Ihre Praxis erneut aus." },
          { status: 400 }
        );
      }

      // Check if Place ID is already used by another practice
      const existing = await db.query.practices.findFirst({
        where: and(
          eq(practices.googlePlaceId, parsed.googlePlaceId),
          ne(practices.id, practice.id)
        ),
        columns: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Diese Google-Praxis ist bereits mit einem anderen Konto verknüpft.", code: "PLACE_ID_TAKEN", warning: true },
          { status: 409 }
        );
      }

      googleReviewUrl = getGoogleReviewLink(parsed.googlePlaceId);
    } else if (parsed.googlePlaceId) {
      googleReviewUrl = getGoogleReviewLink(parsed.googlePlaceId);
    }

    await db.update(practices)
      .set({ ...parsed, googleReviewUrl, updatedAt: new Date() })
      .where(eq(practices.id, practice.id));

    // Audit log for settings change
    logAudit({
      practiceId: practice.id,
      action: "practice.updated",
      entity: "practice",
      entityId: practice.id,
      before: {
        name: practice.name,
        googlePlaceId: practice.googlePlaceId,
        npsThreshold: practice.npsThreshold,
        logoUrl: practice.logoUrl,
      },
      after: parsed,
      ...meta,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
