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
    .replace(/^-/, "")
    .replace(/-$/, "");
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
