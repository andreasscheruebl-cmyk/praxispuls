"use server";

import { db } from "@/lib/db";
import { surveys } from "@/lib/db/schema";
import { getActivePractice } from "./practice";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SURVEY_TEMPLATES } from "@/lib/survey-templates";

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

/**
 * Toggle survey active state
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

  await db
    .update(surveys)
    .set({ isActive: !survey.isActive, updatedAt: new Date() })
    .where(eq(surveys.id, surveyId));

  revalidatePath("/dashboard");
}

/**
 * Change survey template
 */
export async function changeSurveyTemplate(
  surveyId: string,
  templateId: string
) {
  const practice = await getActivePractice();
  if (!practice) throw new Error("Praxis nicht gefunden");

  const template = SURVEY_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error("Template nicht gefunden");

  // Ownership check: verify survey belongs to active practice
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  });
  if (!survey || survey.practiceId !== practice.id) {
    throw new Error("Umfrage nicht gefunden");
  }

  await db
    .update(surveys)
    .set({
      questions: template.questions,
      updatedAt: new Date(),
    })
    .where(and(eq(surveys.id, surveyId), eq(surveys.practiceId, practice.id)));

  revalidatePath("/dashboard/settings");
}
