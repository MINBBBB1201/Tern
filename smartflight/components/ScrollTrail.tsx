"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * G2: the hero's route-line motif, extended across the whole page. A single
 * faint contrail traced through the page gutters, drawn in as the reader
 * scrolls (strokeDashoffset scrubbed to scroll progress) — the same
 * "circle the world → become your ticket" flight-path language, stretched
 * into an ambient background thread instead of a second 3D scene.
 *
 * Restraint: fixed to the viewport, routed mostly through the empty side
 * gutters, very low opacity with a soft glow. Desktop-only and
 * no-preference-only (CSS `.scroll-trail` gate) — mobile never paints it
 * (gutters are too narrow, and a scroll-scrubbed repaint is not worth the
 * battery), and reduced-motion users get nothing. GSAP core + ScrollTrigger
 * only (both free); no new dependency.
 */
export default function ScrollTrail() {
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const path = pathRef.current;
    if (!path) return;
    const mm = gsap.matchMedia();
    // Mirror the CSS visibility gate so getTotalLength runs on a laid-out
    // path and the scrub only exists where the trail is actually shown.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
  });

  return (
    <svg className="scroll-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        ref={pathRef}
        d="M 7 -6 C 12 16, 5 33, 9 51 C 13 69, 88 65, 92 83 C 95 95, 90 106, 88 114"
      />
    </svg>
  );
}
