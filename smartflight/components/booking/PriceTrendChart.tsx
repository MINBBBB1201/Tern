"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { useTranslations } from "next-intl";
import type { PriceTrendPoint } from "../../hooks/usePriceTrend";

type PriceTrendChartProps = {
  priceChartData: PriceTrendPoint[];
  chartLoading: boolean;
  onLoadTrend: () => void;
  cheapestDatePoint: PriceTrendPoint | null;
};

export default function PriceTrendChart({ priceChartData, chartLoading, onLoadTrend, cheapestDatePoint }: PriceTrendChartProps) {
  const t = useTranslations("PriceTrend");
  return (
    <div className="glass-panel mt-6 rounded-[20px] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{t("title")}</p>
          <p className="text-xs text-muted">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={onLoadTrend}
          disabled={chartLoading}
          className="btn-sheen rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:bg-primary/90 transition-colors"
        >
          {chartLoading ? t("loading") : t("load")}
        </button>
      </div>
      {priceChartData.length > 0 && (
        <div>
          {/* Civil-twilight chart palette: contrail line on the dark glass
              panel, axes in dimmed paper, a dark tooltip, and the cheapest
              day marked with the warm horizon accent (the "best" highlight,
              kept off the contrail line so the two never blend). */}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={priceChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" stroke="rgba(143,224,232,0.25)" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "rgba(246,248,251,0.65)" }} />
              <YAxis stroke="rgba(143,224,232,0.25)" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "rgba(246,248,251,0.65)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v: unknown) => [`$${v as number}`, t("tooltipMinFare")]}
                contentStyle={{ fontFamily: "var(--font-mono)", background: "#141F3D", border: "1px solid rgba(143,224,232,0.25)", borderRadius: 12, color: "#F6F8FB" }}
                labelStyle={{ color: "rgba(246,248,251,0.7)" }}
                itemStyle={{ color: "#F6F8FB" }}
                cursor={{ stroke: "rgba(143,224,232,0.3)" }}
              />
              <Line type="monotone" dataKey="price" stroke="var(--contrail-300)" strokeWidth={2} dot={{ r: 3, fill: "var(--contrail-300)" }} activeDot={{ r: 5 }} />
              {cheapestDatePoint && (
                <ReferenceDot x={cheapestDatePoint.date} y={cheapestDatePoint.price} r={6} fill="var(--horizon-500)" stroke="#0A0F1E" strokeWidth={2} label={{ value: t("bestLabel"), position: "top", fontSize: 10, fill: "var(--horizon-500)" }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
