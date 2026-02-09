import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculate NPS category from score
 */
export function getNpsCategory(
  score: number
): "promoter" | "passive" | "detractor" {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

/**
 * Generate Google Review deeplink from Place ID
 */
export function getGoogleReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

/**
 * Format date in German locale
 */
export function formatDateDE(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Calculate NPS score from responses
 * NPS = %Promoters - %Detractors (range: -100 to +100)
 */
export function calculateNps(
  responses: { npsCategory: string }[]
): number | null {
  if (responses.length === 0) return null;

  const promoters = responses.filter(
    (r) => r.npsCategory === "promoter"
  ).length;
  const detractors = responses.filter(
    (r) => r.npsCategory === "detractor"
  ).length;
  const total = responses.length;

  return Math.round(((promoters - detractors) / total) * 100);
}
