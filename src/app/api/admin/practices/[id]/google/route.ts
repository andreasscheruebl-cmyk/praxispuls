import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/auth";
import { getPracticeForAdmin, updatePracticeGoogle } from "@/lib/db/queries/admin";
import { adminGoogleUpdateSchema } from "@/lib/validations";
import { getGoogleReviewLink } from "@/lib/google";
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
  const parsed = adminGoogleUpdateSchema.safeParse(body);
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

  // Handle placeId change
  if (parsed.data.googlePlaceId !== undefined) {
    if (parsed.data.googlePlaceId === null) {
      // Remove Google connection
      update.googlePlaceId = null;
      update.googleReviewUrl = null;
      update.googleRedirectEnabled = false;
    } else {
      update.googlePlaceId = parsed.data.googlePlaceId;
      update.googleReviewUrl = getGoogleReviewLink(parsed.data.googlePlaceId);
    }
  }

  // Handle redirect toggle
  if (parsed.data.googleRedirectEnabled !== undefined) {
    update.googleRedirectEnabled = parsed.data.googleRedirectEnabled;
  }

  await updatePracticeGoogle(id, update);

  const meta = getRequestMeta(request);
  logAudit({
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
