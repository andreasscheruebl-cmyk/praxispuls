import type { SurveyTemplate } from "@/types";

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: "zahnarzt_standard",
    name: "Zahnarzt Standard",
    description: "NPS + 4 Kategorien + Freitext (empfohlen, 60-90 Sekunden)",
    questions: [
      {
        id: "nps",
        type: "nps",
        label: "Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?",
        required: true,
      },
      {
        id: "wait_time",
        type: "stars",
        label: "Wartezeit",
        required: false,
        category: "waitTime",
      },
      {
        id: "friendliness",
        type: "stars",
        label: "Freundlichkeit",
        required: false,
        category: "friendliness",
      },
      {
        id: "treatment",
        type: "stars",
        label: "Behandlungsqualität",
        required: false,
        category: "treatment",
      },
      {
        id: "facility",
        type: "stars",
        label: "Praxisausstattung",
        required: false,
        category: "facility",
      },
      {
        id: "freetext",
        type: "freetext",
        label: "Möchten Sie uns noch etwas mitteilen?",
        required: false,
      },
    ],
  },
  {
    id: "zahnarzt_kurz",
    name: "Zahnarzt Kurz",
    description: "Nur NPS + Freitext (30 Sekunden)",
    questions: [
      {
        id: "nps",
        type: "nps",
        label: "Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?",
        required: true,
      },
      {
        id: "freetext",
        type: "freetext",
        label: "Möchten Sie uns noch etwas mitteilen?",
        required: false,
      },
    ],
  },
  {
    id: "zahnarzt_prophylaxe",
    name: "Zahnarzt Prophylaxe",
    description: "NPS + PZR-spezifische Fragen",
    questions: [
      {
        id: "nps",
        type: "nps",
        label: "Wie wahrscheinlich ist es, dass Sie unsere Praxis für Prophylaxe weiterempfehlen?",
        required: true,
      },
      {
        id: "wait_time",
        type: "stars",
        label: "Wartezeit",
        required: false,
        category: "waitTime",
      },
      {
        id: "friendliness",
        type: "stars",
        label: "Freundlichkeit der Prophylaxe-Assistenz",
        required: false,
        category: "friendliness",
      },
      {
        id: "treatment",
        type: "stars",
        label: "Behandlungsqualität (PZR)",
        required: false,
        category: "treatment",
      },
      {
        id: "facility",
        type: "stars",
        label: "Sauberkeit & Hygiene",
        required: false,
        category: "facility",
      },
      {
        id: "freetext",
        type: "freetext",
        label: "Haben Sie Verbesserungsvorschläge für unsere Prophylaxe?",
        required: false,
      },
    ],
  },
];
