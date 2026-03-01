import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { searchPlaces, getPlaceDetails } from "@/lib/google";
import { z } from "zod";

const placeIdParam = z.string().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/);

export async function GET(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const rawPlaceId = searchParams.get("placeId");

    // Verify a specific Place ID → return full details
    if (rawPlaceId) {
      const parsed = placeIdParam.safeParse(rawPlaceId);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Ungültige Place ID", code: "BAD_REQUEST" },
          { status: 400 }
        );
      }
      const result = await getPlaceDetails(parsed.data);
      if ("error" in result) {
        if (result.error === "NO_API_KEY") {
          return NextResponse.json(
            { error: "Google Places API nicht konfiguriert", code: "NOT_CONFIGURED" },
            { status: 503 }
          );
        }
        const status = result.error === "NOT_FOUND" ? 404 : 502;
        return NextResponse.json(
          { error: "Google Place ID nicht gefunden", code: result.error },
          { status }
        );
      }
      return NextResponse.json(result.data);
    }

    // Search by query
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const postalCode = searchParams.get("postalCode") || undefined;
    const result = await searchPlaces(query, postalCode);
    if ("error" in result) {
      if (result.error === "NO_API_KEY") {
        return NextResponse.json(
          { error: "Google Places API nicht konfiguriert", code: "NOT_CONFIGURED" },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Suche fehlgeschlagen", code: "API_ERROR" },
        { status: 502 }
      );
    }
    return NextResponse.json(result.data);
  } catch (err) {
    console.error("GET /api/google/places error:", err);
    return NextResponse.json({ error: "Interner Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
