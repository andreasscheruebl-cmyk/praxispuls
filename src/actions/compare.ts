"use server";

import { z } from "zod";
import { getActivePractice } from "./practice";
import { getPracticesForUser } from "@/lib/practice";
import { getUser } from "@/lib/auth";
import {
  getComparisonStats,
  getSurveyByTemplateAndPractice,
} from "@/lib/db/queries/compare";
import type { ComparisonStats } from "@/lib/db/queries/compare";

// ============================================================
// SCHEMAS
// ============================================================

const surveyStatsSchema = z.object({
  surveyId: z.string().uuid(),
});

const timeRangeSchema = z
  .object({
    surveyId: z.string().uuid(),
    from: z.string().datetime(),
    to: z.string().datetime(),
  })
  .refine((d) => new Date(d.from) <= new Date(d.to), {
    message: "Startdatum muss vor Enddatum liegen",
  });

const locationSchema = z.object({
  templateId: z.string().uuid(),
  practiceId: z.string().uuid(),
});

// ============================================================
// RESULT TYPE
// ============================================================

type ActionResult =
  | ComparisonStats
  | { error: string; code: string };

// ============================================================
// MODUS 1: Survey Stats
// ============================================================

export async function fetchSurveyStats(
  input: unknown
): Promise<ActionResult> {
  const practice = await getActivePractice();
  if (!practice) return { error: "Praxis nicht gefunden", code: "UNAUTHORIZED" };

  const parsed = surveyStatsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Ungültige Umfrage-ID", code: "VALIDATION_ERROR" };
  }

  try {
    return await getComparisonStats(parsed.data.surveyId, practice.id);
  } catch (error) {
    console.error("[fetchSurveyStats]", error);
    return { error: "Daten konnten nicht geladen werden", code: "INTERNAL_ERROR" };
  }
}

// ============================================================
// MODUS 2: Time Range Stats
// ============================================================

export async function fetchTimeRangeStats(
  input: unknown
): Promise<ActionResult> {
  const practice = await getActivePractice();
  if (!practice) return { error: "Praxis nicht gefunden", code: "UNAUTHORIZED" };

  const parsed = timeRangeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe",
      code: "VALIDATION_ERROR",
    };
  }

  try {
    return await getComparisonStats(parsed.data.surveyId, practice.id, {
      from: new Date(parsed.data.from),
      to: new Date(parsed.data.to),
    });
  } catch (error) {
    console.error("[fetchTimeRangeStats]", error);
    return { error: "Daten konnten nicht geladen werden", code: "INTERNAL_ERROR" };
  }
}

// ============================================================
// MODUS 3: Location Stats
// ============================================================

export async function fetchLocationStats(
  input: unknown
): Promise<ActionResult> {
  // Verify user has access to the target practice
  const user = await getUser();
  const userPractices = await getPracticesForUser(user.id);

  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Ungültige Eingabe", code: "VALIDATION_ERROR" };
  }

  const { templateId, practiceId } = parsed.data;

  // Ownership check: practiceId must belong to this user
  const ownsPractice = userPractices.some((p) => p.id === practiceId);
  if (!ownsPractice) {
    return { error: "Kein Zugriff auf diese Praxis", code: "FORBIDDEN" };
  }

  try {
    // Find the survey for this template + practice
    const match = await getSurveyByTemplateAndPractice(templateId, practiceId);
    if (!match) {
      return { error: "Keine Umfrage für diese Vorlage gefunden", code: "NOT_FOUND" };
    }

    return await getComparisonStats(match.surveyId, practiceId);
  } catch (error) {
    console.error("[fetchLocationStats]", error);
    return { error: "Daten konnten nicht geladen werden", code: "INTERNAL_ERROR" };
  }
}
