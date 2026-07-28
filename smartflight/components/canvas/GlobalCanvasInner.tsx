"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View, PerformanceMonitor } from "@react-three/drei";
import AmbientScene from "./AmbientScene";
import { degradeQuality, floorQuality, reportMonitor, useQuality } from "./quality";

/**
 * Site-wide persistent WebGL layer (single context for every 3D scene).
 *
 * Scenes are declared as drei <View>s wherever they belong in the DOM
 * (this file owns the full-viewport ambient view; pages add their own),
 * and all of them render through <View.Port /> inside this one canvas.
 *
 * Stacking: sections paint opaque backgrounds, so a z-index of -1 would
 * never be visible. The canvas instead follows the .ambient-drift
 * convention from globals.css — fixed, z-index 1 (one below the drift
 * grain at 2), pointer-events: none — atmosphere above section fills,
 * beneath nav and hero content.
 *
 * Gating: prefers-reduced-motion still skips WebGL entirely (a stated user
 * preference, not a performance guess). Everything else — including phones,
 * which previously got a hard `innerWidth < 768` downgrade and never saw
 * the globe — starts at full quality and is demoted only if the device
 * fails to keep up. See quality.ts for why the old static gates went.
 */
export default function GlobalCanvasInner() {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const quality = useQuality();

  if (reduced) return null;

  return (
    <>
      {/* Full-viewport ambient view — the default backdrop scene */}
      <View
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
      >
        <AmbientScene lite={quality !== "full"} />
      </View>

      <Canvas
        aria-hidden="true"
        frameloop="always"
        flat
        /* Cap 1.5 rather than 2: at 390x844 the drop from dpr 2 to 1.5 is
           44% fewer fragments and measured 24 -> 29.9fps under a 4x CPU
           throttle, for no visible loss on the globe (I6-b2). "lite" halves
           it again. */
        dpr={quality === "full" ? [1, 1.5] : 1}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
      >
        {/* Frame-time governor.
            Lower bound: a pure fraction of the refresh rate is wrong on a
            high-refresh panel — at 120Hz, 0.7 demands 84fps and would demote
            a phone rendering a perfectly smooth 60. So it is capped in
            absolute fps: keep up with the display, but 45 is good enough
            whatever the panel claims.
            Upper bound is deliberately unreachable. The ladder is one-way
            (quality.ts), so inclining is pointless — and it is actively
            harmful: with a reachable upper bound a healthy 60fps sits just
            above it, inclines, dips back, and two of those flip-flops fire
            onFallback. That measured as a 60fps phone demoting itself all the
            way to static (I6-b2). No incline, no flip-flop.
            onFallback stays wired as a floor for a device that truly cannot
            hold a frame. */}
        <PerformanceMonitor
          bounds={(refreshrate) => [Math.min(refreshrate * 0.7, 45), refreshrate * 2]}
          flipflops={3}
          onChange={({ fps, refreshrate, factor }) => reportMonitor({ fps, refreshrate, factor })}
          onDecline={() => degradeQuality()}
          onFallback={() => floorQuality()}
        />
        <View.Port />
      </Canvas>
    </>
  );
}
