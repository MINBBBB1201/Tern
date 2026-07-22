"use client";

import { useCallback } from "react";

/**
 * Cursor-tracked perspective tilt for cards — a hint of the hero's 3D object
 * language, not a scene. Mutates the element's style directly so mousemove
 * never re-renders. No-ops entirely under prefers-reduced-motion (matchMedia
 * is checked per event so a live preference change takes effect immediately).
 */
export function useHoverTilt<T extends HTMLElement>(maxDeg = 5) {
  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      // G5: a small scale added to the rotation so the card visibly LIFTS
      // toward the cursor, not just a subtle tilt that reads as static in a
      // still frame. The .tilt-card:hover shadow (globals.css) deepens with
      // it for the depth cue.
      el.style.transform = `perspective(900px) rotateX(${(-y * 2 * maxDeg).toFixed(2)}deg) rotateY(${(x * 2 * maxDeg).toFixed(2)}deg) scale(1.03)`;
    },
    [maxDeg]
  );

  const onMouseLeave = useCallback((e: React.MouseEvent<T>) => {
    e.currentTarget.style.transform = "";
  }, []);

  return { onMouseMove, onMouseLeave };
}
