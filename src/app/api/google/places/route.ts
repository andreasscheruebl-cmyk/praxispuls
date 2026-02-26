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
      const details = await getPlaceDetails(placeId);
      if (!details) {
        return NextResponse.json(
          { error: "Google Place ID nicht gefunden", code: "NOT_FOUND" },
          { status: 404 }
        );
      }
      return NextResponse.json(details);
    }

    // Search by query
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const postalCode = searchParams.get("postalCode") || undefined;
    const results = await searchPlaces(query, postalCode);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Interner Fehler", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
