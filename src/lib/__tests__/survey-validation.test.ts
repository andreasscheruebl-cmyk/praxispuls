import { describe, it, expect } from "vitest";
import { validateAnswers, canProceedStep } from "../survey-validation";
import type { SurveyQuestion, SurveyAnswers } from "@/types";
import type { SurveyStep } from "../survey-steps";

function q(
  id: string,
  type: SurveyQuestion["type"],
  required = true,
  options?: string[]
): SurveyQuestion {
  return { id, type, label: `Question ${id}`, required, options };
}

describe("validateAnswers", () => {
  it("returns no errors for valid NPS answer", () => {
    const questions = [q("nps", "nps")];
    const answers: SurveyAnswers = { nps: 8 };
    expect(validateAnswers(questions, answers)).toEqual([]);
  });

  it("returns error for missing required answer", () => {
    const questions = [q("nps", "nps")];
    const answers: SurveyAnswers = {};
    const errors = validateAnswers(questions, answers);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("erforderlich");
  });

  it("allows missing optional answer", () => {
    const questions = [q("feedback", "freetext", false)];
    const answers: SurveyAnswers = {};
    expect(validateAnswers(questions, answers)).toEqual([]);
  });

  it("validates NPS range (0-10)", () => {
    const questions = [q("nps", "nps")];

    expect(validateAnswers(questions, { nps: 0 })).toEqual([]);
    expect(validateAnswers(questions, { nps: 10 })).toEqual([]);
    expect(validateAnswers(questions, { nps: -1 })).toHaveLength(1);
    expect(validateAnswers(questions, { nps: 11 })).toHaveLength(1);
    expect(validateAnswers(questions, { nps: 5.5 })).toHaveLength(1);
  });

  it("validates eNPS range (0-10)", () => {
    const questions = [q("enps", "enps")];
    expect(validateAnswers(questions, { enps: 7 })).toEqual([]);
    expect(validateAnswers(questions, { enps: -1 })).toHaveLength(1);
  });

  it("validates stars range (1-5)", () => {
    const questions = [q("stars", "stars")];

    expect(validateAnswers(questions, { stars: 1 })).toEqual([]);
    expect(validateAnswers(questions, { stars: 5 })).toEqual([]);
    expect(validateAnswers(questions, { stars: 0 })).toHaveLength(1);
    expect(validateAnswers(questions, { stars: 6 })).toHaveLength(1);
  });

  it("validates likert range (1-5)", () => {
    const questions = [q("likert", "likert")];
    expect(validateAnswers(questions, { likert: 3 })).toEqual([]);
    expect(validateAnswers(questions, { likert: 0 })).toHaveLength(1);
  });

  it("validates freetext max length", () => {
    const questions = [q("ft", "freetext")];
    expect(validateAnswers(questions, { ft: "Hello" })).toEqual([]);
    expect(validateAnswers(questions, { ft: "x".repeat(2001) })).toHaveLength(1);
  });

  it("validates single-choice must be in options", () => {
    const questions = [q("sc", "single-choice", true, ["A", "B", "C"])];
    expect(validateAnswers(questions, { sc: "A" })).toEqual([]);
    expect(validateAnswers(questions, { sc: "D" })).toHaveLength(1);
  });

  it("validates yes-no must be boolean", () => {
    const questions = [q("yn", "yes-no")];
    expect(validateAnswers(questions, { yn: true })).toEqual([]);
    expect(validateAnswers(questions, { yn: false })).toEqual([]);
    expect(validateAnswers(questions, { yn: "yes" as unknown as boolean })).toHaveLength(1);
  });

  it("validates multiple questions at once", () => {
    const questions = [
      q("nps", "nps"),
      q("s1", "stars"),
      q("ft", "freetext", false),
    ];
    const answers: SurveyAnswers = { nps: 8, s1: 4 };
    expect(validateAnswers(questions, answers)).toEqual([]);
  });

  it("returns multiple errors for multiple invalid answers", () => {
    const questions = [
      q("nps", "nps"),
      q("s1", "stars"),
    ];
    const answers: SurveyAnswers = {};
    const errors = validateAnswers(questions, answers);
    expect(errors).toHaveLength(2);
  });

  it("rejects non-number value for NPS type", () => {
    const questions = [q("nps", "nps")];
    const answers: SurveyAnswers = { nps: "8" as unknown as number };
    expect(validateAnswers(questions, answers)).toHaveLength(1);
  });
});

describe("canProceedStep", () => {
  it("returns true when all required questions answered", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("nps", "nps")],
    };
    expect(canProceedStep(step, { nps: 8 })).toBe(true);
  });

  it("returns false when required question unanswered", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("nps", "nps")],
    };
    expect(canProceedStep(step, {})).toBe(false);
  });

  it("returns true when only optional questions", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("ft", "freetext", false)],
    };
    expect(canProceedStep(step, {})).toBe(true);
  });

  it("returns false for invalid stars value (0)", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("s1", "stars")],
    };
    expect(canProceedStep(step, { s1: 0 })).toBe(false);
  });

  it("returns true for valid stars value", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("s1", "stars")],
    };
    expect(canProceedStep(step, { s1: 3 })).toBe(true);
  });

  it("returns true for yes-no with false value", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("yn", "yes-no")],
    };
    expect(canProceedStep(step, { yn: false })).toBe(true);
  });

  it("handles mixed required and optional questions", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [
        q("s1", "stars", true),
        q("s2", "stars", false),
      ],
    };
    // Required s1 answered, optional s2 not → should pass
    expect(canProceedStep(step, { s1: 4 })).toBe(true);
    // Required s1 not answered → should fail
    expect(canProceedStep(step, { s2: 3 })).toBe(false);
  });

  it("returns false for empty string on required freetext", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("ft", "freetext", true)],
    };
    expect(canProceedStep(step, { ft: "" })).toBe(false);
  });

  it("returns false for empty string on required single-choice", () => {
    const step: SurveyStep = {
      id: "step-0",
      questions: [q("sc", "single-choice", true, ["A", "B"])],
    };
    expect(canProceedStep(step, { sc: "" })).toBe(false);
    expect(canProceedStep(step, { sc: "A" })).toBe(true);
  });
});
