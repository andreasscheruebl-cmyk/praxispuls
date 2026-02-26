import { db } from "@/lib/db";
import { practices, responses, auditEvents, loginEvents } from "@/lib/db/schema";
import type { Practice } from "@/lib/db/schema";
import type { PlanId } from "@/types";
import { getEffectivePlan } from "@/lib/plans";
import { eq, isNull, isNotNull, ilike, or, and, count, sql, desc, gte, lte } from "drizzle-orm";

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

/**
 * Extended platform stats: responses (30d), Google connection rate, registrations trend.
 */
export async function getExtendedPlatformStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [responsesResult] = await db
    .select({ total: count() })
    .from(responses)
    .where(gte(responses.createdAt, thirtyDaysAgo));

  const allPractices = await db.query.practices.findMany({
    where: isNull(practices.deletedAt),
  });

  const withGoogle = allPractices.filter((p) => p.googlePlaceId).length;
  const googleRate = allPractices.length > 0
    ? Math.round((withGoogle / allPractices.length) * 100)
    : 0;

  // Registrations per day (last 30 days)
  const registrations = await db
    .select({
      date: sql<string>`to_char(${practices.createdAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(practices)
    .where(and(
      isNull(practices.deletedAt),
      gte(practices.createdAt, thirtyDaysAgo),
    ))
    .groupBy(sql`to_char(${practices.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${practices.createdAt}, 'YYYY-MM-DD')`);

  return {
    responses30d: responsesResult?.total ?? 0,
    googleRate,
    withGoogle,
    totalPractices: allPractices.length,
    registrations,
  };
}

// ============================================================
// AUDIT EVENTS
// ============================================================

export interface AuditFilter {
  practiceId?: string;
  action?: string;
  from?: string; // ISO date
  to?: string;   // ISO date
  page?: number;
  pageSize?: number;
}

/**
 * Get audit events with filtering and pagination.
 */
export async function getAuditEvents(filter: AuditFilter) {
  const { practiceId, action, from, to, page = 1, pageSize = 20 } = filter;

  const conditions = [];

  if (practiceId) {
    conditions.push(eq(auditEvents.practiceId, practiceId));
  }
  if (action) {
    conditions.push(eq(auditEvents.action, action));
  }
  if (from) {
    conditions.push(gte(auditEvents.createdAt, new Date(from)));
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(auditEvents.createdAt, toDate));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ total: count() })
    .from(auditEvents)
    .where(where);

  const total = totalResult?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const events = await db.query.auditEvents.findMany({
    where,
    orderBy: [desc(auditEvents.createdAt)],
    limit: pageSize,
    offset,
    with: {
      practice: { columns: { name: true, email: true } },
    },
  });

  return { events, total, page, pageSize };
}

/**
 * Get distinct audit action types (for filter dropdown).
 */
export async function getAuditActionTypes() {
  const result = await db
    .selectDistinct({ action: auditEvents.action })
    .from(auditEvents)
    .orderBy(auditEvents.action);

  return result.map((r) => r.action);
}

// ============================================================
// LOGIN EVENTS
// ============================================================

export interface LoginFilter {
  practiceId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Get login events with filtering and pagination.
 */
export async function getLoginEvents(filter: LoginFilter) {
  const { practiceId, from, to, page = 1, pageSize = 20 } = filter;

  const conditions = [];

  if (practiceId) {
    conditions.push(eq(loginEvents.practiceId, practiceId));
  }
  if (from) {
    conditions.push(gte(loginEvents.createdAt, new Date(from)));
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(loginEvents.createdAt, toDate));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ total: count() })
    .from(loginEvents)
    .where(where);

  const total = totalResult?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const events = await db.query.loginEvents.findMany({
    where,
    orderBy: [desc(loginEvents.createdAt)],
    limit: pageSize,
    offset,
    with: {
      practice: { columns: { name: true, email: true } },
    },
  });

  return { events, total, page, pageSize };
}
