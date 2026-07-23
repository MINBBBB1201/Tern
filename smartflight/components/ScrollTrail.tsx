"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * G2/G5-fix: the hero's flight-path motif as one faint contrail — now
 * scoped to the HERO. It lives inside the .hero-twilight section
 * (absolute, clipped by the hero's overflow:hidden), so it scrolls away
 * with the hero and never bleeds onto the sections below. Routed entirely
 * down the hero's far-left gutter (x 2–9), so it never crosses the globe,
 * the search bar, or any content. Drawn in on the hero's own scroll-out.
 *
 * Desktop + no-preference only (CSS `.scroll-trail` gate); GSAP core +
 * ScrollTrigger only (both free), no new dependency.
 */
export default function ScrollTrail() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;
    const hero = svg.closest<HTMLElement>(".hero-twilight");
    if (!hero) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len });
      // ~45% pre-drawn so it's present on the first screen, completing as
      // the hero scrolls out (and clipping away with it).
      const tween = gsap.fromTo(
        path,
        { strokeDashoffset: len * 0.55 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
        }
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
  });

  return (
    <svg ref={svgRef} className="scroll-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path ref={pathRef} d="M 5 -4 C 9 22, 2 46, 6 70 C 9 92, 4 108, 6 122" />
    </svg>
  );
}
