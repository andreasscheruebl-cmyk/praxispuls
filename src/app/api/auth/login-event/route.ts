import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginEvents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getActivePracticeForUser } from "@/lib/practice";

/**
 * POST – Record a login event for the current user.
 * Called from the client after successful authentication.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) {
      return NextResponse.json({ error: "Praxis nicht gefunden", code: "NOT_FOUND" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const method = (body.method as string) || "password";

    // Extract IP and user agent from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0]?.trim() : request.headers.get("x-real-ip") || null;
    const userAgent = request.headers.get("user-agent") || null;

    await db.insert(loginEvents).values({
      practiceId: practice.id,
      userAgent,
      ipAddress,
      method,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Interner Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

/**
 * GET – Retrieve login history for the current user (last 20 events).
 */
export async function GET() {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) {
      return NextResponse.json({ events: [] });
    }

    const events = await db.query.loginEvents.findMany({
      where: eq(loginEvents.practiceId, practice.id),
      orderBy: [desc(loginEvents.createdAt)],
      limit: 20,
    });

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
