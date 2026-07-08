"use client";

import Link from "next/link";
import type { AirportGuide } from "../../lib/airportGuides";

type AirportGuideCardsProps = {
  departureGuide: AirportGuide;
  arrivalGuide: AirportGuide;
  from: string;
  to: string;
};

export default function AirportGuideCards({ departureGuide, arrivalGuide, from, to }: AirportGuideCardsProps) {
  if (!departureGuide && !arrivalGuide) return null;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {[departureGuide, arrivalGuide].map((guide, idx) => guide && (
        <div key={idx} className="glass-panel rounded-[20px] p-5">
          <p className="mb-1 text-sm font-semibold">{guide.name}</p>
          <p className="text-xs text-muted mb-3">{guide.summary}</p>
          <Link
            href={`/guide/airport/${idx === 0 ? from : to}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#eff5ff] px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Airport guide →
          </Link>
        </div>
      ))}
    </div>
  );
}
