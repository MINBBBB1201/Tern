# Backlog — B/C/D/E/F/G/H series (2026-07-17 → 2026-07-22)

## I5 — 로케일 SEO 정합성 (2026-07-26)

### I5-0 진단 (이 라운드의 본체)

I4 보고 말미의 "Guide OG images stay English (crawlers don't send the locale
cookie)" 한 문장을 실제 요청으로 확인한 결과, **파급이 OG 이미지가 아니라
사이트 전체였다.**

- 로케일 전달은 **`TERN_LOCALE` 쿠키 단독**이었다. `/ko/about` 등 경로는 404,
  `Accept-Language` 헤더는 무시 — 쿠키만이 유일한 신호.
- 그래서 **크롤러에게 Tern은 영어 단일 언어 사이트였다.** Googlebot UA +
  쿠키 없음으로 `/guide/airport/ICN`을 받으면 `<html lang="en">`, 본문
  한글/가나 문자 **0개**. I4에 들인 4개 언어 번역이 유입으로 이어질 경로가
  아예 없었다.
- `<link rel="alternate">` 0개, `og:locale` 0개, sitemap 36 URL에 로케일 URL
  및 hreflang 0개. canonical은 있으나 로케일 무관 단일 URL.
- robots.txt는 원인이 아니었다 (`Allow: /`).

판단 근거로 결정적이었던 것: Duffel Links의 `success_url`이
`${origin}/booking` 하드코딩이라, `localePrefix: "as-needed"` + 쿠키 폴백이면
**어필리에이트 페이로드를 바꾸지 않고도** 반환 레그 로케일이 유지된다.
따라서 전환 규모가 라우팅·미들웨어·링크 생성으로 국한 → 진행 가능.

**규약 충돌 (§머리말에 따라 명시):** §3 불가침의 "next-intl 로케일 시스템"을
I5-1이 재배선한다. 브리프 우선 원칙으로 진행하되, 실제로는 로케일 집합(4개)과
메시지 파일은 불변이고 **전달 경로만 쿠키 → URL**로 바뀌었다.

### I5-1 경로 기반 로케일 라우팅

`i18n/routing.ts`(`localePrefix: "as-needed"`), `i18n/navigation.ts`,
`middleware.ts` 신설. `app/*` → `app/[locale]/*` 이동(`git mv`, 이력 보존).
`i18n/request.ts`가 쿠키 대신 `requestLocale` 사용. 내부 링크·`router.push`
13파일을 로케일 인지 `Link`/`useRouter`로 교체. `lib/actions/setLocale.ts`는
사용처가 사라져 삭제.

검증: 크롤러 기준 `/ko/guide/airport/ICN` 본문 한글 **0 → 11,155자**.
접두어 없는 기존 URL 10종 전부 200. 무손상 3종(로그인 리다이렉트 /
어필리에이트 파라미터 / 공유 URL 로케일) 통과 —
`scripts/i5-nondestructive.mjs`. Duffel 반환 레그는
`/booking?order_id=…` → 307 → `/ko/booking?order_id=…`로 쿼리까지 보존.

**I5-1이 만든 회귀를 같은 라운드에서 수정:** `HomeContent`의 nav에 원시
`<a href="/booking">`가 남아 있어 로케일 접두어를 잃었다. `Link`로 교체
(eslint `no-html-link-for-pages`도 동시 해소). 범위 밖 발견이 아니라 이번
변경이 유발한 회귀라 이번 커밋에 포함.

### I5-2 hreflang / canonical / sitemap / og:locale

`lib/seo.ts` 신설 — 로케일별 self-canonical + 4개 로케일 hreflang +
`x-default`(en) + `og:locale`/`og:locale:alternate`. sitemap **36 → 144 URL,
hreflang 576개**.

가이드 23공항 × 4로케일 **전량 포함 판단**: I4에서 본문이 실제로 완전 번역되어
로케일별 콘텐츠가 진짜 다르다(중복 콘텐츠 아님). 사이트 최대 롱테일 자산이라
제외하면 I4를 낭비하는 셈. 반대로 `/booking?…`는 쿼리 변형이 무한하고
로케일별 콘텐츠 차이가 없어 robots 제외를 **유지** — 전량 확장을 무비판
적용하지 않았다.

### I5-3 OG 이미지 로케일화 — 완료

`generateStaticParams`가 locale × iata 전 조합(4 × 23 = **92**)을 반환하도록
변경. 카드 텍스트는 kicker를 `AirportGuide.badge` 메시지에서, 공항명/도시/국가를
`lib/airportBrief`의 per-locale 데이터에서 가져온다(페이지 본문과 같은 출처라
카피가 갈라지지 않는다). 도시·국가를 부제로 추가.

빌드 정적 페이지 **67 → 159**(+92). 검증:
`docs/screenshots/i5-{en,ko,ja,zh}-og-guide-icn.png` + 교차 확인용
`i5-{ko,zh}-og-guide-nrt.png`. 캡처만으로는 연결이 증명되지 않으므로 각 로케일
페이지의 `og:image`/`twitter:image`를 파싱해 자기 로케일 이미지를 가리키는 것도
확인했다.

**사전 우려는 기각됨:** `next/og`(Satori) 기본 폰트가 라틴 전용이라 CJK가
두부로 깨질 것을 예상하고 폰트 번들링을 검토했으나, 실제 렌더 결과 한글·가나/한자·
간체 모두 정상이었다. 폰트 의존성을 추가하지 않았다. (추측으로 dependency를
늘리지 않고 먼저 측정한 사례)

### 미해결 — 범위 밖으로 두고 기록만 (§7)

- **기본 로케일 OG 이미지 URL이 307을 거친다.** 페이지가 내보내는 en OG URL은
  `/en/guide/airport/ICN/opengraph-image`인데 `localePrefix: "as-needed"` 때문에
  실제 서빙은 접두어 없는 경로다 → 307 후 200. ko/ja/zh는 200 직행.
  대형 스크레이퍼는 리다이렉트를 따르므로 치명적이지 않으나, 고치려면 세 개
  OG 라우트(home/blog/guide)의 이미지 URL을 직접 조립해야 하고 Next가 붙이는
  콘텐츠 해시를 잃는다. 별도 판단 필요.

### 다음 라운드 대상 (I5에서 미착수)

I5-0 진단이 예상보다 무겁고 I5-1이 앱 라우트 전체 이동이라 리뷰 단위가 이미
가득 차, §7에 따라 여기서 끊었다. 둘 다 I5-1 완료로 선행 조건이 해소되어
독립 라운드로 바로 착수 가능하다.

- **I5-4 airports.json 로케일화 전략 미정** — 전량 번역 vs 도시명만 로케일화하고
  공항 정식 명칭은 원문 유지. 전량 기계 번역은 §2-1 위반 소지가 있어 전략 판단
  자체가 산출물.
- **I5-5 `lib/transportService.ts` 미처리** — 861줄, 임포트되는 곳 없음(dead code).
  삭제할지 연결할지 판단 필요.

### 보류 (결정됨, 지금 손대지 않음)

- **`x-default` = en 유지.** 실트래픽 데이터 없이 판단 보류. 애널리틱스 연결 후 재논의.
- `app/[locale]/blog/rss.xml`이 로케일 세그먼트 안으로 들어가 `/ko/blog/rss.xml`도
  생성된다. 피드 정본을 하나로 둘지 로케일별로 둘지 미결정.
- 중간에 `/guide/airport/ICN`에서 HTTP 500을 한 차례 관측했으나 `.next` 삭제 후
  200. Turbopack 캐시 문제로 판단하되 재현 조건은 미확정.

## I4 — i18n completeness + naturalness (2026-07-26)

Closes the **B6 residual** below. `lib/airportGuides.ts` was split into
`lib/airportBrief.ts` (name/city/country/summary, client-safe) and
`lib/airportGuideBodies.{ko,ja,zh}.ts` (the prose bodies); `getAirportGuide`
recombines them per locale, so /guide/airport/*, the airport blog posts and
/booking's guide cards are now localized instead of English-only. Message
files went 403 → 457 keys with the hardcoded UI strings migrated (passenger
popover, /booking states, price-trend chart labels, auth errors, per-route
metadata). Locale-hardcoded `en-US` formatters were routed through
`i18n/locales.localeTag`. Captures: `docs/screenshots/i4-{en,ko,ja,zh}-*.png`.

Known residuals after I4 (deliberate, not oversights):

- `lib/data/airports.json` city/airport names are English-only. The 23
  curated airports display localized city names everywhere (search bar,
  /booking, guides); any *other* airport picked from the autocomplete shows
  its English dataset name. Localizing ~5,000 airports is its own project.
- `lib/transportService.ts` (861 lines of English transport copy) is **dead
  code** — not imported anywhere. Left untranslated on purpose; delete it or
  wire it up before it's worth localizing.
- OG images for airport guides stay English: they're statically generated at
  build time and crawlers fetch them without the locale cookie.
- The `Home` namespace still carries ~15 keys for the removed `showResults`
  block (`flightsFound`, `directVsConnecting`, …). Translated but unrendered.

## G5 + H series status (visible motion + differentiation, 2026-07-22)

Lesson driving G5: restraint that becomes an *invisible* effect is a
failure. Pass bar for every item here: two side-by-side captures must show
an obvious, eyes-only difference (G3's rotateX 1.5° that read identical in
captures is treated as a fail and re-tuned). H group is real-data-only —
any fabricated stat/trend means skipping that item with a specific reason.

- G5. Raise existing motion to visible — [x] (trail 0.12→0.22 + 22% pre-drawn
  at scroll 0 + routed left of the globe so it's present on the first screen,
  clearly visible on content sections; card tilt 2–3°→4–5° PLUS scale(1.03)
  lift + a deep .tilt-card:hover shadow so the hovered card obviously rises
  in a still frame (the G3 fail mode fixed); globe idle spin 0.07→0.09;
  Most Popular Airlines data-fx-card moved from the grid to each cell so the
  six cards stagger in one-by-one. Captures g5-trail-firstscreen / g5-tilt-
  rest vs g5-tilt-active / g5-stagger-mid vs g5-stagger-settled)
- G5-fix. Scroll-trail leak past the hero — [x] (at 0.22 the page-wide fixed
  trail's centre-crossing diagonal became visible over the Airline Deals /
  Destinations content. Fixed by scoping the trail to the hero: moved
  <ScrollTrail> inside .hero-twilight, CSS position fixed→absolute so the
  hero's overflow:hidden clips it and it scrolls away with the hero, and
  rerouted the path entirely down the hero's far-left gutter (x 2–9) so it
  never crosses the globe/search/any content. Verified trailfix-hero /
  trailfix-deals-clean / trailfix-destinations-clean — no trail below the
  hero; the dashed arc in Destinations is the intentional RouteArcView.)
- G5-fix2. Two reported line artifacts — [x] (1) "Airline Deals left vertical
  line" = the ScrollTrail, already cured by G5-fix (hero-scoped); re-verified
  clean on current HEAD (arcfix-deals-confirm) — the report was a pre-fix/
  stale screenshot. (2) "dashed line + plane below Explore Top Destinations" =
  RouteArcView (a separate, intentional component — not a duplicate of the
  hero line, but after F1's dark re-theme its contrail arc read as a stray
  hero route line over the section). REMOVED the <RouteArcView> mount +
  import from the destinations section; the cards carry it. Before/after:
  trailfix-destinations-clean (arc present) → arcfix-destinations-after (gone).
  ScrollTrail confirmed absolute-in-hero, bottom:-812 at that scroll.)
- H1. Airline Deals → signature page (nav-surfaced, per-airline brand
  accent, no invented categories) — [x] (/deals already existed + nav-linked;
  redesigned the cards into a Tern signature: per-carrier brand micro-accent
  — a top hairline in the airline's own colour (KE blue / TK red / OZ warm-
  red / 7C orange, added to lib/airlineDeals) that brightens on hover, a
  brand glow behind the logo, and an OFFICIAL badge that lights up in the
  brand colour on hover. Same treatment on the homepage section, plus a new
  "See all deals →" link to /deals. Real 4 airlines/links kept, no invented
  categories. Captures h1-deals-rest / h1-deals-hover / h1-home-deals-seeall)
- H2. Price-trend graph — REAL DATA ONLY — [x] (ALREADY IMPLEMENTED and
  verified working: hooks/usePriceTrend queries the real Duffel /api/search
  for each of ±5 days around the searched date and plots the per-day min
  fare (components/booking/PriceTrendChart, recharts) on the /booking
  results page — matches the hero's "±5d" stat exactly. Data availability
  CONFIRMED: /api/search returns real Duffel offers ($119.80 Jeju ICN→NRT,
  real times/aircraft), and isBookableAirline filters out duffel/dummy/test/
  sample. IMPORTANT & honest: in Duffel TEST mode the API returns the same
  fare for every date, so the trend line is FLAT — real data, not faked; we
  deliberately do NOT fabricate day-to-day variation (a live token would
  show real movement). Capture h2-price-trend.png. Residual: /booking is
  still light-themed (not SubpageShell) while the rest of the site is dark —
  an F4 candidate, out of H2 scope.)
- H3. Delay-risk viz — REAL DATA ONLY — [x] (NO new viz added, per the rule.
  Finding: real delay statistics are NOT available — Duffel /api/search
  returns no historical/live delay data and no other source is wired. The
  existing "Risk X/98" badge is a HEURISTIC (lib/offerUtils computeDelayRisk
  Score: base 8 + stops×15 + red-eye-departure +12 + tight-layover
  penalties, cap 98; comment already says "not live FAA data"); the "Lowest
  delay risk" sort (delay_low) orders ascending by it. Instead of baseless
  viz, made the EXISTING signal honest: the About/Support/Blog copy claimed
  it was "an estimate from historical delay patterns for the route and
  carrier" — false, since the score uses neither history nor route/carrier —
  corrected across en/ko/ja/zh to an accurate "relative estimate from the
  itinerary's shape (stops, timing, connections)", and added a cursor-help
  tooltip on the badge saying the same. Captures h3-about-honest-copy.png;
  badge title verified in DOM.)
- H4. Transparency "how we make money" section (About/Support), consistent
  with Terms/Privacy, user-first tone — [x] (new #money section on /about,
  in the dark Civil Twilight glass: "Tern is free to use — here's how it
  stays that way, stated plainly instead of buried", then three bullets —
  free/no ads/no data sale; a small commission when you book via a partner
  (Duffel checkout / Aviasales site) at no extra cost; ranking never for
  sale, no invented discounts or "sponsored" tags — with links to Terms &
  Privacy. Restates the Terms s3/s4 affiliate model in user-first language,
  no new legal claims. en/ko/ja/zh. Capture h4-how-we-make-money.png)

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
