export type Offer = {
  id: string;
  price: string;
  currency: string;
  airline?: string;
  airlineIata?: string;
  airlineLogo?: string;
  departure?: string;
  arrival?: string;
  stops: number;
  duration?: string;
  originAirport?: string;
  destinationAirport?: string;
  aircraftType?: string;
  aircraftIata?: string;
  cabinClass?: string;
  segments?: Array<{
    departing_at?: string;
    arriving_at?: string;
    origin?: string;
    destination?: string;
    duration?: string;
    marketing_carrier?: string;
    operating_carrier?: string;
    aircraft?: string;
  }>;
};

export const PROGRAM_GROUPS = [
  "Amex Membership Rewards",
  "BILT Rewards",
  "Star Alliance Programs",
  "SkyTeam Programs",
] as const;

export const BOOKABLE_AIRLINES = [
  "korean air",
  "asiana",
  "turkish",
  "united",
  "delta",
  "air france",
  "klm",
  "lufthansa",
  "ana",
  "american",
  "british",
  "qatar",
  "emirates",
  "singapore",
  "cathay",
  "etihad",
  "air canada",
  "jal",
  "japan airlines",
  "eva",
  "finnair",
  "swiss",
  "austrian",
  "lot",
  "vietnam airlines",
  "thai",
  "malaysia airlines",
  "garuda",
];

export const normalize = (v?: string) => (v || "").toLowerCase().trim();

export const isBookableAirline = (airline?: string) => {
  const a = normalize(airline);
  if (!a) return false;
  if (a.includes("test") || a.includes("sample") || a.includes("dummy") || a.includes("duffel")) return false;
  return BOOKABLE_AIRLINES.some((k) => a.includes(k));
};

export type PriceAlert = {
  id: string;
  from: string;
  to: string;
  targetPrice: number;
  setDate: string;
};

export const parseDurationMinutes = (iso?: string) => {
  if (!iso) return Infinity;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return Infinity;
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  return h * 60 + min;
};

export const timeLabel = (iso?: string) => (iso ? iso.slice(11, 16) : "--:--");

/** `tag` is a BCP-47 tag from i18n/locales — never hardcode one here. */
export const dateLabel = (iso: string | undefined, tag: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString(tag, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};

export const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
};

export const scoreOffer = (o: Offer) => {
  const p = Number(o.price || 0);
  const d = parseDurationMinutes(o.duration);
  return p * 0.65 + d * 0.35 + (o.stops ?? 0) * 120;
};

export const toMinutes = (iso?: string) => {
  if (!iso) return -1;
  const hh = Number(iso.slice(11, 13));
  const mm = Number(iso.slice(14, 16));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return -1;
  return hh * 60 + mm;
};

export const resolvesProgramMatch = (offer: Offer, selectedPrograms: string[]) => {
  if (selectedPrograms.length === 0) return true;
  const airline = (offer.airline || "").toLowerCase();

  return selectedPrograms.some((p) => {
    if (p === "Amex Membership Rewards" || p === "BILT Rewards") return true;
    if (p === "Star Alliance Programs") {
      return ["united", "turkish", "asiana", "lufthansa", "air canada"].some((k) => airline.includes(k));
    }
    if (p === "SkyTeam Programs") {
      return ["delta", "air france", "klm", "korean air"].some((k) => airline.includes(k));
    }
    return false;
  });
};

/** Airlines commonly paired with major transferable currency / alliance programs (heuristic). */
export const loyaltyAllianceMatch = (offer: Offer) => {
  const a = (offer.airline || "").toLowerCase();
  const star = ["united", "turkish", "asiana", "lufthansa", "air canada", "swiss", "ana", "singapore", "eva", "austrian", "lot"];
  const sky = ["delta", "air france", "klm", "korean air", "vietnam airlines", "garuda"];
  return star.some((k) => a.includes(k)) || sky.some((k) => a.includes(k));
};

export const arrivalTimestamp = (iso?: string) => {
  if (!iso) return Infinity;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Infinity : t;
};

export const layoverBetweenSegments = (arr?: string, dep?: string) => {
  if (!arr || !dep) return 0;
  const mins = (new Date(dep).getTime() - new Date(arr).getTime()) / 60000;
  return Math.max(0, mins);
};

/** Heuristic 0–98: higher = more schedule fragility (not live FAA data). */
export const computeDelayRiskScore = (offer: Offer): number => {
  let risk = 8;
  risk += (offer.stops ?? 0) * 15;
  const depM = toMinutes(offer.departure);
  if (depM >= 0 && (depM >= 22 * 60 || depM <= 5 * 60)) risk += 12;
  const segs = offer.segments ?? [];
  for (let i = 0; i < segs.length - 1; i++) {
    const lay = layoverBetweenSegments(segs[i]?.arriving_at, segs[i + 1]?.departing_at);
    if (lay > 0 && lay < 55) risk += 30;
    else if (lay < 85) risk += 18;
    else if (lay < 115) risk += 9;
  }
  return Math.min(98, Math.round(risk));
};

export type SortTab =
  | "price"
  | "duration"
  | "arrival"
  | "ai"
  | "delay_low"
  | "delay_high"
  | "connecting_value";

export const buildBookingPrograms = (offer: Offer) => {
  const airline = offer.airline || "Partner Airline";
  const iata = (offer.airlineIata || "--").toUpperCase();
  const base = Math.max(30000, Math.round(Number(offer.price || 0) * 120));

  return {
    easyPicks: [
      {
        label: `${airline} Direct Program`,
        points: base,
        cash: "+$60",
        note: `Book directly with ${airline} (${iata}) for instant ticket issuance.`,
      },
      {
        label: "Tern Smart Pick",
        points: Math.round(base * 0.92),
        cash: "+$78",
        note: "Includes optimized transfer ratio and fee-aware recommendation.",
      },
    ],
    transferOptions: [
      { program: "Amex Membership Rewards", points: Math.round(base * 0.36), cash: "+$95" },
      { program: "BILT Rewards", points: Math.round(base * 0.35), cash: "+$90" },
      { program: "Chase Ultimate Rewards", points: Math.round(base * 0.37), cash: "+$98" },
      { program: "Capital One Miles", points: Math.round(base * 0.38), cash: "+$105" },
    ],
  };
};

/**
 * Brand names only — these are proper nouns, not translated. The
 * translatable content (earn rate, transfer bonus, note) lives in
 * messages/*.json under LoyaltyCard.programs.{id}, keyed by id here.
 */
export const CARD_PROGRAM_IDS = [
  { id: "amexPlatinum", program: "Amex Platinum" },
  { id: "chaseSapphireReserve", program: "Chase Sapphire Reserve" },
  { id: "capitalOneVentureX", program: "Capital One Venture X" },
] as const;
