// Deep link into our Travelpayouts White Label at book.flytern.site — a pure
// URL template, no API. The White Label (whitelabel.travelpayouts.com backend,
// Aviasales inventory) has our marker baked into its instance config, so a
// plain first-party link credits us: no tp.media redirect wrapper and no
// campaign/marker query params needed anymore.
//
// URL format, per Travelpayouts "Links to the White Label with a completed
// search form" (support article 115003710648):
//   https://book.flytern.site/?flightSearch={ROUTECODE}
// The route code grammar is the SAME one Aviasales' own /search/{code} URLs
// use — {ORIGIN}{DDMM}{DEST}[{DDMM}][class]{pax} — only its placement differs:
// White Label takes it as the `flightSearch` query param, not a path segment.
// Verified July 2026: the White Label server-renders the parsed route, dates,
// passengers and cabin into the page for that URL (not a blank search form).
//
// Case matters: IATA codes MUST be uppercase — lowercase letters are read as
// cabin-class letters, and a 2-letter uppercase suffix is read as a country
// code (docs example: ...ROc1 = anywhere in Romania, ...ROC1 = Rochester).

const WHITE_LABEL_BASE = "https://book.flytern.site";

// Route-code cabin letters (airline booking-class convention). Economy is the
// default and takes no letter. "w" renders as "Comfort" (the White Label's
// premium-economy label), matching Aviasales.
const CABIN_LETTER: Record<string, string> = {
  economy: "",
  premium_economy: "w",
  business: "c",
  first: "f",
};

// YYYY-MM-DD → DDMM (route codes carry no year; the White Label reads them as
// the next occurrence within 12 months, which always matches a flight search).
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

/** Link to our White Label booking site (book.flytern.site) with the user's
 *  route, dates, passengers, and cabin pre-filled. Returns null only for
 *  unusable input, so callers can simply hide the CTA. */
export const buildAviasalesLink = (params: AviasalesLinkParams): string | null => {
  if (!params.from || !params.to || !params.departureDate) return null;

  const departDDMM = toDDMM(params.departureDate);
  if (!departDDMM) return null;
  const returnDDMM = params.returnDate ? toDDMM(params.returnDate) : "";
  if (params.returnDate && !returnDDMM) return null;

  const cabin = CABIN_LETTER[params.cabinClass || "economy"] ?? "";

  // Passenger digits: adults (mandatory — the link won't work without it),
  // then children, then infants; trailing zeros are omitted the way the docs'
  // own examples do (1 adult economy = "...NRT27081" → pax "1").
  const children = params.children || 0;
  const infants = params.infants || 0;
  const pax =
    String(params.adults || 1) +
    (children || infants ? String(children) : "") +
    (infants ? String(infants) : "");

  const routeCode = `${params.from.toUpperCase()}${departDDMM}${params.to.toUpperCase()}${returnDDMM}${cabin}${pax}`;
  return `${WHITE_LABEL_BASE}/?flightSearch=${routeCode}`;
};
