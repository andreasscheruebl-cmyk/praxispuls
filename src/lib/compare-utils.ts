/**
 * Pure utility functions for comparison dashboard.
 * Extracted from db/queries/compare.ts for testability (no DB import).
 */

export interface CategoryScore {
  category: string;
  avgScore: number;
  maxScore: number;
  responseCount: number;
}

type QuestionJson = {
  id: string;
  type: string;
  label: string;
  category?: string;
};

const SCORABLE_TYPES = new Set(["stars", "likert", "nps", "enps"]);

export function calculateNps(
  promoters: number,
  detractors: number,
  total: number
): number | null {
  return total > 0
    ? Math.round(((promoters - detractors) / total) * 100)
    : null;
}

export function buildQuestionMeta(questions: QuestionJson[]) {
  const meta = new Map<string, { category: string; maxScore: number }>();
  for (const q of questions) {
    if (!q.category || !SCORABLE_TYPES.has(q.type)) continue;
    const maxScore = q.type === "nps" || q.type === "enps" ? 10 : 5;
    meta.set(q.id, { category: q.category, maxScore });
  }
  return meta;
}

export function aggregateCategoryScores(
  answerRows: { answers: Record<string, unknown> | null }[],
  questionMeta: Map<string, { category: string; maxScore: number }>
): CategoryScore[] {
  const categoryAgg = new Map<
    string,
    { sum: number; count: number; maxScore: number }
  >();

  for (const row of answerRows) {
    const answers = row.answers;
    if (!answers) continue;

    for (const [questionId, value] of Object.entries(answers)) {
      const meta = questionMeta.get(questionId);
      if (!meta) continue;

      const numValue = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(numValue)) continue;

      const existing = categoryAgg.get(meta.category);
      if (existing) {
        existing.sum += numValue;
        existing.count += 1;
      } else {
        categoryAgg.set(meta.category, {
          sum: numValue,
          count: 1,
          maxScore: meta.maxScore,
        });
      }
    }
  }

  const scores: CategoryScore[] = [];
  for (const [category, agg] of categoryAgg) {
    scores.push({
      category,
      avgScore: Math.round((agg.sum / agg.count) * 10) / 10,
      maxScore: agg.maxScore,
      responseCount: agg.count,
    });
  }
  scores.sort((a, b) => a.category.localeCompare(b.category, "de"));
  return scores;
}
