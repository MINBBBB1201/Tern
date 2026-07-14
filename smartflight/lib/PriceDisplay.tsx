"use client";

import { useTranslations } from "next-intl";
import { formatMoney } from "./offerUtils";
import { useDisplayCurrency } from "./useDisplayCurrency";

type PriceDisplayProps = {
  amount: number;
  currency: string;
  /** Tailwind classes for the primary (large) price. */
  primaryClassName?: string;
  /** Tailwind classes for the secondary (original-currency) note. */
  secondaryClassName?: string;
};

/**
 * Shows a converted price in the user's locale-implied currency, with the
 * ORIGINAL price always shown too (smaller, secondary) — the converted
 * number is informational only; the actual charge happens in the
 * original currency at checkout (Duffel hosted checkout or
 * book.flytern.site), which may also move independently before payment.
 */
export function PriceDisplay({ amount, currency, primaryClassName, secondaryClassName }: PriceDisplayProps) {
  const t = useTranslations("Offer");
  const { displayCurrency, convert, ratesLoaded } = useDisplayCurrency();
  const converted = ratesLoaded ? convert(amount, currency) : null;

  if (converted == null) {
    // No conversion available (rates not loaded yet, same currency, or
    // this currency isn't in Frankfurter's table) — just show the
    // original, no secondary line.
    return <span className={primaryClassName}>{formatMoney(amount, currency)}</span>;
  }

  return (
    <span>
      <span className={primaryClassName}>{formatMoney(converted, displayCurrency)}</span>
      <span className={secondaryClassName ?? "ml-1.5 text-xs font-normal text-muted"}>
        {t("approxChargedIn", { price: formatMoney(amount, currency) })}
      </span>
    </span>
  );
}
