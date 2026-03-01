"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PlaceResult = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type PlaceDetails = {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  totalRatings?: number;
  googleMapsUrl?: string;
};

type GooglePlacesSearchProps = {
  value: string;
  onChange: (placeId: string) => void;
  selectedName?: string;
  /** Auto-search this query on mount (e.g. practice name) */
  initialQuery?: string;
  /** Postal code for better local search results */
  postalCode?: string;
};

/**
 * Autocomplete search for Google Places with verification step.
 * After selection, fetches and displays place details so the user
 * can confirm this is the correct practice before saving.
 */
export function GooglePlacesSearch({
  value,
  onChange,
  selectedName,
  initialQuery,
  postalCode,
}: GooglePlacesSearchProps) {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    selectedName ?? (value || "")
  );

  // Verification state
  const [pendingPlace, setPendingPlace] = useState<PlaceResult | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [confirmed, setConfirmed] = useState(!!value);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep displayValue in sync when selectedName or value changes externally
  useEffect(() => {
    if (selectedName) {
      setDisplayValue(selectedName);
    } else if (value && !pendingPlace) {
      setDisplayValue(value);
    } else if (!value && !pendingPlace) {
      setDisplayValue("");
    }
  }, [selectedName, value, pendingPlace]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: searchQuery.trim() });
      if (postalCode) params.set("postalCode", postalCode);
      const response = await fetch(`/api/google/places?${params}`);
      if (!response.ok) {
        setResults([]);
        return;
      }
      const data: unknown = await response.json();
      const places = Array.isArray(data) ? (data as PlaceResult[]) : [];
      setResults(places);
      setIsOpen(places.length > 0);
    } catch (err) {
      console.error("[GooglePlacesSearch] fetchPlaces failed:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [postalCode]);

  // Fetch place details for verification
  async function verifyPlace(place: PlaceResult) {
    setVerifying(true);
    setPendingPlace(place);
    setPlaceDetails(null);
    setIsOpen(false);
    setResults([]);
    setDisplayValue(place.mainText);

    try {
      const res = await fetch(
        `/api/google/places?placeId=${encodeURIComponent(place.placeId)}`
      );
      if (res.ok) {
        const data: unknown = await res.json().catch(() => null);
        if (data && typeof data === "object" && "placeId" in data) {
          setPlaceDetails(data as PlaceDetails);
        }
      }
    } catch (err) {
      console.error("[GooglePlacesSearch] verifyPlace failed:", err);
    } finally {
      setVerifying(false);
    }
  }

  // User confirms this is the correct place
  function handleConfirm() {
    if (pendingPlace) {
      onChange(pendingPlace.placeId);
      setConfirmed(true);
      setDisplayValue(placeDetails?.name || pendingPlace.mainText);
    }
  }

  // User rejects – go back to search
  function handleReject() {
    setPendingPlace(null);
    setPlaceDetails(null);
    setConfirmed(false);
    setDisplayValue("");
    onChange("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = e.target.value;
    setDisplayValue(newQuery);
    if (value) {
      onChange("");
      setConfirmed(false);
    }
    setPendingPlace(null);
    setPlaceDetails(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchPlaces(newQuery);
    }, 300);
  }

  function handleSelect(result: PlaceResult) {
    // Don't save immediately – verify first
    verifyPlace(result);
  }

  function handleClear() {
    onChange("");
    setDisplayValue("");
    setResults([]);
    setIsOpen(false);
    setPendingPlace(null);
    setPlaceDetails(null);
    setConfirmed(false);
  }

  // Auto-search with initialQuery on mount
  const initialSearchDone = useRef(false);
  useEffect(() => {
    if (initialQuery && !value && !initialSearchDone.current) {
      initialSearchDone.current = true;
      setDisplayValue(initialQuery);
      fetchPlaces(initialQuery);
    }
  }, [initialQuery, value, fetchPlaces]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasSelection = confirmed && value.length > 0;
  const showVerification = pendingPlace && !confirmed;

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="Praxisname suchen..."
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasSelection && "border-green-500 pr-8"
          )}
          readOnly={hasSelection || !!showVerification}
          aria-label="Google Place suchen"
          aria-expanded={isOpen}
          aria-controls="google-places-listbox"
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        {(hasSelection || showVerification) && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "flex h-5 w-5 items-center justify-center rounded-full",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "transition-colors"
            )}
            aria-label="Auswahl aufheben"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground">Suche wird durchgeführt...</p>
      )}

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <ul
          id="google-places-listbox"
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-input bg-background shadow-md",
            "max-h-60 overflow-y-auto"
          )}
        >
          {results.map((result) => (
            <li
              key={result.placeId}
              role="option"
              aria-selected={false}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors"
              )}
              onClick={() => handleSelect(result)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelect(result);
              }}
              tabIndex={0}
            >
              <span className="font-medium">{result.mainText}</span>
              <span className="ml-1 text-muted-foreground">{result.secondaryText}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Verification card: "Ist das Ihre Praxis?" */}
      {showVerification && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-800">
            Ist das Ihre Praxis?
          </p>
          {verifying ? (
            <p className="text-sm text-muted-foreground">Wird überprüft...</p>
          ) : placeDetails ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">{placeDetails.name}</p>
              <p className="text-xs text-muted-foreground">{placeDetails.address}</p>
              {placeDetails.rating && (
                <p className="text-xs text-muted-foreground">
                  {"★".repeat(Math.round(placeDetails.rating))}{"☆".repeat(5 - Math.round(placeDetails.rating))}{" "}
                  {placeDetails.rating}/5
                  {placeDetails.totalRatings ? ` (${placeDetails.totalRatings} Bewertungen)` : ""}
                </p>
              )}
              {placeDetails.googleMapsUrl && (
                <a
                  href={placeDetails.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-blue-600 underline"
                >
                  Auf Google Maps ansehen
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium">{pendingPlace.mainText}</p>
              <p className="text-xs text-muted-foreground">{pendingPlace.secondaryText}</p>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={verifying}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Ja, das ist meine Praxis
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Nein, andere suchen
            </button>
          </div>
        </div>
      )}

      {/* Confirmed indicator */}
      {hasSelection && placeDetails && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">{placeDetails.name}</p>
              <p className="text-xs text-green-700">{placeDetails.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
