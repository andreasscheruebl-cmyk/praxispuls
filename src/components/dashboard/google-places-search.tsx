"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Shape of each result returned by /api/google/places?q=...
type PlaceResult = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type GooglePlacesSearchProps = {
  value: string;
  onChange: (placeId: string) => void;
  selectedName?: string;
};

/**
 * Autocomplete search component for Google Places.
 * Debounces user input and queries the internal API endpoint,
 * then displays a dropdown of matching places.
 */
export function GooglePlacesSearch({
  value,
  onChange,
  selectedName,
}: GooglePlacesSearchProps) {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    selectedName ?? (value || "")
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep displayValue in sync when selectedName or value changes externally
  useEffect(() => {
    if (selectedName) {
      setDisplayValue(selectedName);
    } else if (value) {
      setDisplayValue(value);
    } else {
      setDisplayValue("");
    }
  }, [selectedName, value]);

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

  // Fetch places from the internal API
  const fetchPlaces = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/google/places?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (!response.ok) {
        setResults([]);
        return;
      }
      const data: PlaceResult[] = await response.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input changes with 300ms debounce
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = e.target.value;
    setDisplayValue(newQuery);

    // Clear any existing selection when user starts typing
    if (value) {
      onChange("");
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      fetchPlaces(newQuery);
    }, 300);
  }

  // Handle selection of a place from the dropdown
  function handleSelect(result: PlaceResult) {
    onChange(result.placeId);
    setDisplayValue(result.mainText);
    setResults([]);
    setIsOpen(false);
  }

  // Clear the current selection
  function handleClear() {
    onChange("");
    setDisplayValue("");
    setResults([]);
    setIsOpen(false);
  }

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasSelection = value.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input with optional clear button */}
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
            hasSelection && "pr-8"
          )}
          readOnly={hasSelection}
          aria-label="Google Place suchen"
          aria-expanded={isOpen}
          aria-controls="google-places-listbox"
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />

        {/* Clear button */}
        {hasSelection && (
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <p className="mt-1 text-xs text-muted-foreground">
          Suche wird durchgeführt...
        </p>
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
              aria-selected={result.placeId === value}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors"
              )}
              onClick={() => handleSelect(result)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSelect(result);
                }
              }}
              tabIndex={0}
            >
              <span className="font-medium">{result.mainText}</span>
              <span className="ml-1 text-muted-foreground">
                {result.secondaryText}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
