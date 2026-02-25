"use server";

import { db } from "@/lib/db";
import { practices, surveys } from "@/lib/db/schema";
import { getUser } from "@/lib/auth";
import { practiceUpdateSchema } from "@/lib/validations";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { getGoogleReviewLink } from "@/lib/google";
import { SURVEY_TEMPLATES } from "@/lib/survey-templates";

/**
 * Get current user's practice
 */
export async function getPractice() {
  const user = await getUser();

  const practice = await db.query.practices.findFirst({
    where: and(eq(practices.email, user.email!), isNull(practices.deletedAt)),
  });

  return practice;
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
  const slug = slugify(data.name);

  const googleReviewUrl = data.googlePlaceId
    ? getGoogleReviewLink(data.googlePlaceId)
    : null;

  // Create practice
  const [practice] = await db
    .insert(practices)
    .values({
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
  const template = SURVEY_TEMPLATES.find((t) => t.id === templateId) || SURVEY_TEMPLATES[0]!;

  await db.insert(surveys).values({
    practiceId: practice!.id,
    title: "Patientenbefragung",
    slug: `${slug}-umfrage`,
    questions: template.questions,
    isActive: true,
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

  const practice = await db.query.practices.findFirst({
    where: eq(practices.email, user.email!),
  });

  if (!practice) throw new Error("Praxis nicht gefunden");

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
