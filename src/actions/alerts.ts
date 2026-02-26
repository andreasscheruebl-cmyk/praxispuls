"use server";

import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { getUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Mark an alert as read
 */
export async function markAlertRead(alertId: string) {
  const user = await getUser();

  // Get practice for user
  const alert = await db.query.alerts.findFirst({
    where: eq(alerts.id, alertId),
    with: { practice: true },
  });

  if (!alert || alert.practice.ownerUserId !== user.id) {
    throw new Error("Alert nicht gefunden");
  }

  await db
    .update(alerts)
    .set({ isRead: true })
    .where(eq(alerts.id, alertId));

  revalidatePath("/dashboard");
}

/**
 * Add note to an alert
 */
export async function addAlertNote(alertId: string, note: string) {
  const user = await getUser();

  const parsed = z.string().min(1).max(2000).parse(note);

  const alert = await db.query.alerts.findFirst({
    where: eq(alerts.id, alertId),
    with: { practice: true },
  });

  if (!alert || alert.practice.ownerUserId !== user.id) {
    throw new Error("Alert nicht gefunden");
  }

  await db
    .update(alerts)
    .set({ note: parsed, isRead: true })
    .where(eq(alerts.id, alertId));

  revalidatePath("/dashboard");
}
