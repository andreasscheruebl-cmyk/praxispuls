import { describe, it, expect } from "vitest";
import {
  calculateNps,
  buildQuestionMeta,
  aggregateCategoryScores,
} from "../compare-utils";

// ============================================================
// calculateNps
// ============================================================

describe("calculateNps", () => {
  it("returns null for 0 responses", () => {
    expect(calculateNps(0, 0, 0)).toBeNull();
  });

  it("calculates NPS correctly: all promoters → 100", () => {
    expect(calculateNps(10, 0, 10)).toBe(100);
  });

  it("calculates NPS correctly: all detractors → -100", () => {
    expect(calculateNps(0, 10, 10)).toBe(-100);
  });

  it("calculates NPS correctly: even split → 0", () => {
    expect(calculateNps(5, 5, 10)).toBe(0);
  });

  it("calculates NPS correctly: mixed (7 promoters, 2 detractors, 10 total) → 50", () => {
    // (7-2)/10 = 0.5 → 50
    expect(calculateNps(7, 2, 10)).toBe(50);
  });

  it("rounds correctly: 3 promoters, 1 detractor, 7 total → 29", () => {
    // (3-1)/7 = 0.2857 → Math.round(28.57) = 29
    expect(calculateNps(3, 1, 7)).toBe(29);
  });

  it("handles passives correctly (not counted in formula)", () => {
    // 6 promoters, 2 detractors, 10 total (2 passives)
    // (6-2)/10 = 0.4 → 40
    expect(calculateNps(6, 2, 10)).toBe(40);
  });
});

// ============================================================
// buildQuestionMeta
// ============================================================

describe("buildQuestionMeta", () => {
  it("returns empty map for no questions", () => {
    expect(buildQuestionMeta([]).size).toBe(0);
  });

  it("ignores questions without category", () => {
    const meta = buildQuestionMeta([
      { id: "q1", type: "stars", label: "Rating" },
    ]);
    expect(meta.size).toBe(0);
  });

  it("ignores non-scorable types (freetext, single-choice, yes-no)", () => {
    const meta = buildQuestionMeta([
      { id: "q1", type: "freetext", label: "Comment", category: "Feedback" },
      { id: "q2", type: "single-choice", label: "Pick", category: "Choice" },
      { id: "q3", type: "yes-no", label: "Agree?", category: "Bool" },
    ]);
    expect(meta.size).toBe(0);
  });

  it("maps stars and likert with maxScore 5", () => {
    const meta = buildQuestionMeta([
      { id: "q1", type: "stars", label: "Rating", category: "Service" },
      { id: "q2", type: "likert", label: "Agree", category: "Satisfaction" },
    ]);
    expect(meta.size).toBe(2);
    expect(meta.get("q1")).toEqual({ category: "Service", maxScore: 5 });
    expect(meta.get("q2")).toEqual({ category: "Satisfaction", maxScore: 5 });
  });

  it("maps nps and enps with maxScore 10", () => {
    const meta = buildQuestionMeta([
      { id: "q1", type: "nps", label: "Recommend?", category: "NPS" },
      { id: "q2", type: "enps", label: "Employee NPS", category: "eNPS" },
    ]);
    expect(meta.get("q1")).toEqual({ category: "NPS", maxScore: 10 });
    expect(meta.get("q2")).toEqual({ category: "eNPS", maxScore: 10 });
  });
});

// ============================================================
// aggregateCategoryScores
// ============================================================

describe("aggregateCategoryScores", () => {
  const meta = new Map([
    ["q-stars", { category: "Service", maxScore: 5 }],
    ["q-likert", { category: "Service", maxScore: 5 }],
    ["q-nps", { category: "NPS", maxScore: 10 }],
  ]);

  it("returns empty array for no answer rows", () => {
    expect(aggregateCategoryScores([], meta)).toEqual([]);
  });

  it("returns empty array for null answers", () => {
    const rows = [{ answers: null }, { answers: null }];
    expect(aggregateCategoryScores(rows, meta)).toEqual([]);
  });

  it("aggregates single category correctly", () => {
    const rows = [
      { answers: { "q-stars": 4 } },
      { answers: { "q-stars": 5 } },
      { answers: { "q-stars": 3 } },
    ];
    const scores = aggregateCategoryScores(rows, meta);
    expect(scores).toHaveLength(1);
    expect(scores[0]!.category).toBe("Service");
    expect(scores[0]!.avgScore).toBe(4); // (4+5+3)/3 = 4.0
    expect(scores[0]!.maxScore).toBe(5);
    expect(scores[0]!.responseCount).toBe(3);
  });

  it("aggregates multiple questions in same category", () => {
    const rows = [
      { answers: { "q-stars": 4, "q-likert": 3 } },
      { answers: { "q-stars": 5, "q-likert": 4 } },
    ];
    const scores = aggregateCategoryScores(rows, meta);
    const service = scores.find((s) => s.category === "Service");
    // (4+3+5+4)/4 = 4.0
    expect(service!.avgScore).toBe(4);
    expect(service!.responseCount).toBe(4);
  });

  it("aggregates multiple categories", () => {
    const rows = [
      { answers: { "q-stars": 4, "q-nps": 9 } },
      { answers: { "q-stars": 5, "q-nps": 7 } },
    ];
    const scores = aggregateCategoryScores(rows, meta);
    expect(scores).toHaveLength(2);

    const nps = scores.find((s) => s.category === "NPS");
    expect(nps!.avgScore).toBe(8); // (9+7)/2 = 8.0
    expect(nps!.maxScore).toBe(10);
  });

  it("ignores unknown question IDs", () => {
    const rows = [{ answers: { "unknown-q": 5, "q-stars": 4 } }];
    const scores = aggregateCategoryScores(rows, meta);
    expect(scores).toHaveLength(1);
    expect(scores[0]!.category).toBe("Service");
  });

  it("ignores non-numeric values", () => {
    const rows = [
      { answers: { "q-stars": "not a number" } },
      { answers: { "q-stars": 4 } },
    ];
    const scores = aggregateCategoryScores(rows, meta);
    expect(scores).toHaveLength(1);
    expect(scores[0]!.avgScore).toBe(4);
    expect(scores[0]!.responseCount).toBe(1);
  });

  it("handles string numbers correctly", () => {
    const rows = [
      { answers: { "q-stars": "4" } },
      { answers: { "q-stars": 5 } },
    ];
    const scores = aggregateCategoryScores(rows, meta);
    expect(scores[0]!.avgScore).toBe(4.5); // (4+5)/2 = 4.5
  });

  it("rounds avgScore to 1 decimal place", () => {
    const rows = [
      { answers: { "q-stars": 4 } },
      { answers: { "q-stars": 5 } },
      { answers: { "q-stars": 4 } },
    ];
    const scores = aggregateCategoryScores(rows, meta);
    // (4+5+4)/3 = 4.333... → 4.3
    expect(scores[0]!.avgScore).toBe(4.3);
  });

  it("sorts categories alphabetically (German locale)", () => {
    const multiMeta = new Map([
      ["q1", { category: "Zufriedenheit", maxScore: 5 }],
      ["q2", { category: "Atmosphäre", maxScore: 5 }],
      ["q3", { category: "Kommunikation", maxScore: 5 }],
    ]);
    const rows = [
      { answers: { q1: 4, q2: 3, q3: 5 } },
    ];
    const scores = aggregateCategoryScores(rows, multiMeta);
    expect(scores.map((s) => s.category)).toEqual([
      "Atmosphäre",
      "Kommunikation",
      "Zufriedenheit",
    ]);
  });
});
