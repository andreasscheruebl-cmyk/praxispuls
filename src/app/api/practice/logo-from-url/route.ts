import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createServiceClient } from "@/lib/supabase/server";
import { getPlacePhotoUrl } from "@/lib/google";
import { getActivePracticeForUser } from "@/lib/practice";
import { isSafeUrl } from "@/lib/url-validation";

/**
 * POST /api/practice/logo-from-url
 * Fetches an image from a URL server-side (bypasses CORS) and uploads to storage.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;
    const user = auth.user;

    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL fehlt", code: "BAD_REQUEST" }, { status: 400 });
    }

    const practice = await getActivePracticeForUser(user.id);
    if (!practice) {
      return NextResponse.json({ error: "Praxis nicht gefunden", code: "NOT_FOUND" }, { status: 404 });
    }

    // Resolve relative Google photo URLs to direct Google API URLs
    let fetchUrl = url;
    if (url.startsWith("/api/google/photo")) {
      const refParam = new URL(url, "http://localhost").searchParams.get("ref");
      if (refParam) {
        const googleUrl = getPlacePhotoUrl(refParam, 400);
        if (!googleUrl) {
          return NextResponse.json({ error: "Google API nicht konfiguriert", code: "INTERNAL_ERROR" }, { status: 500 });
        }
        fetchUrl = googleUrl;
      }
    }

    // SSRF protection: block private/internal URLs
    if (!isSafeUrl(fetchUrl)) {
      return NextResponse.json(
        { error: "URL nicht erlaubt", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    // Fetch image server-side (no CORS issues)
    const imgRes = await fetch(fetchUrl, { signal: AbortSignal.timeout(10000) });
    if (!imgRes.ok) {
      return NextResponse.json({ error: "Bild konnte nicht geladen werden", code: "BAD_REQUEST" }, { status: 400 });
    }

    const contentType = imgRes.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    if (buffer.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Bild zu groß (max. 2 MB)", code: "BAD_REQUEST" }, { status: 400 });
    }

    const ext = contentType.includes("svg") ? "svg" : contentType.includes("webp") ? "webp" : contentType.includes("png") ? "png" : "jpg";
    const storagePath = `${practice.id}/logo.${ext}`;

    const supabase = createServiceClient();

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(storagePath, buffer, { contentType, upsert: true });

    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return NextResponse.json({ error: "Upload fehlgeschlagen", code: "INTERNAL_ERROR" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(storagePath);

    await db
      .update(practices)
      .set({ logoUrl: publicUrl, updatedAt: new Date() })
      .where(eq(practices.id, practice.id));

    return NextResponse.json({ logoUrl: publicUrl });
  } catch (err) {
    console.error("Logo from URL error:", err);
    return NextResponse.json({ error: "Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
