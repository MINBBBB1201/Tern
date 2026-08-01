import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { resolveAirportGuideOr404 } from "../../../../../lib/airportGuideAccess";
import { getAllGuidedAirportCodes } from "../../../../../lib/airportGuides";
import { ogCard, ogSize, ogContentType } from "../../../../../lib/og";
import { routing } from "../../../../../i18n/routing";

export const alt = "Tern — Airport Guide";
export const size = ogSize;
export const contentType = ogContentType;

/**
 * I5-3: one image per locale × airport (4 × 23 = 92), pre-generated at build
 * time. Before this the route only varied by `iata`, so every share preview
 * was English no matter which locale page was shared — the residual I4 left
 * behind because a cookie-based locale never reached a statically generated
 * route. Now the locale is a route segment, so it does.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllGuidedAirportCodes().map((iata) => ({ locale, iata }))
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; iata: string }>;
}) {
  const { locale, iata } = await params;
  /* I10: same gate as the page. generateStaticParams only pre-renders the 23
     curated codes, but the route stayed dynamic for everything else, so
     /guide/airport/ZZZ/opengraph-image happily rendered a 71KB card for an
     airport that does not exist. Sharing the resolver means the image can
     never name an airport the page itself would 404 on. */
  const guide = resolveAirportGuideOr404(iata, locale);
  const t = await getTranslations({ locale, namespace: "AirportGuide" });

  // City/country come from the per-locale brief, so the subtitle is localized
  // by the same data the page body uses — no separate copy to drift.
  const place = [guide.city, guide.country].filter(Boolean).join(", ");

  return new ImageResponse(
    ogCard({
      kicker: t("badge"),
      title: `${guide.name} (${guide.iata})`,
      subtitle: place || undefined,
    }),
    { ...size }
  );
}
