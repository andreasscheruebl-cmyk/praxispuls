import { describe, it, expect } from "vitest";
import { SURVEY_TEMPLATES } from "../survey-templates";

describe("SURVEY_TEMPLATES", () => {
  it("has 3 templates", () => {
    expect(SURVEY_TEMPLATES).toHaveLength(3);
  });

  it("all templates have required fields", () => {
    for (const template of SURVEY_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.questions.length).toBeGreaterThan(0);
    }
  });

  it("all templates start with an NPS question", () => {
    for (const template of SURVEY_TEMPLATES) {
      expect(template.questions[0]!.type).toBe("nps");
      expect(template.questions[0]!.required).toBe(true);
    }
  });

  it("includes standard, kurz, and prophylaxe", () => {
    const ids = SURVEY_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("zahnarzt_standard");
    expect(ids).toContain("zahnarzt_kurz");
    expect(ids).toContain("zahnarzt_prophylaxe");
  });
});
