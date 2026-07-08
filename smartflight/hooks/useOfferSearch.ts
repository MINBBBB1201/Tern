"use client";

import { useCallback, useEffect, useState } from "react";
import { isBookableAirline, type Offer } from "../lib/offerUtils";

type UseOfferSearchParams = {
  from: string;
  to: string;
  departureDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
};

export function useOfferSearch({ from, to, departureDate, adults, children, infants, cabinClass }: UseOfferSearchParams) {
  const [results, setResults] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOffers = useCallback(
    async (targetDate: string): Promise<Offer[]> => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: from,
          destination: to,
          departureDate: targetDate,
          adults,
          children,
          infants,
          cabinClass,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ? "Search API failed" : "Search failed");
      return (data?.offers || []) as Offer[];
    },
    [from, to, adults, children, infants, cabinClass]
  );

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the search request on param change; loading/error must reset synchronously before the fetch starts
    setLoading(true);
    setError("");
    fetchOffers(departureDate)
      .then((offers) => {
        if (!active) return;
        setResults(offers.filter((o) => isBookableAirline(o.airline)));
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load real-time flight offers.");
        setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchOffers, departureDate]);

  return { results, loading, error, fetchOffers };
}
