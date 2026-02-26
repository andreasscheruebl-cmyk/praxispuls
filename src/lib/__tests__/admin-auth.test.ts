import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase server client
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock next/headers (required by supabase createClient)
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("REDIRECT");
  }),
}));

import { requireAdminForApi, getAdminEmails } from "../auth";

const ADMIN_EMAIL = "admin@praxis.de";
const NON_ADMIN_EMAIL = "user@praxis.de";

beforeEach(() => {
  vi.resetAllMocks();
  process.env.ADMIN_EMAILS = ADMIN_EMAIL;
});

describe("getAdminEmails", () => {
  it("parses comma-separated emails", () => {
    process.env.ADMIN_EMAILS = "a@b.de, c@d.de, E@F.DE";
    expect(getAdminEmails()).toEqual(["a@b.de", "c@d.de", "e@f.de"]);
  });

  it("returns empty array when not set", () => {
    process.env.ADMIN_EMAILS = "";
    expect(getAdminEmails()).toEqual([]);
  });
});

describe("requireAdminForApi", () => {
  it("returns UNAUTHORIZED when not logged in", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await requireAdminForApi();
    expect(result.error).toBeDefined();
    // Check the response status
    expect(result.error!.status).toBe(401);
  });

  it("returns FORBIDDEN for non-admin user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: NON_ADMIN_EMAIL } },
      error: null,
    });
    const result = await requireAdminForApi();
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(403);
  });

  it("returns user for admin email", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u2", email: ADMIN_EMAIL } },
      error: null,
    });
    const result = await requireAdminForApi();
    expect(result.user).toBeDefined();
    expect(result.user!.email).toBe(ADMIN_EMAIL);
    expect(result.error).toBeUndefined();
  });

  it("handles case-insensitive admin check", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u3", email: "Admin@Praxis.DE" } },
      error: null,
    });
    const result = await requireAdminForApi();
    expect(result.user).toBeDefined();
  });
});
