"use server";

import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  ACTIVE_PRACTICE_COOKIE,
  getPracticesForUser,
  getActivePracticeForUser,
} from "@/lib/practice";

/**
 * Get all practices owned by the current user.
 */
export async function getPractices() {
  const user = await getUser();
  return getPracticesForUser(user.id);
}

/**
 * Get the active practice for the current user.
 * Reads `active_practice_id` cookie; falls back to the first practice.
 */
export async function getActivePractice(practiceId?: string) {
  const user = await getUser();
  return getActivePracticeForUser(user.id, practiceId);
}

/**
 * Set the active practice cookie.
 */
export async function setActivePractice(practiceId: string) {
  const user = await getUser();
  const userPractices = await getPracticesForUser(user.id);

  const match = userPractices.find((p) => p.id === practiceId);
  if (!match) throw new Error("Praxis nicht gefunden oder kein Zugriff");

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PRACTICE_COOKIE, practiceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  revalidatePath("/dashboard");
}

