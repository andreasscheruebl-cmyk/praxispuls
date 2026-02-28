import { describe, it, expect } from "vitest";
import { practiceCreateSchema } from "../validations";

describe("practiceCreateSchema", () => {
  const validInput = {
    name: "Zahnarztpraxis Dr. Müller",
    industryCategory: "gesundheit",
    industrySubCategory: "zahnarzt",
    templateId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts valid input", () => {
    const result = practiceCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts input with optional googlePlaceId", () => {
    const result = practiceCreateSchema.safeParse({
      ...validInput,
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = practiceCreateSchema.safeParse({
      ...validInput,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = practiceCreateSchema.safeParse({
      ...validInput,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid industryCategory", () => {
    const result = practiceCreateSchema.safeParse({
      ...validInput,
      industryCategory: "invalid_category",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all 10 valid industry categories with matching sub-categories", () => {
    const pairs: [string, string][] = [
      ["gesundheit", "zahnarzt"],
      ["handwerk", "kfz_werkstatt"],
      ["beauty", "friseur"],
      ["gastronomie", "restaurant"],
      ["fitness", "fitnessstudio"],
      ["einzelhandel", "laden"],
      ["bildung", "fahrschule"],
      ["vereine", "sportverein"],
      ["beratung", "steuerberater"],
      ["individuell", "eigene_branche"],
    ];
    for (const [cat, sub] of pairs) {
      const result = practiceCreateSchema.safeParse({
        ...validInput,
        industryCategory: cat,
        industrySubCategory: sub,
      });
      expect(result.success, `${cat}/${sub} should be valid`).toBe(true);
    }
  });

  it("rejects empty industrySubCategory", () => {
    const result = practiceCreateSchema.safeParse({
      ...validInput,
      industrySubCategory: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID templateId", () => {
    const result = practiceCreateSchema.safeParse({
      ...validInput,
      templateId: "zahnarzt_standard",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing templateId", () => {
    const { templateId: _, ...noTemplate } = validInput;
    const result = practiceCreateSchema.safeParse(noTemplate);
    expect(result.success).toBe(false);
  });

  it("rejects missing industryCategory", () => {
    const { industryCategory: _, ...noCategory } = validInput;
    const result = practiceCreateSchema.safeParse(noCategory);
    expect(result.success).toBe(false);
  });

  it("rejects mismatched category and sub-category", () => {
    const result = practiceCreateSchema.safeParse({
      ...validInput,
      industryCategory: "beauty",
      industrySubCategory: "zahnarzt", // belongs to "gesundheit"
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("industrySubCategory");
    }
  });

  it("accepts matching category and sub-category pairs", () => {
    const pairs = [
      { industryCategory: "gesundheit", industrySubCategory: "zahnarzt" },
      { industryCategory: "handwerk", industrySubCategory: "kfz_werkstatt" },
      { industryCategory: "beauty", industrySubCategory: "friseur" },
      { industryCategory: "individuell", industrySubCategory: "eigene_branche" },
    ];
    for (const pair of pairs) {
      const result = practiceCreateSchema.safeParse({ ...validInput, ...pair });
      expect(result.success, `${pair.industryCategory}/${pair.industrySubCategory} should be valid`).toBe(true);
    }
  });
});
