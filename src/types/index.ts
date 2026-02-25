// Re-export DB types
export type {
  Practice,
  NewPractice,
  Survey,
  NewSurvey,
  Response,
  NewResponse,
  Alert,
  NewAlert,
} from "@/lib/db/schema";

// ============================================================
// Survey Template Types
// ============================================================
export type SurveyTemplateId =
  | "zahnarzt_standard"
  | "zahnarzt_kurz"
  | "zahnarzt_prophylaxe";

export type SurveyQuestion = {
  id: string;
  type: "nps" | "stars" | "freetext";
  label: string;
  required: boolean;
  category?: string;
};

export type SurveyTemplate = {
  id: SurveyTemplateId;
  name: string;
  description: string;
  questions: SurveyQuestion[];
};

// ============================================================
// Dashboard Types
// ============================================================
export type DashboardOverview = {
  npsScore: number | null;
  npsTrend: number | null; // change vs last period
  totalResponses: number;
  responsesThisWeek: number;
  googleReviewClicks: number;
  googleConversionRate: number | null;
  unreadAlerts: number;
  categoryScores: {
    waitTime: number | null;
    friendliness: number | null;
    treatment: number | null;
    facility: number | null;
  };
};

// ============================================================
// Plan Types
// ============================================================
export type PlanId = "free" | "starter" | "professional";

export type PlanLimits = {
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
