"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatMoney, type Offer } from "../../lib/offerUtils";
import OfferCard from "./OfferCard";

type OfferListProps = {
  offers: Offer[];
  from: string;
  to: string;
  cabinClass: string;
  cheapestDirect: Offer | null;
  cheapestConnecting: Offer | null;
  onSelectOffer: (offer: Offer) => void;
  aviasalesUrl: string | null;
};

export default function OfferList({ offers, from, to, cabinClass, cheapestDirect, cheapestConnecting, onSelectOffer, aviasalesUrl }: OfferListProps) {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const t = useTranslations("Filters");

  if (offers.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {/* Cheapest direct / connecting callouts */}
      {(cheapestDirect || cheapestConnecting) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {cheapestDirect && (
            <span className="rounded-full bg-primary-subtle px-3 py-1 text-primary-hover font-medium">
              {t("cheapestNonStop", { price: formatMoney(Number(cheapestDirect.price), cheapestDirect.currency) })}
            </span>
          )}
          {cheapestConnecting && (
            <span className="rounded-full bg-success-subtle px-3 py-1 text-success-strong font-medium">
              {t("cheapestWithStops", { price: formatMoney(Number(cheapestConnecting.price), cheapestConnecting.currency) })}
            </span>
          )}
        </div>
      )}

      {/* Commission disclosure — must precede the per-card booking links */}
      {aviasalesUrl && (
        <p className="text-xs text-muted">{t("bookRouteDisclosure")}</p>
      )}

      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isExpanded={expandedOfferId === offer.id}
          onToggleExpand={() => setExpandedOfferId((cur) => (cur === offer.id ? null : offer.id))}
          onSelect={() => onSelectOffer(offer)}
          from={from}
          to={to}
          cabinClass={cabinClass}
          aviasalesUrl={aviasalesUrl}
        />
      ))}
    </div>
  );
}
