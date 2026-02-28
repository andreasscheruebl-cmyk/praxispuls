import { z } from "zod";

// ============================================================
// ENV VALIDATION
// ============================================================
export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  GOOGLE_PLACES_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// ============================================================
// AUTH
// ============================================================
export const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
});

export const registerSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
  practiceName: z
    .string()
    .min(2, "Bitte geben Sie den Namen Ihrer Praxis ein."),
});

// ============================================================
// PRACTICE
// ============================================================
export const practiceUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Bitte geben Sie eine gültige PLZ ein.")
    .optional(),
  googlePlaceId: z.string().optional(),
  alertEmail: z.string().email().optional(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  industryCategory: z.enum([
    "gesundheit", "handwerk", "beauty", "gastronomie", "fitness",
    "einzelhandel", "bildung", "vereine", "beratung", "individuell",
  ]).optional(),
  industrySubCategory: z.string().min(1).max(50).optional(),
  npsThreshold: z.number().int().min(7).max(10).optional(),
  googleRedirectEnabled: z.boolean().optional(),
});

// ============================================================
// SURVEY RESPONSE (Public – from patient/employee)
// ============================================================
export const surveyResponseSchema = z.object({
  surveyId: z.string().uuid(),
  answers: z.record(
    z.string().max(100),
    z.union([z.number().int().min(0).max(10), z.string().max(2000), z.boolean()])
  ).refine(
    (obj) => Object.keys(obj).length <= 50,
    "Too many answers"
  ),
  channel: z.enum(["qr", "link", "email"]).default("qr"),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  sessionHash: z.string().optional(),
});

// ============================================================
// ALERT
// ============================================================
export const alertNoteSchema = z.object({
  note: z.string().max(1000),
});

// ============================================================
// ADMIN – Practice Management
// ============================================================
export const adminEmailChangeSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
});

export const adminSuspendSchema = z.object({
  suspended: z.boolean(),
});

export const adminBanSchema = z.object({
  banned: z.boolean(),
});

export const adminSetPasswordSchema = z.object({
  password: z.string().min(8, "Mindestens 8 Zeichen"),
});

export const adminGoogleUpdateSchema = z.object({
  googlePlaceId: z.string().nullable().optional(),
  googleRedirectEnabled: z.boolean().optional(),
});

// ============================================================
// SURVEY QUESTION (shared validation for template + survey JSONB)
// ============================================================
export const QUESTION_TYPES = [
  "nps", "stars", "freetext", "enps", "likert", "single-choice", "yes-no",
] as const;
export type SurveyQuestionType = (typeof QUESTION_TYPES)[number];

export const INDUSTRY_CATEGORIES = [
  "gesundheit", "handwerk", "beauty", "gastronomie", "fitness",
  "einzelhandel", "bildung", "vereine", "beratung", "individuell",
] as const;
export type IndustryCategory = (typeof INDUSTRY_CATEGORIES)[number];

export const RESPONDENT_TYPES = [
  "patient", "tierhalter", "kunde", "gast", "mitglied", "fahrschueler",
  "schueler", "eltern", "mandant", "mitarbeiter", "individuell", "teilnehmer",
] as const;
export type RespondentType = (typeof RESPONDENT_TYPES)[number];

// ============================================================
// PRACTICE CREATE (Onboarding + AddLocation)
// ============================================================
export const practiceCreateSchema = z.object({
  name: z.string().min(2).max(200),
  industryCategory: z.enum(INDUSTRY_CATEGORIES),
  industrySubCategory: z.string().min(1).max(50),
  googlePlaceId: z.string().max(200).optional(),
  templateId: z.string().uuid(),
});

export const surveyQuestionSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum(QUESTION_TYPES),
  label: z.string().min(1).max(500),
  required: z.boolean(),
  category: z.string().max(50).optional(),
  options: z.array(z.string().max(200)).max(10).optional(),
});

// ============================================================
// TEMPLATE CREATE / UPDATE (Admin CRUD)
// ============================================================
export const templateCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES),
  industrySubCategory: z.string().max(50).optional(),
  respondentType: z.enum(RESPONDENT_TYPES),
  category: z.enum(["customer", "employee"]),
  questions: z.array(surveyQuestionSchema).min(1).max(30),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const templateUpdateSchema = templateCreateSchema.partial();

// ============================================================
// TEMPLATE CUSTOMIZATION (Light Customization at Survey creation)
// ============================================================
export const templateCustomizationSchema = z.object({
  templateId: z.string().uuid(),
  disabledQuestionIds: z.array(z.string()).optional(),
  labelOverrides: z.record(z.string(), z.string().max(500)).optional(),
  customQuestions: z.array(surveyQuestionSchema).max(3).optional(),
});

// ============================================================
// SURVEY CREATE / UPDATE (Dashboard Management)
// ============================================================
export const surveyCreateSchema = z.object({
  templateId: z.string().uuid(),
  title: z.string().min(2).max(200),
  disabledQuestionIds: z.array(z.string().max(50)).max(30).optional(),
  labelOverrides: z.record(z.string().max(50), z.string().max(500)).optional(),
  customQuestions: z.array(surveyQuestionSchema).max(3).optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  autoDeleteAfterMonths: z.number().int().min(1).max(36).optional().nullable(),
});

export const surveyUpdateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  autoDeleteAfterMonths: z.number().int().min(1).max(36).optional().nullable(),
});

