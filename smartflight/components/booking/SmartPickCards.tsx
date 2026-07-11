"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useHoverTilt } from "../../hooks/useHoverTilt";
import { formatMoney, type Offer, type SortTab } from "../../lib/offerUtils";

gsap.registerPlugin(useGSAP);

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
  const gridRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("SmartPicks");

  // Mounts when offers arrive (after page-level ScrollFX has run), so the
  // entrance is owned here. Wrappers animate, not the buttons — tilt-card
  // has its own hover transform. Fast and subtle: these cards are the
  // scan-first summary row, motion must never delay reading them.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(gsap.utils.toArray("[data-pick-wrap]"), {
          autoAlpha: 0,
          y: 14,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.04,
        });
      });
    },
    { scope: gridRef, dependencies: [!!smartPicks] }
  );

  if (!smartPicks) return null;

  const smartPickCards = [
    { key: "cheap", label: t("cheapestLabel"), sub: t("cheapestSub"), offer: smartPicks.cheapest, sort: "price" as SortTab },
    { key: "fast", label: t("fastestLabel"), sub: t("fastestSub"), offer: smartPicks.fastest, sort: "duration" as SortTab },
    { key: "early", label: t("earliestLabel"), sub: t("earliestSub"), offer: smartPicks.earliestArr, sort: "arrival" as SortTab },
    { key: "ai", label: t("aiLabel"), sub: t("aiSub"), offer: smartPicks.ai, sort: "ai" as SortTab },
    ...(smartPicks.bestConnection
      ? [{ key: "conn", label: t("connectionLabel"), sub: t("connectionSub"), offer: smartPicks.bestConnection, sort: "connecting_value" as SortTab }]
      : []),
    { key: "safe", label: t("safestLabel"), sub: t("safestSub"), offer: smartPicks.safest, sort: "delay_low" as SortTab },
  ];

  if (smartPickCards.length === 0) return null;

  return (
    <div ref={gridRef} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {smartPickCards.map((card) => (
        <div data-pick-wrap className="h-full" key={card.key}>
          <SmartPickCard card={card} onPick={onPick} />
        </div>
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
      className="glass-panel tilt-card h-full w-full rounded-2xl p-3 text-left hover:shadow-md hover:border-[var(--contrail-300)]"
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
