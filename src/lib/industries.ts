import type { IndustryCategory, IndustrySubCategory, RespondentType } from "@/types";

// ============================================================
// Industry Sub-Category Definition
// ============================================================

type SubCategory = {
  id: IndustrySubCategory;
  label: string;
  defaultRespondentType: RespondentType;
};

// ============================================================
// Industry Category Definition
// ============================================================

type Category = {
  id: IndustryCategory;
  label: string;
  subCategories: SubCategory[];
};

// ============================================================
// 10 Categories, 28 Sub-Categories
// ============================================================

export const INDUSTRY_CATEGORIES: readonly Category[] = [
  {
    id: "gesundheit",
    label: "Gesundheit & Medizin",
    subCategories: [
      { id: "zahnarzt", label: "Zahnarztpraxis", defaultRespondentType: "patient" },
      { id: "hausarzt", label: "Hausarzt / Allgemeinmedizin", defaultRespondentType: "patient" },
      { id: "augenarzt", label: "Augenarzt", defaultRespondentType: "patient" },
      { id: "dermatologe", label: "Dermatologe / Hautarzt", defaultRespondentType: "patient" },
      { id: "physiotherapie", label: "Physiotherapie", defaultRespondentType: "patient" },
      { id: "tierarzt", label: "Tierarztpraxis", defaultRespondentType: "tierhalter" },
      { id: "apotheke", label: "Apotheke", defaultRespondentType: "kunde" },
    ],
  },
  {
    id: "handwerk",
    label: "Handwerk & Technik",
    subCategories: [
      { id: "kfz_werkstatt", label: "KFZ-Werkstatt", defaultRespondentType: "kunde" },
      { id: "she", label: "Sanitär / Heizung / Elektro", defaultRespondentType: "kunde" },
      { id: "handwerk_allgemein", label: "Handwerk allgemein", defaultRespondentType: "kunde" },
    ],
  },
  {
    id: "beauty",
    label: "Beauty & Pflege",
    subCategories: [
      { id: "friseur", label: "Friseur", defaultRespondentType: "kunde" },
      { id: "kosmetik", label: "Kosmetik / Beauty-Studio", defaultRespondentType: "kunde" },
    ],
  },
  {
    id: "gastronomie",
    label: "Gastronomie & Hotellerie",
    subCategories: [
      { id: "restaurant", label: "Restaurant / Caf\u00e9", defaultRespondentType: "gast" },
      { id: "hotel", label: "Hotel / Pension", defaultRespondentType: "gast" },
    ],
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    subCategories: [
      { id: "fitnessstudio", label: "Fitnessstudio", defaultRespondentType: "mitglied" },
      { id: "yoga_wellness", label: "Yoga / Wellness-Studio", defaultRespondentType: "mitglied" },
    ],
  },
  {
    id: "einzelhandel",
    label: "Einzelhandel",
    subCategories: [
      { id: "laden", label: "Gesch\u00e4ft / Laden", defaultRespondentType: "kunde" },
      { id: "optiker", label: "Optiker / H\u00f6rakustiker", defaultRespondentType: "kunde" },
    ],
  },
  {
    id: "bildung",
    label: "Bildung & Ausbildung",
    subCategories: [
      { id: "fahrschule", label: "Fahrschule", defaultRespondentType: "fahrschueler" },
      { id: "nachhilfe", label: "Nachhilfe / Musikschule", defaultRespondentType: "schueler" },
      { id: "schule", label: "Schule / Gymnasium", defaultRespondentType: "schueler" },
      { id: "kindergarten", label: "Kindergarten / Kita", defaultRespondentType: "eltern" },
    ],
  },
  {
    id: "vereine",
    label: "Vereine & Organisationen",
    subCategories: [
      { id: "sportverein", label: "Sportverein", defaultRespondentType: "mitglied" },
      { id: "verein_allgemein", label: "Verein allgemein", defaultRespondentType: "mitglied" },
    ],
  },
  {
    id: "beratung",
    label: "Beratung & Recht",
    subCategories: [
      { id: "steuerberater", label: "Steuerberater", defaultRespondentType: "mandant" },
      { id: "rechtsanwalt", label: "Rechtsanwalt / Kanzlei", defaultRespondentType: "mandant" },
    ],
  },
  {
    id: "individuell",
    label: "Individuell",
    subCategories: [
      { id: "eigene_branche", label: "Eigene Branche", defaultRespondentType: "individuell" },
      { id: "private_umfrage", label: "Private Umfrage", defaultRespondentType: "teilnehmer" },
    ],
  },
] as const satisfies readonly Category[];

// ============================================================
// Smart 2-Layer threshold
// ============================================================

const SMART_LAYER_THRESHOLD = 3;

// ============================================================
// Helper Functions
// ============================================================

export function getSubCategory(id: IndustrySubCategory): SubCategory | undefined {
  for (const category of INDUSTRY_CATEGORIES) {
    const sub = category.subCategories.find((s) => s.id === id);
    if (sub) return sub;
  }
  return undefined;
}

export function getCategoryForSub(subId: IndustrySubCategory): Category | undefined {
  return INDUSTRY_CATEGORIES.find((cat) =>
    cat.subCategories.some((s) => s.id === subId),
  );
}

export function needsSecondLayer(categoryId: IndustryCategory): boolean {
  const category = INDUSTRY_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return false;
  return category.subCategories.length >= SMART_LAYER_THRESHOLD;
}
