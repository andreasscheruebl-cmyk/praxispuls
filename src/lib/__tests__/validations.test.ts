import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  practiceUpdateSchema,
  surveyResponseSchema,
  alertNoteSchema,
  envSchema,
} from "../validations";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "dr.mueller@praxis.de",
      password: "sicher123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "sicher123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "dr@praxis.de",
      password: "kurz",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "dr@praxis.de",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      email: "dr@praxis.de",
      password: "sicher123",
      practiceName: "Zahnarztpraxis Müller",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short practice name", () => {
    const result = registerSchema.safeParse({
      email: "dr@praxis.de",
      password: "sicher123",
      practiceName: "X",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing practice name", () => {
    const result = registerSchema.safeParse({
      email: "dr@praxis.de",
      password: "sicher123",
    });
    expect(result.success).toBe(false);
  });
});

describe("practiceUpdateSchema", () => {
  it("accepts valid full update", () => {
    const result = practiceUpdateSchema.safeParse({
      name: "Neue Praxis",
      postalCode: "80331",
      primaryColor: "#FF5733",
      npsThreshold: 9,
      googleRedirectEnabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    const result = practiceUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid PLZ (4 digits)", () => {
    const result = practiceUpdateSchema.safeParse({ postalCode: "8033" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid PLZ (letters)", () => {
    const result = practiceUpdateSchema.safeParse({ postalCode: "ABCDE" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hex color", () => {
    const result = practiceUpdateSchema.safeParse({ primaryColor: "red" });
    expect(result.success).toBe(false);
  });

  it("accepts valid hex color", () => {
    const result = practiceUpdateSchema.safeParse({ primaryColor: "#0a1B2c" });
    expect(result.success).toBe(true);
  });

  it("rejects npsThreshold below 7", () => {
    const result = practiceUpdateSchema.safeParse({ npsThreshold: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects npsThreshold above 10", () => {
    const result = practiceUpdateSchema.safeParse({ npsThreshold: 11 });
    expect(result.success).toBe(false);
  });

  it("accepts valid industry category", () => {
    const result = practiceUpdateSchema.safeParse({ industryCategory: "gesundheit" });
    expect(result.success).toBe(true);
  });

  it("accepts valid industry sub-category", () => {
    const result = practiceUpdateSchema.safeParse({ industrySubCategory: "zahnarztpraxis" });
    expect(result.success).toBe(true);
  });

  it("rejects empty industry category", () => {
    const result = practiceUpdateSchema.safeParse({ industryCategory: "" });
    expect(result.success).toBe(false);
  });
});

describe("surveyResponseSchema", () => {
  const validResponse = {
    surveyId: "550e8400-e29b-41d4-a716-446655440000",
    answers: { nps: 8 },
  };

  it("accepts minimal valid response", () => {
    const result = surveyResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("accepts full valid response with answers", () => {
    const result = surveyResponseSchema.safeParse({
      ...validResponse,
      answers: {
        nps: 8,
        wait_time: 4,
        friendliness: 5,
        treatment: 3,
        facility: 4,
        feedback: "Sehr zufrieden!",
      },
      channel: "link",
      deviceType: "mobile",
      sessionHash: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts response with empty answers", () => {
    const result = surveyResponseSchema.safeParse({
      ...validResponse,
      answers: {},
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID surveyId", () => {
    const result = surveyResponseSchema.safeParse({
      ...validResponse,
      surveyId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing answers field", () => {
    const result = surveyResponseSchema.safeParse({
      surveyId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects answer value out of number range", () => {
    const result = surveyResponseSchema.safeParse({
      ...validResponse,
      answers: { nps: 11 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects answer string over 2000 chars", () => {
    const result = surveyResponseSchema.safeParse({
      ...validResponse,
      answers: { feedback: "x".repeat(2001) },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid channel", () => {
    const result = surveyResponseSchema.safeParse({
      ...validResponse,
      channel: "sms",
    });
    expect(result.success).toBe(false);
  });

  it("defaults channel to qr", () => {
    const result = surveyResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.channel).toBe("qr");
    }
  });
});

describe("alertNoteSchema", () => {
  it("accepts valid note", () => {
    const result = alertNoteSchema.safeParse({ note: "Patient wurde kontaktiert." });
    expect(result.success).toBe(true);
  });

  it("rejects note over 1000 chars", () => {
    const result = alertNoteSchema.safeParse({ note: "x".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("accepts empty note", () => {
    const result = alertNoteSchema.safeParse({ note: "" });
    expect(result.success).toBe(true);
  });
});

describe("envSchema", () => {
  it("accepts valid env with required fields", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "key123",
      SUPABASE_SERVICE_ROLE_KEY: "role123",
      DATABASE_URL: "postgresql://localhost:5432/db",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid supabase URL", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "key123",
      SUPABASE_SERVICE_ROLE_KEY: "role123",
      DATABASE_URL: "postgresql://localhost:5432/db",
    });
    expect(result.success).toBe(false);
  });

  it("defaults NEXT_PUBLIC_APP_URL to localhost", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "key123",
      SUPABASE_SERVICE_ROLE_KEY: "role123",
      DATABASE_URL: "postgresql://localhost:5432/db",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    }
  });
});
