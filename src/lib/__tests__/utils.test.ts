import { describe, it, expect } from "vitest";
import { cn, getNpsCategory, slugify, formatDateDE, formatDateTimeDE } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "end")).toBe("base end");
  });
});

describe("getNpsCategory", () => {
  it("returns promoter for score 9", () => {
    expect(getNpsCategory(9)).toBe("promoter");
  });

  it("returns promoter for score 10", () => {
    expect(getNpsCategory(10)).toBe("promoter");
  });

  it("returns passive for score 8", () => {
    expect(getNpsCategory(8)).toBe("passive");
  });

  it("returns passive for score 7", () => {
    expect(getNpsCategory(7)).toBe("passive");
  });

  it("returns detractor for score 6", () => {
    expect(getNpsCategory(6)).toBe("detractor");
  });

  it("returns detractor for score 0", () => {
    expect(getNpsCategory(0)).toBe("detractor");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces umlauts", () => {
    expect(slugify("Schöne Zähne")).toBe("schoene-zaehne");
  });

  it("replaces ß", () => {
    expect(slugify("Straße")).toBe("strasse");
  });

  it("replaces ü", () => {
    expect(slugify("Münchner Praxis")).toBe("muenchner-praxis");
  });

  it("removes leading and trailing dashes", () => {
    expect(slugify("--test--")).toBe("test");
  });

  it("replaces multiple special chars with single dash", () => {
    expect(slugify("Dr. Müller & Partner")).toBe("dr-mueller-partner");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatDateDE", () => {
  it("formats Date object in German format", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    expect(formatDateDE(date)).toBe("15.01.2026");
  });

  it("formats date string in German format", () => {
    expect(formatDateDE("2026-12-25T00:00:00Z")).toBe("25.12.2026");
  });
});

describe("formatDateTimeDE", () => {
  it("returns em dash for null", () => {
    expect(formatDateTimeDE(null)).toBe("—");
  });

  it("formats Date object with time", () => {
    const date = new Date("2026-01-15T14:30:00Z");
    const result = formatDateTimeDE(date);
    expect(result).toContain("15.01.2026");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("formats date string with time", () => {
    const result = formatDateTimeDE("2026-06-01T09:15:00Z");
    expect(result).toContain("01.06.2026");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

