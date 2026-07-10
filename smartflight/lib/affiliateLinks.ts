// Travelpayouts / Aviasales affiliate deep link — a pure URL template, no API.
// The tp.media redirect wraps an Aviasales search URL and credits the click to
// our marker:
//   https://tp.media/r?campaign_id=..&marker=..&p=..&trs=..&u=<encoded inner URL>
//   inner: https://www.aviasales.com/search/{ORIGIN}{DDMM}{DEST}[{DDMM}][class]{pax}
//
// Why the route-code format and not the documented query-param one
// (search.aviasales.com/flights/?origin_iata=..&locale=en&..): that host now
// 302s to the aviasales.ru homepage and drops every param — Russian UI, empty
// search (verified July 2026). Aviasales picks language by DOMAIN, not by a
// locale param, so pinning www.aviasales.com is what actually forces English.
// The route code is what Aviasales' own search UI generates; verified in a
// real browser to land on .com, lang="en", pre-filled, with live fares.
//
// NEXT_PUBLIC_ prefix is required: the link is assembled in client components,
// and these IDs are not secrets — they are visible in the final URL anyway.

const TP_CONFIG = {
  campaignId: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_CAMPAIGN_ID,
  marker: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER,
  p: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_P,
  trs: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_TRS,
};

// Route-code cabin letters (airline booking-class convention). Economy is the
// default and takes no letter. Aviasales normalizes "b" to "c" for business;
// we emit the canonical letters it generates itself. "w" renders as "Comfort"
// (their premium-economy label).
const CABIN_LETTER: Record<string, string> = {
  economy: "",
  premium_economy: "w",
  business: "c",
  first: "f",
};

// YYYY-MM-DD → DDMM (route codes carry no year; Aviasales reads them as the
// next occurrence within 12 months, which always matches a flight search).
const toDDMM = (isoDate: string): string | null => {
  const m = isoDate.match(/^\d{4}-(\d{2})-(\d{2})$/);
  return m ? `${m[2]}${m[1]}` : null;
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

  const departDDMM = toDDMM(params.departureDate);
  if (!departDDMM) return null;
  const returnDDMM = params.returnDate ? toDDMM(params.returnDate) : "";
  if (params.returnDate && !returnDDMM) return null;

  const cabin = CABIN_LETTER[params.cabinClass || "economy"] ?? "";

  // Passenger digits: adults, then children, then infants — trailing zeros
  // are omitted the way Aviasales' own URLs do (1 adult economy = "...NRT1").
  const children = params.children || 0;
  const infants = params.infants || 0;
  const pax =
    String(params.adults || 1) +
    (children || infants ? String(children) : "") +
    (infants ? String(infants) : "");

  const routeCode = `${params.from.toUpperCase()}${departDDMM}${params.to.toUpperCase()}${returnDDMM}${cabin}${pax}`;
  const innerUrl = `https://www.aviasales.com/search/${routeCode}`;

  const outer = new URLSearchParams({
    campaign_id: campaignId,
    marker,
    p,
    trs,
    u: innerUrl,
  });
  return `https://tp.media/r?${outer.toString()}`;
};
