import { db } from "@/lib/db";
import { responses, surveys, surveyTemplates } from "@/lib/db/schema";
import { eq, and, gte, lte, count, sql, isNull } from "drizzle-orm";
import {
  calculateNps,
  buildQuestionMeta,
  aggregateCategoryScores,
} from "@/lib/compare-utils";
import type { CategoryScore } from "@/lib/compare-utils";

// Re-export types for consumers
export type { CategoryScore } from "@/lib/compare-utils";

// ============================================================
// TYPES
// ============================================================

export interface ComparisonStats {
  npsScore: number | null;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  categoryScores: CategoryScore[];
}

type QuestionJson = {
  id: string;
  type: string;
  label: string;
  category?: string;
};

// ============================================================
// CORE: getComparisonStats
// ============================================================

/**
 * Get NPS + category scores for a survey, optionally filtered by date range.
 * Verifies ownership via practiceId in WHERE clause.
 */
export async function getComparisonStats(
  surveyId: string,
  practiceId: string,
  dateRange?: { from: Date; to: Date }
): Promise<ComparisonStats> {
  // Build WHERE conditions
  const conditions = [
    eq(responses.surveyId, surveyId),
    eq(responses.practiceId, practiceId),
  ];
  if (dateRange) {
    conditions.push(gte(responses.createdAt, dateRange.from));
    conditions.push(lte(responses.createdAt, dateRange.to));
  }

  // Step 1: NPS aggregation (same pattern as dashboard.ts)
  const [npsCounts] = await db
    .select({
      total: count(),
      promoters: count(
        sql`CASE WHEN ${responses.npsCategory} = 'promoter' THEN 1 END`
      ),
      passives: count(
        sql`CASE WHEN ${responses.npsCategory} = 'passive' THEN 1 END`
      ),
      detractors: count(
        sql`CASE WHEN ${responses.npsCategory} = 'detractor' THEN 1 END`
      ),
    })
    .from(responses)
    .where(and(...conditions));

  const total = npsCounts?.total ?? 0;
  const promoters = Number(npsCounts?.promoters ?? 0);
  const passives = Number(npsCounts?.passives ?? 0);
  const detractors = Number(npsCounts?.detractors ?? 0);
  const npsScore = calculateNps(promoters, detractors, total);

  // Step 2: Category scores from answers JSONB
  const survey = await db.query.surveys.findFirst({
    where: and(eq(surveys.id, surveyId), eq(surveys.practiceId, practiceId)),
    columns: { questions: true },
  });

  const questions = (survey?.questions ?? []) as QuestionJson[];
  const questionMeta = buildQuestionMeta(questions);

  if (questionMeta.size === 0) {
    return { npsScore, totalResponses: total, promoters, passives, detractors, categoryScores: [] };
  }

  const answerRows = await db
    .select({ answers: responses.answers })
    .from(responses)
    .where(and(...conditions));

  const categoryScores = aggregateCategoryScores(
    answerRows as { answers: Record<string, unknown> | null }[],
    questionMeta
  );

  return { npsScore, totalResponses: total, promoters, passives, detractors, categoryScores };
}

// ============================================================
// MODUS 3: Shared Templates
// ============================================================

/**
 * Find templates shared across ≥2 of the user's practices.
 */
export async function getSharedTemplates(practiceIds: string[]) {
  if (practiceIds.length < 2) return [];

  const rows = await db
    .select({
      templateId: surveys.templateId,
      templateName: surveyTemplates.name,
      practiceCount: sql<number>`count(distinct ${surveys.practiceId})`,
    })
    .from(surveys)
    .innerJoin(surveyTemplates, eq(surveys.templateId, surveyTemplates.id))
    .where(
      and(
        sql`${surveys.practiceId} IN (${sql.join(
          practiceIds.map((id) => sql`${id}`),
          sql`, `
        )})`,
        isNull(surveys.deletedAt)
      )
    )
    .groupBy(surveys.templateId, surveyTemplates.name)
    .having(sql`count(distinct ${surveys.practiceId}) >= 2`);

  return rows.map((r) => ({
    templateId: r.templateId!,
    templateName: r.templateName,
    practiceCount: Number(r.practiceCount),
  }));
}

// ============================================================
// MODUS 3: Survey by Template + Practice
// ============================================================

/**
 * Get the first (active > draft > paused) survey for a given template at a practice.
 */
export async function getSurveyByTemplateAndPractice(
  templateId: string,
  practiceId: string
) {
  const survey = await db.query.surveys.findFirst({
    where: and(
      eq(surveys.templateId, templateId),
      eq(surveys.practiceId, practiceId),
      isNull(surveys.deletedAt)
    ),
    columns: { id: true, title: true },
    orderBy: (s, { asc }) => [
      sql`CASE WHEN ${s.status} = 'active' THEN 0
           WHEN ${s.status} = 'draft' THEN 1
           WHEN ${s.status} = 'paused' THEN 2
           ELSE 3 END`,
      asc(s.createdAt),
    ],
  });

  if (!survey) return null;
  return { surveyId: survey.id, surveyTitle: survey.title };
}
