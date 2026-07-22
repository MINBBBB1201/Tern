/**
 * Airline deal-page directory — shared by the homepage section and /deals.
 * Every fact here must be verifiable on the linked page: no invented
 * codes, discounts, or expiry dates attributed to real airlines (C1
 * principle). Descriptions live in messages under Home.{descKey}.
 * `route` is the airline's popular route as shown in the carriers
 * section — reused on /deals as an honest search entry point.
 * `brand` is the carrier's own signature colour, used ONLY as a micro-
 * accent (a top hairline + a hover glow) on the Civil Twilight card — a
 * brand hint, never a repaint. Not a claim; the airlines' marks stay
 * untouched.
 */
export const airlineDealPages = [
  {
    airline: "Korean Air",
    iata: "KE",
    descKey: "dealKE",
    domain: "koreanair.com",
    url: "https://www.koreanair.com/kr/en/book/deals",
    route: { from: "ICN", to: "LAX" },
    brand: "#0F4C97", // Korean Air sky blue
  },
  {
    airline: "Turkish Airlines",
    iata: "TK",
    descKey: "dealTK",
    domain: "turkishairlines.com",
    url: "https://www.turkishairlines.com/en-int/flights/flight-ticket/",
    route: { from: "ICN", to: "IST" },
    brand: "#C8102E", // Turkish red
  },
  {
    airline: "Asiana Airlines",
    iata: "OZ",
    descKey: "dealOZ",
    domain: "flyasiana.com",
    url: "https://flyasiana.com/C/KR/EN/contents/travel-information",
    route: { from: "ICN", to: "CDG" },
    brand: "#D64550", // Asiana warm red
  },
  {
    airline: "Jeju Air",
    iata: "7C",
    descKey: "deal7C",
    domain: "jejuair.net",
    url: "https://www.jejuair.net/en/specialprice/event.do",
    route: { from: "ICN", to: "NRT" },
    brand: "#FF6B1A", // Jeju Air orange
  },
] as const;

export type AirlineDealPage = (typeof airlineDealPages)[number];
