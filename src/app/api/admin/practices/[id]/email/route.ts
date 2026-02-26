import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import { getPracticeForAdmin, updatePracticeEmail } from "@/lib/db/queries/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { adminEmailChangeSchema } from "@/lib/validations";
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
  const parsed = adminEmailChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ungültige Eingabe", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const previousEmail = practice.email;

  // Update in Supabase Auth
  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(
    practice.ownerUserId,
    { email }
  );

  if (error) {
    return NextResponse.json(
      { error: "E-Mail konnte nicht geändert werden", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }

  // Update in practices table
  await updatePracticeEmail(id, email);

  const meta = getRequestMeta(request);
  logAudit({
    practiceId: id,
    action: "admin.email_changed",
    entity: "user",
    entityId: practice.ownerUserId,
    before: { email: previousEmail },
    after: { email },
    ...meta,
  });

  return NextResponse.json({ success: true });
}
