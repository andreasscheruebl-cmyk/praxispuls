import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { responses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const trackClickSchema = z.object({
  responseId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = trackClickSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Daten", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Verify response exists before updating
    const existing = await db.query.responses.findFirst({
      where: eq(responses.id, parsed.data.responseId),
      columns: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Response nicht gefunden", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await db
      .update(responses)
      .set({ googleReviewClicked: true })
      .where(eq(responses.id, parsed.data.responseId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json(
      { error: "Interner Fehler", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
