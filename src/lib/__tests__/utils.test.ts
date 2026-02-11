import { describe, it, expect } from "vitest";
import { getNpsCategory, slugify, formatDateDE, getGoogleReviewUrl } from "../utils";

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

describe("getGoogleReviewUrl", () => {
  it("returns correct Google review URL", () => {
    const url = getGoogleReviewUrl("ChIJ123abc");
    expect(url).toBe("https://search.google.com/local/writereview?placeid=ChIJ123abc");
  });
});
