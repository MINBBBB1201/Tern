"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export type DestinationPoint = {
  lat: number;
  lon: number;
  nickname: string;
};

type DestinationSearchProps = {
  onSelect: (point: DestinationPoint | null) => void;
  /** ISO 3166-1 alpha-2 country code to restrict suggestions to (e.g. the airport's country). */
  countryCode?: string;
};

type Suggestion = {
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
};

export function DestinationSearch({ onSelect, countryCode }: DestinationSearchProps) {
  const t = useTranslations("Guide");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (countryCode) params.set("country", countryCode);
        const res = await fetch(`/api/geocode?${params.toString()}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500); // debounced — one request per pause in typing, not per keystroke

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, countryCode]);

  const handlePick = (s: Suggestion) => {
    setQuery(s.displayName);
    setOpen(false);
    // shortName (e.g. "Empire State Building"), not the full comma-heavy
    // displayName — passing the long address string to Uber as
    // addressLine1 caused Uber's own re-geocoder to override our precise
    // lat/lon and land on the wrong place.
    onSelect({ lat: s.lat, lon: s.lon, nickname: s.shortName });
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    onSelect(null);
  };

  return (
    <div className="relative mb-3">
      <div className="flex items-center gap-2 rounded-xl border border-[#dbe5f3] bg-white px-3 py-2">
        <span className="text-xs text-muted">{t("toLabel")}</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={t("hotelPlaceholder")}
          className="flex-1 text-xs outline-none placeholder:text-muted/70"
        />
        {loading && <span className="text-[10px] text-muted">…</span>}
        {query && (
          <button type="button" onClick={handleClear} className="text-muted hover:text-foreground" aria-label="Clear destination">
            ×
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl py-1">
            {suggestions.map((s) => (
              <button
                key={`${s.lat}-${s.lon}`}
                type="button"
                onClick={() => handlePick(s)}
                className="block w-full truncate px-3 py-2 text-left text-xs hover:bg-black/5"
              >
                {s.displayName}
              </button>
            ))}
            {/* Required by LocationIQ's free-tier terms */}
            <a
              href="https://locationiq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-1.5 text-[10px] text-muted hover:underline"
            >
              Search by LocationIQ.com
            </a>
          </div>
        </>
      )}
    </div>
  );
}
