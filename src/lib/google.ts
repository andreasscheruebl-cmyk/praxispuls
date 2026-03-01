const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  totalRatings?: number;
  googleMapsUrl?: string;
  photoReference?: string;
  photoReferences?: string[];
  website?: string;
}

/**
 * Search for a business via Google Places Autocomplete.
 * If postalCode is provided, appends it to the query for better local results.
 */
export async function searchPlaces(query: string, postalCode?: string): Promise<PlacePrediction[]> {
  if (!GOOGLE_API_KEY) {
    console.warn("GOOGLE_PLACES_API_KEY not set");
    return [];
  }

  // Append postal code to query for better local relevance
  const searchInput = postalCode ? `${query} ${postalCode}` : query;

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  url.searchParams.set("input", searchInput);
  url.searchParams.set("types", "establishment");
  url.searchParams.set("components", "country:de");
  url.searchParams.set("language", "de");
  url.searchParams.set("key", GOOGLE_API_KEY);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`Google Places Autocomplete HTTP ${res.status}`);
      return [];
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error(`Google Places Autocomplete non-JSON response: ${contentType}`);
      return [];
    }
    const data = await res.json();

    if (data.status !== "OK") {
      if (data.status !== "ZERO_RESULTS") {
        console.error(`Google Places Autocomplete API status: ${data.status}`, data.error_message);
      }
      return [];
    }

    return data.predictions.map(
      (p: {
        place_id: string;
        description: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
      }) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting.main_text,
        secondaryText: p.structured_formatting.secondary_text,
      })
    );
  } catch (err) {
    console.error("Google Places Autocomplete error:", err);
    return [];
  }
}

export type PlaceDetailsResult =
  | { data: PlaceDetails }
  | { error: "NO_API_KEY" | "API_ERROR" | "NOT_FOUND" };

/**
 * Get details for a specific Place ID.
 * Returns discriminated union so callers can distinguish between
 * "no API key configured" vs "place not found" vs "API error".
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetailsResult> {
  if (!GOOGLE_API_KEY) return { error: "NO_API_KEY" };

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,rating,user_ratings_total,url,photos,website");
  url.searchParams.set("language", "de");
  url.searchParams.set("key", GOOGLE_API_KEY);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`Google Places Details HTTP ${res.status} for placeId ${placeId}`);
      return { error: "API_ERROR" };
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error(`Google Places Details non-JSON response: ${contentType}`);
      return { error: "API_ERROR" };
    }
    const data = await res.json();

    if (data.status === "NOT_FOUND" || data.status === "INVALID_REQUEST") {
      return { error: "NOT_FOUND" };
    }
    if (data.status !== "OK") {
      console.error(`Google Places Details API status: ${data.status}`, data.error_message);
      return { error: "API_ERROR" };
    }

    const result = data.result;
    const allPhotoRefs = (result.photos ?? [])
      .map((p: { photo_reference: string }) => p.photo_reference)
      .slice(0, 6) as string[];
    return {
      data: {
        placeId,
        name: result.name,
        address: result.formatted_address,
        rating: result.rating,
        totalRatings: result.user_ratings_total,
        googleMapsUrl: result.url,
        photoReference: allPhotoRefs[0],
        photoReferences: allPhotoRefs,
        website: result.website,
      },
    };
  } catch (err) {
    console.error(`Google Places Details error for placeId ${placeId}:`, err);
    return { error: "API_ERROR" };
  }
}

/**
 * Get a Google Places photo URL via photo reference.
 * Returns null if no API key is set.
 */
export function getPlacePhotoUrl(photoReference: string, maxWidth = 400): string | null {
  if (!GOOGLE_API_KEY) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

/**
 * Generate Google Review deep link from Place ID
 */
export function getGoogleReviewLink(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}
