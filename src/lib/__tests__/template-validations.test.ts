import { describe, it, expect } from "vitest";
import {
  surveyQuestionSchema,
  templateCreateSchema,
  templateCustomizationSchema,
} from "../validations";

describe("surveyQuestionSchema", () => {
  it("accepts valid question", () => {
    const result = surveyQuestionSchema.safeParse({
      id: "nps",
      type: "nps",
      label: "How likely are you to recommend?",
      required: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts question with category and options", () => {
    const result = surveyQuestionSchema.safeParse({
      id: "satisfaction",
      type: "single-choice",
      label: "Zufriedenheit",
      required: false,
      category: "satisfaction",
      options: ["Sehr gut", "Gut", "Befriedigend"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    const result = surveyQuestionSchema.safeParse({
      id: "",
      type: "stars",
      label: "Test",
      required: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = surveyQuestionSchema.safeParse({
      id: "test",
      type: "invalid",
      label: "Test",
      required: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects label over 500 chars", () => {
    const result = surveyQuestionSchema.safeParse({
      id: "test",
      type: "stars",
      label: "x".repeat(501),
      required: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 10 options", () => {
    const result = surveyQuestionSchema.safeParse({
      id: "test",
      type: "single-choice",
      label: "Test",
      required: false,
      options: Array.from({ length: 11 }, (_, i) => `Opt ${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("templateCreateSchema", () => {
  const validTemplate = {
    name: "Test Template",
    industryCategory: "gesundheit" as const,
    respondentType: "patient" as const,
    category: "customer" as const,
    questions: [
      { id: "nps", type: "nps" as const, label: "NPS?", required: true },
    ],
  };

  it("accepts valid template", () => {
    const result = templateCreateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
  });

  it("accepts template with all optional fields", () => {
    const result = templateCreateSchema.safeParse({
      ...validTemplate,
      description: "A test template",
      industrySubCategory: "zahnarzt",
      sortOrder: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = templateCreateSchema.safeParse({
      ...validTemplate,
      name: "x",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid industry category", () => {
    const result = templateCreateSchema.safeParse({
      ...validTemplate,
      industryCategory: "nonexistent",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty questions array", () => {
    const result = templateCreateSchema.safeParse({
      ...validTemplate,
      questions: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 30 questions", () => {
    const result = templateCreateSchema.safeParse({
      ...validTemplate,
      questions: Array.from({ length: 31 }, (_, i) => ({
        id: `q${i}`,
        type: "stars",
        label: `Question ${i}`,
        required: false,
      })),
    });
    expect(result.success).toBe(false);
  });
});

describe("templateCustomizationSchema", () => {
  it("accepts valid customization", () => {
    const result = templateCustomizationSchema.safeParse({
      templateId: "550e8400-e29b-41d4-a716-446655440000",
      disabledQuestionIds: ["stars_1"],
      labelOverrides: { nps: "Custom NPS question?" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts customization with custom questions", () => {
    const result = templateCustomizationSchema.safeParse({
      templateId: "550e8400-e29b-41d4-a716-446655440000",
      customQuestions: [
        { id: "custom_1", type: "stars", label: "Extra question", required: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 3 custom questions", () => {
    const result = templateCustomizationSchema.safeParse({
      templateId: "550e8400-e29b-41d4-a716-446655440000",
      customQuestions: Array.from({ length: 4 }, (_, i) => ({
        id: `custom_${i}`,
        type: "stars",
        label: `Custom ${i}`,
        required: false,
      })),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID templateId", () => {
    const result = templateCustomizationSchema.safeParse({
      templateId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});
