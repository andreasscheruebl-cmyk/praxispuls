import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getUserOptional } from "@/lib/auth";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getActivePracticeForUser } from "@/lib/practice";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

/** Map content-type to file extension */
function getExtension(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return map[contentType] ?? "png";
}

/**
 * Extract the storage path from a full Supabase public URL.
 * Returns e.g. "practiceId/logo.png" or null if not parseable.
 */
function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    // Supabase public URLs follow the pattern:
    // .../storage/v1/object/public/logos/<path>
    const marker = "/storage/v1/object/public/logos/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return url.pathname.slice(idx + marker.length);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const user = await getUserOptional();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // 2. Find the active practice for this user
    const practice = await getActivePracticeForUser(user.id);
    if (!practice) {
      return NextResponse.json(
        { error: "Praxis nicht gefunden", code: "PRACTICE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Keine Datei hochgeladen", code: "NO_FILE" },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Datei zu groß. Maximal 2 MB erlaubt.",
          code: "FILE_TOO_LARGE",
        },
        { status: 400 }
      );
    }

    // 5. Validate content type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Ungültiger Dateityp. Erlaubt sind: JPEG, PNG, WebP und SVG.",
          code: "INVALID_TYPE",
        },
        { status: 400 }
      );
    }

    // 6. Prepare upload
    const ext = getExtension(file.type);
    const storagePath = `${practice.id}/logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createServiceClient();

    // 7. Delete old logo if it exists and has a different path
    if (practice.logoUrl) {
      const oldPath = extractStoragePath(practice.logoUrl);
      if (oldPath && oldPath !== storagePath) {
        await supabase.storage.from("logos").remove([oldPath]);
      }
    }

    // 8. Upload to Supabase Storage (upsert to overwrite same extension)
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return NextResponse.json(
        { error: "Fehler beim Hochladen", code: "UPLOAD_FAILED" },
        { status: 500 }
      );
    }

    // 9. Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(storagePath);

    // 10. Update the practice record with the new logo URL
    await db
      .update(practices)
      .set({ logoUrl: publicUrl, updatedAt: new Date() })
      .where(eq(practices.id, practice.id));

    return NextResponse.json({ logoUrl: publicUrl });
  } catch (err) {
    console.error("Logo upload error:", err);
    return NextResponse.json(
      { error: "Interner Serverfehler", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
