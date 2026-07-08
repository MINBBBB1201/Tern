"use client";

import { formatMoney, type PriceAlert } from "../../lib/offerUtils";

type PriceAlertPanelProps = {
  alerts: PriceAlert[];
  alertPrice: string;
  setAlertPrice: (v: string) => void;
  onAddAlert: () => void;
  onDeleteAlert: (id: string) => void;
};

export default function PriceAlertPanel({ alerts, alertPrice, setAlertPrice, onAddAlert, onDeleteAlert }: PriceAlertPanelProps) {
  return (
    <div className="glass-panel mt-4 rounded-[20px] p-5">
      <p className="mb-3 text-sm font-semibold">Price alerts</p>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Target price (USD)"
          value={alertPrice}
          onChange={(e) => setAlertPrice(e.target.value)}
          className="flex-1 rounded-xl border border-[#dfe7f2] px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={onAddAlert}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Set alert
        </button>
      </div>
      {alerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between rounded-xl border border-[#edf2fb] bg-[#f8faff] px-3 py-2 text-xs">
              <span className="data-mono">{alert.from} → {alert.to} · target {formatMoney(alert.targetPrice, "USD")} · set {alert.setDate}</span>
              <button type="button" onClick={() => onDeleteAlert(alert.id)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
