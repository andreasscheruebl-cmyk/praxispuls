// ============================================================
// Survey Status (derived from pgEnum in schema.ts)
// ============================================================
export type { SurveyStatus } from "@/lib/db/schema";

// ============================================================
// Derived types (single source of truth: as-const arrays in validations.ts)
// ============================================================
import type { SurveyQuestionType, RespondentType, IndustryCategory, IndustrySubCategory } from "@/lib/validations";
export type { SurveyQuestionType, RespondentType, IndustryCategory, IndustrySubCategory };

// ============================================================
// Survey Template Types
// ============================================================

/** @deprecated Use DB-backed templates (survey_templates table) instead */
type SurveyTemplateId =
  | "zahnarzt_standard"
  | "zahnarzt_kurz"
  | "zahnarzt_prophylaxe";

export type SurveyQuestion = {
  id: string;
  type: SurveyQuestionType;
  label: string;
  required: boolean;
  category?: string;
  options?: string[]; // For single-choice questions
};

/** @deprecated Use SurveyTemplateRow from db/schema instead */
export type SurveyTemplate = {
  id: SurveyTemplateId;
  name: string;
  description: string;
  questions: SurveyQuestion[];
};

// ============================================================
// Template Customization (Light Customization)
// ============================================================
export type TemplateCustomization = {
  templateId: string;
  disabledQuestionIds?: string[];
  labelOverrides?: Record<string, string>;
  customQuestions?: SurveyQuestion[];
};

// ============================================================
// Survey Answers (JSONB format)
// ============================================================
export type SurveyAnswers = Record<string, number | string | boolean>;

// ============================================================
// Template Category
// ============================================================
export type TemplateCategory = "customer" | "employee";

// ============================================================
// Plan Types
// ============================================================
export type PlanId = "free" | "starter" | "professional";

type PlanLimits = {
  maxResponsesPerMonth: number;
  maxLocations: number;
  templates: SurveyTemplateId[];
  hasAlerts: boolean;
  hasBranding: boolean;
  hasCustomTimeFilter: boolean;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    maxResponsesPerMonth: 30,
    maxLocations: 1,
    templates: ["zahnarzt_standard"],
    hasAlerts: false,
    hasBranding: false,
    hasCustomTimeFilter: false,
  },
  starter: {
    maxResponsesPerMonth: 200,
    maxLocations: 3,
    templates: ["zahnarzt_standard", "zahnarzt_kurz", "zahnarzt_prophylaxe"],
    hasAlerts: true,
    hasBranding: true,
    hasCustomTimeFilter: true,
  },
  professional: {
    maxResponsesPerMonth: Infinity,
    maxLocations: 10,
    templates: ["zahnarzt_standard", "zahnarzt_kurz", "zahnarzt_prophylaxe"],
    hasAlerts: true,
    hasBranding: true,
    hasCustomTimeFilter: true,
  },
};
