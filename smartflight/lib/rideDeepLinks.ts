import { getAirport } from "./airportData";

/**
 * Uber ride-request deep links — genuinely public and self-serve
 * (developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction),
 * unlike Kakao T, Grab, and Bolt, none of which offer a public/self-serve
 * booking API or deep link as of this writing (Kakao: map/nav APIs only,
 * no taxi booking API. Grab: login SSO SDK only, requires partner
 * whitelisting. Bolt: official support page states "we don't offer any
 * public or private APIs").
 *
 * Real documented format is `m.uber.com/looking?pickup={json}&drop[0]={json}`
 * — pickup/dropoff are single JSON-encoded objects, not bracketed
 * sub-params, and the path is `/looking`, not `/ul/` with an `action`
 * param (that scheme doesn't exist; tested live and it 406s, then
 * redirects to a generic city page with the coordinates dropped).
 * client_id is optional in practice — tested without one and the pickup
 * point still resolved correctly on Uber's own page.
 *
 * Lyft has a similarly public universal-link system
 * (developer.lyft.com/docs/universal-links) but is North America only,
 * so it's not wired in yet — same shape as this function, add it the
 * same way if/when it's worth the second button (JFK-only markets).
 */

const UBER_CLIENT_ID = process.env.NEXT_PUBLIC_UBER_CLIENT_ID; // optional

type RidePoint = {
  lat: number;
  lon: number;
  nickname?: string;
};

const toUberLocation = (point: RidePoint) =>
  JSON.stringify({
    latitude: point.lat,
    longitude: point.lon,
    ...(point.nickname ? { addressLine1: point.nickname } : {}),
  });

export function buildUberDeepLink(pickup: RidePoint, dropoff?: RidePoint): string {
  const params = new URLSearchParams();
  params.set("pickup", toUberLocation(pickup));
  if (dropoff) params.set("drop[0]", toUberLocation(dropoff));
  if (UBER_CLIENT_ID) params.set("client_id", UBER_CLIENT_ID);

  // m.uber.com deep link: works whether or not the Uber app is installed —
  // falls back to the mobile-web rider experience automatically.
  return `https://m.uber.com/looking?${params.toString()}`;
}

/**
 * Build an Uber pickup-at-this-airport deep link from an IATA code,
 * using the same airport dataset the weather feature already established
 * as the shared source of truth for airport coordinates.
 */
export function buildAirportUberLink(iataCode: string): string | null {
  const airport = getAirport(iataCode);
  if (!airport) return null;
  return buildUberDeepLink({
    lat: airport.lat,
    lon: airport.lon,
    nickname: `${iataCode} Airport`,
  });
}
