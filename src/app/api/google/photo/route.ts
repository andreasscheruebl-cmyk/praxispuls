import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { getPlacePhotoUrl } from "@/lib/google";

export async function GET(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");
    if (!ref) {
      return NextResponse.json({ error: "Missing ref parameter", code: "BAD_REQUEST" }, { status: 400 });
    }

    const photoUrl = getPlacePhotoUrl(ref, 400);
    if (!photoUrl) {
      return NextResponse.json({ error: "Google API not configured", code: "INTERNAL_ERROR" }, { status: 500 });
    }

    // Proxy the photo from Google
    const res = await fetch(photoUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Photo not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Interner Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
