import airportsRaw from "./data/airports.json";

/**
 * Static IATA-keyed airport dataset (~7,900 airports: name, city, country,
 * lat/lon). Sourced from mwgg/Airports (public domain), trimmed to entries
 * that have an IATA code and only the fields Tern needs.
 *
 * This is the shared source of truth for "where is this airport" — the
 * gap that previously didn't exist anywhere in the codebase (SearchBar
 * is free-text IATA input, airportGuides.ts has no coordinates). Weather
 * consumes this now; the Tier 2 taxi work and the Tier 1 accessibility
 * directory should both build on this same file rather than inventing
 * their own airport list.
 */
export type AirportInfo = {
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
};

const AIRPORTS = airportsRaw as Record<string, AirportInfo>;

export function getAirport(iataCode: string): AirportInfo | null {
  if (!iataCode) return null;
  return AIRPORTS[iataCode.toUpperCase()] ?? null;
}

export function isKnownAirport(iataCode: string): boolean {
  return getAirport(iataCode) !== null;
}
