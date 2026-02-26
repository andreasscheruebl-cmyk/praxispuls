import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import {
  getPracticeForAdmin,
  updatePracticeGoogle,
} from "@/lib/db/queries/admin";
import { adminGoogleUpdateSchema } from "@/lib/validations";
import { getGoogleReviewLink } from "@/lib/google";
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

  const parsed = adminGoogleUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const before = {
    googlePlaceId: practice.googlePlaceId,
    googleReviewUrl: practice.googleReviewUrl,
    googleRedirectEnabled: practice.googleRedirectEnabled,
  };

  const update: {
    googlePlaceId?: string | null;
    googleReviewUrl?: string | null;
    googleRedirectEnabled?: boolean;
  } = {};

  if (parsed.data.googlePlaceId !== undefined) {
    if (parsed.data.googlePlaceId === null) {
      update.googlePlaceId = null;
      update.googleReviewUrl = null;
      update.googleRedirectEnabled = false;
    } else {
      update.googlePlaceId = parsed.data.googlePlaceId;
      update.googleReviewUrl = getGoogleReviewLink(
        parsed.data.googlePlaceId
      );
    }
  }

  if (parsed.data.googleRedirectEnabled !== undefined) {
    update.googleRedirectEnabled = parsed.data.googleRedirectEnabled;
  }

  await updatePracticeGoogle(id, update);

  const meta = getRequestMeta(request);
  await logAudit({
    practiceId: id,
    action: "admin.google_updated",
    entity: "practice",
    entityId: id,
    before,
    after: update,
    ...meta,
  });

  return NextResponse.json({ success: true });
}
