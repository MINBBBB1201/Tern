/**
 * Currency conversion for DISPLAY purposes only.
 *
 * Duffel's offer prices are fixed to our organization's billing currency
 * (confirmed via Duffel's own docs: "It will match your organisation's
 * billing currency" — there's no per-end-user currency negotiation at
 * the offer stage). So every price Tern receives is in one currency
 * (USD) regardless of the traveler's locale. This module converts that
 * for display only — the actual charge still happens in the original
 * currency at checkout (Duffel hosted checkout or book.flytern.site),
 * which is why every place this is used must show the original price
 * too, not replace it silently.
 *
 * Rate source: Frankfurter (api.frankfurter.dev), free, no API key, no
 * signup, no rate limit for normal use, open source, aggregates ECB and
 * other provider data. Confirmed by direct fetch during development —
 * the v2/rates endpoint's `quotes` filter parameter didn't reliably
 * narrow results in testing, so this fetches the full rate list and
 * filters in code instead of depending on that parameter.
 */

export type FxRates = {
  base: string;
  date: string;
  rates: Record<string, number>;
};

let cachedRates: { data: FxRates; fetchedAt: number } | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 hour — Frankfurter's underlying data updates once a day anyway

export async function getFxRates(): Promise<FxRates | null> {
  if (cachedRates && Date.now() - cachedRates.fetchedAt < CACHE_MS) {
    return cachedRates.data;
  }

  try {
    const res = await fetch("https://api.frankfurter.dev/v2/rates?base=USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return cachedRates?.data ?? null;

    const raw: { date: string; base: string; quote: string; rate: number }[] = await res.json();
    if (!Array.isArray(raw) || raw.length === 0) return cachedRates?.data ?? null;

    const rates: Record<string, number> = { USD: 1 };
    let date = "";
    for (const row of raw) {
      rates[row.quote] = row.rate;
      date = row.date;
    }

    const data: FxRates = { base: "USD", date, rates };
    cachedRates = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    return cachedRates?.data ?? null;
  }
}

/** Locale -> default display currency. A heuristic (locale isn't the same as country), not a user preference system. */
export const LOCALE_CURRENCY: Record<string, string> = {
  en: "USD",
  ko: "KRW",
  ja: "JPY",
  zh: "CNY",
};

/**
 * Converts between any two currencies using the USD-based rate table.
 * amountFromCurrency -> USD -> amountToCurrency. Returns null if either
 * currency isn't in the rate table (e.g. Frankfurter doesn't cover it).
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: FxRates
): number | null {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = fromCurrency === "USD" ? 1 : rates.rates[fromCurrency];
  const toRate = toCurrency === "USD" ? 1 : rates.rates[toCurrency];
  if (!fromRate || !toRate) return null;

  const amountUsd = amount / fromRate;
  return amountUsd * toRate;
}
