"use client";

import { CARD_PROGRAM_OPTIONS } from "../../lib/offerUtils";

export default function LoyaltyCardTips() {
  return (
    <div className="glass-panel mt-4 rounded-[20px] p-5">
      <p className="mb-3 text-sm font-semibold">Maximize your points</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {CARD_PROGRAM_OPTIONS.map((card) => (
          <div key={card.program} className="rounded-xl border border-[#edf2fb] bg-[#f8faff] p-3">
            <p className="text-xs font-semibold">{card.program}</p>
            <p className="mt-1 text-xs text-muted">{card.earnRate} · Transfer bonus {card.transferBonus}</p>
            <p className="mt-1 text-xs text-muted">{card.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
