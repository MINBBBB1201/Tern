"use client";

import { useTranslations } from "next-intl";
import { CARD_PROGRAM_IDS } from "../../lib/offerUtils";

export default function LoyaltyCardTips() {
  const t = useTranslations("LoyaltyCard");
  return (
    <div className="glass-panel mt-4 rounded-[20px] p-5">
      <p className="mb-3 text-sm font-semibold">{t("title")}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {CARD_PROGRAM_IDS.map((card) => (
          <div key={card.id} className="glass-chip rounded-xl p-3">
            <p className="text-xs font-semibold">{card.program}</p>
            <p className="mt-1 text-xs text-muted">
              {t(`programs.${card.id}.earnRate`)} · {t("transferBonus")} {t(`programs.${card.id}.transferBonus`)}
            </p>
            <p className="mt-1 text-xs text-muted">{t(`programs.${card.id}.note`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
