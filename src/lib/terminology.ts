import type { RespondentType } from "@/types";

// ============================================================
// Terminology Type
// ============================================================

export type Terminology = {
  singular: string;
  plural: string;
  genitive: string;
  dative: string;
  surveyTitle: string;
  feedbackLabel: string;
};

// ============================================================
// Terminology Map (12 entries)
// ============================================================

const TERMINOLOGY_MAP: Record<RespondentType, Terminology> = {
  patient: {
    singular: "Patient",
    plural: "Patienten",
    genitive: "des Patienten",
    dative: "dem Patienten",
    surveyTitle: "Patientenbefragung",
    feedbackLabel: "Patienten-Feedback",
  },
  tierhalter: {
    singular: "Tierhalter",
    plural: "Tierhalter",
    genitive: "des Tierhalters",
    dative: "dem Tierhalter",
    surveyTitle: "Tierhalterbefragung",
    feedbackLabel: "Tierhalter-Feedback",
  },
  kunde: {
    singular: "Kunde",
    plural: "Kunden",
    genitive: "des Kunden",
    dative: "dem Kunden",
    surveyTitle: "Kundenbefragung",
    feedbackLabel: "Kunden-Feedback",
  },
  gast: {
    singular: "Gast",
    plural: "G\u00e4ste",
    genitive: "des Gastes",
    dative: "dem Gast",
    surveyTitle: "G\u00e4stebefragung",
    feedbackLabel: "G\u00e4ste-Feedback",
  },
  mitglied: {
    singular: "Mitglied",
    plural: "Mitglieder",
    genitive: "des Mitglieds",
    dative: "dem Mitglied",
    surveyTitle: "Mitgliederbefragung",
    feedbackLabel: "Mitglieder-Feedback",
  },
  fahrschueler: {
    singular: "Fahrsch\u00fcler",
    plural: "Fahrsch\u00fcler",
    genitive: "des Fahrsch\u00fclers",
    dative: "dem Fahrsch\u00fcler",
    surveyTitle: "Fahrsch\u00fclerbefragung",
    feedbackLabel: "Fahrsch\u00fcler-Feedback",
  },
  schueler: {
    singular: "Sch\u00fcler",
    plural: "Sch\u00fcler",
    genitive: "des Sch\u00fclers",
    dative: "dem Sch\u00fcler",
    surveyTitle: "Sch\u00fclerbefragung",
    feedbackLabel: "Sch\u00fcler-Feedback",
  },
  eltern: {
    singular: "Eltern",
    plural: "Eltern",
    genitive: "der Eltern",
    dative: "den Eltern",
    surveyTitle: "Elternbefragung",
    feedbackLabel: "Eltern-Feedback",
  },
  mandant: {
    singular: "Mandant",
    plural: "Mandanten",
    genitive: "des Mandanten",
    dative: "dem Mandanten",
    surveyTitle: "Mandantenbefragung",
    feedbackLabel: "Mandanten-Feedback",
  },
  mitarbeiter: {
    singular: "Mitarbeiter",
    plural: "Mitarbeiter",
    genitive: "des Mitarbeiters",
    dative: "dem Mitarbeiter",
    surveyTitle: "Mitarbeiterbefragung",
    feedbackLabel: "Mitarbeiter-Feedback",
  },
  individuell: {
    singular: "Teilnehmer",
    plural: "Teilnehmer",
    genitive: "des Teilnehmers",
    dative: "dem Teilnehmer",
    surveyTitle: "Umfrage",
    feedbackLabel: "Feedback",
  },
  teilnehmer: {
    singular: "Teilnehmer",
    plural: "Teilnehmer",
    genitive: "des Teilnehmers",
    dative: "dem Teilnehmer",
    surveyTitle: "Teilnehmerbefragung",
    feedbackLabel: "Teilnehmer-Feedback",
  },
};

// ============================================================
// Fallback
// ============================================================

const FALLBACK: Terminology = TERMINOLOGY_MAP.teilnehmer;

// ============================================================
// getTerminology()
// ============================================================

export function getTerminology(respondentType: RespondentType): Terminology {
  return TERMINOLOGY_MAP[respondentType] ?? FALLBACK;
}
