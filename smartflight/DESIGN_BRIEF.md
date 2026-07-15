# Tern Design Upgrade Brief

**Goal**: Make Tern look like the best-designed flight app in the category —
on par with the reference sites (21st.dev, Aceternity, Magic UI, Float UI)
in visual polish, while staying true to Tern's own "Civil Twilight" identity
(Arctic Tern migration story, dusk-gradient palette, Space Grotesk display
type, glassmorphism). Not a redesign from scratch — a polish pass on an
already-distinctive system.

**How to work through this**: one stage at a time, verify in a real browser
(Puppeteer) before moving to the next stage, commit each stage separately.
Re-read this file at the start of every session — context does not persist
across `claude --continue` restarts.

---

## Stage 0 — Setup (already done — skip to Stage 1)

1. ~~Install the design-taste skill~~ — done, installed at
   `.agents/skills/design-taste-frontend/SKILL.md`.
2. ~~Connect 21st.dev MCP~~ — done, connected as `mcp__21st__*` tools.
3. ~~Read `app/globals.css`~~ — done. Design tokens (every new component
   must use these, never introduce new ad-hoc colors):
   - **Civil Twilight palette** (`:root`): `--ink-900 #0A0F1E`,
     `--dusk-700 #1B2A52`, `--horizon-500 #F2934D`,
     `--contrail-300 #8FE0E8`, `--signal-600 #2F6FED`,
     `--paper-50 #F6F8FB`; gradients `--hero-twilight-bg`,
     `--contrail-glow`.
   - **Glass system**: `--glass-fill-dark/-light/-strong`,
     `--glass-border`, `--glass-highlight`, `--glass-blur 18px`; classes
     `glass-panel`, `glass-panel-dark`, `glass-panel-scan` (offer lists),
     `glass-panel-strong` (modals), `glass-chip`, `glass-row`,
     `glass-nav` / `glass-nav-dark`, `glass-boost` (flat-bg sections).
   - **Tailwind theme tokens** (`@theme inline`): `navy(-deep/-mid/-light)`,
     `sky-*`, `background/surface(-raised/-overlay)`,
     `foreground(-muted/-faint)`, `muted`, `primary(-hover/-active/
     -subtle/-border)`, `border(-strong/-focus)`, semantic
     `success/warning/danger` + `-subtle` + `-strong` (AA on glass),
     radius `sm 4/md 8/lg 12/xl 16/2xl 20/full`, shadows
     `xs/sm/md/lg/navy/search`.
   - **Type**: `--font-sans` Geist, `--font-mono` JetBrains Mono
     (`data-mono` class = mono + tabular-nums for all numeric data),
     `--font-display` Space Grotesk (`hero-headline`).
   - **Hero/brand classes**: `hero-twilight`, `hero-stars`,
     `ambient-drift`, `boarding-pass-static(-wrap)`, `boarding-pass-mark`,
     `route-trace(-path)`, `tilt-card` (+`useHoverTilt`), `brand-range`,
     `vol-*` (volumetric search bar family), `focus-ring-contrail`.
4. Do **not** add framer-motion or anime.js — GSAP + `@gsap/react` +
   ScrollTrigger are already the animation system. Two animation
   libraries in one app causes bundle bloat and conflicting timelines.
5. Do **not** adopt HeroUI, Material, or any other complete component
   library wholesale — Tern's tokens and glass-panel/glass-chip system
   already function as its own design system. Pulling from reference
   sites means copying *structure and interaction patterns*, then
   rebuilding with Tern's own classes — never pasting in a competing
   library's default styling.

## Stage 1 — Homepage hero (highest visibility, sets the tone)

Current state: dark hero, Arctic Tern R3F scene flies across, wingtrail
condenses into a glass boarding pass, settles into the search card below.
~87fps average, reduced-motion respected, bloom postprocessing already
tried and rejected (killed text legibility — don't re-add without reading
why in the code comments).

Look for incremental wins, not a teardown:
- Does the 3D scene have enough atmospheric depth (stars/particles/parallax
  layers already exist per `ambient-drift` — check if it reads as
  intentional or sparse)?
- Reference sites for *motion/interaction quality*, not layout: look at
  how 21st.dev/Aceternity handle scroll-triggered reveals, cursor-reactive
  elements, and glass/blur depth — borrow the *feel*, rebuild with GSAP.
- Check hero copy hierarchy and CTA prominence against the reference
  sites' hero patterns.

## Stage 1.5 — Signature brand features (do this after Stage 1's base polish, before Stage 2)

The brand name "Civil Twilight" and the Arctic Tern migration story are
currently used once (homepage hero) and nowhere else. No competitor
(Google Flights, Skyscanner, Kayak) has any brand narrative woven into
its actual UI mechanics — this is a real differentiation opportunity.
Four candidate features, roughly ordered by impact-to-effort ratio
(cheapest/highest-impact first):

1. **Arctic Tern as the app-wide loading/wayfinding motif.** Right now
   the tern flies once in the hero and never reappears. Reuse the
   existing R3F tern asset as the loading indicator during flight
   search — have it fly along the actual route being searched (origin
   to destination direction) instead of a generic spinner. Cheapest of
   the four since the 3D asset already exists; biggest perception win
   for the least new engineering.

2. **"Boarding pass materialize" transition on offer selection.** When
   a user selects a flight, the OfferCard shouldn't just navigate away —
   do a GSAP flip/morph transition where the card visually becomes a
   boarding pass, directly continuing the hero's own "wingtrail
   condenses into a glass boarding pass" motif. Ties two existing brand
   moments together.

3. **Live local-sky-color background on airport guide pages.** Airport
   guide pages already have `getAirport(iata)` lat/lon data. Compute
   local time at that airport and shift the page's background gradient
   to reflect whether it's actually day/dusk/night there right now —
   directly reinforces "Civil Twilight" with real data already on hand,
   no new API needed.

4. **Real civil-twilight terminator line on a 3D globe for route
   selection.** The most ambitious: when origin/destination are picked,
   show a small rotating 3D globe (R3F) with the great-circle flight
   path drawn between the two points, and the actual astronomical civil
   twilight boundary line crossing the globe in real time. This makes
   the brand name a literal, functioning feature — no other flight
   search site does this. Biggest effort (real astronomical calculation
   for the terminator line, a new 3D scene), biggest potential
   signature moment. Consider this a stretch goal for once 1-3 are done
   and validated live, not a Day 1 requirement.

Build and verify 1 and 2 first (both reuse assets/motifs that already
exist). Treat 3 and 4 as separate follow-up stages if 1-2 land well.

## Stage 2 — Booking results page (the actual product surface)


This is where users spend the most time — currently more utilitarian than
the homepage. Candidates for polish:
- OfferCard: hover depth/elevation, micro-interactions on expand/collapse,
  smoother transitions between collapsed/expanded states.
- SmartPickCards: currently a static grid — consider a subtle
  scroll-reveal or hover-tilt pass (hover-tilt hook already exists,
  `useHoverTilt` — check if it's applied here).
- Price/currency display (`PriceDisplay` component) — the converted-price
  UI is functional but plain; look at how reference sites handle
  secondary/tertiary numeric hierarchy.
- Loading states: what does the UI look like while search results stream
  in? This is a real moment users watch — a generic spinner is a missed
  opportunity given the 3D/motion identity established on the homepage.

## Stage 3 — Airport guide pages

Currently plain white cards on `#F4F7FC` background — functional, zero
personality, doesn't match the homepage's design language at all. Bring
the Civil Twilight system here: glass-panel treatment, Space Grotesk
headers, maybe a small illustrative element per section (terminal layout,
accessibility, transit tips) rather than plain bulleted lists.

## Stage 4 — Component-level consistency pass

After Stages 1-3, do a pass across ALL components checking:
- Consistent border-radius scale, shadow depth, spacing rhythm
- Every button/chip/badge uses the same interaction pattern (hover,
  active, disabled states) — audit for one-off styling that drifted
- Dark/light mode consistency where both exist (nav has `navOverHero`
  dark variant — check if it's applied correctly everywhere it should be)

---

## Ground rules (apply to every stage)

- Verify every change in a real browser via Puppeteer before committing —
  screenshots, not just tsc/eslint passing.
- Never regress the explicit non-negotiables already documented in the
  codebase: offer cards have NO per-card entrance animation (preserves
  fast scanning — this was a deliberate decision, don't re-add it),
  reduced-motion must be respected everywhere, render loop must pause on
  backgrounded tabs.
- Cite which reference site/component inspired a change in the commit
  message, and confirm it was re-skinned to Tern's tokens (not copied
  with its original library's default classes/colors).
- One stage per commit (or a few small commits per stage) — not one giant
  everything-at-once commit. Easier to review, easier to revert if
  something looks wrong live.
