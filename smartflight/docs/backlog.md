# Backlog — B series (2026-07-17)

Quality bar for every item: Linear/Stripe-level restrained professionalism.
The shared goal is removing "AI-generated" genericness while keeping the
Civil Twilight design system (ink/dusk palette, glass, Space Grotesk) and
raising its finish. MIT libraries (framer-motion, GSAP) may be installed;
note significant bundle-size impact in the commit message.

Rules: one commit or more per item, check the box in that commit, push when
all six are done. Each item is self-verified against real rendered
screenshots from the running app — "correct in code" is not verification.
Must not break: sun-position sync, search→arc sync, ambient bird, locale
switching, affiliate links, mobile static branch. tsc/eslint stay clean.

## B1. Unify button hover effect — [x]

Apply the Search flights button's hover sheen consistently to every primary
button site-wide (CTA, Select, Continue to booking, View Official Deals…).

- Extract a shared button component/class; remove duplicated CSS.
- Done when: hovering any primary button shows the same sheen, and the
  sheen is defined in exactly one place in the codebase.

## B2. Glass UI material upgrade — [ ]

Target image: "glass you look through from an airplane window" — deep blur,
soft edges, faint internal reflections and light gradients, a very subtle
double-layer feel.

- Improve the glass tokens at the CSS-variable layer so search bar / chips /
  modals / cards all pick it up at once (no scattered per-component edits).
- Done when: in a zoomed capture of the hero search bar the boundary reads
  as "light", not a "line". No text-contrast regression.

## B3. Review-your-flight modal — [ ]

Current problems: appears abruptly on Select, and the light card design
breaks from the hero's dark glass tone — generic.

- framer-motion spring entrance (scale 0.96→1 + fade + slight rise),
  symmetric exit, overlay fades too.
- Redesign the modal in Civil Twilight dark glass. Clean up the information
  hierarchy of the points-payment option list (airline / price / points).
- Done when: frame captures of enter/exit confirm smoothness, and the modal
  looks like the same site as the hero.

## B4. Light sections rework — [ ]

Explore offers and Airline Deals (incl. the C1 redesign) are generic card
grids disconnected from the hero.

- Bridge the dark-hero → light-section boundary with gradient/overlap.
- framer-motion stagger on scroll entry (cards fade+rise in sequence),
  respecting prefers-reduced-motion.
- Rework card design on design-system tokens.
- Done when: captures taken mid-scroll from the hero downward no longer
  read as "two different sites stitched together".

## B5. Korean typography — [ ]

- Introduce Pretendard (variable font; self-host or CDN, whichever performs
  better). Korean uses Pretendard; Latin/digits keep Space Grotesk via the
  fallback chain.
- Configure appropriate fallbacks for ja/zh locales too (e.g. Noto Sans
  JP/SC).
- Done when: a ko-locale hero+search-bar capture shows Korean type that is
  not a system font, loading without CLS/FOUT.

## B6. Translation gap scan — [ ]

- Render every page in the ko locale and audit all remaining English
  strings (migrate hardcoded strings to i18n keys).
- Add everything found to all four locales (en/ko/ja/zh).
- Done when: full-page ko captures show zero English besides intended
  proper nouns (airline names, IATA codes…). Record scan method and count
  in the commit message.
