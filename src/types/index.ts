// ============================================================
// Survey Status (derived from pgEnum in schema.ts)
// ============================================================
export type { SurveyStatus } from "@/lib/db/schema";

// ============================================================
// Respondent Types
// ============================================================
export type RespondentType =
  | "patient"
  | "tierhalter"
  | "kunde"
  | "gast"
  | "mitglied"
  | "fahrschueler"
  | "schueler"
  | "eltern"
  | "mandant"
  | "mitarbeiter"
  | "individuell"
  | "teilnehmer";

// ============================================================
// Industry Categories
// ============================================================
export type IndustryCategory =
  | "gesundheit"
  | "handwerk"
  | "beauty"
  | "gastronomie"
  | "fitness"
  | "einzelhandel"
  | "bildung"
  | "vereine"
  | "beratung"
  | "individuell";

// ============================================================
// Survey Template Types
// ============================================================
export type SurveyQuestionType =
  | "nps"
  | "stars"
  | "freetext"
  | "enps"
  | "likert"
  | "single-choice"
  | "yes-no";

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

export type SurveyTemplate = {
  id: SurveyTemplateId;
  name: string;
  description: string;
  questions: SurveyQuestion[];
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
