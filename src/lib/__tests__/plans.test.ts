import { describe, it, expect } from "vitest";
import { getEffectivePlan } from "../plans";

describe("getEffectivePlan", () => {
  it("returns override when set and not expired", () => {
    const result = getEffectivePlan({
      plan: "free",
      planOverride: "professional",
      overrideExpiresAt: new Date("2099-12-31"),
    });
    expect(result).toBe("professional");
  });

  it("returns override when set with no expiry", () => {
    const result = getEffectivePlan({
      plan: "starter",
      planOverride: "professional",
      overrideExpiresAt: null,
    });
    expect(result).toBe("professional");
  });

  it("returns Stripe plan when override is expired", () => {
    const result = getEffectivePlan({
      plan: "starter",
      planOverride: "professional",
      overrideExpiresAt: new Date("2020-01-01"),
    });
    expect(result).toBe("starter");
  });

  it("returns Stripe plan when no override is set", () => {
    const result = getEffectivePlan({
      plan: "starter",
      planOverride: null,
      overrideExpiresAt: null,
    });
    expect(result).toBe("starter");
  });

  it("returns 'free' when no plan and no override", () => {
    const result = getEffectivePlan({
      plan: null,
      planOverride: null,
      overrideExpiresAt: null,
    });
    expect(result).toBe("free");
  });

  it("returns 'free' when plan is empty string and no override", () => {
    const result = getEffectivePlan({
      plan: "",
      planOverride: null,
      overrideExpiresAt: null,
    });
    expect(result).toBe("free");
  });

  it("override takes precedence over Stripe plan", () => {
    const result = getEffectivePlan({
      plan: "starter",
      planOverride: "free",
      overrideExpiresAt: null,
    });
    expect(result).toBe("free");
  });
});
