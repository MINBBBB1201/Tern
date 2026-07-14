import { NextRequest, NextResponse } from "next/server";
import airportsRaw from "../../../../lib/data/airports.json";

type AirportInfo = {
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
};

const AIRPORTS = airportsRaw as Record<string, AirportInfo>;

// Built once per server instance (module scope), not per-request.
const ENTRIES = Object.entries(AIRPORTS);

/**
 * The airport dataset has no passenger-volume/importance field, so a pure
 * text-match search ranks tiny regional airports next to major hubs
 * whenever they tie on match quality — e.g. searching "lon" surfaced
 * London Biggin Hill and Parry Sound before London Heathrow. This list
 * gives major world hubs a ranking boost so they surface first, which is
 * what almost every searcher actually wants. Not exhaustive — covers the
 * airports already curated with real guides this session plus other
 * major global hubs by passenger volume.
 */
const MAJOR_HUB_BOOST = new Set([
  "ICN", "GMP", "NRT", "HND", "JFK", "LHR", "SIN", "AMS", "HKG", "DXB",
  "BKK", "IST", "TPE", "SYD", "FRA", "MUC", "CDG", "LAX", "ORD", "YYZ",
  "MAD", "ZRH", "PVG", "PEK", "PKX", "KUL", "GRU", "ATL", "DFW", "DEN",
  "SFO", "SEA", "MIA", "EWR", "BOS", "IAH", "PHX", "LAS", "MCO", "MSP",
  "DTW", "PHL", "LGA", "BWI", "SLC", "SAN", "TPA", "PDX", "AUS", "DCA",
  "YVR", "YUL", "MEX", "GIG", "EZE", "BOG", "LIM", "SCL", "PTY",
  "LGW", "MAN", "EDI", "DUB", "BRU", "FCO", "MXP", "VCE", "BCN", "LIS",
  "OSL", "ARN", "CPH", "HEL", "VIE", "WAW", "PRG", "BUD", "ATH", "SVO",
  "DME", "DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "CGK", "MNL", "SGN",
  "HAN", "RGN", "PNH", "PEN", "CMB", "KTM", "DAC", "KHI", "LHE", "ISB",
  "DOH", "AUH", "JED", "RUH", "AMM", "BEY", "TLV", "CAI", "CMN", "LOS",
  "NBO", "ADD", "JNB", "CPT", "DUR", "ACC", "DKR", "ALG", "TUN",
  "PEK", "CAN", "SZX", "CTU", "XIY", "CKG", "KMG", "NKG", "HGH", "WUH",
  "FUK", "NGO", "KIX", "CTS", "OKA", "GRU", "CGH", "BSB", "CNF", "SSA",
  "AKL", "CHC", "PER", "BNE", "MEL", "ADL", "NAN",
]);

/**
 * Several cities have more than one MAJOR_HUB_BOOST airport (e.g. London:
 * LHR + LGW; New York: JFK + LGA + EWR), which tied at the same score and
 * fell back to JSON insertion order — live-tested and caught: "lon"
 * actually surfaced LGW ahead of LHR, not the order the first version of
 * this file's commit message claimed. This second, smaller tier breaks
 * those specific ties in favor of the single most internationally
 * recognized airport per city, without touching every other ranking.
 */
const PRIMARY_HUB_TIEBREAK = new Set(["LHR", "JFK", "CDG", "NRT"]);

export type AirportSearchResult = {
  iata: string;
  name: string;
  city: string;
  country: string;
};

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const scored: { entry: AirportSearchResult; score: number }[] = [];

  for (const [iata, info] of ENTRIES) {
    const iataLower = iata.toLowerCase();
    const cityLower = info.city.toLowerCase();
    const nameLower = info.name.toLowerCase();

    let score = -1;
    if (iataLower === q) score = 100;
    else if (iataLower.startsWith(q)) score = 90;
    else if (cityLower.startsWith(q)) score = 80;
    else if (nameLower.startsWith(q)) score = 70;
    else if (cityLower.includes(q)) score = 50;
    else if (nameLower.includes(q)) score = 40;

    if (score > 0) {
      if (MAJOR_HUB_BOOST.has(iata)) score += 15;
      if (PRIMARY_HUB_TIEBREAK.has(iata)) score += 3;
      scored.push({ entry: { iata, name: info.name, city: info.city, country: info.country }, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({ results: scored.slice(0, 8).map((s) => s.entry) });
}
