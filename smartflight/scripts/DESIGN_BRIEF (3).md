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
3. Read `app/globals.css` in full and write down (in this file, replacing
   this bullet) the exact list of design tokens already defined
   (`--ink-900`, `--dusk-700`, `--horizon-500`, `--contrail-300`,
   `--signal-600`, `--paper-50`, plus the semantic Tailwind classes like
   `text-success-strong`/`glass-chip`/`data-mono`). Every new component
   must use these, never introduce new ad-hoc colors.
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

## Stage 1.5 — Signature brand features

**UPDATE #2, after live review of the first globe implementation**:
user feedback was that the small secondary globe (tucked beside the
boarding pass) reads as awkward, not impressive. Direction changes
below supersede the "small, secondary accent" framing from the first
update — the globe is now a primary compositional element, not an
accent.

1. **Globe: bigger, standalone, continuously spinning, left-positioned.**
   Not "position doesn't matter" in the literal sense — left works
   because it rebalances the hero now that it's a large element (right
   side currently anchors the boarding pass). Concretely:
   - Significantly larger radius than the current implementation —
     should read as a real focal object, not a detail near the pass.
   - Continuous rotation is fine now that it's foregrounded as its own
     thing — the earlier "sun appears to orbit" tradeoff was awkward
     specifically because the globe was small and easy to scrutinize as
     a secondary detail; at a larger, more confident scale it should
     read as "the earth is turning," which is exactly correct.
   - Hero layout needs to change to fit this, not just add it: the
     headline is currently centered — evaluate right-aligning the
     text block (or overlaying it on the globe's negative space) so
     the globe has room to be a real presence on the left rather than
     competing with centered text for the same space. Try both, keep
     whichever reads cleaner in a screenshot at 1440×900 and mobile.
   - Terminator/solar math from the first pass stays (already verified
     against almanac values) — carry `lib/solar.ts` and the shader
     approach forward, just at the new scale/position.

2. **Unify tern + globe + boarding pass into one continuous sequence.**
   Currently the tern's open-space flight and the globe are two
   unrelated elements sharing a scene. Redirect the tern's flight path
   to orbit the globe once, tracing the same great-circle route already
   drawn on the globe's surface (ICN→LHR line), then break off toward
   camera and condense into the boarding pass — one continuous
   cinematic beat (circle the world → become your ticket) instead of
   two separate motifs. This likely means reworking `TernSequence`'s
   keypoints to originate from/relate to the globe's actual position
   and radius instead of independent fractional hero coordinates.

3. **Bird model quality pass.** Current tern reads as a placeholder
   silhouette. Improve: individual primary-feather detail at the wing
   tips (not a smooth wing edge), the Arctic Tern's signature forked
   tail (currently likely simplified), and a translucency/rim-light
   response on the wings when backlit by the dusk gradient (thin
   membrane catching light at the edges) rather than flat shading.
   Reference real Arctic Tern photos for the silhouette specifics if
   unsure — this is a real bird, get the shape right, not a generic
   bird shape.

4. **Replace the fake stats row.** "500+ Airlines / 2M+ Routes / 4.9/5
   Rating / 10M+ Travelers" (app/page.tsx ~line 704) are hardcoded
   placeholder numbers with no real data behind them — flagged during
   design review as a trust problem, not just a style one: this is an
   early-stage solo project with no real traffic, and displaying
   fabricated social-proof numbers is dishonest, not just generic-
   looking. Remove entirely. Replace with a compact horizontal strip
   showing the 5 real SmartPicks categories (Cheapest / Fastest /
   Earliest arrival / AI pick / Lowest delay risk) with small icons —
   demonstrates the actual product differentiator instead of invented
   social proof. Labels already exist and are already translated
   (`SmartPicks` namespace in messages/*.json) — reuse those keys,
   don't write new copy.

5. **Arctic Tern as the app-wide loading/wayfinding motif** (carried
   over from update #1, still pending). Reuse the tern for the flight-
   search loading state — flying the actual searched route instead of a
   generic spinner.

6. **"Boarding pass materialize" transition on offer selection**
   (carried over, still pending).

7. **Live local-sky-color background on airport guide pages** (carried
   over, still pending).

Priority order: 1 and 2 together (the globe rework and the unified
sequence are really one piece of work — do them in the same pass since
2 depends on 1's new globe geometry), then 4 (quick, no 3D work, real
trust issue worth fixing fast), then 3 (bird quality — can happen
alongside or after), then 5-7.

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
