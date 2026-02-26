import { describe, it, expect } from "vitest";
import { PLAN_BADGE_STYLES, PLAN_LABELS } from "../constants/plans";

describe("PLAN_BADGE_STYLES", () => {
  it("has styles for all plan tiers", () => {
    expect(PLAN_BADGE_STYLES).toHaveProperty("free");
    expect(PLAN_BADGE_STYLES).toHaveProperty("starter");
    expect(PLAN_BADGE_STYLES).toHaveProperty("professional");
  });

  it("contains Tailwind class strings", () => {
    expect(PLAN_BADGE_STYLES.free).toContain("bg-");
    expect(PLAN_BADGE_STYLES.starter).toContain("bg-");
    expect(PLAN_BADGE_STYLES.professional).toContain("bg-");
  });
});

describe("PLAN_LABELS", () => {
  it("has labels for all plan tiers", () => {
    expect(PLAN_LABELS.free).toBe("Free");
    expect(PLAN_LABELS.starter).toBe("Starter");
    expect(PLAN_LABELS.professional).toBe("Professional");
  });
});
