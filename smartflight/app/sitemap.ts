import type { MetadataRoute } from "next";
import { getAllGuidedAirportCodes } from "../lib/airportGuides";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.flytern.site";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const guideRoutes: MetadataRoute.Sitemap = getAllGuidedAirportCodes().map((iata) => ({
    url: `${baseUrl}/guide/airport/${iata}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...guideRoutes];
}
