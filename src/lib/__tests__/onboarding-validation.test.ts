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

  it("accepts all 10 valid industry categories", () => {
    const categories = [
      "gesundheit", "handwerk", "beauty", "gastronomie", "fitness",
      "einzelhandel", "bildung", "vereine", "beratung", "individuell",
    ];
    for (const cat of categories) {
      const result = practiceCreateSchema.safeParse({
        ...validInput,
        industryCategory: cat,
      });
      expect(result.success, `${cat} should be valid`).toBe(true);
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
});
