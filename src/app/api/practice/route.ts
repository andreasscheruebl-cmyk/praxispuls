import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { eq, and, ne, isNull } from "drizzle-orm";
import { practiceUpdateSchema, practiceCreateSchema } from "@/lib/validations";
import { getGoogleReviewLink, getPlaceDetails } from "@/lib/google";
import { slugify } from "@/lib/utils";
import { getTemplateById } from "@/lib/db/queries/templates";
import { getTerminology } from "@/lib/terminology";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { getActivePracticeForUser, getLocationCountForUser } from "@/lib/practice";
import { getEffectivePlan } from "@/lib/plans";
import { PLAN_LIMITS } from "@/types";
import type { RespondentType } from "@/types";

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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ungültiger Request-Body", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const parsed = practiceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { name, industryCategory, industrySubCategory, googlePlaceId, templateId } = parsed.data;

    // Load template from DB
    const dbTemplate = await getTemplateById(templateId);
    if (!dbTemplate) {
      return NextResponse.json(
        { error: "Ungültiges Umfrage-Template", code: "INVALID_TEMPLATE" },
        { status: 400 },
      );
    }

    // IDOR protection: template must match the selected industry + category
    if (dbTemplate.industryCategory !== industryCategory ||
        dbTemplate.industrySubCategory !== industrySubCategory ||
        dbTemplate.category !== "customer") {
      return NextResponse.json(
        { error: "Template passt nicht zur gewählten Branche", code: "TEMPLATE_MISMATCH" },
        { status: 400 },
      );
    }

    // Validate external data before transaction
    let googleReviewUrl: string | null = null;
    if (googlePlaceId) {
      const placeResult = await getPlaceDetails(googlePlaceId);
      if ("error" in placeResult) {
        // Skip validation if API key not configured — don't block onboarding
        if (placeResult.error !== "NO_API_KEY") {
          const msg = placeResult.error === "NOT_FOUND"
            ? "Ungültige Google Place ID. Bitte wählen Sie Ihre Praxis erneut aus."
            : "Google Places API ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.";
          return NextResponse.json(
            { error: msg, code: placeResult.error === "NOT_FOUND" ? "BAD_REQUEST" : "EXTERNAL_API_ERROR" },
            { status: placeResult.error === "NOT_FOUND" ? 400 : 502 },
          );
        }
      }
      googleReviewUrl = getGoogleReviewLink(googlePlaceId);
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "E-Mail-Adresse fehlt in Ihrem Konto", code: "MISSING_EMAIL" },
        { status: 400 },
      );
    }
    const userEmail = user.email;

    const terminology = getTerminology(
      (dbTemplate.respondentType as RespondentType) ?? "kunde",
    );

    // Transaction: check limit + insert atomically to prevent race conditions
    const result = await db.transaction(async (tx) => {
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

      if (googlePlaceId) {
        const existingPlace = await tx.query.practices.findFirst({
          where: and(eq(practices.googlePlaceId, googlePlaceId), isNull(practices.deletedAt)),
          columns: { id: true },
        });
        if (existingPlace) {
          return {
            error: "Diese Google-Praxis ist bereits mit einem anderen Konto verknüpft.",
            code: "PLACE_ID_TAKEN" as const,
          };
        }
      }

      let slug = slugify(name);
      let slugAvailable = false;
      for (let i = 0; i < 5; i++) {
        const existingSlug = await tx.query.practices.findFirst({
          where: eq(practices.slug, slug),
          columns: { id: true },
        });
        if (!existingSlug) { slugAvailable = true; break; }
        slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;
      }
      if (!slugAvailable) {
        return { error: "Ein eindeutiger Name konnte nicht generiert werden. Bitte wählen Sie einen anderen Namen.", code: "SLUG_COLLISION" as const };
      }

      const [practice] = await tx.insert(practices).values({
        ownerUserId: user.id,
        name,
        slug,
        email: userEmail,
        industryCategory,
        industrySubCategory,
        googlePlaceId,
        googleReviewUrl,
        alertEmail: userEmail,
        plan: userPlan,
      }).returning();

      if (!practice) {
        return { error: "Praxis konnte nicht erstellt werden", code: "INSERT_FAILED" as const };
      }

      let surveySlug = `${slug}-umfrage`;
      let surveySlugAvailable = false;
      for (let i = 0; i < 5; i++) {
        const existingSurveySlug = await tx.query.surveys.findFirst({
          where: eq(surveys.slug, surveySlug),
          columns: { id: true },
        });
        if (!existingSurveySlug) { surveySlugAvailable = true; break; }
        surveySlug = `${slug}-umfrage-${Math.random().toString(36).slice(2, 8)}`;
      }
      if (!surveySlugAvailable) {
        return { error: "Ein eindeutiger Name konnte nicht generiert werden. Bitte wählen Sie einen anderen Namen.", code: "SLUG_COLLISION" as const };
      }

      await tx.insert(surveys).values({
        practiceId: practice.id,
        title: terminology.surveyTitle,
        slug: surveySlug,
        questions: dbTemplate.questions,
        status: "active",
        respondentType: dbTemplate.respondentType,
        templateId: dbTemplate.id,
      });

      return { practice };
    });

    if ("error" in result) {
      let status: number;
      switch (result.code) {
        case "PLACE_ID_TAKEN": status = 409; break;
        case "LOCATION_LIMIT_REACHED": status = 403; break;
        case "SLUG_COLLISION": status = 409; break;
        default: status = 500; break;
      }
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    await logAudit({
      practiceId: result.practice.id,
      action: "practice.created",
      entity: "practice",
      entityId: result.practice.id,
      before: undefined,
      after: { name, industryCategory, industrySubCategory, templateId },
      ...getRequestMeta(request),
    });

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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ungültiger Request-Body", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const parsed = practiceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }
    const meta = getRequestMeta(request);

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) return NextResponse.json({ error: "Praxis nicht gefunden", code: "NOT_FOUND" }, { status: 404 });

    const updates = parsed.data;

    if (updates.googlePlaceId && updates.googlePlaceId !== practice.googlePlaceId) {
      const placeResult = await getPlaceDetails(updates.googlePlaceId);
      if ("error" in placeResult && placeResult.error !== "NO_API_KEY") {
        const msg = placeResult.error === "NOT_FOUND"
          ? "Ungültige Google Place ID. Bitte wählen Sie Ihre Praxis erneut aus."
          : "Google Places API ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.";
        return NextResponse.json(
          { error: msg, code: placeResult.error === "NOT_FOUND" ? "BAD_REQUEST" : "EXTERNAL_API_ERROR" },
          { status: placeResult.error === "NOT_FOUND" ? 400 : 502 },
        );
      }

      const existing = await db.query.practices.findFirst({
        where: and(
          eq(practices.googlePlaceId, updates.googlePlaceId),
          ne(practices.id, practice.id),
          isNull(practices.deletedAt),
        ),
        columns: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Diese Google-Praxis ist bereits mit einem anderen Konto verknüpft.", code: "PLACE_ID_TAKEN", warning: true },
          { status: 409 },
        );
      }
    }

    const googleReviewUrl = updates.googlePlaceId
      ? getGoogleReviewLink(updates.googlePlaceId)
      : practice.googleReviewUrl;

    await db.update(practices)
      .set({ ...updates, googleReviewUrl, updatedAt: new Date() })
      .where(eq(practices.id, practice.id));

    // Audit log for settings change
    await logAudit({
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
      after: updates,
      ...meta,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/practice error:", err);
    return NextResponse.json({ error: "Fehler beim Aktualisieren", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
