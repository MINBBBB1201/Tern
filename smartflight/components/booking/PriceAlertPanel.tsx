"use client";

import { useTranslations } from "next-intl";
import { type PriceAlert } from "../../lib/offerUtils";
import { PriceDisplay } from "../../lib/PriceDisplay";

type PriceAlertPanelProps = {
  alerts: PriceAlert[];
  alertPrice: string;
  setAlertPrice: (v: string) => void;
  onAddAlert: () => void;
  onDeleteAlert: (id: string) => void;
};

export default function PriceAlertPanel({ alerts, alertPrice, setAlertPrice, onAddAlert, onDeleteAlert }: PriceAlertPanelProps) {
  const t = useTranslations("PriceAlert");
  return (
    <div className="glass-panel mt-4 rounded-[20px] p-5">
      <p className="mb-3 text-sm font-semibold">{t("title")}</p>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder={t("targetPricePlaceholder")}
          value={alertPrice}
          onChange={(e) => setAlertPrice(e.target.value)}
          className="glass-chip flex-1 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={onAddAlert}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          {t("setAlert")}
        </button>
      </div>
      {alerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="glass-chip flex items-center justify-between rounded-xl px-3 py-2 text-xs">
              <span className="data-mono">
                {alert.from} → {alert.to} · {t("target")}{" "}
                <PriceDisplay amount={alert.targetPrice} currency="USD" />{" "}
                · {t("setOn")} {alert.setDate}
              </span>
              <button type="button" onClick={() => onDeleteAlert(alert.id)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
