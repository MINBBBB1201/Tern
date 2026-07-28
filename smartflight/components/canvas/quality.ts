"use client";
import { useSyncExternalStore } from "react";

/**
 * Runtime render-quality tier, driven by measured frame time.
 *
 * Replaces the old static gates (`innerWidth < 768`, `hardwareConcurrency
 * <= 4`). Both were poor proxies: viewport width is a layout signal, and
 * logical core count says nothing about GPU or thermal headroom — a budget
 * 8-core Android passed while a high-end iPhone reporting 4 was refused.
 * drei's PerformanceMonitor measures what actually matters, so the device
 * earns its tier instead of being profiled by a guess.
 *
 * Ladder (each step is backed by an I6-b2 measurement at CPU 4x throttle,
 * 390x844 — see docs/backlog.md):
 *   full   — hero globe + 140 ambient motes, dpr cap 1.5
 *   lite   — hero globe + 60 motes, dpr 1.0   (~55% fewer pixels: 24→30fps)
 *   static — hero falls back to the boarding-pass card, globe unmounts
 *            (dropping the globe was the largest single step: 24→40fps)
 *
 * Degradation is ONE-WAY on purpose. Re-upgrading after a recovery invites
 * oscillation — the globe mounting is itself expensive enough to re-trigger
 * a decline, which would flip the hero between two visual states while the
 * user watches it. A tier lost stays lost for the page's lifetime.
 */
export type Quality = "full" | "lite" | "static";

const ORDER: Quality[] = ["full", "lite", "static"];

let current: Quality = "full";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getQuality(): Quality {
  return current;
}

/** Step down one tier. No-op at "static" (and never steps back up). */
export function degradeQuality(): Quality {
  const next = ORDER[Math.min(ORDER.indexOf(current) + 1, ORDER.length - 1)];
  if (next !== current) {
    current = next;
    emit();
  }
  return current;
}

/** Drop straight to the floor — used by PerformanceMonitor's onFallback. */
export function floorQuality(): Quality {
  if (current !== "static") {
    current = "static";
    emit();
  }
  return current;
}

/** Test seam: probes drive the ladder directly to verify the fallback path. */
export function __setQuality(q: Quality) {
  if (q !== current) {
    current = q;
    emit();
  }
}

export function useQuality(): Quality {
  return useSyncExternalStore(subscribe, getQuality, () => "full" as const);
}

/** Last frame-governor reading, for the verification probe only. */
export type MonitorSnapshot = { fps: number; refreshrate: number; factor: number };
let lastMonitor: MonitorSnapshot | null = null;
export function reportMonitor(s: MonitorSnapshot) {
  lastMonitor = s;
}

if (typeof window !== "undefined") {
  // Verification hook (see scripts/i6b-fallback-verify.mjs). Reading the tier
  // from the DOM is not enough — the probe also needs to force one, and to
  // see the fps/refreshrate the governor is actually judging against.
  (window as unknown as Record<string, unknown>).__ternQuality = {
    get: getQuality,
    set: __setQuality,
    degrade: degradeQuality,
    monitor: () => lastMonitor,
  };
}
