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

  // Response counts
  const [responseCounts] = await db
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
    );

  // Responses this week
  const [weekCount] = await db
    .select({ count: count() })
    .from(responses)
    .where(
      and(
        eq(responses.practiceId, practiceId),
        gte(responses.createdAt, sevenDaysAgo)
      )
    );

  // Category averages
  const [categoryAvgs] = await db
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
    );

  // Unread alerts
  const [unreadAlerts] = await db
    .select({ count: count() })
    .from(alerts)
    .where(
      and(eq(alerts.practiceId, practiceId), eq(alerts.isRead, false))
    );

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
