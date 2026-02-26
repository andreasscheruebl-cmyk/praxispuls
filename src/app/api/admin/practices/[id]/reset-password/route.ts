import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import { getPracticeForAdmin } from "@/lib/db/queries/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { logAudit, getRequestMeta } from "@/lib/audit";

export async function POST(
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

  const supabase = createServiceClient();
  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(practice.ownerUserId);

  if (userError || !userData.user?.email) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const { error: linkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: userData.user.email,
  });

  if (linkError) {
    return NextResponse.json(
      { error: "Reset-Link konnte nicht erstellt werden", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }

  const meta = getRequestMeta(request);
  logAudit({
    practiceId: id,
    action: "admin.password_reset_email",
    entity: "user",
    entityId: practice.ownerUserId,
    ...meta,
  });

  return NextResponse.json({ success: true });
}
