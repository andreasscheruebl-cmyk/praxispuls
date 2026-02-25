import { describe, it, expect } from "vitest";
import { PLAN_LIMITS } from "@/types";
import type { PlanId } from "@/types";

describe("PLAN_LIMITS", () => {
  it("has all three plan tiers", () => {
    const plans = Object.keys(PLAN_LIMITS) as PlanId[];
    expect(plans).toContain("free");
    expect(plans).toContain("starter");
    expect(plans).toContain("professional");
    expect(plans).toHaveLength(3);
  });

  describe("maxLocations", () => {
    it("free plan allows 1 location", () => {
      expect(PLAN_LIMITS.free.maxLocations).toBe(1);
    });

    it("starter plan allows 3 locations", () => {
      expect(PLAN_LIMITS.starter.maxLocations).toBe(3);
    });

    it("professional plan allows 10 locations", () => {
      expect(PLAN_LIMITS.professional.maxLocations).toBe(10);
    });

    it("scales up with plan tier", () => {
      expect(PLAN_LIMITS.free.maxLocations).toBeLessThan(
        PLAN_LIMITS.starter.maxLocations
      );
      expect(PLAN_LIMITS.starter.maxLocations).toBeLessThan(
        PLAN_LIMITS.professional.maxLocations
      );
    });
  });

  describe("maxResponsesPerMonth", () => {
    it("free plan has 30 responses", () => {
      expect(PLAN_LIMITS.free.maxResponsesPerMonth).toBe(30);
    });

    it("starter plan has 200 responses", () => {
      expect(PLAN_LIMITS.starter.maxResponsesPerMonth).toBe(200);
    });

    it("professional plan has unlimited responses", () => {
      expect(PLAN_LIMITS.professional.maxResponsesPerMonth).toBe(Infinity);
    });

    it("scales up with plan tier", () => {
      expect(PLAN_LIMITS.free.maxResponsesPerMonth).toBeLessThan(
        PLAN_LIMITS.starter.maxResponsesPerMonth
      );
      expect(PLAN_LIMITS.starter.maxResponsesPerMonth).toBeLessThan(
        PLAN_LIMITS.professional.maxResponsesPerMonth
      );
    });
  });

  describe("feature flags", () => {
    it("free plan has no premium features", () => {
      expect(PLAN_LIMITS.free.hasAlerts).toBe(false);
      expect(PLAN_LIMITS.free.hasBranding).toBe(false);
      expect(PLAN_LIMITS.free.hasCustomTimeFilter).toBe(false);
    });

    it("starter plan has all premium features", () => {
      expect(PLAN_LIMITS.starter.hasAlerts).toBe(true);
      expect(PLAN_LIMITS.starter.hasBranding).toBe(true);
      expect(PLAN_LIMITS.starter.hasCustomTimeFilter).toBe(true);
    });

    it("professional plan has all premium features", () => {
      expect(PLAN_LIMITS.professional.hasAlerts).toBe(true);
      expect(PLAN_LIMITS.professional.hasBranding).toBe(true);
      expect(PLAN_LIMITS.professional.hasCustomTimeFilter).toBe(true);
    });
  });

  describe("templates", () => {
    it("free plan has only standard template", () => {
      expect(PLAN_LIMITS.free.templates).toEqual(["zahnarzt_standard"]);
    });

    it("starter plan has all templates", () => {
      expect(PLAN_LIMITS.starter.templates).toHaveLength(3);
      expect(PLAN_LIMITS.starter.templates).toContain("zahnarzt_standard");
      expect(PLAN_LIMITS.starter.templates).toContain("zahnarzt_kurz");
      expect(PLAN_LIMITS.starter.templates).toContain("zahnarzt_prophylaxe");
    });

    it("professional plan has all templates", () => {
      expect(PLAN_LIMITS.professional.templates).toHaveLength(3);
    });
  });
});
