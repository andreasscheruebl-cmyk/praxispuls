import { describe, it, expect } from "vitest";
import { getEffectivePlan } from "@/lib/plans";

describe("getEffectivePlan", () => {
  it("returns override when set and not expired", () => {
    const result = getEffectivePlan({
      plan: "free",
      planOverride: "professional",
      overrideExpiresAt: new Date(Date.now() + 86400000), // tomorrow
    });
    expect(result).toBe("professional");
  });

  it("returns override when no expiry set (permanent override)", () => {
    const result = getEffectivePlan({
      plan: "free",
      planOverride: "starter",
      overrideExpiresAt: null,
    });
    expect(result).toBe("starter");
  });

  it("returns Stripe plan when override is expired", () => {
    const result = getEffectivePlan({
      plan: "starter",
      planOverride: "professional",
      overrideExpiresAt: new Date(Date.now() - 86400000), // yesterday
    });
    expect(result).toBe("starter");
  });

  it("returns Stripe plan when no override set", () => {
    const result = getEffectivePlan({
      plan: "professional",
      planOverride: null,
      overrideExpiresAt: null,
    });
    expect(result).toBe("professional");
  });

  it('returns "free" when no plan and no override', () => {
    const result = getEffectivePlan({
      plan: null,
      planOverride: null,
      overrideExpiresAt: null,
    });
    expect(result).toBe("free");
  });

  it('returns "free" when plan is empty string', () => {
    const result = getEffectivePlan({
      plan: "",
      planOverride: null,
      overrideExpiresAt: null,
    });
    expect(result).toBe("free");
  });

  it("handles string date for overrideExpiresAt (from DB)", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const result = getEffectivePlan({
      plan: "free",
      planOverride: "professional",
      overrideExpiresAt: new Date(future),
    });
    expect(result).toBe("professional");
  });
});
