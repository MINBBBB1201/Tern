"use client";

import { useCallback, useMemo, useState } from "react";
import {
  arrivalTimestamp,
  computeDelayRiskScore,
  loyaltyAllianceMatch,
  type Offer,
  parseDurationMinutes,
  resolvesProgramMatch,
  scoreOffer,
  toMinutes,
  type SortTab,
} from "../lib/offerUtils";

export function useOfferFilters(results: Offer[]) {
  const [sortTab, setSortTab] = useState<SortTab>("duration");

  const [stopsFilter, setStopsFilter] = useState<"all" | "0" | "1" | "2">("all");
  const [priceCeiling, setPriceCeiling] = useState<number>(3000);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [depWindow, setDepWindow] = useState<[number, number]>([0, 1439]);
  const [arrWindow, setArrWindow] = useState<[number, number]>([0, 1439]);
  const [loyaltyFilterOn, setLoyaltyFilterOn] = useState(false);
  const [connectingOnly, setConnectingOnly] = useState(false);

  const resetMaxPriceFor = useCallback((offers: Offer[]) => {
    const highest = offers.length > 0 ? Math.max(...offers.map((o) => Number(o.price))) : 3000;
    const rounded = Math.max(300, Math.ceil(highest / 100) * 100);
    setPriceCeiling(rounded);
    setMaxPrice(rounded);
  }, []);

  const uniqueAirlines = useMemo(() => {
    return Array.from(new Set(results.map((r) => r.airline).filter(Boolean) as string[]));
  }, [results]);

  const baseFiltered = useMemo(() => {
    let data = [...results];

    if (stopsFilter !== "all") {
      const maxStops = Number(stopsFilter);
      data = data.filter((o) => (o.stops ?? 0) <= maxStops);
    }

    data = data.filter((o) => Number(o.price) <= maxPrice);

    if (selectedAirlines.length > 0) {
      data = data.filter((o) => selectedAirlines.includes(o.airline || ""));
    }

    data = data.filter((o) => resolvesProgramMatch(o, selectedPrograms));
    if (loyaltyFilterOn) {
      data = data.filter((o) => loyaltyAllianceMatch(o));
    }

    if (connectingOnly) {
      data = data.filter((o) => (o.stops ?? 0) > 0);
    }

    data = data.filter((o) => {
      const dep = toMinutes(o.departure);
      const arr = toMinutes(o.arrival);
      if (dep < 0 || arr < 0) return true;
      return dep >= depWindow[0] && dep <= depWindow[1] && arr >= arrWindow[0] && arr <= arrWindow[1];
    });

    return data;
  }, [
    results,
    stopsFilter,
    maxPrice,
    selectedAirlines,
    selectedPrograms,
    depWindow,
    arrWindow,
    loyaltyFilterOn,
    connectingOnly,
  ]);

  const smartPicks = useMemo(() => {
    const pool = baseFiltered;
    if (pool.length === 0) return null;
    const cheapest = pool.reduce((m, c) => (!m || Number(c.price) < Number(m.price) ? c : m));
    const fastest = pool.reduce((m, c) =>
      !m || parseDurationMinutes(c.duration) < parseDurationMinutes(m.duration) ? c : m
    );
    const earliestArr = pool.reduce((m, c) =>
      !m || arrivalTimestamp(c.arrival) < arrivalTimestamp(m.arrival) ? c : m
    );
    const ai = pool.reduce((m, c) => (!m || scoreOffer(c) < scoreOffer(m) ? c : m));
    const connectingPool = pool.filter((o) => (o.stops ?? 0) > 0);
    const bestConnection =
      connectingPool.length > 0
        ? connectingPool.reduce((m, c) => (!m || Number(c.price) < Number(m.price) ? c : m))
        : null;
    const safest = pool.reduce((m, c) =>
      !m || computeDelayRiskScore(c) < computeDelayRiskScore(m) ? c : m
    );
    const delayWatch = pool.reduce((m, c) =>
      !m || computeDelayRiskScore(c) > computeDelayRiskScore(m) ? c : m
    );
    return { cheapest, fastest, earliestArr, ai, bestConnection, safest, delayWatch };
  }, [baseFiltered]);

  const filteredSortedOffers = useMemo(() => {
    let data = [...baseFiltered];

    if (sortTab === "price") {
      data.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortTab === "duration") {
      data.sort((a, b) => parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration));
    } else if (sortTab === "arrival") {
      data.sort((a, b) => arrivalTimestamp(a.arrival) - arrivalTimestamp(b.arrival));
    } else if (sortTab === "ai") {
      data.sort((a, b) => scoreOffer(a) - scoreOffer(b));
    } else if (sortTab === "delay_low") {
      data.sort((a, b) => computeDelayRiskScore(a) - computeDelayRiskScore(b));
    } else if (sortTab === "delay_high") {
      data.sort((a, b) => computeDelayRiskScore(b) - computeDelayRiskScore(a));
    } else if (sortTab === "connecting_value") {
      data = data.filter((o) => (o.stops ?? 0) > 0);
      data.sort((a, b) => Number(a.price) - Number(b.price));
    }

    return data;
  }, [baseFiltered, sortTab]);

  const cheapestDirect = filteredSortedOffers
    .filter((o) => (o.stops ?? 0) === 0)
    .reduce<Offer | null>((min, cur) => (!min || Number(cur.price) < Number(min.price) ? cur : min), null);

  const cheapestConnecting = filteredSortedOffers
    .filter((o) => (o.stops ?? 0) > 0)
    .reduce<Offer | null>((min, cur) => (!min || Number(cur.price) < Number(min.price) ? cur : min), null);

  return {
    sortTab,
    setSortTab,
    stopsFilter,
    setStopsFilter,
    priceCeiling,
    maxPrice,
    setMaxPrice,
    selectedAirlines,
    setSelectedAirlines,
    selectedPrograms,
    setSelectedPrograms,
    depWindow,
    setDepWindow,
    arrWindow,
    setArrWindow,
    loyaltyFilterOn,
    setLoyaltyFilterOn,
    connectingOnly,
    setConnectingOnly,
    resetMaxPriceFor,
    uniqueAirlines,
    baseFiltered,
    smartPicks,
    filteredSortedOffers,
    cheapestDirect,
    cheapestConnecting,
  };
}
