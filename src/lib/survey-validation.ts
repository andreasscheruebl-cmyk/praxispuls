import type { SurveyQuestion, SurveyAnswers } from "@/types";
import type { SurveyStep } from "./survey-steps";

/**
 * Server-side validation of answers against question definitions.
 * Returns an array of error messages (empty = valid).
 */
export function validateAnswers(
  questions: SurveyQuestion[],
  answers: SurveyAnswers
): string[] {
  const errors: string[] = [];

  // Reject unknown answer keys (prevents arbitrary data injection)
  const questionIds = new Set(questions.map((q) => q.id));
  for (const key of Object.keys(answers)) {
    if (!questionIds.has(key)) {
      errors.push(`Unbekanntes Feld: "${key}"`);
    }
  }

  for (const q of questions) {
    const value = answers[q.id];
    const hasValue = value !== undefined && value !== null && value !== "";

    // Required check
    if (q.required && !hasValue) {
      errors.push(`Frage "${q.label}" ist erforderlich.`);
      continue;
    }

    // Skip validation if no value provided for optional questions
    if (!hasValue) continue;

    // Type-specific validation
    switch (q.type) {
      case "nps":
      case "enps": {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10) {
          errors.push(`"${q.label}": Wert muss zwischen 0 und 10 liegen.`);
        }
        break;
      }
      case "stars":
      case "likert": {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
          errors.push(`"${q.label}": Wert muss zwischen 1 und 5 liegen.`);
        }
        break;
      }
      case "freetext": {
        if (typeof value !== "string" || value.length > 2000) {
          errors.push(`"${q.label}": Maximal 2000 Zeichen.`);
        }
        break;
      }
      case "single-choice": {
        if (typeof value !== "string" || !q.options?.includes(value)) {
          errors.push(`"${q.label}": Ungültige Auswahl.`);
        }
        break;
      }
      case "yes-no": {
        if (typeof value !== "boolean") {
          errors.push(`"${q.label}": Muss Ja oder Nein sein.`);
        }
        break;
      }
      default: {
        const _exhaustive: never = q.type;
        errors.push(`Unbekannter Fragetyp: ${String(_exhaustive)}`);
      }
    }
  }

  return errors;
}

/**
 * Client-side check: can the user proceed past this step?
 * Returns true when all required questions in the step have valid answers.
 */
export function canProceedStep(
  step: SurveyStep,
  answers: SurveyAnswers
): boolean {
  for (const q of step.questions) {
    if (!q.required) continue;

    const value = answers[q.id];
    if (value === undefined || value === null) return false;

    // Type-specific checks for "has a valid value"
    switch (q.type) {
      case "nps":
      case "enps":
        if (typeof value !== "number" || value < 0 || value > 10) return false;
        break;
      case "stars":
      case "likert":
        if (typeof value !== "number" || value < 1 || value > 5) return false;
        break;
      case "freetext":
        if (typeof value !== "string" || value.length === 0) return false;
        break;
      case "single-choice":
        if (typeof value !== "string" || value.length === 0 || !q.options?.includes(value)) return false;
        break;
      case "yes-no":
        if (typeof value !== "boolean") return false;
        break;
      default: {
        const _exhaustive: never = q.type;
        throw new Error(`Unknown question type: ${String(_exhaustive)}`);
      }
    }
  }

  return true;
}
