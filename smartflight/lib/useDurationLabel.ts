"use client";

import { useTranslations } from "next-intl";
import { parseDurationMinutes } from "./offerUtils";

/**
 * Flight/layover durations in the active locale ("2h 30m" / "2시간 30분" /
 * "2時間30分" / "2小时30分"). The unit letters used to be baked into
 * offerUtils.durationLabel, which left English "h"/"m" on every offer card
 * and layover badge in all four locales.
 */
export function useDurationLabel() {
  const t = useTranslations("Offer");

  /** ISO-8601 duration (Duffel's "PT2H30M") → localized label. */
  const fromIso = (iso?: string) => {
    const mins = parseDurationMinutes(iso);
    if (!Number.isFinite(mins)) return "--";
    return fromMinutes(mins);
  };

  const fromMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = Math.round(mins % 60);
    return hours > 0 ? t("durationHm", { hours, minutes }) : t("durationM", { minutes });
  };

  return { fromIso, fromMinutes };
}
