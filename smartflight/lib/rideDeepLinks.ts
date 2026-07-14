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
 * Lyft has a documented universal-link system
 * (developer.lyft.com/docs/universal-links): `lyft.com/ride?id=lyft&
 * pickup[latitude]=..&pickup[longitude]=..&destination[latitude]=..&
 * destination[longitude]=..&partner=CLIENT_ID` — bracketed params, not
 * JSON-encoded like Uber's. North America only, so callers gate the
 * button on the airport's country (US/CA) — see isLyftAvailable.
 *
 * BUT: unlike Uber's client_id, Lyft's self-serve developer signup has
 * been discontinued — developer.lyft.com/v1/docs/affiliate-program now
 * states "Please get in touch with your Lyft Business contact for
 * access to API documentation," and the plain developer.lyft.com signup
 * flow no longer resolves. Same bucket as Kakao T and Grab from the
 * original Tier 2 research: a real API, but gated behind a business
 * relationship, not reachable for a solo project. Left wired in (gated
 * behind NEXT_PUBLIC_LYFT_CLIENT_ID, which nothing can currently
 * obtain) rather than removed, since it's harmless dormant code — if
 * Lyft reopens self-serve access this just needs an env var, not new
 * code. Don't waste time trying to sign up again without checking this
 * comment first.
 */

const UBER_CLIENT_ID = process.env.NEXT_PUBLIC_UBER_CLIENT_ID; // optional
const LYFT_CLIENT_ID = process.env.NEXT_PUBLIC_LYFT_CLIENT_ID; // Lyft calls this "partner"; unobtainable without a Lyft Business relationship (see comment above)
const LYFT_COUNTRIES = new Set(["US", "CA"]);

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

/**
 * Same as buildAirportUberLink, but also sets a dropoff point — used
 * once the traveler enters a destination via the geocoding search box.
 */
export function buildAirportUberLinkWithDropoff(
  iataCode: string,
  dropoff: RidePoint
): string | null {
  const airport = getAirport(iataCode);
  if (!airport) return null;
  return buildUberDeepLink(
    { lat: airport.lat, lon: airport.lon, nickname: `${iataCode} Airport` },
    dropoff
  );
}

/** True for the US/Canada, where Lyft's universal links actually resolve. */
export function isLyftAvailable(countryCode: string | null | undefined): boolean {
  return !!countryCode && LYFT_COUNTRIES.has(countryCode.toUpperCase());
}

function buildLyftDeepLink(pickup: RidePoint, dropoff?: RidePoint): string {
  const params = new URLSearchParams();
  params.set("id", "lyft");
  params.set("pickup[latitude]", String(pickup.lat));
  params.set("pickup[longitude]", String(pickup.lon));
  if (dropoff) {
    params.set("destination[latitude]", String(dropoff.lat));
    params.set("destination[longitude]", String(dropoff.lon));
  }
  if (LYFT_CLIENT_ID) params.set("partner", LYFT_CLIENT_ID);

  return `https://lyft.com/ride?${params.toString()}`;
}

/** Same shape as buildAirportUberLink, for the Lyft pickup-at-this-airport case. */
export function buildAirportLyftLink(iataCode: string): string | null {
  const airport = getAirport(iataCode);
  if (!airport) return null;
  return buildLyftDeepLink({ lat: airport.lat, lon: airport.lon });
}

/** Same shape as buildAirportUberLinkWithDropoff, for Lyft. */
export function buildAirportLyftLinkWithDropoff(
  iataCode: string,
  dropoff: RidePoint
): string | null {
  const airport = getAirport(iataCode);
  if (!airport) return null;
  return buildLyftDeepLink({ lat: airport.lat, lon: airport.lon }, dropoff);
}
