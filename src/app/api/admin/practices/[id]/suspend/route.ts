import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import { getPracticeForAdmin, updatePracticeSuspension } from "@/lib/db/queries/admin";
import { adminSuspendSchema } from "@/lib/validations";
import { logAudit, getRequestMeta } from "@/lib/audit";

export async function PUT(
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

  const body = await request.json();
  const parsed = adminSuspendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  // Block self-suspend
  if (practice.ownerUserId === auth.user.id) {
    return NextResponse.json(
      { error: "Sie können Ihr eigenes Konto nicht sperren", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const { suspended } = parsed.data;
  const suspendedAt = suspended ? new Date() : null;

  await updatePracticeSuspension(id, suspendedAt);

  const meta = getRequestMeta(request);
  logAudit({
    practiceId: id,
    action: suspended ? "admin.account_suspended" : "admin.account_unsuspended",
    entity: "practice",
    entityId: id,
    before: { suspendedAt: practice.suspendedAt },
    after: { suspendedAt },
    ...meta,
  });

  return NextResponse.json({ success: true });
}
