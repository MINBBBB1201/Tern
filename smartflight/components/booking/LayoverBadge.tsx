"use client";

import { useTranslations } from "next-intl";
import { layoverBetweenSegments } from "../../lib/offerUtils";

type LayoverBadgeProps = {
  arrivingAt?: string;
  nextDepartingAt?: string;
  nextOrigin?: string;
};

/**
 * Connection wait time between two consecutive segments.
 * Render this between segment rows in OfferCard's expanded segment list.
 *
 *  - < 60 min   -> danger  (tight, same tier as computeDelayRiskScore's <55 risk)
 *  - 60–150 min -> success (comfortable)
 *  - > 150 min  -> warning (long wait)
 */
export function LayoverBadge({ arrivingAt, nextDepartingAt, nextOrigin }: LayoverBadgeProps) {
  const t = useTranslations("Offer");
  const minutes = layoverBetweenSegments(arrivingAt, nextDepartingAt);
  if (!minutes) return null;

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const colorClass =
    minutes < 60 ? "text-danger-strong" : minutes <= 150 ? "text-success-strong" : "text-warning-strong";

  return (
    <div className={`glass-chip data-mono flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${colorClass}`}>
      <span className="font-semibold">{label} {t("layover")}</span>
      {nextOrigin && <span className="text-muted">{t("layoverAt", { airport: nextOrigin })}</span>}
    </div>
  );
}

