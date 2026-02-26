import { describe, it, expect } from "vitest";
import {
  adminEmailChangeSchema,
  adminSuspendSchema,
  adminBanSchema,
  adminSetPasswordSchema,
  adminGoogleUpdateSchema,
} from "../validations";

describe("adminEmailChangeSchema", () => {
  it("accepts valid email", () => {
    const result = adminEmailChangeSchema.safeParse({ email: "dr@praxis.de" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = adminEmailChangeSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = adminEmailChangeSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

describe("adminSuspendSchema", () => {
  it("accepts true", () => {
    expect(adminSuspendSchema.safeParse({ suspended: true }).success).toBe(true);
  });

  it("accepts false", () => {
    expect(adminSuspendSchema.safeParse({ suspended: false }).success).toBe(true);
  });

  it("rejects string", () => {
    expect(adminSuspendSchema.safeParse({ suspended: "yes" }).success).toBe(false);
  });
});

describe("adminBanSchema", () => {
  it("accepts boolean", () => {
    expect(adminBanSchema.safeParse({ banned: true }).success).toBe(true);
    expect(adminBanSchema.safeParse({ banned: false }).success).toBe(true);
  });

  it("rejects non-boolean", () => {
    expect(adminBanSchema.safeParse({ banned: 1 }).success).toBe(false);
  });
});

describe("adminSetPasswordSchema", () => {
  it("accepts password >= 8 chars", () => {
    expect(adminSetPasswordSchema.safeParse({ password: "abcd1234" }).success).toBe(true);
  });

  it("rejects password < 8 chars", () => {
    expect(adminSetPasswordSchema.safeParse({ password: "short" }).success).toBe(false);
  });

  it("accepts long password", () => {
    expect(adminSetPasswordSchema.safeParse({ password: "xK9#mP2qL7$nR4wZ" }).success).toBe(true);
  });
});

describe("adminGoogleUpdateSchema", () => {
  it("accepts null placeId (remove)", () => {
    const result = adminGoogleUpdateSchema.safeParse({ googlePlaceId: null });
    expect(result.success).toBe(true);
  });

  it("accepts valid placeId", () => {
    const result = adminGoogleUpdateSchema.safeParse({ googlePlaceId: "ChIJ1234" });
    expect(result.success).toBe(true);
  });

  it("accepts redirect toggle only", () => {
    const result = adminGoogleUpdateSchema.safeParse({ googleRedirectEnabled: false });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = adminGoogleUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
