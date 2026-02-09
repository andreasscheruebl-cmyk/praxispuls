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
}

/**
 * Search for a dental practice via Google Places Autocomplete.
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

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") return [];

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
}

/**
 * Get details for a specific Place ID
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  if (!GOOGLE_API_KEY) return null;

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,rating,user_ratings_total,url");
  url.searchParams.set("language", "de");
  url.searchParams.set("key", GOOGLE_API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") return null;

  const result = data.result;
  return {
    placeId,
    name: result.name,
    address: result.formatted_address,
    rating: result.rating,
    totalRatings: result.user_ratings_total,
    googleMapsUrl: result.url,
  };
}

/**
 * Generate Google Review deep link from Place ID
 */
export function getGoogleReviewLink(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}
