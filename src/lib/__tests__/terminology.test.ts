import { describe, expect, it } from "vitest";

import type { RespondentType } from "@/types";

import type { Terminology } from "../terminology";
import { getTerminology } from "../terminology";

const ALL_RESPONDENT_TYPES: RespondentType[] = [
  "patient",
  "tierhalter",
  "kunde",
  "gast",
  "mitglied",
  "fahrschueler",
  "schueler",
  "eltern",
  "mandant",
  "mitarbeiter",
  "individuell",
  "teilnehmer",
];

describe("getTerminology", () => {
  it("returns valid Terminology for all 12 respondentTypes", () => {
    for (const type of ALL_RESPONDENT_TYPES) {
      const t = getTerminology(type);
      expect(t.singular).toBeTruthy();
      expect(t.plural).toBeTruthy();
      expect(t.genitive).toBeTruthy();
      expect(t.dative).toBeTruthy();
      expect(t.surveyTitle).toBeTruthy();
      expect(t.feedbackLabel).toBeTruthy();
    }
  });

  it("falls back to 'teilnehmer' for unknown types", () => {
    const fallback = getTerminology("unknown_type" as RespondentType);
    const teilnehmer = getTerminology("teilnehmer");
    expect(fallback).toEqual(teilnehmer);
  });

  it("maps 'individuell' to generic terms", () => {
    const t = getTerminology("individuell");
    expect(t.singular).toBe("Teilnehmer");
    expect(t.surveyTitle).toBe("Umfrage");
    expect(t.feedbackLabel).toBe("Feedback");
  });

  it.each([
    ["patient", "Patientenbefragung", "Patienten-Feedback"],
    ["kunde", "Kundenbefragung", "Kunden-Feedback"],
    ["gast", "G\u00e4stebefragung", "G\u00e4ste-Feedback"],
    ["mitglied", "Mitgliederbefragung", "Mitglieder-Feedback"],
    ["mandant", "Mandantenbefragung", "Mandanten-Feedback"],
    ["mitarbeiter", "Mitarbeiterbefragung", "Mitarbeiter-Feedback"],
    ["teilnehmer", "Teilnehmerbefragung", "Teilnehmer-Feedback"],
  ] as const)(
    "type '%s' has surveyTitle '%s' and feedbackLabel '%s'",
    (type, expectedTitle, expectedLabel) => {
      const t = getTerminology(type);
      expect(t.surveyTitle).toBe(expectedTitle);
      expect(t.feedbackLabel).toBe(expectedLabel);
    },
  );

  it("returns correct German cases for 'patient'", () => {
    const t = getTerminology("patient");
    expect(t.singular).toBe("Patient");
    expect(t.plural).toBe("Patienten");
    expect(t.genitive).toBe("des Patienten");
    expect(t.dative).toBe("dem Patienten");
  });

  it("handles special plural forms correctly", () => {
    expect(getTerminology("gast").plural).toBe("G\u00e4ste");
    expect(getTerminology("mitglied").plural).toBe("Mitglieder");
    expect(getTerminology("mandant").plural).toBe("Mandanten");
  });

  it("handles 'eltern' correctly (always plural)", () => {
    const t = getTerminology("eltern");
    expect(t.singular).toBe("Eltern");
    expect(t.plural).toBe("Eltern");
    expect(t.genitive).toBe("der Eltern");
    expect(t.dative).toBe("den Eltern");
    expect(t.surveyTitle).toBe("Elternbefragung");
  });

  it("returns Terminology type shape", () => {
    const t: Terminology = getTerminology("patient");
    const keys = Object.keys(t).sort();
    expect(keys).toEqual([
      "dative",
      "feedbackLabel",
      "genitive",
      "plural",
      "singular",
      "surveyTitle",
    ]);
  });
});
