import type { MetadataRoute } from "next";

/**
 * Native App Router robots (metadata route → /robots.txt). Everything
 * public is crawlable; excluded are the auth page, the API endpoints
 * (JSON, not pages), and the parameterized live-fare search results
 * (/booking?… — infinite query variants; the canonical /booking is
 * indexed instead). Points at the native sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/signin", "/api/", "/booking?"],
    },
    sitemap: "https://www.flytern.site/sitemap.xml",
    host: "https://www.flytern.site",
  };
}
