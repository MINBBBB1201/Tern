"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import AmbientScene from "./AmbientScene";

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
 * Gating mirrors HeroSceneTern: prefers-reduced-motion or a low-core
 * device skips WebGL entirely; narrow viewports run a lighter scene.
 */
export default function GlobalCanvasInner() {
  const [mode] = useState<"off" | "lite" | "full">(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
    if ((navigator.hardwareConcurrency ?? 8) <= 4) return "off";
    return window.innerWidth < 768 ? "lite" : "full";
  });

  if (mode === "off") return null;

  return (
    <>
      {/* Full-viewport ambient view — the default backdrop scene */}
      <View
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
      >
        <AmbientScene lite={mode === "lite"} />
      </View>

      <Canvas
        aria-hidden="true"
        frameloop="always"
        flat
        dpr={mode === "lite" ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
      >
        <View.Port />
      </Canvas>
    </>
  );
}
