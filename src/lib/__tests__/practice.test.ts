import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers before importing the module under test
const mockCookieGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
    set: vi.fn(),
  })),
}));

// Mock the DB module
const mockFindMany = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      practices: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
      },
    },
  },
}));

import {
  getPracticesForUser,
  getActivePracticeForUser,
} from "../practice";

// Test fixtures
const USER_ID = "user-111";
const PRACTICE_A = {
  id: "practice-aaa",
  ownerUserId: USER_ID,
  name: "Praxis A",
  plan: "starter",
  createdAt: new Date("2025-01-01"),
  deletedAt: null,
};
const PRACTICE_B = {
  id: "practice-bbb",
  ownerUserId: USER_ID,
  name: "Praxis B",
  plan: "starter",
  createdAt: new Date("2025-06-01"),
  deletedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPracticesForUser", () => {
  it("returns all practices for a user", async () => {
    mockFindMany.mockResolvedValue([PRACTICE_A, PRACTICE_B]);

    const result = await getPracticesForUser(USER_ID);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(PRACTICE_A);
    expect(result[1]).toEqual(PRACTICE_B);
  });

  it("returns empty array when user has no practices", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getPracticesForUser("unknown-user");

    expect(result).toEqual([]);
  });

  it("calls db.query with correct parameters", async () => {
    mockFindMany.mockResolvedValue([]);

    await getPracticesForUser(USER_ID);

    expect(mockFindMany).toHaveBeenCalledOnce();
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.anything(),
        orderBy: expect.any(Function),
      })
    );
  });
});

describe("getActivePracticeForUser", () => {
  it("returns null when user has no practices", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getActivePracticeForUser(USER_ID);

    expect(result).toBeNull();
  });

  it("returns matching practice when practiceId is provided", async () => {
    mockFindMany.mockResolvedValue([PRACTICE_A, PRACTICE_B]);

    const result = await getActivePracticeForUser(USER_ID, PRACTICE_B.id);

    expect(result).toEqual(PRACTICE_B);
  });

  it("returns null when practiceId does not belong to user", async () => {
    mockFindMany.mockResolvedValue([PRACTICE_A]);

    const result = await getActivePracticeForUser(USER_ID, "foreign-id");

    expect(result).toBeNull();
  });

  it("uses cookie value when no practiceId provided", async () => {
    mockFindMany.mockResolvedValue([PRACTICE_A, PRACTICE_B]);
    mockCookieGet.mockReturnValue({ value: PRACTICE_B.id });

    const result = await getActivePracticeForUser(USER_ID);

    expect(result).toEqual(PRACTICE_B);
    expect(mockCookieGet).toHaveBeenCalledWith("active_practice_id");
  });

  it("falls back to first practice when cookie is missing", async () => {
    mockFindMany.mockResolvedValue([PRACTICE_A, PRACTICE_B]);
    mockCookieGet.mockReturnValue(undefined);

    const result = await getActivePracticeForUser(USER_ID);

    expect(result).toEqual(PRACTICE_A);
  });

  it("falls back to first practice when cookie points to invalid practice", async () => {
    mockFindMany.mockResolvedValue([PRACTICE_A, PRACTICE_B]);
    mockCookieGet.mockReturnValue({ value: "deleted-practice-id" });

    const result = await getActivePracticeForUser(USER_ID);

    expect(result).toEqual(PRACTICE_A);
  });

  it("explicit practiceId takes precedence over cookie", async () => {
    mockFindMany.mockResolvedValue([PRACTICE_A, PRACTICE_B]);
    mockCookieGet.mockReturnValue({ value: PRACTICE_B.id });

    const result = await getActivePracticeForUser(USER_ID, PRACTICE_A.id);

    // practiceId overrides cookie
    expect(result).toEqual(PRACTICE_A);
  });
});
