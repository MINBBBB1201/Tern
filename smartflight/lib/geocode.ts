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
  lat: number;
  lon: number;
};

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    console.error("LOCATIONIQ_API_KEY missing");
    return [];
  }
  if (!query || query.trim().length < 3) return [];

  const url = `https://us1.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&limit=5&dedupe=1`;

  const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1h, per LocationIQ's "cache results" guidance
  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((item: { display_name: string; lat: string; lon: string }) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}
