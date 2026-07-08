"use client";

import { useState } from "react";
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
};

export default function OfferList({ offers, from, to, cabinClass, cheapestDirect, cheapestConnecting, onSelectOffer }: OfferListProps) {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  if (offers.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {/* Cheapest direct / connecting callouts */}
      {(cheapestDirect || cheapestConnecting) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {cheapestDirect && (
            <span className="rounded-full bg-[#eff5ff] px-3 py-1 text-primary font-medium">
              Cheapest non-stop: {formatMoney(Number(cheapestDirect.price), cheapestDirect.currency)}
            </span>
          )}
          {cheapestConnecting && (
            <span className="rounded-full bg-[#f5fff8] px-3 py-1 text-green-700 font-medium">
              Cheapest with stops: {formatMoney(Number(cheapestConnecting.price), cheapestConnecting.currency)}
            </span>
          )}
        </div>
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
        />
      ))}
    </div>
  );
}
