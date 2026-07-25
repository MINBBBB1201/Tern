import { ImageResponse } from "next/og";
import { getAirportBrief } from "../../../../../lib/airportBrief";
import { getAllGuidedAirportCodes } from "../../../../../lib/airportGuides";
import { ogCard, ogSize, ogContentType } from "../../../../../lib/og";

export const alt = "Tern — Airport Guide";
export const size = ogSize;
export const contentType = ogContentType;

// Pre-generate one image per guided airport at build time.
export function generateStaticParams() {
  return getAllGuidedAirportCodes().map((iata) => ({ iata }));
}

export default async function Image({ params }: { params: Promise<{ iata: string }> }) {
  const { iata } = await params;
  // Statically generated at build time, so it stays English — OG cards are
  // fetched by crawlers without our locale cookie.
  const guide = getAirportBrief(iata);

  return new ImageResponse(
    ogCard({ kicker: "Airport Guide", title: `${guide.name} (${guide.iata})` }),
    { ...size }
  );
}
