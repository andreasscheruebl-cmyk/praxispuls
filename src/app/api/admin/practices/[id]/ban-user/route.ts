import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import { getPracticeForAdmin } from "@/lib/db/queries/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { adminBanSchema } from "@/lib/validations";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { validateUuid, parseJsonBody } from "../helpers";

export async function POST(
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

  const body = await parseJsonBody(request);
  if (body.error) return body.error;

  const parsed = adminBanSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  // Block self-ban
  if (practice.ownerUserId === auth.user.id) {
    return NextResponse.json(
      {
        error: "Sie können sich nicht selbst sperren",
        code: "FORBIDDEN",
      },
      { status: 403 }
    );
  }

  const { banned } = parsed.data;
  const supabase = createServiceClient();

  const { error } = await supabase.auth.admin.updateUserById(
    practice.ownerUserId,
    { ban_duration: banned ? "876000h" : "none" }
  );

  if (error) {
    return NextResponse.json(
      {
        error: "Benutzer-Status konnte nicht geändert werden",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  const meta = getRequestMeta(request);
  await logAudit({
    practiceId: id,
    action: banned ? "admin.user_banned" : "admin.user_unbanned",
    entity: "user",
    entityId: practice.ownerUserId,
    ...meta,
  });

  return NextResponse.json({ success: true });
}
