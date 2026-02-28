import { db } from "@/lib/db";
import { surveys, surveyTemplates, responses } from "@/lib/db/schema";
import { eq, and, isNull, count, sql, desc } from "drizzle-orm";

// ============================================================
// TYPES
// ============================================================

export interface SurveyWithStats {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "active" | "paused" | "archived";
  description: string | null;
  respondentType: string | null;
  templateId: string | null;
  templateName: string | null;
  templateCategory: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  autoDeleteAfterMonths: number | null;
  responseCount: number;
  npsScore: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// ============================================================
// QUERIES
// ============================================================

/**
 * Get all surveys for a practice with response stats.
 * Joins templates for name + category, aggregates responses for count + NPS.
 */
export async function getSurveysWithStats(
  practiceId: string
): Promise<SurveyWithStats[]> {
  const rows = await db
    .select({
      id: surveys.id,
      title: surveys.title,
      slug: surveys.slug,
      status: surveys.status,
      description: surveys.description,
      respondentType: surveys.respondentType,
      templateId: surveys.templateId,
      templateName: surveyTemplates.name,
      templateCategory: surveyTemplates.category,
      startsAt: surveys.startsAt,
      endsAt: surveys.endsAt,
      autoDeleteAfterMonths: surveys.autoDeleteAfterMonths,
      createdAt: surveys.createdAt,
      updatedAt: surveys.updatedAt,
      responseCount: count(responses.id),
      promoters: count(
        sql`CASE WHEN ${responses.npsCategory} = 'promoter' THEN 1 END`
      ),
      detractors: count(
        sql`CASE WHEN ${responses.npsCategory} = 'detractor' THEN 1 END`
      ),
    })
    .from(surveys)
    .leftJoin(surveyTemplates, eq(surveys.templateId, surveyTemplates.id))
    .leftJoin(responses, eq(surveys.id, responses.surveyId))
    .where(
      and(
        eq(surveys.practiceId, practiceId),
        isNull(surveys.deletedAt)
      )
    )
    .groupBy(
      surveys.id,
      surveyTemplates.name,
      surveyTemplates.category
    )
    .orderBy(
      // Active first, then by updatedAt desc
      sql`CASE WHEN ${surveys.status} = 'active' THEN 0
           WHEN ${surveys.status} = 'draft' THEN 1
           WHEN ${surveys.status} = 'paused' THEN 2
           ELSE 3 END`,
      desc(surveys.updatedAt)
    );

  return rows.map((row) => {
    const total = Number(row.responseCount);
    const promoters = Number(row.promoters);
    const detractors = Number(row.detractors);
    const npsScore =
      total > 0
        ? Math.round(((promoters - detractors) / total) * 100)
        : null;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status!,
      description: row.description,
      respondentType: row.respondentType,
      templateId: row.templateId,
      templateName: row.templateName ?? null,
      templateCategory: row.templateCategory ?? null,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      autoDeleteAfterMonths: row.autoDeleteAfterMonths,
      responseCount: total,
      npsScore,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });
}

/**
 * Count non-deleted surveys for a practice.
 */
export async function getSurveyCount(practiceId: string): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(surveys)
    .where(
      and(
        eq(surveys.practiceId, practiceId),
        isNull(surveys.deletedAt)
      )
    );
  return result?.total ?? 0;
}

/**
 * Count responses for a specific survey.
 */
export async function getSurveyResponseCount(
  surveyId: string
): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(responses)
    .where(eq(responses.surveyId, surveyId));
  return result?.total ?? 0;
}
