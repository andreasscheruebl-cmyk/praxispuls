import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import type { Practice } from "@/lib/db/schema";
import type { PlanId } from "@/types";
import { getEffectivePlan } from "@/lib/plans";
import { eq, isNull, isNotNull, ilike, or, and, count, sql, desc } from "drizzle-orm";

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
 * Filter params for practices list.
 */
export interface PracticesFilter {
  search?: string;
  plan?: PlanId;
  hasGoogle?: boolean;
  hasOverride?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Get practices with search, filter, and pagination.
 * Plan filter is applied in-app since getEffectivePlan() is app logic.
 */
export async function getPracticesFiltered(filter: PracticesFilter) {
  const { search, plan, hasGoogle, hasOverride, page = 1, pageSize = 20 } = filter;

  const conditions = [isNull(practices.deletedAt)];

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(practices.name, pattern),
        ilike(practices.email, pattern)
      )!
    );
  }

  if (hasGoogle === true) {
    conditions.push(isNotNull(practices.googlePlaceId));
  } else if (hasGoogle === false) {
    conditions.push(isNull(practices.googlePlaceId));
  }

  if (hasOverride === true) {
    conditions.push(isNotNull(practices.planOverride));
  } else if (hasOverride === false) {
    conditions.push(isNull(practices.planOverride));
  }

  const where = and(...conditions);

  // If plan filter is set, we need all results to filter in-app
  if (plan) {
    const allResults = await db.query.practices.findMany({
      where,
      orderBy: [desc(practices.createdAt)],
    });

    const filtered = allResults.filter(
      (p: Practice) => getEffectivePlan(p) === plan
    );

    const total = filtered.length;
    const offset = (page - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    return { practices: paginated, total, page, pageSize };
  }

  // No plan filter: use SQL pagination
  const [totalResult] = await db
    .select({ total: count() })
    .from(practices)
    .where(where);

  const total = totalResult?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const results = await db.query.practices.findMany({
    where,
    orderBy: [desc(practices.createdAt)],
    limit: pageSize,
    offset,
  });

  return { practices: results, total, page, pageSize };
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
