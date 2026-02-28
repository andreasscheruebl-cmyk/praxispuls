import { describe, it, expect } from "vitest";
import { buildSteps, getStepHeading } from "../survey-steps";
import type { SurveyQuestion } from "@/types";

function q(id: string, type: SurveyQuestion["type"], required = true): SurveyQuestion {
  return { id, type, label: `Question ${id}`, required };
}

describe("buildSteps", () => {
  it("returns empty array for empty questions", () => {
    expect(buildSteps([])).toEqual([]);
  });

  it("groups standard template (nps + 4 stars + freetext) into 4 steps", () => {
    const questions: SurveyQuestion[] = [
      q("nps", "nps"),
      q("wait", "stars"),
      q("friendly", "stars"),
      q("treatment", "stars"),
      q("facility", "stars"),
      q("feedback", "freetext", false),
    ];

    const steps = buildSteps(questions);

    expect(steps).toHaveLength(4);
    // Step 0: NPS alone
    expect(steps[0]!.questions.map((q) => q.type)).toEqual(["nps"]);
    // Step 1: first 3 stars
    expect(steps[1]!.questions.map((q) => q.type)).toEqual(["stars", "stars", "stars"]);
    // Step 2: remaining 1 star
    expect(steps[2]!.questions.map((q) => q.type)).toEqual(["stars"]);
    // Step 3: freetext
    expect(steps[3]!.questions.map((q) => q.type)).toEqual(["freetext"]);
  });

  it("groups short template (nps + freetext) into 2 steps", () => {
    const questions: SurveyQuestion[] = [
      q("nps", "nps"),
      q("feedback", "freetext", false),
    ];

    const steps = buildSteps(questions);

    expect(steps).toHaveLength(2);
    expect(steps[0]!.questions[0]!.type).toBe("nps");
    expect(steps[1]!.questions[0]!.type).toBe("freetext");
  });

  it("groups employee standard (enps + 7 likert + freetext) into 5 steps", () => {
    const questions: SurveyQuestion[] = [
      q("enps", "enps"),
      q("l1", "likert"),
      q("l2", "likert"),
      q("l3", "likert"),
      q("l4", "likert"),
      q("l5", "likert"),
      q("l6", "likert"),
      q("l7", "likert"),
      q("feedback", "freetext", false),
    ];

    const steps = buildSteps(questions);

    // enps (1) + [3 likert] + [3 likert] + [1 likert] + freetext (1) = 5
    expect(steps).toHaveLength(5);
    expect(steps[0]!.questions[0]!.type).toBe("enps");
    expect(steps[1]!.questions).toHaveLength(3);
    expect(steps[2]!.questions).toHaveLength(3);
    expect(steps[3]!.questions).toHaveLength(1);
    expect(steps[4]!.questions[0]!.type).toBe("freetext");
  });

  it("handles mixed types correctly", () => {
    const questions: SurveyQuestion[] = [
      q("nps", "nps"),
      q("s1", "stars"),
      q("l1", "likert"),
      q("sc1", "single-choice"),
      q("yn1", "yes-no"),
      q("feedback", "freetext", false),
    ];
    // Make single-choice have options
    questions[3]!.options = ["Option A", "Option B"];

    const steps = buildSteps(questions);

    // nps (1) + [stars, likert, single-choice] (3) + [yes-no] (1) + freetext (1) = 4
    expect(steps).toHaveLength(4);
    expect(steps[0]!.questions[0]!.type).toBe("nps");
    expect(steps[1]!.questions.map((q) => q.type)).toEqual(["stars", "likert", "single-choice"]);
    expect(steps[2]!.questions[0]!.type).toBe("yes-no");
    expect(steps[3]!.questions[0]!.type).toBe("freetext");
  });

  it("puts NPS before eNPS when both present", () => {
    const questions: SurveyQuestion[] = [
      q("nps", "nps"),
      q("enps", "enps"),
    ];

    const steps = buildSteps(questions);

    expect(steps).toHaveLength(2);
    expect(steps[0]!.questions[0]!.type).toBe("nps");
    expect(steps[1]!.questions[0]!.type).toBe("enps");
  });

  it("assigns sequential step IDs", () => {
    const questions: SurveyQuestion[] = [
      q("nps", "nps"),
      q("s1", "stars"),
      q("feedback", "freetext", false),
    ];

    const steps = buildSteps(questions);

    expect(steps.map((s) => s.id)).toEqual(["step-0", "step-1", "step-2"]);
  });
});

describe("getStepHeading", () => {
  it("returns NPS heading for nps step", () => {
    const step = { id: "step-0", questions: [q("nps", "nps")] };
    expect(getStepHeading(step)).toBe("Ihre Weiterempfehlung");
  });

  it("returns eNPS heading for enps step", () => {
    const step = { id: "step-0", questions: [q("enps", "enps")] };
    expect(getStepHeading(step)).toBe("Ihre Weiterempfehlung");
  });

  it("returns freetext heading for freetext step", () => {
    const step = { id: "step-0", questions: [q("ft", "freetext")] };
    expect(getStepHeading(step)).toBe("Ihr persönliches Feedback");
  });

  it("returns stars heading for stars step", () => {
    const step = { id: "step-0", questions: [q("s1", "stars"), q("s2", "stars")] };
    expect(getStepHeading(step)).toBe("Ihre Bewertung");
  });

  it("returns likert heading for likert step", () => {
    const step = { id: "step-0", questions: [q("l1", "likert")] };
    expect(getStepHeading(step)).toBe("Ihre Einschätzung");
  });

  it("returns generic heading for mixed types", () => {
    const step = { id: "step-0", questions: [q("yn", "yes-no"), q("sc", "single-choice")] };
    expect(getStepHeading(step)).toBe("Ihre Angaben");
  });

  it("returns empty string for empty step", () => {
    const step = { id: "step-0", questions: [] };
    expect(getStepHeading(step)).toBe("");
  });
});
