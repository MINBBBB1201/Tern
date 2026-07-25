"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { AirportBrief } from "../../lib/airportBrief";
import {
  buildAirportUberLink,
  buildAirportUberLinkWithDropoff,
  buildAirportLyftLink,
  buildAirportLyftLinkWithDropoff,
  isLyftAvailable,
} from "../../lib/rideDeepLinks";
import { getAirport } from "../../lib/airportData";
import { DestinationSearch, type DestinationPoint } from "../DestinationSearch";

type AirportGuideCardsProps = {
  departureGuide: AirportBrief;
  arrivalGuide: AirportBrief;
  from: string;
  to: string;
};

export default function AirportGuideCards({ departureGuide, arrivalGuide, from, to }: AirportGuideCardsProps) {
  const t = useTranslations("Guide");
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
        const countryCode = getAirport(iata)?.country;
        const lyftLink = isLyftAvailable(countryCode)
          ? dropoff
            ? buildAirportLyftLinkWithDropoff(iata, dropoff)
            : buildAirportLyftLink(iata)
          : null;

        return (
          <div key={idx} className="glass-panel rounded-[20px] p-5">
            <p className="mb-1 text-sm font-semibold">{guide.name}</p>
            <p className="text-xs text-muted mb-3">{guide.summary}</p>

            {uberLink && (
              <>
                <DestinationSearch
                  countryCode={countryCode}
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
                      {dropoff ? t("rideTo", { iata: guide.iata }) : t("rideFrom", { iata: guide.iata })}
                    </span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black">
                    {t("open")}
                  </span>
                </a>
                <p className={`mt-1.5 text-[11px] text-muted ${lyftLink ? "mb-2" : "mb-3"}`}>
                  {t("uberNote")}
                </p>
              </>
            )}

            {lyftLink && (
              <a
                href={lyftLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-[#FF00BF] px-4 py-3.5 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-black tracking-tight text-white">Lyft</span>
                  <span className="hidden text-xs text-white/70 sm:inline">
                    {dropoff ? t("rideTo", { iata: guide.iata }) : t("rideFrom", { iata: guide.iata })}
                  </span>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#FF00BF]">
                  {t("open")}
                </span>
              </a>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/guide/airport/${iata}`}
                className="inline-flex items-center gap-1 rounded-full bg-[rgba(143,224,232,0.12)] px-3 py-1.5 text-xs font-medium text-[var(--contrail-300)] hover:bg-primary hover:text-white transition-colors"
              >
                {t("airportGuide")}
              </Link>
              <Link
                href={`/guide/airport/${iata}#accessibility`}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-xs font-medium text-muted hover:text-primary hover:border-primary transition-colors"
              >
                {t("accessibility")}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
