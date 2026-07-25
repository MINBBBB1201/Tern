"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { Offer } from "../lib/offerUtils";
import { localeTag } from "../i18n/locales";

export type PriceTrendPoint = {
  date: string;
  price: number;
  fullDate: string;
  isSelected: boolean;
};

export function usePriceTrend(departureDate: string, fetchOffers: (targetDate: string) => Promise<Offer[]>) {
  const [priceChartData, setPriceChartData] = useState<PriceTrendPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const tag = localeTag(useLocale());

  const loadTrend = async () => {
    setChartLoading(true);
    const chartData: PriceTrendPoint[] = [];
    const selectedDate = new Date(departureDate);
    try {
      for (let i = -5; i <= 5; i++) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const offers = await fetchOffers(dateStr);
        if (offers.length > 0) {
          const minPrice = Math.min(...offers.map((o) => Number(o.price)));
          chartData.push({
            date: d.toLocaleDateString(tag, { month: "short", day: "numeric" }),
            price: minPrice,
            fullDate: dateStr,
            isSelected: dateStr === departureDate,
          });
        }
      }
      setPriceChartData(chartData);
    } finally {
      setChartLoading(false);
    }
  };

  const cheapestDatePoint = useMemo<PriceTrendPoint | null>(
    () =>
      priceChartData.length > 0
        ? priceChartData.reduce((min, curr) => (Number(curr.price) < Number(min.price) ? curr : min))
        : null,
    [priceChartData]
  );

  return { priceChartData, chartLoading, loadTrend, cheapestDatePoint };
}
