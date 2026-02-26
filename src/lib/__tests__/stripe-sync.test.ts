import { describe, it, expect, vi, beforeEach } from "vitest";
import { PLAN_LIMITS } from "@/types";
import type { PlanId } from "@/types";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

// Mock the DB module
const mockFindMany = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      practices: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
      },
    },
    select: () => ({ from: mockFrom }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });

import { getLocationCountForUser } from "../practice";
import { getEffectivePlan } from "../plans";

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({ where: mockWhere });
});

// ============================================================
// getLocationCountForUser — database helper
// ============================================================
describe("getLocationCountForUser", () => {
  it("returns 0 when user has no practices", async () => {
    mockWhere.mockResolvedValue([{ value: 0 }]);

    const count = await getLocationCountForUser("user-no-practices");

    expect(count).toBe(0);
  });

  it("returns correct count for user with practices", async () => {
    mockWhere.mockResolvedValue([{ value: 3 }]);

    const count = await getLocationCountForUser("user-with-3");

    expect(count).toBe(3);
  });

  it("returns 0 when db returns empty result", async () => {
    mockWhere.mockResolvedValue([]);

    const count = await getLocationCountForUser("user-empty");

    expect(count).toBe(0);
  });
});

// ============================================================
// getEffectivePlan — plan resolution with overrides
// ============================================================
describe("getEffectivePlan for limit checks", () => {
  it("returns Stripe plan when no override is set", () => {
    const practice = { plan: "starter", planOverride: null, overrideExpiresAt: null };
    expect(getEffectivePlan(practice)).toBe("starter");
  });

  it("returns override when active", () => {
    const practice = {
      plan: "free",
      planOverride: "professional",
      overrideExpiresAt: new Date(Date.now() + 86400000), // tomorrow
    };
    expect(getEffectivePlan(practice)).toBe("professional");
  });

  it("falls back to Stripe plan when override is expired", () => {
    const practice = {
      plan: "starter",
      planOverride: "professional",
      overrideExpiresAt: new Date(Date.now() - 86400000), // yesterday
    };
    expect(getEffectivePlan(practice)).toBe("starter");
  });

  it("returns 'free' when both plan and override are null", () => {
    const practice = { plan: null, planOverride: null, overrideExpiresAt: null };
    expect(getEffectivePlan(practice)).toBe("free");
  });
});

// ============================================================
// Location limit enforcement logic
// ============================================================
describe("location limit enforcement", () => {
  /**
   * Mirrors the check in api/practice/route.ts POST and actions/practice.ts:
   *   if (currentCount >= maxLocations) → block
   */
  function isAtLimit(currentCount: number, plan: PlanId): boolean {
    return currentCount >= PLAN_LIMITS[plan].maxLocations;
  }

  it("free plan: allows first location (0 -> 1)", () => {
    expect(isAtLimit(0, "free")).toBe(false);
  });

  it("free plan: blocks second location (1 -> 2)", () => {
    expect(isAtLimit(1, "free")).toBe(true);
  });

  it("starter plan: allows up to 3 locations", () => {
    expect(isAtLimit(0, "starter")).toBe(false);
    expect(isAtLimit(2, "starter")).toBe(false);
    expect(isAtLimit(3, "starter")).toBe(true);
  });

  it("professional plan: allows up to 10 locations", () => {
    expect(isAtLimit(9, "professional")).toBe(false);
    expect(isAtLimit(10, "professional")).toBe(true);
  });

  it("override changes effective limit", () => {
    // User has free Stripe plan but professional override
    const practice = {
      plan: "free",
      planOverride: "professional",
      overrideExpiresAt: new Date(Date.now() + 86400000),
    };
    const effectivePlan = getEffectivePlan(practice);
    expect(isAtLimit(5, effectivePlan)).toBe(false); // professional allows 10
    expect(isAtLimit(10, effectivePlan)).toBe(true);
  });
});

// ============================================================
// Downgrade detection logic
// ============================================================
describe("downgrade detection", () => {
  /**
   * Mirrors the check in webhooks/stripe syncPlanToAllPractices:
   *   if (locationCount > maxLocations) → warn
   */
  function needsDowngradeWarning(locationCount: number, newPlan: PlanId): boolean {
    return locationCount > PLAN_LIMITS[newPlan].maxLocations;
  }

  it("warns when locations exceed new plan limit", () => {
    expect(needsDowngradeWarning(5, "free")).toBe(true);   // 5 > 1
    expect(needsDowngradeWarning(5, "starter")).toBe(true); // 5 > 3
  });

  it("no warning when locations are within new plan limit", () => {
    expect(needsDowngradeWarning(2, "starter")).toBe(false);      // 2 <= 3
    expect(needsDowngradeWarning(3, "professional")).toBe(false);  // 3 <= 10
  });

  it("no warning when exactly at limit", () => {
    expect(needsDowngradeWarning(1, "free")).toBe(false);    // 1 = 1, not >
    expect(needsDowngradeWarning(3, "starter")).toBe(false); // 3 = 3, not >
  });
});
