# Backlog — B/C/D/E/F/G series (2026-07-17 → 2026-07-22)

## G series status (scroll motion, existing Three.js/CSS assets, 2026-07-22)

Direction: no AI-generated 3D (Higgsfield cost + it fights the custom
HeroGlobe/HeroTernView identity we already own) — instead make the
existing Three.js/CSS assets react to scroll. GSAP core + ScrollTrigger
only (both free since GSAP 3.13; no paid plugins). Captures saved under
docs/screenshots/g*.png.

- G1. Hero globe scroll recede — [x] (was already fading+drifting on
  scroll; deepened it: +1.6 units z-pushback into depth and 12%→18%
  shrink, and aligned the fade range to the bird's flightFade (0.05–0.5)
  so globe and tern recede in step. g1-globe-rest.png / g1-globe-recede.png)
- G2. Section motion + page-wide route line — [x] (card fade+rise already
  shipped via ScrollFX data-fx-*; kept, intensity fine. NEW: ScrollTrail —
  the hero's flight-path motif as one faint contrail routed through the
  page gutters, drawn in by scroll (strokeDashoffset scrubbed via
  ScrollTrigger). Desktop + no-preference only; mobile never paints it.
  g2-trail-top/mid/bottom.png)
- G3. Card hover tilt + shadow depth — [x] (useHoverTilt extended to the
  homepage Airline-Deals cards, the airline picker rows, and the /deals
  cards; ≤2.5° perspective + deeper hover shadow. g3-card-rest/tilt.png,
  transform verified perspective(900px) rotateX 1.51 rotateY 1.59)
- G4. Star density scroll reactivity (optional) — [~] (largely already met
  by the F1 both-edge star mask, which swells/dims density spatially as a
  section scrolls through. A CSS view()-timeline opacity breathe was
  trialled on top and REVERTED: the headless capture harness pins
  ViewTimeline progress at 50%, so its live scroll-scrub could not be
  verified — not shipping an unverifiable visual over an effect the mask
  already delivers.)

## F series status (background tone continuity, 2026-07-21)

- F1. Homepage background: one continuous dark gradient track — [x]
- F2. Subpages join the dark tone track — [x]
- F3. /signin dark conversion — [x] (bespoke light-indigo page, not SubpageShell-based, rewritten to the twilight identity: ink→dusk bg + warm horizon glow + hero-stars; card → glass-modal-dark; inputs → glass fill with contrail focus rim; tabs/labels/links → white/contrail; primary CTA indigo→signal-blue (bg-primary, matching site CTAs); Google button → dark glass; error/notice banners → translucent red/emerald on dark. Unified with D3's AuthMenu dark tokens (white/15 chips, contrail, paper text). All auth logic + i18n keys untouched. Verified 3 states: login / typing (signup, contrail focus) / error (real Firebase 400 "Incorrect email or password")) (SubpageShell wrapper: paper-50 body → night-tail scope + dusk→deep-ink→dusk gradient continuous with the header band and footer; nav's light second state deleted — dark glass everywhere; glass-boost stripped from all six consumers (deals/blog/blog-post/about/support/legal); inline signal-600 kickers → contrail (≈2.9:1 on dusk was too weak for 11px labels); new .night-tail hover:text-foreground remap so hover states brighten instead of vanishing. Verified 1 cut per page — deals, blog, blog post(ko), about, support, terms(ko), privacy(ko) — glass/logos/type legible, no light seams; tsc/eslint clean) (single full-page-height linear-gradient on <main> = scroll-linked color interpolation with zero JS and zero new deps; .night-tail scope moved to <main> so every section's text/glass flipped at once; light section fills + the muddy horizon×white color-mixes deleted; why-strip now dissolves horizon→dusk; RouteArcView ink→contrail (would have vanished on dusk); hero-stars reused at 0.38 opacity behind a both-edge fade mask on the two deepest sections so nothing reads flat black; nav two-state toggle removed (dark everywhere); offers photo-card CTAs signal→contrail + heavier photo foot after the dark-glass bar washed the blue out. Verified 6 desktop scroll cuts + mobile static branch: no flat black block, no light haze seam, arc/logos/type all legible)

### F1. Homepage background tone continuity
Diagnosis: "Choose Your Perfect Flight" reads flat black (no ink/dusk
tonal movement), and the deals→destinations→airlines transition floats on
a muddy pink-grey haze (horizon-500 × white color-mixes). The earlier
"middle sections dark" option was explicitly deselected at the time
(tail-only was chosen); this item supersedes that — the whole page moves
inside the dark spectrum only: ink→dusk→ink, no light "day" band.
Approach: scroll-linked color comes from a single full-page-height
linear-gradient on <main> (color interpolates with scroll position by
construction — no scroll listeners, no new deps); the .night-tail dark
scope moves to <main> so every section's text/glass flips at once;
RouteArcView's ink-on-paper arc flips to contrail-on-dusk or it would
vanish; flat-black zones get the existing hero-stars texture at low
opacity behind a vertical fade mask (density/opacity varies as the
section scrolls — reuse, not a new texture). Done when: 5–6 full-scroll
captures show no flat black block and no light haze seam.

## E series status (morph precision + IA + polish, 2026-07-20)

- E1. Bird→ticket morph corner-snap precision — [x] (two faults: glint inset 0.14 > corner radius 0.09 seated them inside the frame; and they were pinned to a flat un-transformed plane while the pass grew/rotated. Fix: seat point = rounded-corner 45° vertex `R·(1−1/√2)`, and each glint now rides the pass's live scale→rotation→position. Kept manual interpolation over react-spring — imperative useFrame scene, deterministic replay/freeze hooks, and physics-spring overshoot would *hurt* frame-exact seating; no bundle add. Numeric: seated glint↔frame-corner distance 0.00000 across 3 replays; clean-build captures before/during/complete)
- E2. Site information architecture (footer 4 groups, Terms/Privacy, real contact email) — [x] (footer regrouped Company/Support/Legal/Explore, reusing existing pages + new /terms /privacy; no invented Careers/Investors. New LegalPage renders both legal pages from TermsPage/PrivacyPage namespaces across en/ko/ja/zh. Content is honest to the real business — solo dev, Duffel-API search, Duffel Links test-mode handoff, Travelpayouts/Aviasales affiliate, no analytics/ad trackers, price alerts local-only. Contact email: support@flytern.site — flytern.site HAS Namecheap forwarding MX configured (domain is mail-enabled), and this address was already the committed contact; the specific alias's deliverability can't be DNS-verified externally, so flagged for owner to confirm. Verified all four locales + #contact anchor)
- E3. Visual polish (optional, brand-first) — [x] (background texture: evaluated and DECLINED — the system already carries palette-correct texture, hero-stars on the night bands and a faint dot-grid on the light sections, so adding more would breach the Linear/Stripe/Apple restraint bar. Icons: none introduced — the site's convention is inline hand-drawn SVG, and no place newly needed one, so no gratuitous lucide add. Shipped one genuine, brand-consistent refinement the new 4-group footer surfaced: the footer link groups now form a tidy 2×2 on small screens instead of one long stack, opening to the same 4-wide row beside the brand at md+)

### E1. Bird→ticket morph corner-snap precision
The D5 corner glints seat *inside* the ticket frame, not on its corners.
Recalculate so the four glints snap exactly to the rounded-rect corner
vertices, and ride the pass's live transform so they track the real
(growing/rotating) corners during assembly rather than a detached flat
plane. Compare the current manual per-frame interpolation against
react-spring and choose with rationale (bundle impact noted if adopted).
Done when: before/during/complete captures show the glints exactly on the
frame corners, stable across repeated __ternReplay.

### E2. Site information architecture
Footer regrouped into Company / Support / Legal / Explore, reusing
existing pages (not inventing Careers/Investors/etc.). Real receivable
contact email on Support/Contact (verify support@flytern.site actually
receives; report honestly if not). New Terms of Use + Privacy Policy
pages with honest content reflecting the real business (solo developer,
Duffel-API flight comparison, affiliate links) — not a boilerplate
copy-paste. Done when: footer + each new/regrouped page verified in all
four locales (en/ko/ja/zh), links working.

### E3. Visual polish (optional, brand-first)
Background texture only within the Civil Twilight ink/dusk palette; icons
from the existing set (lucide). Not mandatory — skip and record the
reason if it does not fit the brand.

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
