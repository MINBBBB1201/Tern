"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { LOCALE_CURRENCY, convertCurrency, type FxRates } from "./currency";

export function useDisplayCurrency() {
  const locale = useLocale();
  const displayCurrency = LOCALE_CURRENCY[locale] || "USD";
  const [rates, setRates] = useState<FxRates | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fx")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setRates(data);
      })
      .catch(() => {
        if (!cancelled) setRates(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Converts an amount from its original currency to the locale's display currency. Returns null if unavailable (missing rates, or display currency == original currency). */
  const convert = (amount: number, fromCurrency: string): number | null => {
    if (!rates || fromCurrency === displayCurrency) return null;
    return convertCurrency(amount, fromCurrency, displayCurrency, rates);
  };

  return { displayCurrency, convert, ratesLoaded: !!rates };
}
