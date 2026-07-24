import type { MetadataRoute } from "next";
import { getAllGuidedAirportCodes } from "../lib/airportGuides";
import { blogPosts } from "../lib/blogPosts";

/**
 * Native App Router sitemap (metadata route → /sitemap.xml). Dynamic
 * routes are enumerated from the same data files the pages import, so the
 * sitemap can never drift from the routes that actually exist:
 *   - guide/airport/[iata]  ← getAllGuidedAirportCodes()
 *   - blog/[slug]           ← blogPosts
 * /signin (auth) is deliberately omitted; the parameterized /booking?…
 * live-fare results are excluded via robots.ts (the canonical /booking is
 * what gets indexed). Airline "deal pages" are external carrier URLs, not
 * internal routes, so only the /deals index appears here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.flytern.site";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/booking`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/deals`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = getAllGuidedAirportCodes().map((iata) => ({
    url: `${baseUrl}/guide/airport/${iata}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...guideRoutes, ...blogRoutes];
}
