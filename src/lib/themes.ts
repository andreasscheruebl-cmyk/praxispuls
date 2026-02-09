// Theme system – types and configuration

export type ThemeId = "standard" | "vertrauen";

export type ThemeConfig = {
  id: ThemeId;
  name: string;
  description: string;
  // Structural differences per theme
  survey: {
    npsStyle: "buttons" | "slider";
    ratingStyle: "stars" | "circles";
    paperTexture: boolean;
  };
  dashboard: {
    mobileNav: "hamburger" | "bottom-tabs";
    categoryDisplay: "stars" | "bars";
  };
  landing: {
    heroLayout: "centered" | "asymmetric";
  };
  chart: {
    primaryColor: string;
    accentColor: string;
  };
  pdf: {
    brandColor: [number, number, number];
  };
};

export const THEMES: Record<ThemeId, ThemeConfig> = {
  standard: {
    id: "standard",
    name: "Standard",
    description: "Klar & professionell – Blau, modern, bewährt.",
    survey: {
      npsStyle: "buttons",
      ratingStyle: "stars",
      paperTexture: false,
    },
    dashboard: {
      mobileNav: "hamburger",
      categoryDisplay: "stars",
    },
    landing: {
      heroLayout: "centered",
    },
    chart: {
      primaryColor: "#2563eb",
      accentColor: "#60a5fa",
    },
    pdf: {
      brandColor: [59, 130, 246],
    },
  },
  vertrauen: {
    id: "vertrauen",
    name: "Vertrauen",
    description: "Warm & premium – Teal, Sage, Creme, Serif-Akzente.",
    survey: {
      npsStyle: "slider",
      ratingStyle: "stars",
      paperTexture: true,
    },
    dashboard: {
      mobileNav: "bottom-tabs",
      categoryDisplay: "bars",
    },
    landing: {
      heroLayout: "asymmetric",
    },
    chart: {
      primaryColor: "#0D9488",
      accentColor: "#A7C4A1",
    },
    pdf: {
      brandColor: [13, 148, 136],
    },
  },
};

export function getThemeConfig(themeId: ThemeId): ThemeConfig {
  return THEMES[themeId] ?? THEMES.standard;
}
