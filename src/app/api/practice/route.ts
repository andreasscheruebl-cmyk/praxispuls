import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { eq, and, ne, isNull } from "drizzle-orm";
import { practiceUpdateSchema } from "@/lib/validations";
import { getGoogleReviewLink, getPlaceDetails } from "@/lib/google";
import { slugify } from "@/lib/utils";
import { SURVEY_TEMPLATES } from "@/lib/survey-templates";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { ZodError } from "zod";
import { getActivePracticeForUser, getLocationCountForUser } from "@/lib/practice";
import { getEffectivePlan } from "@/lib/plans";
import { PLAN_LIMITS } from "@/types";

export async function GET() {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) return NextResponse.json({ error: "Praxis nicht gefunden", code: "NOT_FOUND" }, { status: 404 });

    const locationCount = await getLocationCountForUser(user.id);
    const effectivePlan = getEffectivePlan(practice);
    const maxLocations = PLAN_LIMITS[effectivePlan].maxLocations;

    return NextResponse.json({ ...practice, locationCount, maxLocations });
  } catch (err) {
    console.error("GET /api/practice error:", err);
    return NextResponse.json({ error: "Interner Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await request.json();
    const { name, postalCode, googlePlaceId, templateId: templateIdParam, logoUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name fehlt", code: "BAD_REQUEST" }, { status: 400 });
    }

    // Validate external data before transaction
    let googleReviewUrl: string | null = null;
    if (googlePlaceId) {
      const placeDetails = await getPlaceDetails(googlePlaceId);
      if (!placeDetails) {
        return NextResponse.json(
          { error: "Ungültige Google Place ID. Bitte wählen Sie Ihre Praxis erneut aus.", code: "BAD_REQUEST" },
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

    const chosenTemplateId = templateIdParam || "zahnarzt_standard";
    const template = SURVEY_TEMPLATES.find(t => t.id === chosenTemplateId);
    if (!template) {
      return NextResponse.json(
        { error: "Ungültiges Umfrage-Template", code: "INVALID_TEMPLATE" },
        { status: 400 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "E-Mail-Adresse fehlt in Ihrem Konto", code: "MISSING_EMAIL" },
        { status: 400 }
      );
    }
    const userEmail = user.email;

    // Transaction: check limit + insert atomically to prevent race conditions
    const result = await db.transaction(async (tx) => {
      // Check location limit against user's effective plan
      const userPractices = await tx.query.practices.findMany({
        where: and(eq(practices.ownerUserId, user.id), isNull(practices.deletedAt)),
        columns: { id: true, plan: true, planOverride: true, overrideExpiresAt: true },
      });
      const currentCount = userPractices.length;
      const userPlan = userPractices[0]
        ? getEffectivePlan(userPractices[0])
        : "free";
      const maxLocations = PLAN_LIMITS[userPlan].maxLocations;

      if (currentCount >= maxLocations) {
        return {
          error: `Ihr aktueller Plan (${userPlan}) erlaubt maximal ${maxLocations} Standort${maxLocations === 1 ? "" : "e"}. Bitte upgraden Sie Ihren Plan, um weitere Standorte hinzuzufügen.`,
          code: "LOCATION_LIMIT_REACHED" as const,
        };
      }

      // Generate unique slug
      let slug = slugify(name);
      const existingSlug = await tx.query.practices.findFirst({
        where: eq(practices.slug, slug),
        columns: { id: true },
      });
      if (existingSlug) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      const [practice] = await tx.insert(practices).values({
        ownerUserId: user.id,
        name: name.trim(),
        slug,
        email: userEmail,
        postalCode,
        googlePlaceId,
        googleReviewUrl,
        logoUrl: logoUrl || null,
        alertEmail: userEmail,
        plan: userPlan, // Inherit effective plan from user
      }).returning();

      if (!practice) {
        return { error: "Praxis konnte nicht erstellt werden", code: "INSERT_FAILED" as const };
      }

      const surveySlug = `${slug}-umfrage`;
      await tx.insert(surveys).values({
        practiceId: practice.id,
        title: "Patientenbefragung",
        slug: surveySlug,
        questions: template.questions,
        status: "active",
      });

      return { practice };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 403 }
      );
    }

    return NextResponse.json(result.practice, { status: 201 });
  } catch (err) {
    console.error("Create practice error:", err);
    return NextResponse.json({ error: "Fehler beim Erstellen", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await request.json();
    const parsed = practiceUpdateSchema.parse(body);
    const meta = getRequestMeta(request);

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) return NextResponse.json({ error: "Praxis nicht gefunden", code: "NOT_FOUND" }, { status: 404 });

    // Verify Google Place ID if changed
    let googleReviewUrl = practice.googleReviewUrl;
    if (parsed.googlePlaceId && parsed.googlePlaceId !== practice.googlePlaceId) {
      const placeDetails = await getPlaceDetails(parsed.googlePlaceId);
      if (!placeDetails) {
        return NextResponse.json(
          { error: "Ungültige Google Place ID. Bitte wählen Sie Ihre Praxis erneut aus.", code: "BAD_REQUEST" },
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
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    console.error("PUT /api/practice error:", err);
    return NextResponse.json({ error: "Fehler beim Aktualisieren", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
