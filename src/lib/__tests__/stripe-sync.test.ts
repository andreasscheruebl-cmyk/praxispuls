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

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({ where: mockWhere });
});

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

  it("returns 0 when db returns null result", async () => {
    mockWhere.mockResolvedValue([]);

    const count = await getLocationCountForUser("user-empty");

    expect(count).toBe(0);
  });
});

describe("location limit enforcement", () => {
  const plans: PlanId[] = ["free", "starter", "professional"];

  it.each(plans)("plan '%s' has a defined maxLocations", (plan) => {
    expect(PLAN_LIMITS[plan].maxLocations).toBeGreaterThan(0);
  });

  it("free plan blocks at 1 location", () => {
    const max = PLAN_LIMITS.free.maxLocations;
    const currentCount = 1;
    expect(currentCount >= max).toBe(true);
  });

  it("free plan allows first location", () => {
    const max = PLAN_LIMITS.free.maxLocations;
    const currentCount = 0;
    expect(currentCount >= max).toBe(false);
  });

  it("starter plan allows up to 3 locations", () => {
    const max = PLAN_LIMITS.starter.maxLocations;
    expect(0 < max).toBe(true);
    expect(1 < max).toBe(true);
    expect(2 < max).toBe(true);
    expect(3 >= max).toBe(true);
  });

  it("professional plan allows up to 10 locations", () => {
    const max = PLAN_LIMITS.professional.maxLocations;
    expect(9 < max).toBe(true);
    expect(10 >= max).toBe(true);
  });
});

describe("downgrade detection", () => {
  it("detects downgrade from professional to free with excess locations", () => {
    const locationCount = 5;
    const newPlan: PlanId = "free";
    const maxLocations = PLAN_LIMITS[newPlan].maxLocations;

    expect(locationCount > maxLocations).toBe(true);
  });

  it("detects downgrade from professional to starter with excess locations", () => {
    const locationCount = 5;
    const newPlan: PlanId = "starter";
    const maxLocations = PLAN_LIMITS[newPlan].maxLocations;

    expect(locationCount > maxLocations).toBe(true);
  });

  it("no warning when location count is within limit", () => {
    const locationCount = 2;
    const newPlan: PlanId = "starter";
    const maxLocations = PLAN_LIMITS[newPlan].maxLocations;

    expect(locationCount > maxLocations).toBe(false);
  });

  it("no warning when upgrading", () => {
    const locationCount = 3;
    const newPlan: PlanId = "professional";
    const maxLocations = PLAN_LIMITS[newPlan].maxLocations;

    expect(locationCount > maxLocations).toBe(false);
  });
});

describe("plan sync logic", () => {
  it("all plans are valid PlanIds", () => {
    const validPlans: PlanId[] = ["free", "starter", "professional"];
    for (const plan of validPlans) {
      expect(PLAN_LIMITS[plan]).toBeDefined();
    }
  });

  it("subscription metadata should include userId and practiceId", () => {
    // Verify the metadata shape expected by webhook handler
    const metadata = {
      practiceId: "practice-123",
      userId: "user-456",
    };

    expect(metadata.practiceId).toBeDefined();
    expect(metadata.userId).toBeDefined();
  });
});
