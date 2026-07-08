"use client";

import { useHoverTilt } from "../../hooks/useHoverTilt";
import { formatMoney, type Offer, type SortTab } from "../../lib/offerUtils";

type SmartPicks = {
  cheapest: Offer;
  fastest: Offer;
  earliestArr: Offer;
  ai: Offer;
  bestConnection: Offer | null;
  safest: Offer;
  delayWatch: Offer;
} | null;

type SmartPickCardsProps = {
  smartPicks: SmartPicks;
  onPick: (sort: SortTab, offer: Offer) => void;
};

export default function SmartPickCards({ smartPicks, onPick }: SmartPickCardsProps) {
  if (!smartPicks) return null;

  const smartPickCards = [
    { key: "cheap", label: "Cheapest", sub: "Lowest fare in view", offer: smartPicks.cheapest, sort: "price" as SortTab },
    { key: "fast", label: "Fastest", sub: "Shortest travel time", offer: smartPicks.fastest, sort: "duration" as SortTab },
    { key: "early", label: "Earliest arrival", sub: "First to land locally", offer: smartPicks.earliestArr, sort: "arrival" as SortTab },
    { key: "ai", label: "AI pick", sub: "Balanced price & time", offer: smartPicks.ai, sort: "ai" as SortTab },
    ...(smartPicks.bestConnection
      ? [{ key: "conn", label: "Best connection deal", sub: "Great value with stops", offer: smartPicks.bestConnection, sort: "connecting_value" as SortTab }]
      : []),
    { key: "safe", label: "Lowest delay risk", sub: "Heuristic schedule stability", offer: smartPicks.safest, sort: "delay_low" as SortTab },
  ];

  if (smartPickCards.length === 0) return null;

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {smartPickCards.map((card) => (
        <SmartPickCard key={card.key} card={card} onPick={onPick} />
      ))}
    </div>
  );
}

type SmartPickCardProps = {
  card: { label: string; sub: string; offer: Offer | null; sort: SortTab };
  onPick: (sort: SortTab, offer: Offer) => void;
};

function SmartPickCard({ card, onPick }: SmartPickCardProps) {
  const tilt = useHoverTilt<HTMLButtonElement>(3);

  return (
    <button
      type="button"
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onClick={() => card.offer && onPick(card.sort, card.offer)}
      className="glass-panel tilt-card rounded-2xl p-3 text-left hover:shadow-md hover:border-[var(--contrail-300)]"
    >
      {/* primary-hover, not primary: 12px text on glass needs ≥4.5:1 (primary is 4.42) */}
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-hover">{card.label}</p>
      <p className="mt-0.5 text-xs text-muted">{card.sub}</p>
      {card.offer && (
        <p className="data-mono mt-1.5 text-base font-bold text-foreground">
          {formatMoney(Number(card.offer.price), card.offer.currency)}
        </p>
      )}
    </button>
  );
}
