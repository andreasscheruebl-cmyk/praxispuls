import { NextResponse } from "next/server";
import { requireAuthForApi } from "@/lib/auth";
import { searchPlaces, getPlaceDetails } from "@/lib/google";

export async function GET(request: Request) {
  try {
    const auth = await requireAuthForApi();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const placeId = searchParams.get("placeId");

    // Verify a specific Place ID → return full details
    if (placeId) {
      const result = await getPlaceDetails(placeId);
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
    const results = await searchPlaces(query, postalCode);
    return NextResponse.json(results);
  } catch (err) {
    console.error("GET /api/google/places error:", err);
    return NextResponse.json({ error: "Interner Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
