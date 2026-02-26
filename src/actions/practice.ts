"use server";

import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { getUser } from "@/lib/auth";
import { practiceUpdateSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { slugify } from "@/lib/utils";
import { getGoogleReviewLink } from "@/lib/google";
import { SURVEY_TEMPLATES } from "@/lib/survey-templates";
import {
  getPracticesForUser,
  getActivePracticeForUser,
} from "@/lib/practice";
import { PLAN_LIMITS } from "@/types";
import type { PlanId } from "@/types";

const ACTIVE_PRACTICE_COOKIE = "active_practice_id";

/**
 * Get all practices owned by the current user.
 */
export async function getPractices() {
  const user = await getUser();
  return getPracticesForUser(user.id);
}

/**
 * Get the active practice for the current user.
 * Reads `active_practice_id` cookie; falls back to the first practice.
 */
export async function getActivePractice(practiceId?: string) {
  const user = await getUser();
  return getActivePracticeForUser(user.id, practiceId);
}

/**
 * Set the active practice cookie.
 */
export async function setActivePractice(practiceId: string) {
  const user = await getUser();
  const userPractices = await getPracticesForUser(user.id);

  const match = userPractices.find((p) => p.id === practiceId);
  if (!match) throw new Error("Praxis nicht gefunden oder kein Zugriff");

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PRACTICE_COOKIE, practiceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  revalidatePath("/dashboard");
}

/**
 * Create practice during onboarding
 */
export async function createPractice(data: {
  name: string;
  postalCode?: string;
  googlePlaceId?: string;
  surveyTemplate?: string;
}) {
  const user = await getUser();

  // Check location limit against user's plan
  const existingPractices = await getPracticesForUser(user.id);
  const currentCount = existingPractices.length;
  const userPlan = (existingPractices[0]?.plan ?? "free") as PlanId;
  const maxLocations = PLAN_LIMITS[userPlan].maxLocations;

  if (currentCount >= maxLocations) {
    throw new Error(
      `Standort-Limit erreicht: Ihr Plan (${userPlan}) erlaubt maximal ${maxLocations} Standort${maxLocations === 1 ? "" : "e"}.`
    );
  }

  const slug = slugify(data.name);

  const googleReviewUrl = data.googlePlaceId
    ? getGoogleReviewLink(data.googlePlaceId)
    : null;

  const [practice] = await db
    .insert(practices)
    .values({
      ownerUserId: user.id,
      name: data.name,
      slug,
      email: user.email!,
      postalCode: data.postalCode,
      googlePlaceId: data.googlePlaceId,
      googleReviewUrl,
      alertEmail: user.email!,
      surveyTemplate: data.surveyTemplate || "zahnarzt_standard",
    })
    .returning();

  // Create default survey from template
  const templateId = data.surveyTemplate || "zahnarzt_standard";
  const template =
    SURVEY_TEMPLATES.find((t) => t.id === templateId) || SURVEY_TEMPLATES[0]!;

  await db.insert(surveys).values({
    practiceId: practice!.id,
    title: "Patientenbefragung",
    slug: `${slug}-umfrage`,
    questions: template.questions,
    isActive: true,
  });

  // Set as active practice
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PRACTICE_COOKIE, practice!.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  revalidatePath("/dashboard");
  return practice;
}

/**
 * Update practice settings
 */
export async function updatePractice(data: unknown) {
  const user = await getUser();
  const parsed = practiceUpdateSchema.parse(data);

  const practice = await getActivePractice();
  if (!practice) throw new Error("Praxis nicht gefunden");

  // Verify ownership
  if (practice.ownerUserId !== user.id) {
    throw new Error("Kein Zugriff auf diese Praxis");
  }

  const googleReviewUrl = parsed.googlePlaceId
    ? getGoogleReviewLink(parsed.googlePlaceId)
    : practice.googleReviewUrl;

  await db
    .update(practices)
    .set({
      ...parsed,
      googleReviewUrl,
      updatedAt: new Date(),
    })
    .where(eq(practices.id, practice.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}
