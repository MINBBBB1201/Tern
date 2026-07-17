/**
 * Blog post registry. Copy (titles, excerpts, intros, bodies of the
 * points/product posts) lives in messages under BlogPage.*; airport
 * posts additionally pull their factual sections from the airport
 * guide data (lib/airportGuides.ts) — real content reshaped, nothing
 * invented for the blog.
 */
export type BlogPost =
  | { slug: string; kind: "airport"; iata: string; tagKey: "tagAirport"; titleKey: string; excerptKey: string; introKey: string }
  | { slug: string; kind: "points"; tagKey: "tagPoints"; titleKey: string; excerptKey: string; introKey: string }
  | { slug: string; kind: "product"; tagKey: "tagProduct"; titleKey: string; excerptKey: string; introKey: string };

export const blogPosts: BlogPost[] = [
  {
    slug: "icn-layover-guide",
    kind: "airport",
    iata: "ICN",
    tagKey: "tagAirport",
    titleKey: "icnTitle",
    excerptKey: "icnExcerpt",
    introKey: "icnIntro",
  },
  {
    slug: "nrt-into-tokyo",
    kind: "airport",
    iata: "NRT",
    tagKey: "tagAirport",
    titleKey: "nrtTitle",
    excerptKey: "nrtExcerpt",
    introKey: "nrtIntro",
  },
  {
    slug: "ist-first-timers",
    kind: "airport",
    iata: "IST",
    tagKey: "tagAirport",
    titleKey: "istTitle",
    excerptKey: "istExcerpt",
    introKey: "istIntro",
  },
  {
    slug: "points-transfers-101",
    kind: "points",
    tagKey: "tagPoints",
    titleKey: "pointsTitle",
    excerptKey: "pointsExcerpt",
    introKey: "pointsIntro",
  },
  {
    slug: "how-tern-ranks-flights",
    kind: "product",
    tagKey: "tagProduct",
    titleKey: "rankTitle",
    excerptKey: "rankExcerpt",
    introKey: "rankIntro",
  },
];

export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
