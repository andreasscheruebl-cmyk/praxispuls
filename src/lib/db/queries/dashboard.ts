import { db } from "@/lib/db";
import { responses, alerts } from "@/lib/db/schema";
import { eq, and, gte, count, avg, sql, desc } from "drizzle-orm";

/**
 * Get dashboard overview stats for a practice
 */
export async function getDashboardOverview(practiceId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Run all independent queries in parallel
  const [
    [responseCounts],
    [weekCount],
    [categoryAvgs],
    [unreadAlerts],
  ] = await Promise.all([
    db
      .select({
        total: count(),
        promoters: count(
          sql`CASE WHEN ${responses.npsCategory} = 'promoter' THEN 1 END`
        ),
        detractors: count(
          sql`CASE WHEN ${responses.npsCategory} = 'detractor' THEN 1 END`
        ),
        googleClicks: count(
          sql`CASE WHEN ${responses.googleReviewClicked} = true THEN 1 END`
        ),
      })
      .from(responses)
      .where(
        and(
          eq(responses.practiceId, practiceId),
          gte(responses.createdAt, thirtyDaysAgo)
        )
      ),
    db
      .select({ count: count() })
      .from(responses)
      .where(
        and(
          eq(responses.practiceId, practiceId),
          gte(responses.createdAt, sevenDaysAgo)
        )
      ),
    db
      .select({
        waitTime: avg(responses.ratingWaitTime),
        friendliness: avg(responses.ratingFriendliness),
        treatment: avg(responses.ratingTreatment),
        facility: avg(responses.ratingFacility),
      })
      .from(responses)
      .where(
        and(
          eq(responses.practiceId, practiceId),
          gte(responses.createdAt, thirtyDaysAgo)
        )
      ),
    db
      .select({ count: count() })
      .from(alerts)
      .where(
        and(eq(alerts.practiceId, practiceId), eq(alerts.isRead, false))
      ),
  ]);

  // Calculate NPS
  const total = responseCounts?.total ?? 0;
  const promoters = Number(responseCounts?.promoters ?? 0);
  const detractors = Number(responseCounts?.detractors ?? 0);
  const npsScore =
    total > 0
      ? Math.round(((promoters - detractors) / total) * 100)
      : null;

  const googleClicks = Number(responseCounts?.googleClicks ?? 0);

  return {
    npsScore,
    totalResponses: total,
    responsesThisWeek: weekCount?.count ?? 0,
    googleReviewClicks: googleClicks,
    googleConversionRate:
      promoters > 0 ? Math.round((googleClicks / promoters) * 100) : null,
    unreadAlerts: unreadAlerts?.count ?? 0,
    categoryScores: {
      waitTime: categoryAvgs?.waitTime ? Number(categoryAvgs.waitTime) : null,
      friendliness: categoryAvgs?.friendliness
        ? Number(categoryAvgs.friendliness)
        : null,
      treatment: categoryAvgs?.treatment
        ? Number(categoryAvgs.treatment)
        : null,
      facility: categoryAvgs?.facility
        ? Number(categoryAvgs.facility)
        : null,
    },
  };
}

/**
 * Get recent responses for a practice
 */
export async function getRecentResponses(
  practiceId: string,
  limit: number = 20
) {
  return db.query.responses.findMany({
    where: eq(responses.practiceId, practiceId),
    orderBy: [desc(responses.createdAt)],
    limit,
  });
}

/**
 * Count responses for a practice in the current calendar month
 */
export async function getMonthlyResponseCount(practiceId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await db
    .select({ count: count() })
    .from(responses)
    .where(
      and(
        eq(responses.practiceId, practiceId),
        gte(responses.createdAt, startOfMonth)
      )
    );

  return result?.count ?? 0;
}

/**
 * Get review funnel metrics for a practice (last 30 days)
 * Tracks: total responses → NPS categories → Google shown → Google clicked
 */
export async function getReviewFunnel(practiceId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [result] = await db
    .select({
      totalResponses: count(),
      promoters: count(
        sql`CASE WHEN ${responses.npsCategory} = 'promoter' THEN 1 END`
      ),
      passives: count(
        sql`CASE WHEN ${responses.npsCategory} = 'passive' THEN 1 END`
      ),
      detractors: count(
        sql`CASE WHEN ${responses.npsCategory} = 'detractor' THEN 1 END`
      ),
      googleShown: count(
        sql`CASE WHEN ${responses.googleReviewShown} = true THEN 1 END`
      ),
      googleClicked: count(
        sql`CASE WHEN ${responses.googleReviewClicked} = true THEN 1 END`
      ),
    })
    .from(responses)
    .where(
      and(
        eq(responses.practiceId, practiceId),
        gte(responses.createdAt, thirtyDaysAgo)
      )
    );

  const totalResponses = result?.totalResponses ?? 0;
  const promoters = Number(result?.promoters ?? 0);
  const passives = Number(result?.passives ?? 0);
  const detractors = Number(result?.detractors ?? 0);
  const googleShown = Number(result?.googleShown ?? 0);
  const googleClicked = Number(result?.googleClicked ?? 0);

  return {
    totalResponses,
    promoters,
    passives,
    detractors,
    googleShown,
    googleClicked,
    conversionRate:
      promoters > 0 ? Math.round((googleClicked / promoters) * 100) : null,
  };
}

/**
 * Get NPS trend data grouped by week for chart display
 */
export async function getNpsTrend(
  practiceId: string,
  weeks: number = 12
) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const rows = await db
    .select({
      week: sql<string>`to_char(date_trunc('week', ${responses.createdAt}), 'IYYY-IW')`,
      weekStart: sql<string>`to_char(date_trunc('week', ${responses.createdAt}), 'DD.MM.')`,
      total: count(),
      promoters: count(
        sql`CASE WHEN ${responses.npsCategory} = 'promoter' THEN 1 END`
      ),
      detractors: count(
        sql`CASE WHEN ${responses.npsCategory} = 'detractor' THEN 1 END`
      ),
    })
    .from(responses)
    .where(
      and(
        eq(responses.practiceId, practiceId),
        gte(responses.createdAt, since)
      )
    )
    .groupBy(
      sql`date_trunc('week', ${responses.createdAt})`
    )
    .orderBy(sql`date_trunc('week', ${responses.createdAt})`);

  return rows.map((row) => {
    const total = Number(row.total);
    const promoters = Number(row.promoters);
    const detractors = Number(row.detractors);
    const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    return {
      week: row.week,
      label: row.weekStart,
      nps,
      responses: total,
      promoters,
      detractors,
    };
  });
}
