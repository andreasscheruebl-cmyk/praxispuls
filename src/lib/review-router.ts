import { getNpsCategory } from "./utils";
import { getGoogleReviewLink } from "./google";

export type RouteResult = {
  category: "promoter" | "passive" | "detractor";
  routedTo: "google" | "internal" | null;
  googleReviewUrl: string | null;
  showGooglePrompt: boolean;
  alertRequired: boolean;
};

/**
 * Smart Review Routing – "Die Zufriedenheits-Weiche"
 *
 * NPS 9-10 (Promoter) → Google Review prompt
 * NPS 7-8  (Passive)  → Thank you, no Google
 * NPS 0-6  (Detractor)→ Empathy screen + alert
 */
export function routeByNps(
  npsScore: number,
  googlePlaceId: string | null,
  npsThreshold: number = 9,
  googleRedirectEnabled: boolean = true
): RouteResult {
  const category = getNpsCategory(npsScore);

  if (npsScore >= npsThreshold && googlePlaceId && googleRedirectEnabled) {
    return {
      category,
      routedTo: "google",
      googleReviewUrl: getGoogleReviewLink(googlePlaceId),
      showGooglePrompt: true,
      alertRequired: false,
    };
  }

  if (category === "detractor") {
    return {
      category,
      routedTo: "internal",
      googleReviewUrl: null,
      showGooglePrompt: false,
      alertRequired: true,
    };
  }

  // Passive or Promoter without Google Place ID
  return {
    category,
    routedTo: null,
    googleReviewUrl: null,
    showGooglePrompt: false,
    alertRequired: false,
  };
}

/**
 * No routing — used for employee surveys where Google routing and alerts are disabled.
 */
export function noRouting(npsScore: number): RouteResult {
  return {
    category: getNpsCategory(npsScore),
    routedTo: null,
    googleReviewUrl: null,
    showGooglePrompt: false,
    alertRequired: false,
  };
}
