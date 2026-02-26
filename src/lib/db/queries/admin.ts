import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq, isNull, count, sql } from "drizzle-orm";

/**
 * Get a single practice by ID (admin use – no ownership check).
 */
export async function getPracticeForAdmin(practiceId: string) {
  return db.query.practices.findFirst({
    where: eq(practices.id, practiceId),
  });
}

/**
 * Get all practices (admin list view).
 */
export async function getAllPractices() {
  return db.query.practices.findMany({
    where: isNull(practices.deletedAt),
    orderBy: [practices.createdAt],
  });
}

/**
 * Set a plan override on a practice.
 */
export async function setPlanOverride(
  practiceId: string,
  override: { plan: string; reason: string; expiresAt: Date | null }
) {
  return db
    .update(practices)
    .set({
      planOverride: override.plan,
      overrideReason: override.reason,
      overrideExpiresAt: override.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(practices.id, practiceId));
}

/**
 * Remove a plan override from a practice.
 */
export async function removePlanOverride(practiceId: string) {
  return db
    .update(practices)
    .set({
      planOverride: null,
      overrideReason: null,
      overrideExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(practices.id, practiceId));
}

/**
 * Get platform-wide stats for admin dashboard.
 */
export async function getPlatformStats() {
  const [result] = await db
    .select({
      totalPractices: count(),
      freePlan: count(sql`CASE WHEN ${practices.plan} = 'free' OR ${practices.plan} IS NULL THEN 1 END`),
      starterPlan: count(sql`CASE WHEN ${practices.plan} = 'starter' THEN 1 END`),
      professionalPlan: count(sql`CASE WHEN ${practices.plan} = 'professional' THEN 1 END`),
      withOverride: count(sql`CASE WHEN ${practices.planOverride} IS NOT NULL THEN 1 END`),
    })
    .from(practices)
    .where(isNull(practices.deletedAt));

  return result ?? { totalPractices: 0, freePlan: 0, starterPlan: 0, professionalPlan: 0, withOverride: 0 };
}
