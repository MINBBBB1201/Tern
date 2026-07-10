// Travelpayouts / Aviasales affiliate deep link — a pure URL template, no API.
// The tp.media redirect wraps an Aviasales search URL and credits the click to
// our marker. Format confirmed against Travelpayouts' docs (July 2026):
//   https://tp.media/r?campaign_id=..&marker=..&p=..&trs=..&u=<encoded inner URL>
//   inner: https://search.aviasales.com/flights/?origin_iata=..&destination_iata=..
//          &depart_date=YYYY-MM-DD[&return_date=YYYY-MM-DD]&adults=..&children=..
//          &infants=..&trip_class=0|1|2&locale=en&one_way=true|false
// Round trip = return_date present AND one_way=false; one-way = one_way=true.
//
// NEXT_PUBLIC_ prefix is required: the link is assembled in client components,
// and these IDs are not secrets — they are visible in the final URL anyway.

const TP_CONFIG = {
  campaignId: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_CAMPAIGN_ID,
  marker: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER,
  p: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_P,
  trs: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_TRS,
};

// Aviasales trip_class: Economy=0, Business=1, First=2. Premium economy has no
// documented value in this format, so it falls back to economy.
const TRIP_CLASS: Record<string, string> = {
  economy: "0",
  premium_economy: "0",
  business: "1",
  first: "2",
};

export type AviasalesLinkParams = {
  from: string;
  to: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD, empty/absent = one-way
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
};

/** Affiliate link to an Aviasales search pre-filled with the user's route,
 *  dates, passengers, and cabin. Returns null when the Travelpayouts env
 *  vars are not configured, so callers can simply hide the CTA. */
export const buildAviasalesLink = (params: AviasalesLinkParams): string | null => {
  const { campaignId, marker, p, trs } = TP_CONFIG;
  if (!campaignId || !marker || !p || !trs) return null;
  if (!params.from || !params.to || !params.departureDate) return null;

  const isRoundTrip = Boolean(params.returnDate);

  const inner = new URLSearchParams({
    origin_iata: params.from.toUpperCase(),
    destination_iata: params.to.toUpperCase(),
    depart_date: params.departureDate,
    ...(isRoundTrip ? { return_date: params.returnDate! } : {}),
    adults: String(params.adults || 1),
    children: String(params.children || 0),
    infants: String(params.infants || 0),
    trip_class: TRIP_CLASS[params.cabinClass || "economy"] ?? "0",
    locale: "en",
    one_way: String(!isRoundTrip),
  });
  const innerUrl = `https://search.aviasales.com/flights/?${inner.toString()}`;

  const outer = new URLSearchParams({
    campaign_id: campaignId,
    marker,
    p,
    trs,
    u: innerUrl,
  });
  return `https://tp.media/r?${outer.toString()}`;
};
