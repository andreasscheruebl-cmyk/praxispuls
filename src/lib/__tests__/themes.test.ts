import { describe, it, expect } from "vitest";
import { getThemeConfig, THEMES } from "../themes";
import type { ThemeId } from "../themes";

describe("getThemeConfig", () => {
  it("returns standard theme config", () => {
    const config = getThemeConfig("standard");
    expect(config.id).toBe("standard");
    expect(config.name).toBe("Standard");
    expect(config.survey.npsStyle).toBe("buttons");
    expect(config.survey.ratingStyle).toBe("stars");
    expect(config.survey.paperTexture).toBe(false);
    expect(config.dashboard.mobileNav).toBe("hamburger");
  });

  it("returns vertrauen theme config", () => {
    const config = getThemeConfig("vertrauen");
    expect(config.id).toBe("vertrauen");
    expect(config.name).toBe("Vertrauen");
    expect(config.survey.npsStyle).toBe("slider");
    expect(config.survey.paperTexture).toBe(true);
    expect(config.dashboard.mobileNav).toBe("bottom-tabs");
  });

  it("returns different chart colors per theme", () => {
    const standard = getThemeConfig("standard");
    const vertrauen = getThemeConfig("vertrauen");
    expect(standard.chart.primaryColor).not.toBe(vertrauen.chart.primaryColor);
  });

  it("returns different PDF brand colors per theme", () => {
    const standard = getThemeConfig("standard");
    const vertrauen = getThemeConfig("vertrauen");
    expect(standard.pdf.brandColor).not.toEqual(vertrauen.pdf.brandColor);
  });

  it("falls back to standard for unknown theme", () => {
    const config = getThemeConfig("nonexistent" as ThemeId);
    expect(config.id).toBe("standard");
  });
});

describe("THEMES constant", () => {
  it("has exactly 2 themes", () => {
    expect(Object.keys(THEMES)).toHaveLength(2);
  });

  it("has standard and vertrauen", () => {
    expect(THEMES).toHaveProperty("standard");
    expect(THEMES).toHaveProperty("vertrauen");
  });

  it("all themes have required properties", () => {
    for (const theme of Object.values(THEMES)) {
      expect(theme).toHaveProperty("id");
      expect(theme).toHaveProperty("name");
      expect(theme).toHaveProperty("description");
      expect(theme).toHaveProperty("survey");
      expect(theme).toHaveProperty("dashboard");
      expect(theme).toHaveProperty("landing");
      expect(theme).toHaveProperty("chart");
      expect(theme).toHaveProperty("pdf");
    }
  });
});
