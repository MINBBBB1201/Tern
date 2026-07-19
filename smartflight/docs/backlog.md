# Backlog — B/C/D series (2026-07-17 → 2026-07-19)

## D series status (bugfix + detail pass, 2026-07-19)

- D1. Remove fabricated stats badges (+ trace how they reappeared) — [x]
- D2. Uber ride deep-link diagnosis (approval-gated → honest state; bug → fix) — [x] (code bug: pickup addressLine1 geocoder override; fixed, not approval-related)
- D3. Auth session wired into UI + logout flow — [x] (state was already subscribed; gap was identity display for email accounts — fixed with email/initial fallback; full flow verified)
- D4. Tern far-side cap loss, root-cause redo (verify ≥4 angles) — [x] (A3's DoubleSide already fixes culling — confirmed by emissive-off A/B; likely cause of continued sighting was a stale .next build; added emissive+renderOrder hardening; verified 4 controlled angles + real far-side flight)
- D5. Tern→ticket morph refinement (premium, restrained) — [x] (four staggered corner-seat glints, soft radial sprites)
- D6. Email/password sign-in re-diagnosis — [x] (no longer broken: live signup + login both succeed with 200s; email/password never touches authDomain, so domain config was never a factor)
- D7. Glass material redo: thin, clear, real — iterate ≥2 on zoomed captures — [x] (blur 24→12, saturate 160→118, broad wash → top specular streak, lit glass lip + inner bottom edge for thickness; 2 iterations)
- D8. Free detail pass across the whole site (desktop+mobile) — [x] (blog list bare-arrow → "Read note" affordance + card lift; arrow-hover motion on offer CTAs; deal card lift; audited desktop+mobile)

## C series status

- C1. Fake SPONSORED coupon replacement — [x] (commit 2c61a1c)
- C2. Deals page — [x]
- C3. Blog page — [x]
- C4. Site-wide button/link audit — [x]
- C5. About / Why "Tern" page — [x]
- C6. Support / Help page — [x]
- C7. Footer restructure — [x]

Quality bar: new pages must read as the same site as the hero/search
pages — an "AI-rushed subpage" feel is failure. Civil Twilight system
throughout; honest content only (no fake commercial claims, no lorem
ipsum).

## Next up (recorded 2026-07-19, not yet started)

- **/deals live-price signal**: attach a real cached "lowest fare seen
  in recent searches" figure per carrier card (from our own search
  cache — never fabricated), promoting the page from static directory
  to living tool.
- **Airport-guide content localization** (B6 residual, priority raised
  now that /blog also surfaces this content): move
  lib/airportGuides.ts + lib/transportService.ts bodies into
  per-locale data modules keyed by IATA, mirroring the LoyaltyCard
  localization pattern.

### C2. Deals page
/deals as a real route reusing the C1 "Airline Deals & Promotions"
card pattern. Honest per-airline promo info (no invented coupons or
discount rates — same principle as C1), CTA into search. Done when:
nav Deals renders a finished page with zero fabricated claims.

### C3. Blog page
/blog list + detail routing. Content reuses real data already in the
project (airport guides, transit passenger facilities, loyalty program
info) reshaped into 3–5 posts. Done when: list → detail renders, and
locale switching doesn't break.

### C4. Site-wide button/link audit
Find href="#", empty onClick, dead links across the codebase; wire
real destinations (incl. pages built this session) or mark honestly
as coming soon — never fake completeness. Done when: the audit list
and dispositions are in the commit message, and no dead controls
remain.

### C5. About / Why "Tern" page
What the service compares and how it differs; the Arctic Tern name
story (longest migration of any animal → finding the optimal route).
Civil Twilight tone, linked from footer/nav.

### C6. Support / Help page
FAQ (how search works, points booking, refund/change basics) plus a
contact section. Real content, dedicated route.

### C7. Footer restructure
Grouped links like a major travel site: Company (About, Why Tern),
Support (Help/FAQ), Explore (Deals, Blog). All pages from this
session wired; text correct in all four locales.

---

# B series (2026-07-17)

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

## B2. Glass UI material upgrade — [x]

Target image: "glass you look through from an airplane window" — deep blur,
soft edges, faint internal reflections and light gradients, a very subtle
double-layer feel.

- Improve the glass tokens at the CSS-variable layer so search bar / chips /
  modals / cards all pick it up at once (no scattered per-component edits).
- Done when: in a zoomed capture of the hero search bar the boundary reads
  as "light", not a "line". No text-contrast regression.

## B3. Review-your-flight modal — [x]

Current problems: appears abruptly on Select, and the light card design
breaks from the hero's dark glass tone — generic.

- framer-motion spring entrance (scale 0.96→1 + fade + slight rise),
  symmetric exit, overlay fades too.
- Redesign the modal in Civil Twilight dark glass. Clean up the information
  hierarchy of the points-payment option list (airline / price / points).
- Done when: frame captures of enter/exit confirm smoothness, and the modal
  looks like the same site as the hero.

## B4. Light sections rework — [x]

Explore offers and Airline Deals (incl. the C1 redesign) are generic card
grids disconnected from the hero.

- Bridge the dark-hero → light-section boundary with gradient/overlap.
- framer-motion stagger on scroll entry (cards fade+rise in sequence),
  respecting prefers-reduced-motion.
- Rework card design on design-system tokens.
- Done when: captures taken mid-scroll from the hero downward no longer
  read as "two different sites stitched together".

## B5. Korean typography — [x]

- Introduce Pretendard (variable font; self-host or CDN, whichever performs
  better). Korean uses Pretendard; Latin/digits keep Space Grotesk via the
  fallback chain.
- Configure appropriate fallbacks for ja/zh locales too (e.g. Noto Sans
  JP/SC).
- Done when: a ko-locale hero+search-bar capture shows Korean type that is
  not a system font, loading without CLS/FOUT.

## B6. Translation gap scan — [x] (UI complete; data-content residual below)

- Render every page in the ko locale and audit all remaining English
  strings (migrate hardcoded strings to i18n keys).
- Add everything found to all four locales (en/ko/ja/zh).
- Done when: full-page ko captures show zero English besides intended
  proper nouns (airline names, IATA codes…). Record scan method and count
  in the commit message.

### B6 residual (follow-up item — content localization project)

All UI chrome is now i18n across en/ko/ja/zh. Deliberately out of scope
for the B6 commit, because it is a content-translation project, not a
string-migration fix:

- `lib/airportGuides.ts` (1,029 lines) — per-airport guide bodies
  (summaries, terminal notes, transit bullets, scam warnings).
- `lib/transportService.ts` (861 lines) — per-city transport content.
- Destination-card date ranges on the homepage render as English data
  strings ("24 Dec 2025 - 07 Jan 2026") and are also stale — replace
  with locale-formatted, dynamically computed ranges.

Recommended shape: move guide content into per-locale data modules (or
messages namespaces keyed by IATA), mirroring how LoyaltyCard content
was localized earlier.
