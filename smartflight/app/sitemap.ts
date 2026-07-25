import type { MetadataRoute } from "next";
import { getAllGuidedAirportCodes } from "../lib/airportGuides";
import { blogPosts } from "../lib/blogPosts";
import { localeUrl, sitemapAlternates } from "../lib/seo";

/**
 * Native App Router sitemap (metadata route → /sitemap.xml). Dynamic routes
 * are enumerated from the same data files the pages import, so the sitemap
 * can never drift from the routes that actually exist:
 *   - guide/airport/[iata]  ← getAllGuidedAirportCodes()
 *   - blog/[slug]           ← blogPosts
 * /signin (auth) is deliberately omitted; the parameterized /booking?…
 * live-fare results are excluded via robots.ts (the canonical /booking is
 * what gets indexed). Airline "deal pages" are external carrier URLs, not
 * internal routes, so only the /deals index appears here.
 *
 * I5: each route is emitted once per locale, and every entry carries the
 * `alternates.languages` set so the four versions are declared as
 * translations of one page rather than four unrelated URLs.
 *
 * The guide routes are included for all four locales (23 airports × 4 = 92
 * URLs) on purpose: after I4 those pages have genuinely distinct, fully
 * translated bodies — they are the strongest long-tail search asset the site
 * has, and omitting them would waste the round that produced them. Locale
 * expansion is NOT applied blindly elsewhere: /booking's parameterized
 * results stay excluded via robots.ts, since those are infinite query
 * variants with no per-locale content difference worth indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: number
  ): MetadataRoute.Sitemap =>
    (["en", "ko", "ja", "zh"] as const).map((locale) => ({
      url: localeUrl(path, locale),
      lastModified: now,
      changeFrequency,
      priority,
      alternates: sitemapAlternates(path),
    }));

  return [
    ...entry("/", "daily", 1),
    ...entry("/booking", "daily", 0.8),
    ...entry("/deals", "weekly", 0.8),
    ...entry("/blog", "weekly", 0.7),
    ...entry("/about", "monthly", 0.5),
    ...entry("/support", "monthly", 0.5),
    ...entry("/terms", "yearly", 0.3),
    ...entry("/privacy", "yearly", 0.3),
    ...getAllGuidedAirportCodes().flatMap((iata) =>
      entry(`/guide/airport/${iata}`, "monthly", 0.7)
    ),
    ...blogPosts.flatMap((post) => entry(`/blog/${post.slug}`, "monthly", 0.6)),
  ];
}
