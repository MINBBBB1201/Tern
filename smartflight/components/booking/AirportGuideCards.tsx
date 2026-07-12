"use client";

import { useState } from "react";
import Link from "next/link";
import type { AirportGuide } from "../../lib/airportGuides";
import { buildAirportUberLink, buildAirportUberLinkWithDropoff } from "../../lib/rideDeepLinks";
import { DestinationSearch, type DestinationPoint } from "../DestinationSearch";

type AirportGuideCardsProps = {
  departureGuide: AirportGuide;
  arrivalGuide: AirportGuide;
  from: string;
  to: string;
};

export default function AirportGuideCards({ departureGuide, arrivalGuide, from, to }: AirportGuideCardsProps) {
  const [destinations, setDestinations] = useState<Record<number, DestinationPoint | null>>({});

  if (!departureGuide && !arrivalGuide) return null;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {[departureGuide, arrivalGuide].map((guide, idx) => {
        if (!guide) return null;
        const iata = idx === 0 ? from : to;
        const dropoff = destinations[idx];
        const uberLink = dropoff
          ? buildAirportUberLinkWithDropoff(iata, dropoff)
          : buildAirportUberLink(iata);

        return (
          <div key={idx} className="glass-panel rounded-[20px] p-5">
            <p className="mb-1 text-sm font-semibold">{guide.name}</p>
            <p className="text-xs text-muted mb-3">{guide.summary}</p>

            {uberLink && (
              <>
                <DestinationSearch
                  onSelect={(point) => setDestinations((prev) => ({ ...prev, [idx]: point }))}
                />
                <a
                  href={uberLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl bg-black px-4 py-3.5 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-black tracking-tight text-white">Uber</span>
                    <span className="hidden text-xs text-white/60 sm:inline">
                      {dropoff ? `${guide.iata} → destination` : `Get a ride from ${guide.iata}`}
                    </span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black">
                    Open ↗
                  </span>
                </a>
                <p className="mb-3 mt-1.5 text-[11px] text-muted">
                  Uber operates in most major cities worldwide, but not everywhere—if it&apos;s not available here, the app will let you know.
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/guide/airport/${iata}`}
                className="inline-flex items-center gap-1 rounded-full bg-[#eff5ff] px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Airport guide →
              </Link>
              <Link
                href={`/guide/airport/${iata}#accessibility`}
                className="inline-flex items-center gap-1 rounded-full border border-[#dbe5f3] px-3 py-1.5 text-xs font-medium text-muted hover:text-primary hover:border-primary transition-colors"
              >
                ♿ Accessibility
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
