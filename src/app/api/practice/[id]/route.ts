import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { logAudit, getRequestMeta } from "@/lib/audit";
import { getLocationCountForUser } from "@/lib/practice";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const { id } = await params;

    // Find the practice and verify ownership
    const practice = await db.query.practices.findFirst({
      where: and(
        eq(practices.id, id),
        eq(practices.ownerUserId, user.id),
        isNull(practices.deletedAt)
      ),
      columns: { id: true, name: true, ownerUserId: true },
    });

    if (!practice) {
      return NextResponse.json(
        { error: "Standort nicht gefunden oder kein Zugriff", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Prevent deletion of last practice
    const locationCount = await getLocationCountForUser(user.id);
    if (locationCount <= 1) {
      return NextResponse.json(
        {
          error:
            "Der letzte Standort kann nicht entfernt werden. Sie benötigen mindestens einen aktiven Standort.",
          code: "LAST_PRACTICE",
        },
        { status: 403 }
      );
    }

    // Soft-delete: set deletedAt timestamp
    await db
      .update(practices)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(practices.id, id));

    // Audit log
    const meta = getRequestMeta(request);
    logAudit({
      practiceId: id,
      action: "practice.deleted",
      entity: "practice",
      entityId: id,
      before: { name: practice.name },
      after: { deletedAt: new Date().toISOString() },
      ...meta,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Entfernen", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
