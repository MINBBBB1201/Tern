/**
 * LocationIQ geocoding — used to turn a free-text destination (e.g. a
 * hotel name) into coordinates for the Uber dropoff deep link.
 *
 * Chosen over the raw OSM Nominatim public API deliberately: Nominatim's
 * usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * explicitly prohibits client-facing autocomplete built on the public
 * API and caps usage at 1 request/second with no self-serve commercial
 * allowance. LocationIQ wraps similar OSM-based data but with a real
 * self-serve free tier (5,000 req/day, 2 req/sec) that explicitly
 * permits commercial/autocomplete use — the only condition is a visible
 * "Search by LocationIQ.com" attribution link, added in the destination
 * input UI.
 *
 * Requires LOCATIONIQ_API_KEY in .env.local (server-side only). Free key:
 * https://locationiq.com — same signup pattern as OPENWEATHER_API_KEY.
 */

export type GeocodeResult = {
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
};

export async function geocodeAddress(query: string, countryCode?: string): Promise<GeocodeResult[]> {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    console.error("LOCATIONIQ_API_KEY missing");
    return [];
  }
  if (!query || query.trim().length < 3) return [];

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    limit: "5",
    dedupe: "1",
  });
  if (countryCode) params.set("countrycodes", countryCode.toLowerCase());

  const url = `https://us1.locationiq.com/v1/autocomplete?${params.toString()}`;

  const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1h, per LocationIQ's "cache results" guidance
  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((item: { display_name: string; display_place?: string; lat: string; lon: string }) => ({
    displayName: item.display_name,
    // display_place is the short label (e.g. "Empire State Building"),
    // vs. display_name's full comma-separated address. We send the short
    // one to Uber as addressLine1 — a long address string there caused
    // Uber's own re-geocoder to override our precise lat/lon and land on
    // the wrong place entirely.
    shortName: item.display_place || item.display_name.split(",")[0],
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}
