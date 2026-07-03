# SMARTFLIGHT Project Memory & ADR (Architectural Decision Records)

## 1. Context Injection
- **Session Bridge**: At the start of every session, read the latest entries here to synchronize your mental model with the project's current state.
- **Anti-Hallucination**: Refer to this file to check what has already been built vs. what is still in the planning phase.

## 2. Technical Decision Log
- [2026-05-14]: Configured Ultra-Strict Mode-specific instructions and consolidated .cursor/rules.
- [2026-05-14]: Optimized project performance by cleaning up redundant git repositories and main folders.
- [2026-05-14]: **ADR-001 — Skyscanner Blue Design Token Migration**
  - `--primary` changed from `#2563eb` → `#0062E3` (Skyscanner brand blue) in `app/globals.css`.
  - Added `--primary-hover`, `--primary-active`, `--primary-subtle`, `--primary-subtle-hover` tokens for interactive states.
  - Added `.glass-panel` utility class using `backdrop-filter: blur(18px)` for Mapbox overlay use case.
  - Decision rationale: Centralizing tokens in `:root` ensures all `text-primary`/`bg-primary` Tailwind utilities pick up the new color globally without per-component changes.
- [2026-05-14]: **ADR-002 — SearchBar Component Extraction**
  - Created `components/SearchBar.tsx` as a self-contained `"use client"` component.
  - Owns all search form state (trip type, IATA codes, dates, passengers, cabin class).
  - Exposes a single `onSearch(params: SearchParams)` callback — parent (`page.tsx`) only receives the final submitted params, eliminating prop-drilling of 10+ state variables.
  - IATA 3-char validation guard added inside `handleSubmit` to prevent invalid API calls.
  - `returnDate` input uses `min={departureDate}` to prevent return-before-departure edge case.
- [2026-05-14]: **ADR-003 — Mapbox 3D Placeholder Hero Layout**
  - Replaced `HeroSection` + inline `TicketCard` search panel in `app/page.tsx` with a full-viewport hero section.
  - Hero contains: (a) a CSS/SVG globe grid placeholder `div` that will be swapped for `<MapboxMap />` when `NEXT_PUBLIC_MAPBOX_TOKEN` is set, (b) `SearchBar` overlaid at the bottom via `absolute` positioning with `z-20`.
  - `page.tsx` state reduced from 15 variables to 8 — search state is now owned by `SearchBar`, page only tracks `lastSearch: SearchParams` for downstream results/alerts sections.
  - Pre-existing TypeScript errors in `app/booking/page.tsx` (broken JSX tags) are unrelated to this change and were present before this session.

## 3. Active Roadmaps
- Phase 1: High-density Flight Search UI implementation (Skyscanner style). ✅ COMPLETE
- Phase 2: Mapbox 3D path visualization — placeholder in place, awaiting `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Phase 3: Taxi/transport API integration.