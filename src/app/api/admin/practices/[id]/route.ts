import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import {
  getPracticeForAdmin,
  softDeletePractice,
} from "@/lib/db/queries/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { validateUuid } from "./helpers";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminForApi();
  if (auth.error) return auth.error;

  const { id } = await params;
  const uuidError = validateUuid(id);
  if (uuidError) return uuidError;

  const practice = await getPracticeForAdmin(id);
  if (!practice) {
    return NextResponse.json(
      { error: "Praxis nicht gefunden", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (practice.deletedAt) {
    return NextResponse.json(
      { error: "Praxis ist bereits gelöscht", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  // Cancel Stripe subscription if active
  if (practice.stripeSubscriptionId) {
    try {
      const { stripe } = await import("@/lib/stripe");
      await stripe.subscriptions.cancel(practice.stripeSubscriptionId);
    } catch (err) {
      console.error("Failed to cancel Stripe subscription:", err);
    }
  }

  await softDeletePractice(id);

  // Ban the user in Supabase Auth so they can't log in
  const supabase = createServiceClient();
  await supabase.auth.admin
    .updateUserById(practice.ownerUserId, {
      ban_duration: "876000h",
    })
    .catch((err: unknown) =>
      console.error("Failed to ban user after delete:", err)
    );

  const meta = getRequestMeta(request);
  await logAudit({
    practiceId: id,
    action: "admin.practice_deleted",
    entity: "practice",
    entityId: id,
    before: { name: practice.name, email: practice.email },
    ...meta,
  });

  return NextResponse.json({ success: true });
}
