"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll choreography (GSAP ScrollTrigger over DOM), shared by the
 * homepage and /booking. Elements opt in with data attributes:
 *
 *   data-fx-head   header block: quiet fade-up, per-batch
 *   data-fx-card   card/tile: perspective lift (real rotateX depth),
 *                  batched so grids stagger together and far-apart
 *                  blocks each wait for their own viewport entry
 *   data-fx-quick  subtle/fast variant for content the user needs to
 *                  read immediately (booking filter bar, smart picks) —
 *                  never gates scanning
 *
 * Elements with their own hover transforms (tilt-card) must put the
 * attribute on a wrapper so the two transforms never fight.
 *
 * ScrollTrigger (not drei ScrollControls) because the site is DOM-first:
 * native scroll keeps working for the search/booking flow, and HTML
 * content defines page height. All entrances are play-once.
 *
 * Reduced motion: the matchMedia condition never creates the tweens, so
 * content renders in its natural, fully visible state. Elements mounted
 * after this runs (async data) are ignored — components that appear with
 * data own their entrance locally (see SmartPickCards).
 */
export default function ScrollFX() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const heads = gsap.utils.toArray<HTMLElement>("[data-fx-head]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-fx-card]");
      const quicks = gsap.utils.toArray<HTMLElement>("[data-fx-quick]");

      if (heads.length) {
        gsap.set(heads, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(heads, {
          start: "top 85%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.08 }),
        });
      }

      if (cards.length) {
        gsap.set(cards, {
          autoAlpha: 0,
          y: 42,
          rotateX: 7,
          transformPerspective: 900,
          transformOrigin: "50% 100%",
        });
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              rotateX: 0,
              duration: 0.65,
              ease: "power3.out",
              stagger: 0.07,
            }),
        });
      }

      if (quicks.length) {
        gsap.set(quicks, { autoAlpha: 0, y: 14 });
        ScrollTrigger.batch(quicks, {
          start: "top 95%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.04 }),
        });
      }
    });
  });

  return null;
}
