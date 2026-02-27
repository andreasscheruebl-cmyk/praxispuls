import type { NewSurveyTemplate } from "@/lib/db/schema";
import type { SurveyQuestion, IndustryCategory, IndustrySubCategory, RespondentType } from "@/types";

// ============================================================
// Question Presets per Industry Group
// ============================================================

type StarPreset = Pick<SurveyQuestion, "id" | "label" | "category">;

// Medical (zahnarzt, hausarzt, augenarzt, dermatologe, physiotherapie)
const MEDICAL_STARS: StarPreset[] = [
  { id: "wait_time", label: "Wartezeit", category: "waitTime" },
  { id: "friendliness", label: "Freundlichkeit", category: "friendliness" },
  { id: "treatment", label: "Behandlungsqualität", category: "treatment" },
  { id: "facility", label: "Praxisausstattung", category: "facility" },
];

// Tierarzt
const TIERARZT_STARS: StarPreset[] = [
  { id: "wait_time", label: "Wartezeit", category: "waitTime" },
  { id: "friendliness", label: "Freundlichkeit", category: "friendliness" },
  { id: "treatment", label: "Behandlung des Tieres", category: "treatment" },
  { id: "facility", label: "Praxisausstattung", category: "facility" },
];

// Apotheke
const APOTHEKE_STARS: StarPreset[] = [
  { id: "consultation", label: "Beratungsqualität", category: "consultation" },
  { id: "friendliness", label: "Freundlichkeit", category: "friendliness" },
  { id: "wait_time", label: "Wartezeit", category: "waitTime" },
  { id: "assortment", label: "Sortiment", category: "assortment" },
];

// Handwerk (kfz_werkstatt, she, handwerk_allgemein)
const HANDWERK_STARS: StarPreset[] = [
  { id: "quality", label: "Arbeitsqualität", category: "quality" },
  { id: "value", label: "Preis-Leistung", category: "value" },
  { id: "communication", label: "Kommunikation", category: "communication" },
  { id: "punctuality", label: "Termintreue", category: "punctuality" },
];

// Beauty (friseur, kosmetik)
const BEAUTY_STARS: StarPreset[] = [
  { id: "result", label: "Ergebnis", category: "result" },
  { id: "friendliness", label: "Freundlichkeit", category: "friendliness" },
  { id: "atmosphere", label: "Atmosphäre", category: "atmosphere" },
  { id: "value", label: "Preis-Leistung", category: "value" },
];

// Gastronomie (restaurant, hotel)
const GASTRO_STARS: StarPreset[] = [
  { id: "quality", label: "Essen-/Zimmerqualität", category: "quality" },
  { id: "service", label: "Service", category: "service" },
  { id: "atmosphere", label: "Atmosphäre", category: "atmosphere" },
  { id: "cleanliness", label: "Sauberkeit", category: "cleanliness" },
];

// Fitness (fitnessstudio, yoga_wellness)
const FITNESS_STARS: StarPreset[] = [
  { id: "equipment", label: "Geräte/Ausstattung", category: "equipment" },
  { id: "cleanliness", label: "Sauberkeit", category: "cleanliness" },
  { id: "coaching", label: "Betreuung", category: "coaching" },
  { id: "value", label: "Preis-Leistung", category: "value" },
];

// Einzelhandel (laden, optiker)
const EINZELHANDEL_STARS: StarPreset[] = [
  { id: "consultation", label: "Beratung", category: "consultation" },
  { id: "friendliness", label: "Freundlichkeit", category: "friendliness" },
  { id: "assortment", label: "Sortiment", category: "assortment" },
  { id: "value", label: "Preis-Leistung", category: "value" },
];

// Bildung (fahrschule, nachhilfe, schule, kindergarten)
const BILDUNG_STARS: StarPreset[] = [
  { id: "teaching", label: "Unterrichtsqualität", category: "teaching" },
  { id: "communication", label: "Kommunikation", category: "communication" },
  { id: "competence", label: "Kompetenz", category: "competence" },
  { id: "facility", label: "Ausstattung", category: "facility" },
];

// Vereine (sportverein, verein_allgemein)
const VEREINE_STARS: StarPreset[] = [
  { id: "offering", label: "Angebot", category: "offering" },
  { id: "organization", label: "Organisation", category: "organization" },
  { id: "coaching", label: "Betreuung", category: "coaching" },
  { id: "facility", label: "Ausstattung", category: "facility" },
];

// Beratung (steuerberater, rechtsanwalt)
const BERATUNG_STARS: StarPreset[] = [
  { id: "competence", label: "Fachkompetenz", category: "competence" },
  { id: "availability", label: "Erreichbarkeit", category: "availability" },
  { id: "clarity", label: "Verständlichkeit", category: "clarity" },
  { id: "value", label: "Preis-Leistung", category: "value" },
];

// Individuell (eigene_branche, private_umfrage)
const INDIVIDUELL_STARS: StarPreset[] = [
  { id: "quality", label: "Qualität", category: "quality" },
  { id: "friendliness", label: "Freundlichkeit", category: "friendliness" },
  { id: "value", label: "Preis-Leistung", category: "value" },
  { id: "communication", label: "Kommunikation", category: "communication" },
];

// ============================================================
// Star presets by sub-category
// ============================================================

const STARS_BY_SUB: Partial<Record<IndustrySubCategory, StarPreset[]>> = {
  // gesundheit
  zahnarzt: MEDICAL_STARS,
  hausarzt: MEDICAL_STARS,
  augenarzt: MEDICAL_STARS,
  dermatologe: MEDICAL_STARS,
  physiotherapie: MEDICAL_STARS,
  tierarzt: TIERARZT_STARS,
  apotheke: APOTHEKE_STARS,
  // handwerk
  kfz_werkstatt: HANDWERK_STARS,
  she: HANDWERK_STARS,
  handwerk_allgemein: HANDWERK_STARS,
  // beauty
  friseur: BEAUTY_STARS,
  kosmetik: BEAUTY_STARS,
  // gastronomie
  restaurant: GASTRO_STARS,
  hotel: GASTRO_STARS,
  // fitness
  fitnessstudio: FITNESS_STARS,
  yoga_wellness: FITNESS_STARS,
  // einzelhandel
  laden: EINZELHANDEL_STARS,
  optiker: EINZELHANDEL_STARS,
  // bildung
  fahrschule: BILDUNG_STARS,
  nachhilfe: BILDUNG_STARS,
  schule: BILDUNG_STARS,
  kindergarten: BILDUNG_STARS,
  // vereine
  sportverein: VEREINE_STARS,
  verein_allgemein: VEREINE_STARS,
  // beratung
  steuerberater: BERATUNG_STARS,
  rechtsanwalt: BERATUNG_STARS,
  // individuell
  eigene_branche: INDIVIDUELL_STARS,
  private_umfrage: INDIVIDUELL_STARS,
};

// ============================================================
// Sub-Category Config
// ============================================================

type SubConfig = {
  subId: IndustrySubCategory;
  category: IndustryCategory;
  label: string;
  respondentType: RespondentType;
  npsLabel: string;
};

const SUB_CONFIGS: SubConfig[] = [
  // gesundheit
  { subId: "zahnarzt", category: "gesundheit", label: "Zahnarzt", respondentType: "patient", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?" },
  { subId: "hausarzt", category: "gesundheit", label: "Hausarzt", respondentType: "patient", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?" },
  { subId: "augenarzt", category: "gesundheit", label: "Augenarzt", respondentType: "patient", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?" },
  { subId: "dermatologe", category: "gesundheit", label: "Dermatologe", respondentType: "patient", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?" },
  { subId: "physiotherapie", category: "gesundheit", label: "Physiotherapie", respondentType: "patient", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?" },
  { subId: "tierarzt", category: "gesundheit", label: "Tierarzt", respondentType: "tierhalter", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Tierarztpraxis weiterempfehlen?" },
  { subId: "apotheke", category: "gesundheit", label: "Apotheke", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Apotheke weiterempfehlen?" },
  // handwerk
  { subId: "kfz_werkstatt", category: "handwerk", label: "KFZ-Werkstatt", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Werkstatt weiterempfehlen?" },
  { subId: "she", category: "handwerk", label: "SHE-Betrieb", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unseren Betrieb weiterempfehlen?" },
  { subId: "handwerk_allgemein", category: "handwerk", label: "Handwerk", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unseren Betrieb weiterempfehlen?" },
  // beauty
  { subId: "friseur", category: "beauty", label: "Friseur", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unseren Salon weiterempfehlen?" },
  { subId: "kosmetik", category: "beauty", label: "Kosmetik", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unser Studio weiterempfehlen?" },
  // gastronomie
  { subId: "restaurant", category: "gastronomie", label: "Restaurant", respondentType: "gast", npsLabel: "Wie wahrscheinlich ist es, dass Sie unser Restaurant weiterempfehlen?" },
  { subId: "hotel", category: "gastronomie", label: "Hotel", respondentType: "gast", npsLabel: "Wie wahrscheinlich ist es, dass Sie unser Hotel weiterempfehlen?" },
  // fitness
  { subId: "fitnessstudio", category: "fitness", label: "Fitnessstudio", respondentType: "mitglied", npsLabel: "Wie wahrscheinlich ist es, dass Sie unser Fitnessstudio weiterempfehlen?" },
  { subId: "yoga_wellness", category: "fitness", label: "Yoga/Wellness", respondentType: "mitglied", npsLabel: "Wie wahrscheinlich ist es, dass Sie unser Studio weiterempfehlen?" },
  // einzelhandel
  { subId: "laden", category: "einzelhandel", label: "Geschäft", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unser Geschäft weiterempfehlen?" },
  { subId: "optiker", category: "einzelhandel", label: "Optiker", respondentType: "kunde", npsLabel: "Wie wahrscheinlich ist es, dass Sie unseren Optiker weiterempfehlen?" },
  // bildung
  { subId: "fahrschule", category: "bildung", label: "Fahrschule", respondentType: "fahrschueler", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Fahrschule weiterempfehlen?" },
  { subId: "nachhilfe", category: "bildung", label: "Nachhilfe", respondentType: "schueler", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Schule weiterempfehlen?" },
  { subId: "schule", category: "bildung", label: "Schule", respondentType: "schueler", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Schule weiterempfehlen?" },
  { subId: "kindergarten", category: "bildung", label: "Kindergarten", respondentType: "eltern", npsLabel: "Wie wahrscheinlich ist es, dass Sie unseren Kindergarten weiterempfehlen?" },
  // vereine
  { subId: "sportverein", category: "vereine", label: "Sportverein", respondentType: "mitglied", npsLabel: "Wie wahrscheinlich ist es, dass Sie unseren Verein weiterempfehlen?" },
  { subId: "verein_allgemein", category: "vereine", label: "Verein", respondentType: "mitglied", npsLabel: "Wie wahrscheinlich ist es, dass Sie unseren Verein weiterempfehlen?" },
  // beratung
  { subId: "steuerberater", category: "beratung", label: "Steuerberater", respondentType: "mandant", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Kanzlei weiterempfehlen?" },
  { subId: "rechtsanwalt", category: "beratung", label: "Rechtsanwalt", respondentType: "mandant", npsLabel: "Wie wahrscheinlich ist es, dass Sie unsere Kanzlei weiterempfehlen?" },
  // individuell
  { subId: "eigene_branche", category: "individuell", label: "Individuell", respondentType: "individuell", npsLabel: "Wie wahrscheinlich ist es, dass Sie uns weiterempfehlen?" },
  { subId: "private_umfrage", category: "individuell", label: "Privat", respondentType: "teilnehmer", npsLabel: "Wie wahrscheinlich ist es, dass Sie uns weiterempfehlen?" },
];

// ============================================================
// Factory: generate Standard + Kurz templates for a sub-category
// ============================================================

function makeCustomerTemplates(config: SubConfig, sortBase: number): NewSurveyTemplate[] {
  const stars = STARS_BY_SUB[config.subId] ?? INDIVIDUELL_STARS;

  const standardQuestions: SurveyQuestion[] = [
    { id: "nps", type: "nps", label: config.npsLabel, required: true },
    ...stars.map((s) => ({
      id: s.id,
      type: "stars" as const,
      label: s.label,
      required: false,
      category: s.category,
    })),
    { id: "freetext", type: "freetext", label: "Möchten Sie uns noch etwas mitteilen?", required: false },
  ];

  const kurzQuestions: SurveyQuestion[] = [
    { id: "nps", type: "nps", label: config.npsLabel, required: true },
    { id: "freetext", type: "freetext", label: "Möchten Sie uns noch etwas mitteilen?", required: false },
  ];

  return [
    {
      name: `${config.label} Standard`,
      slug: `${config.subId}_standard`,
      description: `NPS + ${stars.length} Kategorien + Freitext (empfohlen, 60–90 Sek.)`,
      industryCategory: config.category,
      industrySubCategory: config.subId,
      respondentType: config.respondentType,
      category: "customer",
      questions: standardQuestions,
      isSystem: true,
      sortOrder: sortBase,
    },
    {
      name: `${config.label} Kurz`,
      slug: `${config.subId}_kurz`,
      description: `Nur NPS + Freitext (30 Sek.)`,
      industryCategory: config.category,
      industrySubCategory: config.subId,
      respondentType: config.respondentType,
      category: "customer",
      questions: kurzQuestions,
      isSystem: true,
      sortOrder: sortBase + 1,
    },
  ];
}

// ============================================================
// Employee Templates (3, cross-industry)
// ============================================================

const EMPLOYEE_TEMPLATES: NewSurveyTemplate[] = [
  {
    name: "Mitarbeiter Kurzcheck",
    slug: "employee_kurz",
    description: "eNPS + 2 Likert + Freitext (2 Min.)",
    industryCategory: "individuell",
    respondentType: "mitarbeiter",
    category: "employee",
    questions: [
      { id: "enps", type: "enps", label: "Wie wahrscheinlich ist es, dass Sie Ihren Arbeitgeber weiterempfehlen?", required: true },
      { id: "atmosphere", type: "likert", label: "Ich fühle mich an meinem Arbeitsplatz wohl.", required: false, category: "atmosphere" },
      { id: "leadership", type: "likert", label: "Meine Führungskraft unterstützt mich.", required: false, category: "leadership" },
      { id: "freetext", type: "freetext", label: "Was möchten Sie uns mitteilen?", required: false },
    ],
    isSystem: true,
    sortOrder: 900,
  },
  {
    name: "Mitarbeiter Standard",
    slug: "employee_standard",
    description: "eNPS + 7 Likert + Freitext (5 Min.)",
    industryCategory: "individuell",
    respondentType: "mitarbeiter",
    category: "employee",
    questions: [
      { id: "enps", type: "enps", label: "Wie wahrscheinlich ist es, dass Sie Ihren Arbeitgeber weiterempfehlen?", required: true },
      { id: "atmosphere", type: "likert", label: "Ich fühle mich an meinem Arbeitsplatz wohl.", required: false, category: "atmosphere" },
      { id: "leadership", type: "likert", label: "Meine Führungskraft unterstützt mich.", required: false, category: "leadership" },
      { id: "communication", type: "likert", label: "Die interne Kommunikation funktioniert gut.", required: false, category: "communication" },
      { id: "work_life", type: "likert", label: "Meine Work-Life-Balance ist zufriedenstellend.", required: false, category: "workLife" },
      { id: "development", type: "likert", label: "Ich habe gute Weiterentwicklungsmöglichkeiten.", required: false, category: "development" },
      { id: "teamwork", type: "likert", label: "Die Zusammenarbeit im Team funktioniert gut.", required: false, category: "teamwork" },
      { id: "compensation", type: "likert", label: "Ich bin mit meiner Vergütung zufrieden.", required: false, category: "compensation" },
      { id: "freetext", type: "freetext", label: "Was möchten Sie uns mitteilen?", required: false },
    ],
    isSystem: true,
    sortOrder: 901,
  },
  {
    name: "Mitarbeiter Ausführlich",
    slug: "employee_ausfuehrlich",
    description: "eNPS + 12 Likert + 2 Freitexte (8 Min.)",
    industryCategory: "individuell",
    respondentType: "mitarbeiter",
    category: "employee",
    questions: [
      { id: "enps", type: "enps", label: "Wie wahrscheinlich ist es, dass Sie Ihren Arbeitgeber weiterempfehlen?", required: true },
      { id: "atmosphere", type: "likert", label: "Ich fühle mich an meinem Arbeitsplatz wohl.", required: false, category: "atmosphere" },
      { id: "leadership", type: "likert", label: "Meine Führungskraft unterstützt mich.", required: false, category: "leadership" },
      { id: "communication", type: "likert", label: "Die interne Kommunikation funktioniert gut.", required: false, category: "communication" },
      { id: "work_life", type: "likert", label: "Meine Work-Life-Balance ist zufriedenstellend.", required: false, category: "workLife" },
      { id: "development", type: "likert", label: "Ich habe gute Weiterentwicklungsmöglichkeiten.", required: false, category: "development" },
      { id: "teamwork", type: "likert", label: "Die Zusammenarbeit im Team funktioniert gut.", required: false, category: "teamwork" },
      { id: "compensation", type: "likert", label: "Ich bin mit meiner Vergütung zufrieden.", required: false, category: "compensation" },
      { id: "recognition", type: "likert", label: "Meine Arbeit wird angemessen gewürdigt.", required: false, category: "recognition" },
      { id: "onboarding", type: "likert", label: "Neue Mitarbeiter werden gut eingearbeitet.", required: false, category: "onboarding" },
      { id: "tools", type: "likert", label: "Ich habe die richtigen Arbeitsmittel zur Verfügung.", required: false, category: "tools" },
      { id: "strategy", type: "likert", label: "Ich verstehe die Unternehmensziele und -strategie.", required: false, category: "strategy" },
      { id: "safety", type: "likert", label: "Ich fühle mich sicher, offen Feedback zu geben.", required: false, category: "safety" },
      { id: "freetext_positive", type: "freetext", label: "Was läuft besonders gut?", required: false },
      { id: "freetext_improve", type: "freetext", label: "Was sollte verbessert werden?", required: false },
    ],
    isSystem: true,
    sortOrder: 902,
  },
];

// ============================================================
// Generate all system templates
// ============================================================

function buildAllTemplates(): NewSurveyTemplate[] {
  const templates: NewSurveyTemplate[] = [];

  SUB_CONFIGS.forEach((config, index) => {
    templates.push(...makeCustomerTemplates(config, index * 2));
  });

  templates.push(...EMPLOYEE_TEMPLATES);

  return templates;
}

/**
 * All system templates (56 customer + 3 employee = 59 total).
 * Used by seed script and tests.
 */
export const SYSTEM_TEMPLATES: NewSurveyTemplate[] = buildAllTemplates();
