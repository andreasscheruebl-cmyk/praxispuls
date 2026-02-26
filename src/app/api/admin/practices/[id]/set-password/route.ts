import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { requireAdminForApi } from "@/lib/auth";
import { getPracticeForAdmin } from "@/lib/db/queries/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { validateUuid } from "../helpers";

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

  // Generate a 16-char random password
  const password = crypto
    .randomBytes(12)
    .toString("base64url")
    .slice(0, 16);

  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(
    practice.ownerUserId,
    { password }
  );

  if (error) {
    return NextResponse.json(
      {
        error: "Passwort konnte nicht gesetzt werden",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  const meta = getRequestMeta(request);
  await logAudit({
    practiceId: id,
    action: "admin.password_set",
    entity: "user",
    entityId: practice.ownerUserId,
    ...meta,
  });

  return NextResponse.json(
    { success: true, password },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
