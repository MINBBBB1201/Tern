"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatMoney, PROGRAM_GROUPS, type SortTab } from "../../lib/offerUtils";

type PanelKey = "airlines" | "stops" | "times" | "programs";

type FiltersBarProps = {
  sortTab: SortTab;
  setSortTab: (tab: SortTab) => void;
  stopsFilter: "all" | "0" | "1" | "2";
  setStopsFilter: (v: "all" | "0" | "1" | "2") => void;
  priceCeiling: number;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  selectedAirlines: string[];
  setSelectedAirlines: (v: string[] | ((prev: string[]) => string[])) => void;
  selectedPrograms: string[];
  setSelectedPrograms: (v: string[] | ((prev: string[]) => string[])) => void;
  depWindow: [number, number];
  setDepWindow: (v: [number, number]) => void;
  arrWindow: [number, number];
  setArrWindow: (v: [number, number]) => void;
  loyaltyFilterOn: boolean;
  setLoyaltyFilterOn: (v: boolean) => void;
  connectingOnly: boolean;
  setConnectingOnly: (v: boolean) => void;
  uniqueAirlines: string[];
};

export default function FiltersBar({
  sortTab,
  setSortTab,
  stopsFilter,
  setStopsFilter,
  priceCeiling,
  maxPrice,
  setMaxPrice,
  selectedAirlines,
  setSelectedAirlines,
  selectedPrograms,
  setSelectedPrograms,
  depWindow,
  setDepWindow,
  arrWindow,
  setArrWindow,
  loyaltyFilterOn,
  setLoyaltyFilterOn,
  connectingOnly,
  setConnectingOnly,
  uniqueAirlines,
}: FiltersBarProps) {
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null);
  const togglePanel = (panel: PanelKey) => setOpenPanel((v) => (v === panel ? null : panel));
  const t = useTranslations("Filters");

  return (
    <>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => togglePanel("airlines")} className="glass-chip rounded-full px-4 py-2 text-sm font-medium">{t("airlines")}</button>
          <button type="button" onClick={() => togglePanel("stops")} className="glass-chip rounded-full px-4 py-2 text-sm font-medium">{t("stops")}</button>
          <button type="button" onClick={() => togglePanel("times")} className="glass-chip rounded-full px-4 py-2 text-sm font-medium">{t("times")}</button>
          <button type="button" onClick={() => togglePanel("programs")} className="glass-chip rounded-full px-4 py-2 text-sm font-medium">{t("programs")}</button>
          <label className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${loyaltyFilterOn ? "border-[var(--contrail-300)] bg-[color-mix(in_srgb,var(--contrail-300)_12%,white)]" : "glass-chip"}`}>
            <input type="checkbox" checked={loyaltyFilterOn} onChange={(e) => setLoyaltyFilterOn(e.target.checked)} className="rounded border-gray-300" />
            {t("matchAlliance")}
          </label>
          <label className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${connectingOnly ? "border-[var(--contrail-300)] bg-[color-mix(in_srgb,var(--contrail-300)_12%,white)]" : "glass-chip"}`}>
            <input type="checkbox" checked={connectingOnly} onChange={(e) => setConnectingOnly(e.target.checked)} className="rounded border-gray-300" />
            {t("connectingOnly")}
          </label>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t("sortLabel")}</span>
            <select value={sortTab} onChange={(e) => setSortTab(e.target.value as SortTab)} className="glass-chip rounded-full px-3 py-2 text-sm">
              <option value="duration">{t("sortFastest")}</option>
              <option value="price">{t("sortCheapest")}</option>
              <option value="arrival">{t("sortArrival")}</option>
              <option value="ai">{t("sortAI")}</option>
              <option value="connecting_value">{t("sortConnecting")}</option>
              <option value="delay_low">{t("sortDelayLow")}</option>
            </select>
          </div>
        </div>

        {openPanel === "airlines" && (
          <div className="glass-panel absolute left-0 z-20 mt-2 w-72 rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">{t("selectAirlines")}</p>
              <button className="text-xs text-muted" onClick={() => setSelectedAirlines([])}>{t("reset")}</button>
            </div>
            <div className="max-h-60 space-y-1 overflow-auto pr-1">
              {uniqueAirlines.map((name) => {
                const checked = selectedAirlines.includes(name);
                return (
                  <label
                    key={name}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedAirlines((prev) =>
                          checked ? prev.filter((a) => a !== name) : [...prev, name]
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    {name}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {openPanel === "stops" && (
          <div className="glass-panel absolute left-0 z-20 mt-2 w-56 rounded-2xl p-3">
            <p className="mb-2 text-sm font-semibold">{t("maxStops")}</p>
            {(["all", "0", "1", "2"] as const).map((v) => (
              <label key={v} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                <input
                  type="radio"
                  name="stops"
                  checked={stopsFilter === v}
                  onChange={() => setStopsFilter(v)}
                  className="border-gray-300"
                />
                {v === "all" ? t("stopsAny") : v === "0" ? t("stopsNone") : v === "1" ? t("stopsUpTo1") : t("stopsUpTo2")}
              </label>
            ))}
          </div>
        )}

        {openPanel === "times" && (
          <div className="glass-panel absolute left-0 z-20 mt-2 w-72 rounded-2xl p-4">
            <p className="mb-3 text-sm font-semibold">{t("timesTitle")}</p>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-muted">{t("departure")}: {Math.floor(depWindow[0] / 60).toString().padStart(2, "0")}:{(depWindow[0] % 60).toString().padStart(2, "0")} – {Math.floor(depWindow[1] / 60).toString().padStart(2, "0")}:{(depWindow[1] % 60).toString().padStart(2, "0")}</p>
                <input type="range" min={0} max={1439} value={depWindow[0]} onChange={(e) => setDepWindow([Number(e.target.value), depWindow[1]])} className="brand-range w-full" />
                <input type="range" min={0} max={1439} value={depWindow[1]} onChange={(e) => setDepWindow([depWindow[0], Number(e.target.value)])} className="brand-range w-full" />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">{t("arrival")}: {Math.floor(arrWindow[0] / 60).toString().padStart(2, "0")}:{(arrWindow[0] % 60).toString().padStart(2, "0")} – {Math.floor(arrWindow[1] / 60).toString().padStart(2, "0")}:{(arrWindow[1] % 60).toString().padStart(2, "0")}</p>
                <input type="range" min={0} max={1439} value={arrWindow[0]} onChange={(e) => setArrWindow([Number(e.target.value), arrWindow[1]])} className="brand-range w-full" />
                <input type="range" min={0} max={1439} value={arrWindow[1]} onChange={(e) => setArrWindow([arrWindow[0], Number(e.target.value)])} className="brand-range w-full" />
              </div>
            </div>
          </div>
        )}

        {openPanel === "programs" && (
          <div className="glass-panel absolute left-0 z-20 mt-2 w-64 rounded-2xl p-3">
            <p className="mb-2 text-sm font-semibold">{t("loyaltyPrograms")}</p>
            {PROGRAM_GROUPS.map((pg) => {
              const checked = selectedPrograms.includes(pg);
              return (
                <label key={pg} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedPrograms((prev) =>
                        checked ? prev.filter((p) => p !== pg) : [...prev, pg]
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  {pg}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price slider */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-muted whitespace-nowrap">{t("maxPrice")}</span>
        <input
          type="range"
          min={100}
          max={priceCeiling}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="brand-range flex-1"
        />
        <span className="data-mono text-xs font-semibold text-foreground whitespace-nowrap">{formatMoney(maxPrice, "USD")}</span>
      </div>
    </>
  );
}
