import { NextResponse } from "next/server";
import { getUserOptional } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/practice/logo-from-url
 * Fetches an image from a URL server-side (bypasses CORS) and uploads to storage.
 */
export async function POST(request: Request) {
  try {
    const user = await getUserOptional();
    if (!user?.email) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
    }

    const practice = await db.query.practices.findFirst({
      where: eq(practices.email, user.email),
      columns: { id: true, logoUrl: true },
    });
    if (!practice) {
      return NextResponse.json({ error: "Praxis nicht gefunden" }, { status: 404 });
    }

    // Fetch image server-side (no CORS issues)
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!imgRes.ok) {
      return NextResponse.json({ error: "Bild konnte nicht geladen werden" }, { status: 400 });
    }

    const contentType = imgRes.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    if (buffer.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Bild zu groß (max. 2 MB)" }, { status: 400 });
    }

    const ext = contentType.includes("svg") ? "svg" : contentType.includes("webp") ? "webp" : contentType.includes("png") ? "png" : "jpg";
    const storagePath = `${practice.id}/logo.${ext}`;

    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(storagePath, buffer, { contentType, upsert: true });

    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(storagePath);

    await db
      .update(practices)
      .set({ logoUrl: publicUrl, updatedAt: new Date() })
      .where(eq(practices.id, practice.id));

    return NextResponse.json({ logoUrl: publicUrl });
  } catch (err) {
    console.error("Logo from URL error:", err);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
