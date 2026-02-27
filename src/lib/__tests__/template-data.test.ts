import { describe, it, expect } from "vitest";
import { SYSTEM_TEMPLATES } from "../template-data";

describe("SYSTEM_TEMPLATES", () => {
  it("has 59 templates (28 × 2 customer + 3 employee)", () => {
    expect(SYSTEM_TEMPLATES).toHaveLength(59);
  });

  it("has 56 customer templates and 3 employee templates", () => {
    const customer = SYSTEM_TEMPLATES.filter((t) => t.category === "customer");
    const employee = SYSTEM_TEMPLATES.filter((t) => t.category === "employee");
    expect(customer).toHaveLength(56);
    expect(employee).toHaveLength(3);
  });

  it("all templates have required fields", () => {
    for (const template of SYSTEM_TEMPLATES) {
      expect(template.name).toBeTruthy();
      expect(template.slug).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.industryCategory).toBeTruthy();
      expect(template.respondentType).toBeTruthy();
      expect(template.category).toBeTruthy();
      expect(template.isSystem).toBe(true);
      expect(template.questions.length).toBeGreaterThan(0);
    }
  });

  it("all slugs are unique", () => {
    const slugs = SYSTEM_TEMPLATES.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all customer templates start with NPS", () => {
    const customer = SYSTEM_TEMPLATES.filter((t) => t.category === "customer");
    for (const template of customer) {
      expect(template.questions[0]!.type).toBe("nps");
      expect(template.questions[0]!.required).toBe(true);
    }
  });

  it("all employee templates start with eNPS", () => {
    const employee = SYSTEM_TEMPLATES.filter((t) => t.category === "employee");
    for (const template of employee) {
      expect(template.questions[0]!.type).toBe("enps");
      expect(template.questions[0]!.required).toBe(true);
    }
  });

  it("standard templates have 6 questions (NPS + 4 stars + freetext)", () => {
    const standards = SYSTEM_TEMPLATES.filter(
      (t) => t.category === "customer" && t.slug.endsWith("_standard")
    );
    expect(standards.length).toBe(28);
    for (const template of standards) {
      expect(template.questions).toHaveLength(6);
    }
  });

  it("kurz templates have 2 questions (NPS + freetext)", () => {
    const kurz = SYSTEM_TEMPLATES.filter(
      (t) => t.category === "customer" && t.slug.endsWith("_kurz")
    );
    expect(kurz.length).toBe(28);
    for (const template of kurz) {
      expect(template.questions).toHaveLength(2);
    }
  });

  it("covers all 28 sub-categories", () => {
    const subCategories = new Set(
      SYSTEM_TEMPLATES
        .filter((t) => t.category === "customer")
        .map((t) => t.industrySubCategory)
    );
    expect(subCategories.size).toBe(28);
  });

  it("employee templates have correct names", () => {
    const employee = SYSTEM_TEMPLATES.filter((t) => t.category === "employee");
    const names = employee.map((t) => t.name);
    expect(names).toContain("Mitarbeiter Kurzcheck");
    expect(names).toContain("Mitarbeiter Standard");
    expect(names).toContain("Mitarbeiter Ausführlich");
  });

  it("all question IDs within a template are unique", () => {
    for (const template of SYSTEM_TEMPLATES) {
      const ids = template.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("all questions have valid types", () => {
    const validTypes = new Set([
      "nps", "stars", "freetext", "enps", "likert", "single-choice", "yes-no",
    ]);
    for (const template of SYSTEM_TEMPLATES) {
      for (const q of template.questions) {
        expect(validTypes.has(q.type)).toBe(true);
      }
    }
  });
});
