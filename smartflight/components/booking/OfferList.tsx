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
  aviasalesUrl: string | null;
};

export default function OfferList({ offers, from, to, cabinClass, cheapestDirect, cheapestConnecting, onSelectOffer, aviasalesUrl }: OfferListProps) {
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  if (offers.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {/* Cheapest direct / connecting callouts */}
      {(cheapestDirect || cheapestConnecting) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {cheapestDirect && (
            <span className="rounded-full bg-primary-subtle px-3 py-1 text-primary-hover font-medium">
              Cheapest non-stop: {formatMoney(Number(cheapestDirect.price), cheapestDirect.currency)}
            </span>
          )}
          {cheapestConnecting && (
            <span className="rounded-full bg-success-subtle px-3 py-1 text-success-strong font-medium">
              Cheapest with stops: {formatMoney(Number(cheapestConnecting.price), cheapestConnecting.currency)}
            </span>
          )}
        </div>
      )}

      {/* Affiliate disclosure — must precede the per-card Aviasales links */}
      {aviasalesUrl && (
        <p className="text-xs text-muted">
          &ldquo;Compare on Aviasales&rdquo; links are affiliate links: they open an Aviasales
          search for your route and dates, and Tern may earn a commission at no extra cost to you.
        </p>
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
