"use client";

import { memo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useHoverTilt } from "../../hooks/useHoverTilt";
import { LayoverBadge } from "./LayoverBadge";
import { AirportWeatherChip } from "./AirportWeatherChip";
import { getAircraftImage, getAircraftName } from "../../lib/aircraftImages";
import { PriceDisplay } from "../../lib/PriceDisplay";
import { buildAirportUberLink } from "../../lib/rideDeepLinks";
import { useDurationLabel } from "../../lib/useDurationLabel";
import {
  buildBookingPrograms,
  computeDelayRiskScore,
  timeLabel,
  type Offer,
} from "../../lib/offerUtils";

/** Duffel cabin ids → the localized labels the filter bar already uses. */
const CABIN_KEYS: Record<string, string> = {
  economy: "cabinEconomy",
  premium_economy: "cabinPremiumEconomy",
  business: "cabinBusiness",
  first: "cabinFirst",
};

type OfferCardProps = {
  offer: Offer;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  from: string;
  to: string;
  cabinClass: string;
  aviasalesUrl: string | null;
};

function OfferCardImpl({ offer, isExpanded, onToggleExpand, onSelect, from, to, cabinClass, aviasalesUrl }: OfferCardProps) {
  const t = useTranslations("Offer");
  const tFilters = useTranslations("Filters");
  const duration = useDurationLabel();
  const delayRisk = computeDelayRiskScore(offer);
  const riskColor = delayRisk < 25 ? "text-success-strong" : delayRisk < 55 ? "text-warning-strong" : "text-danger-strong";
  const aircraftImg = getAircraftImage(offer.aircraftIata);
  const aircraftName = getAircraftName(offer.aircraftIata);
  const programs = buildBookingPrograms(offer);
  const tilt = useHoverTilt<HTMLElement>(4);
  const arrivalUberLink = buildAirportUberLink(offer.destinationAirport || to);

  return (
    <article
      id={`flight-card-${offer.id}`}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="glass-panel-scan tilt-card rounded-[20px] hover:shadow-md"
    >
      {/* Main row */}
      <div className="flex flex-wrap items-center gap-4 p-4 md:p-5">
        {/* Airline logo */}
        <div className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {offer.airlineLogo ? (
            <Image
              src={offer.airlineLogo}
              alt={offer.airline || t("altAirline")}
              width={36}
              height={36}
              className="object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span className="text-xs font-bold text-muted">{(offer.airlineIata || "??").toUpperCase()}</span>
          )}
        </div>

        {/* Route & times */}
        <div className="flex flex-1 flex-wrap items-center gap-4 min-w-0">
          <div className="text-center">
            <p className="data-mono text-xl font-bold">{timeLabel(offer.departure)}</p>
            <p className="text-xs text-muted">{offer.originAirport || from}</p>
            <AirportWeatherChip iataCode={offer.originAirport || from} />
          </div>
          <div className="flex flex-col items-center gap-0.5 flex-1 min-w-[80px]">
            <p className="data-mono text-xs text-muted">{duration.fromIso(offer.duration)}</p>
            <div className="relative w-full flex items-center">
              <div className="h-px flex-1 bg-gray-200" />
              <svg className="mx-1 h-3 w-3 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <p className="text-xs text-muted">{offer.stops === 0 ? t("nonStop") : t(offer.stops > 1 ? "stops" : "stop", { count: offer.stops })}</p>
          </div>
          <div className="text-center">
            <p className="data-mono text-xl font-bold">{timeLabel(offer.arrival)}</p>
            <p className="text-xs text-muted">{offer.destinationAirport || to}</p>
            <AirportWeatherChip iataCode={offer.destinationAirport || to} />
          </div>
        </div>

        {/* Airline name + cabin */}
        <div className="hidden md:block text-right min-w-[120px]">
          <p className="text-sm font-semibold">{offer.airline || t("partnerAirline")}</p>
          <p className="text-xs text-muted">
            {tFilters(CABIN_KEYS[offer.cabinClass || cabinClass] ?? "cabinEconomy")}
          </p>
          <span
            title={t("riskInfo")}
            className={`glass-chip data-mono mt-0.5 inline-flex cursor-help items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskColor}`}
          >
            {t("risk", { score: delayRisk })}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col items-end gap-2 ml-auto">
          <p className="data-mono text-2xl font-black text-foreground">
            <PriceDisplay amount={Number(offer.price)} currency={offer.currency} />
          </p>
          <p className="text-xs text-muted">{t("perPerson")}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleExpand}
              className="rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              {isExpanded ? t("less") : t("details")}
            </button>
            <button
              type="button"
              onClick={onSelect}
              className="btn-sheen rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {t("select")}
            </button>
          </div>
          {/* Second revenue path: search-level deep link into our White Label
              at book.flytern.site, so it opens a pre-filled search for this
              route/date — the user re-selects a flight there, hence "this
              route", never "book this flight". */}
          {aviasalesUrl && (
            <a
              href={aviasalesUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="text-[11px] font-medium text-primary-hover hover:underline"
            >
              {t("bookThisRoute")}
            </a>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-[var(--glass-border)] px-4 pb-4 pt-3 md:px-5">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Segments */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("flightSegments")}</p>
              {(offer.segments || []).length > 0 ? (
                <div className="space-y-2">
                  {offer.segments!.map((seg, i) => {
                    const nextSeg = offer.segments![i + 1];
                    return (
                      <div key={i}>
                        <div className="glass-chip rounded-xl p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{seg.origin} → {seg.destination}</span>
                            <span className="data-mono text-muted">{duration.fromIso(seg.duration)}</span>
                          </div>
                          <div className="data-mono mt-1 flex gap-3 text-muted">
                            <span>{timeLabel(seg.departing_at)} → {timeLabel(seg.arriving_at)}</span>
                            <span>{seg.marketing_carrier || seg.operating_carrier || ""}</span>
                            {seg.aircraft && <span>{seg.aircraft}</span>}
                          </div>
                        </div>
                        {nextSeg && (
                          <div className="my-1.5 flex justify-center">
                            <LayoverBadge
                              arrivingAt={seg.arriving_at}
                              nextDepartingAt={nextSeg.departing_at}
                              nextOrigin={nextSeg.origin}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted">{t("noSegmentData")}</p>
              )}
            </div>

            {/* Aircraft + loyalty */}
            <div className="space-y-3">
              {aircraftImg && (
                <div className="relative overflow-hidden rounded-xl border border-[var(--glass-border)]">
                  <Image
                    src={aircraftImg}
                    alt={aircraftName || t("altAircraft")}
                    width={400}
                    height={200}
                    className="h-32 w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  {offer.airlineLogo && (
                    <div className="glass-chip absolute right-2 top-2 flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
                      <Image
                        src={offer.airlineLogo}
                        alt={offer.airline || t("altAirline")}
                        width={30}
                        height={30}
                        className="object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  {aircraftName && (
                    <p className="px-3 py-1.5 text-xs text-muted">
                      {offer.airline ? `${offer.airline} · ${aircraftName}` : aircraftName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("bookWithPoints")}</p>
                <div className="space-y-1">
                  {programs.easyPicks.map((p) => (
                    <div key={p.label} className="glass-chip flex items-center justify-between rounded-lg px-3 py-2 text-xs">
                      <span className="font-medium">{p.label}</span>
                      <span className="data-mono text-primary-hover font-semibold">{p.points.toLocaleString()} pts {p.cash}</span>
                    </div>
                  ))}
                </div>
              </div>

              {arrivalUberLink && (
                <a
                  href={arrivalUberLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-xl bg-black px-3 py-2.5 text-xs transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span className="font-black tracking-tight text-white">Uber</span>
                  <span className="text-white/60">{t("getRideAtArrival", { airport: offer.destinationAirport || to })}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

const OfferCard = memo(OfferCardImpl, (prev, next) => {
  return (
    prev.offer === next.offer &&
    prev.isExpanded === next.isExpanded &&
    prev.from === next.from &&
    prev.to === next.to &&
    prev.cabinClass === next.cabinClass &&
    prev.aviasalesUrl === next.aviasalesUrl
  );
});

export default OfferCard;
