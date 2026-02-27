import { describe, expect, it } from "vitest";

import type { IndustryCategory, IndustrySubCategory } from "@/types";

import {
  INDUSTRY_CATEGORIES,
  getCategoryForSub,
  getSubCategory,
  needsSecondLayer,
} from "../industries";
import { getTerminology } from "../terminology";

describe("INDUSTRY_CATEGORIES", () => {
  it("has exactly 10 categories", () => {
    expect(INDUSTRY_CATEGORIES).toHaveLength(10);
  });

  it("has exactly 28 sub-categories total", () => {
    const total = INDUSTRY_CATEGORIES.reduce(
      (sum, cat) => sum + cat.subCategories.length,
      0,
    );
    expect(total).toBe(28);
  });

  it("contains all expected category IDs", () => {
    const ids = INDUSTRY_CATEGORIES.map((c) => c.id);
    const expected: IndustryCategory[] = [
      "gesundheit",
      "handwerk",
      "beauty",
      "gastronomie",
      "fitness",
      "einzelhandel",
      "bildung",
      "vereine",
      "beratung",
      "individuell",
    ];
    expect(ids).toEqual(expected);
  });

  it("contains all expected sub-category IDs", () => {
    const allSubIds = INDUSTRY_CATEGORIES.flatMap((cat) =>
      cat.subCategories.map((s) => s.id),
    );
    const expected: IndustrySubCategory[] = [
      "zahnarzt", "hausarzt", "augenarzt", "dermatologe", "physiotherapie",
      "tierarzt", "apotheke", "kfz_werkstatt", "she", "handwerk_allgemein",
      "friseur", "kosmetik", "restaurant", "hotel", "fitnessstudio",
      "yoga_wellness", "laden", "optiker", "fahrschule", "nachhilfe",
      "schule", "kindergarten", "sportverein", "verein_allgemein",
      "steuerberater", "rechtsanwalt", "eigene_branche", "private_umfrage",
    ];
    expect(new Set(allSubIds)).toEqual(new Set(expected));
    expect(allSubIds).toHaveLength(expected.length);
  });

  it("every sub-category has a valid defaultRespondentType", () => {
    for (const cat of INDUSTRY_CATEGORIES) {
      for (const sub of cat.subCategories) {
        expect(sub.defaultRespondentType).toBeTruthy();
        expect(typeof sub.defaultRespondentType).toBe("string");
      }
    }
  });

  it.each([
    ["gesundheit", 7],
    ["handwerk", 3],
    ["beauty", 2],
    ["gastronomie", 2],
    ["fitness", 2],
    ["einzelhandel", 2],
    ["bildung", 4],
    ["vereine", 2],
    ["beratung", 2],
    ["individuell", 2],
  ] as const)("category '%s' has %d sub-categories", (id, expected) => {
    const cat = INDUSTRY_CATEGORIES.find((c) => c.id === id);
    expect(cat).toBeDefined();
    expect(cat!.subCategories).toHaveLength(expected);
  });
});

describe("getSubCategory", () => {
  it("finds a sub-category by ID", () => {
    const result = getSubCategory("zahnarzt");
    expect(result).toBeDefined();
    expect(result!.label).toBe("Zahnarztpraxis");
    expect(result!.defaultRespondentType).toBe("patient");
  });

  it("finds sub-categories from different categories", () => {
    expect(getSubCategory("kfz_werkstatt")?.label).toBe("KFZ-Werkstatt");
    expect(getSubCategory("fahrschule")?.defaultRespondentType).toBe("fahrschueler");
    expect(getSubCategory("steuerberater")?.defaultRespondentType).toBe("mandant");
  });

  it("returns undefined for invalid ID", () => {
    expect(getSubCategory("nonexistent" as IndustrySubCategory)).toBeUndefined();
  });
});

describe("getCategoryForSub", () => {
  it("finds parent category for a sub-category", () => {
    const result = getCategoryForSub("zahnarzt");
    expect(result).toBeDefined();
    expect(result!.id).toBe("gesundheit");
  });

  it("finds correct parent for sub-categories across different categories", () => {
    expect(getCategoryForSub("kfz_werkstatt")?.id).toBe("handwerk");
    expect(getCategoryForSub("friseur")?.id).toBe("beauty");
    expect(getCategoryForSub("restaurant")?.id).toBe("gastronomie");
    expect(getCategoryForSub("fitnessstudio")?.id).toBe("fitness");
    expect(getCategoryForSub("laden")?.id).toBe("einzelhandel");
    expect(getCategoryForSub("fahrschule")?.id).toBe("bildung");
    expect(getCategoryForSub("sportverein")?.id).toBe("vereine");
    expect(getCategoryForSub("steuerberater")?.id).toBe("beratung");
    expect(getCategoryForSub("eigene_branche")?.id).toBe("individuell");
  });

  it("returns undefined for invalid sub ID", () => {
    expect(getCategoryForSub("nonexistent" as IndustrySubCategory)).toBeUndefined();
  });
});

describe("needsSecondLayer", () => {
  it("returns true for categories with 3+ sub-categories", () => {
    expect(needsSecondLayer("gesundheit")).toBe(true); // 7
    expect(needsSecondLayer("handwerk")).toBe(true); // 3
    expect(needsSecondLayer("bildung")).toBe(true); // 4
  });

  it("returns false for categories with fewer than 3 sub-categories", () => {
    expect(needsSecondLayer("beauty")).toBe(false); // 2
    expect(needsSecondLayer("gastronomie")).toBe(false); // 2
    expect(needsSecondLayer("fitness")).toBe(false); // 2
    expect(needsSecondLayer("einzelhandel")).toBe(false); // 2
    expect(needsSecondLayer("vereine")).toBe(false); // 2
    expect(needsSecondLayer("beratung")).toBe(false); // 2
    expect(needsSecondLayer("individuell")).toBe(false); // 2
  });

  it("returns false for unknown category ID", () => {
    expect(needsSecondLayer("nonexistent" as IndustryCategory)).toBe(false);
  });
});

describe("cross-module: every defaultRespondentType has terminology", () => {
  it("all defaultRespondentTypes used in industries have a non-fallback terminology", () => {
    const teilnehmerTerms = getTerminology("teilnehmer");
    for (const cat of INDUSTRY_CATEGORIES) {
      for (const sub of cat.subCategories) {
        const terms = getTerminology(sub.defaultRespondentType);
        if (sub.defaultRespondentType !== "teilnehmer" && sub.defaultRespondentType !== "individuell") {
          expect(terms, `${sub.id} (${sub.defaultRespondentType}) should not fall back to teilnehmer`).not.toEqual(teilnehmerTerms);
        }
      }
    }
  });
});

describe("default respondentTypes", () => {
  it.each([
    ["zahnarzt", "patient"],
    ["hausarzt", "patient"],
    ["augenarzt", "patient"],
    ["dermatologe", "patient"],
    ["physiotherapie", "patient"],
    ["tierarzt", "tierhalter"],
    ["apotheke", "kunde"],
    ["kfz_werkstatt", "kunde"],
    ["she", "kunde"],
    ["handwerk_allgemein", "kunde"],
    ["friseur", "kunde"],
    ["kosmetik", "kunde"],
    ["restaurant", "gast"],
    ["hotel", "gast"],
    ["fitnessstudio", "mitglied"],
    ["yoga_wellness", "mitglied"],
    ["laden", "kunde"],
    ["optiker", "kunde"],
    ["fahrschule", "fahrschueler"],
    ["nachhilfe", "schueler"],
    ["schule", "schueler"],
    ["kindergarten", "eltern"],
    ["sportverein", "mitglied"],
    ["verein_allgemein", "mitglied"],
    ["steuerberater", "mandant"],
    ["rechtsanwalt", "mandant"],
    ["eigene_branche", "individuell"],
    ["private_umfrage", "teilnehmer"],
  ] as const)("sub-category '%s' defaults to '%s'", (subId, expectedType) => {
    const sub = getSubCategory(subId);
    expect(sub).toBeDefined();
    expect(sub!.defaultRespondentType).toBe(expectedType);
  });
});
