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
import type { PriceTrendPoint } from "../../hooks/usePriceTrend";

type PriceTrendChartProps = {
  priceChartData: PriceTrendPoint[];
  chartLoading: boolean;
  onLoadTrend: () => void;
  cheapestDatePoint: PriceTrendPoint | null;
};

export default function PriceTrendChart({ priceChartData, chartLoading, onLoadTrend, cheapestDatePoint }: PriceTrendChartProps) {
  return (
    <div className="glass-panel mt-6 rounded-[20px] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Price trend (±5 days)</p>
          <p className="text-xs text-muted">Compare fares around your travel date</p>
        </div>
        <button
          type="button"
          onClick={onLoadTrend}
          disabled={chartLoading}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 hover:bg-primary/90 transition-colors"
        >
          {chartLoading ? "Loading…" : "Load trend"}
        </button>
      </div>
      {priceChartData.length > 0 && (
        <div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={priceChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: unknown) => [`$${v as number}`, "Min fare"]} contentStyle={{ fontFamily: "var(--font-mono)" }} />
              <Line type="monotone" dataKey="price" stroke="var(--signal-600)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              {cheapestDatePoint && (
                <ReferenceDot x={cheapestDatePoint.date} y={cheapestDatePoint.price} r={6} fill="var(--contrail-300)" stroke="white" strokeWidth={2} label={{ value: "Best", position: "top", fontSize: 10 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
