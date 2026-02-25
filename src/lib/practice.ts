import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { cookies } from "next/headers";

const ACTIVE_PRACTICE_COOKIE = "active_practice_id";

/**
 * Get all practices owned by a user ID.
 */
export async function getPracticesForUser(userId: string) {
  return db.query.practices.findMany({
    where: and(
      eq(practices.ownerUserId, userId),
      isNull(practices.deletedAt)
    ),
    orderBy: (practices, { asc }) => [asc(practices.createdAt)],
  });
}

/**
 * Get the active practice for a user.
 * Reads `active_practice_id` cookie; falls back to the first practice.
 * If practiceId is provided, it overrides the cookie (e.g. for API routes).
 */
export async function getActivePracticeForUser(
  userId: string,
  practiceId?: string
) {
  const userPractices = await getPracticesForUser(userId);
  if (userPractices.length === 0) return null;

  // If explicit practiceId, verify ownership
  if (practiceId) {
    return userPractices.find((p) => p.id === practiceId) ?? null;
  }

  // Check cookie
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ACTIVE_PRACTICE_COOKIE)?.value;
  if (cookieValue) {
    const match = userPractices.find((p) => p.id === cookieValue);
    if (match) return match;
  }

  // Fallback: first practice
  return userPractices[0]!;
}
