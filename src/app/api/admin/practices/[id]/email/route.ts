import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import {
  getPracticeForAdmin,
  updatePracticeEmail,
} from "@/lib/db/queries/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { adminEmailChangeSchema } from "@/lib/validations";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { validateUuid, parseJsonBody } from "../helpers";

export async function PUT(
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

  const parsed = adminEmailChangeSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.errors[0]?.message ?? "Ungültige Eingabe",
        code: "VALIDATION_ERROR",
      },
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
      {
        error: "E-Mail konnte nicht geändert werden",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  // Update in practices table — rollback Supabase on failure
  try {
    await updatePracticeEmail(id, email);
  } catch {
    await supabase.auth.admin.updateUserById(practice.ownerUserId, {
      email: previousEmail,
    });
    return NextResponse.json(
      {
        error: "DB-Update fehlgeschlagen, Änderung zurückgerollt",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  const meta = getRequestMeta(request);
  await logAudit({
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
