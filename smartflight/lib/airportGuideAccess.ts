import { notFound } from "next/navigation";
import { getAirport } from "./airportData";
import { getCuratedBrief } from "./airportBrief";
import { countryName } from "./countryNames";
import { getAirportGuide, type AirportGuide } from "./airportGuides";

/**
 * I10: who is allowed a /guide/airport/[iata] page, and under whose name.
 *
 * Server-only. This pulls in the 7,917-entry dataset via ./airportData, so it
 * must never be imported from a client component — that is why the rule lives
 * here rather than in ./airportBrief, which SearchBar imports on the homepage.
 *
 * Three tiers, not two. The guide route used to render *anything* three
 * letters long, because getAirportBrief falls back to a constructed
 * `${iata} Airport` placeholder and getAirportGuide falls back to a generic
 * body. That produced two separate defects:
 *
 *   1. `/guide/airport/ZZZ` → 200 with "ZZZ Airport (ZZZ)". A soft 404: an
 *      indexable page for an airport that does not exist, filled with an
 *      invented name. Every unused 3-letter combination was a live URL.
 *   2. `/guide/airport/ATL` → 200 with "ATL Airport (ATL)", even though the
 *      dataset holds the verified "Hartsfield Jackson Atlanta International
 *      Airport". An invented name shown where a real one exists.
 *
 * (2) is the same §2-1 breach I5-4 already fixed for /booking (see
 * resolveBrief in BookingContent) — the guide route simply never got the
 * same treatment. The rule below is deliberately the same one, so the two
 * surfaces cannot drift:
 *
 *   curated (23)      → the hand-written guide, unchanged
 *   real but uncurated → real name/city/country from the dataset, kept with
 *                        the generic body. That body is honest general advice
 *                        ("use the official taxi rank", "arrive 2h early"),
 *                        not fabricated airport-specific detail, so it is
 *                        fine to show — what was not fine was the name.
 *   neither            → notFound(), i.e. the branded 404 I9 made reachable
 *
 * Uncurated airports stay out of sitemap.xml either way (that is driven by
 * getAllGuidedAirportCodes), so nothing new becomes indexable here. They must
 * keep resolving, though: /booking links to a guide page for whichever
 * airports the user actually searched, so 404-ing tier 2 would break real
 * product links for most routes.
 */
export function resolveAirportGuideOr404(iata: string, locale: string): AirportGuide {
  const code = iata.trim().toUpperCase();

  if (getCuratedBrief(code)) return getAirportGuide(code, locale);

  const raw = getAirport(code);
  if (!raw) notFound();

  return {
    ...getAirportGuide(code, locale),
    name: raw.name,
    city: raw.city,
    // The dataset stores ISO 3166-1 alpha-2; the curated briefs store full
    // names. Localize through the same CLDR path I5-4 used for autocomplete
    // so "US" does not render raw next to "Seoul, South Korea".
    country: countryName(raw.country, locale),
  };
}

/**
 * True for tier 1 — an airport with a hand-written guide.
 *
 * I11 uses this to split the two tiers that both render a page: tier 1 is the
 * indexable long-tail asset I5 built, tier 2 is a real airport carrying only
 * the generic body and must not compete with it in search.
 *
 * (This replaces I10's `airportGuideExists`, which was exported but never
 * called — dead on arrival.)
 */
export function isCuratedAirportGuide(iata: string): boolean {
  return getCuratedBrief(iata.trim().toUpperCase()) !== null;
}
