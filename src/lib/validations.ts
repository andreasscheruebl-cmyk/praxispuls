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
  surveyTemplate: z
    .enum(["zahnarzt_standard", "zahnarzt_kurz", "zahnarzt_prophylaxe"])
    .optional(),
  npsThreshold: z.number().int().min(7).max(10).optional(),
  googleRedirectEnabled: z.boolean().optional(),
  theme: z.enum(["standard", "vertrauen"]).optional(),
});

// ============================================================
// SURVEY RESPONSE (Public – from patient)
// ============================================================
export const surveyResponseSchema = z.object({
  surveyId: z.string().uuid(),
  npsScore: z.number().int().min(0).max(10),
  ratingWaitTime: z.number().int().min(1).max(5).optional(),
  ratingFriendliness: z.number().int().min(1).max(5).optional(),
  ratingTreatment: z.number().int().min(1).max(5).optional(),
  ratingFacility: z.number().int().min(1).max(5).optional(),
  freeText: z.string().max(2000).optional(),
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

