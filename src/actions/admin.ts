"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { setPlanOverride, removePlanOverride } from "@/lib/db/queries/admin";
import { logAudit } from "@/lib/audit";
import { getPracticeForAdmin } from "@/lib/db/queries/admin";
import { requireAdmin } from "@/lib/auth";

const overrideSchema = z.object({
  practiceId: z.string().uuid(),
  plan: z.enum(["free", "starter", "professional"]),
  reason: z.enum(["beta_tester", "demo", "friend", "support", "other"]),
  expiresAt: z.string().nullable(),
});

const removeOverrideSchema = z.object({
  practiceId: z.string().uuid(),
});

export async function setOverrideAction(formData: FormData) {
  await requireAdmin();

  const data = overrideSchema.parse({
    practiceId: formData.get("practiceId"),
    plan: formData.get("plan"),
    reason: formData.get("reason"),
    expiresAt: formData.get("expiresAt") || null,
  });

  const practice = await getPracticeForAdmin(data.practiceId);
  if (!practice) throw new Error("Praxis nicht gefunden");

  const before = {
    planOverride: practice.planOverride,
    overrideReason: practice.overrideReason,
    overrideExpiresAt: practice.overrideExpiresAt,
  };

  await setPlanOverride(data.practiceId, {
    plan: data.plan,
    reason: data.reason,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  });

  logAudit({
    practiceId: data.practiceId,
    action: "admin.override.set",
    entity: "practice",
    entityId: data.practiceId,
    before,
    after: {
      planOverride: data.plan,
      overrideReason: data.reason,
      overrideExpiresAt: data.expiresAt,
    },
  });

  revalidatePath(`/admin/practices/${data.practiceId}`);
  revalidatePath("/admin/practices");
}

export async function removeOverrideAction(formData: FormData) {
  await requireAdmin();

  const data = removeOverrideSchema.parse({
    practiceId: formData.get("practiceId"),
  });

  const practice = await getPracticeForAdmin(data.practiceId);
  if (!practice) throw new Error("Praxis nicht gefunden");

  const before = {
    planOverride: practice.planOverride,
    overrideReason: practice.overrideReason,
    overrideExpiresAt: practice.overrideExpiresAt,
  };

  await removePlanOverride(data.practiceId);

  logAudit({
    practiceId: data.practiceId,
    action: "admin.override.removed",
    entity: "practice",
    entityId: data.practiceId,
    before,
    after: { planOverride: null, overrideReason: null, overrideExpiresAt: null },
  });

  revalidatePath(`/admin/practices/${data.practiceId}`);
  revalidatePath("/admin/practices");
}
