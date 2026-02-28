import type { SurveyQuestion } from "@/types";

// ============================================================
// Survey Step — a group of questions shown together on one screen
// ============================================================
export type SurveyStep = {
  id: string;
  questions: SurveyQuestion[];
};

/**
 * Build display steps from a flat list of survey questions.
 *
 * Grouping rules:
 * 1. NPS/eNPS → each gets its own step (always first)
 * 2. Stars/Likert/single-choice/yes-no → max 3 per step
 * 3. Freetext → each gets its own step (always last)
 */
export function buildSteps(questions: SurveyQuestion[]): SurveyStep[] {
  if (questions.length === 0) return [];

  const npsQuestions: SurveyQuestion[] = [];
  const groupableQuestions: SurveyQuestion[] = [];
  const freetextQuestions: SurveyQuestion[] = [];

  for (const q of questions) {
    switch (q.type) {
      case "nps":
      case "enps":
        npsQuestions.push(q);
        break;
      case "freetext":
        freetextQuestions.push(q);
        break;
      default:
        groupableQuestions.push(q);
    }
  }

  const steps: SurveyStep[] = [];
  let stepCounter = 0;

  // NPS/eNPS: each in its own step
  for (const q of npsQuestions) {
    steps.push({ id: `step-${stepCounter++}`, questions: [q] });
  }

  // Groupable types: max 3 per step
  for (let i = 0; i < groupableQuestions.length; i += 3) {
    const chunk = groupableQuestions.slice(i, i + 3);
    steps.push({ id: `step-${stepCounter++}`, questions: chunk });
  }

  // Freetext: each in its own step
  for (const q of freetextQuestions) {
    steps.push({ id: `step-${stepCounter++}`, questions: [q] });
  }

  return steps;
}

/**
 * Generate a heading for a step based on the question types it contains.
 */
export function getStepHeading(step: SurveyStep): string {
  if (step.questions.length === 0) return "";

  const types = new Set(step.questions.map((q) => q.type));

  if (types.has("nps")) return "Ihre Weiterempfehlung";
  if (types.has("enps")) return "Ihre Weiterempfehlung";
  if (types.has("freetext")) return "Ihr persönliches Feedback";

  if (types.has("stars")) return "Ihre Bewertung";
  if (types.has("likert")) return "Ihre Einschätzung";

  return "Ihre Angaben";
}
