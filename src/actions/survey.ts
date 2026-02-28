"use server";

import { db } from "@/lib/db";
import { surveys, responses } from "@/lib/db/schema";
import type { SurveyStatus } from "@/lib/db/schema";
import { getActivePractice } from "./practice";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTemplateById } from "@/lib/db/queries/templates";
import { surveyCreateSchema, surveyUpdateSchema } from "@/lib/validations";
import { canTransition } from "@/lib/survey-status";
import { slugify } from "@/lib/utils";
import { randomBytes } from "crypto";

// ============================================================
// READ
// ============================================================

/**
 * Get all surveys for current practice
 */
export async function getSurveys() {
  const practice = await getActivePractice();
  if (!practice) return [];

  return db.query.surveys.findMany({
    where: eq(surveys.practiceId, practice.id),
  });
}

// ============================================================
// TOGGLE (legacy — kept for backward compat)
// ============================================================

/**
 * Toggle survey between active and paused state
 */
export async function toggleSurvey(surveyId: string) {
  const practice = await getActivePractice();
  if (!practice) throw new Error("Praxis nicht gefunden");

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  });

  if (!survey || survey.practiceId !== practice.id) {
    throw new Error("Umfrage nicht gefunden");
  }

  if (survey.status !== "active" && survey.status !== "paused") {
    throw new Error("Nur aktive oder pausierte Umfragen können umgeschaltet werden");
  }

  const newStatus = survey.status === "active" ? "paused" : "active";
  await db
    .update(surveys)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(surveys.id, surveyId));

  revalidatePath("/dashboard");
}

// ============================================================
// CHANGE TEMPLATE (legacy)
// ============================================================

/**
 * Change survey template
 */
export async function changeSurveyTemplate(
  surveyId: string,
  templateId: string
) {
  const practice = await getActivePractice();
  if (!practice) throw new Error("Praxis nicht gefunden");

  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template nicht gefunden");

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  });
  if (!survey || survey.practiceId !== practice.id) {
    throw new Error("Umfrage nicht gefunden");
  }

  await db
    .update(surveys)
    .set({
      templateId: template.id,
      questions: template.questions,
      updatedAt: new Date(),
    })
    .where(and(eq(surveys.id, surveyId), eq(surveys.practiceId, practice.id)));

  revalidatePath("/dashboard/settings");
}

// ============================================================
// CREATE SURVEY
// ============================================================

export async function createSurvey(input: unknown) {
  const practice = await getActivePractice();
  if (!practice) return { error: "Praxis nicht gefunden", code: "UNAUTHORIZED" };

  const parsed = surveyCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe", code: "VALIDATION_ERROR" };
  }

  const { templateId, title, disabledQuestionIds, labelOverrides, customQuestions, startsAt, endsAt, autoDeleteAfterMonths } = parsed.data;

  // Load template
  const template = await getTemplateById(templateId);
  if (!template) return { error: "Template nicht gefunden", code: "NOT_FOUND" };

  // Build questions: template questions (minus disabled, with label overrides) + custom
  const questions = template.questions
    .filter((q) => !disabledQuestionIds?.includes(q.id))
    .map((q) => ({
      ...q,
      label: labelOverrides?.[q.id] ?? q.label,
    }));

  if (customQuestions?.length) {
    questions.push(...customQuestions);
  }

  if (questions.length === 0) {
    return { error: "Mindestens eine Frage ist erforderlich", code: "VALIDATION_ERROR" };
  }

  // Generate slug: practiceSlug-surveyTitle, with collision check
  const baseSlug = `${practice.slug}-${slugify(title)}`;
  let slug = baseSlug;

  const existing = await db.query.surveys.findFirst({
    where: eq(surveys.slug, slug),
    columns: { id: true },
  });

  if (existing) {
    const suffix = randomBytes(2).toString("hex"); // 4 hex chars
    slug = `${baseSlug}-${suffix}`;
  }

  const [created] = await db
    .insert(surveys)
    .values({
      practiceId: practice.id,
      title,
      slug,
      questions,
      status: "draft",
      templateId: template.id,
      respondentType: template.respondentType,
      description: template.description,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      autoDeleteAfterMonths: autoDeleteAfterMonths ?? null,
    })
    .returning({ id: surveys.id });

  revalidatePath("/dashboard/surveys");
  return { success: true, surveyId: created!.id };
}

// ============================================================
// UPDATE SURVEY
// ============================================================

export async function updateSurvey(surveyId: string, input: unknown) {
  const practice = await getActivePractice();
  if (!practice) return { error: "Praxis nicht gefunden", code: "UNAUTHORIZED" };

  const parsed = surveyUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe", code: "VALIDATION_ERROR" };
  }

  // Ownership check
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  });
  if (!survey || survey.practiceId !== practice.id) {
    return { error: "Umfrage nicht gefunden", code: "NOT_FOUND" };
  }

  const { title, description, startsAt, endsAt, autoDeleteAfterMonths } = parsed.data;

  await db
    .update(surveys)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
      ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
      ...(autoDeleteAfterMonths !== undefined && { autoDeleteAfterMonths }),
      updatedAt: new Date(),
    })
    .where(and(eq(surveys.id, surveyId), eq(surveys.practiceId, practice.id)));

  revalidatePath("/dashboard/surveys");
  return { success: true };
}

// ============================================================
// UPDATE STATUS
// ============================================================

export async function updateSurveyStatus(surveyId: string, newStatus: SurveyStatus) {
  const practice = await getActivePractice();
  if (!practice) return { error: "Praxis nicht gefunden", code: "UNAUTHORIZED" };

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  });
  if (!survey || survey.practiceId !== practice.id) {
    return { error: "Umfrage nicht gefunden", code: "NOT_FOUND" };
  }

  if (!canTransition(survey.status!, newStatus)) {
    return { error: `Statuswechsel von "${survey.status}" zu "${newStatus}" nicht erlaubt`, code: "BAD_REQUEST" };
  }

  // Draft → Active: must have at least 1 question
  if (survey.status === "draft" && newStatus === "active") {
    const questions = survey.questions as unknown[];
    if (!questions || questions.length === 0) {
      return { error: "Umfrage benötigt mindestens eine Frage", code: "VALIDATION_ERROR" };
    }
  }

  await db
    .update(surveys)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(and(eq(surveys.id, surveyId), eq(surveys.practiceId, practice.id)));

  revalidatePath("/dashboard/surveys");
  return { success: true };
}

// ============================================================
// DELETE SURVEY (Hard Delete)
// ============================================================

export async function deleteSurvey(surveyId: string) {
  const practice = await getActivePractice();
  if (!practice) return { error: "Praxis nicht gefunden", code: "UNAUTHORIZED" };

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  });
  if (!survey || survey.practiceId !== practice.id) {
    return { error: "Umfrage nicht gefunden", code: "NOT_FOUND" };
  }

  // Only allow delete for draft or archived surveys
  if (survey.status !== "draft" && survey.status !== "archived") {
    return { error: "Nur Entwürfe und archivierte Umfragen können gelöscht werden", code: "BAD_REQUEST" };
  }

  // Responses are deleted via CASCADE
  await db
    .delete(surveys)
    .where(and(eq(surveys.id, surveyId), eq(surveys.practiceId, practice.id)));

  revalidatePath("/dashboard/surveys");
  return { success: true };
}

// ============================================================
// DELETE ALL RESPONSES (DSGVO)
// ============================================================

export async function deleteAllSurveyResponses(surveyId: string) {
  const practice = await getActivePractice();
  if (!practice) return { error: "Praxis nicht gefunden", code: "UNAUTHORIZED" };

  // Ownership check via survey
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  });
  if (!survey || survey.practiceId !== practice.id) {
    return { error: "Umfrage nicht gefunden", code: "NOT_FOUND" };
  }

  // Count before delete for feedback
  const [countResult] = await db
    .select({ total: count() })
    .from(responses)
    .where(eq(responses.surveyId, surveyId));

  const deletedCount = countResult?.total ?? 0;

  if (deletedCount > 0) {
    await db
      .delete(responses)
      .where(eq(responses.surveyId, surveyId));
  }

  revalidatePath("/dashboard/surveys");
  return { success: true, deletedCount };
}
