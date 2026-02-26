import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import { getPracticeForAdmin, softDeletePractice } from "@/lib/db/queries/admin";
import { logAudit, getRequestMeta } from "@/lib/audit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminForApi();
  if (auth.error) return auth.error;

  const { id } = await params;
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

  const meta = getRequestMeta(request);
  logAudit({
    practiceId: id,
    action: "admin.practice_deleted",
    entity: "practice",
    entityId: id,
    before: { name: practice.name, email: practice.email },
    ...meta,
  });

  return NextResponse.json({ success: true });
}
