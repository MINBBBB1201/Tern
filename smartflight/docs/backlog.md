# Backlog — B/C/D/E/F/G/H series (2026-07-17 → 2026-07-22)

## I6(1차 브리프) 재실행 시도 — 게이트 실패, 코드 변경 없음 (2026-08-01)

낡은 브리프가 도착했다. 내용은 "I5-3/I5-4/I5-5를 이월해 I6으로 실행하고 I7은
시작하지 말 것"이었으나, 세 항목은 **이월된 적이 없고 I5 안에서 완료·커밋**됐다
(`6bb364d` I5-3, `07d2a54` I5-4, `ef8f614` I5-5). 저장소는 그 지점에서 20여 커밋
앞서 있었고 **I6 · I6-b · I7이 모두 완료** 상태였다. 원인은 브리프를 작성한 Cowork
세션이 대화 압축으로 완료 이력을 잃은 것 — 저장소가 맞고 브리프가 낡았다.

§8-1에 따라 재구현 없이 멈췄다. **커밋·푸시·코드 수정 없음.** 대신 브리프의 통과
기준을 감사 도구로 써서 세 항목이 실제로 동작하는지 실측했다(전부 통과):

- **I6-1(OG)** — `generateStaticParams`가 실제로 locale을 받는다
  (`opengraph-image.tsx:19-23`). ko/ja/zh/en × ICN·NRT·CDG 모두 200 `image/png`,
  바이트·해시 상이(73,246 ~ 86,756B), 육안 확인 통과(`인천국제공항 (ICN) / 서울,
  대한민국`, `巴黎戴高乐机场 (CDG) / 巴黎, 法国`).
- **I6-2(airports.json)** — 전략 이미 적용됨. 검색은 `app/api/airports/search/route.ts`에
  locale 파라미터 자체가 없어 **구조적으로** 로케일 무관(`atlanta`/`LGW`/`CDG` 정상).
- **I6-3(transportService)** — `git grep` 전 확장자 기준 **코드 참조 0건**,
  `lib/types/` 디렉터리도 없음. 남은 언급은 이 문서의 이력 서술뿐.

감사 산출물은 `i6-*` 네임스페이스를 이미 실제 I6 라운드가 점유하고 있어
(§9 I6 교훈) 저장소에 기록하지 않고 스크래치패드에 `audit-` 접두사로 두었다.

### 건드리지 않은 발견 (가) — `app/guide/airport/[iata]/page.tsx` 죽은 중복 라우트

최신 커밋 `20f3bd3`이 I5-1 이전 버전의 가이드 페이지를 되살렸다. 라이트 테마
(`bg-[#F4F7FC]`, `bg-white`), 영문 하드코딩(`← Home`, `Airport guide`), JSON-LD
없음, `opengraph-image` 없음 — F4의 다크 롤아웃과 I5의 로케일화를 **둘 다 되돌린**
형태다.

**라이브 리그레션은 아니다 — 확인함.** next-intl 미들웨어가 `/guide/airport/ICN`을
`/en/...`으로 rewrite 하므로 `[locale]` 라우트가 이긴다. bare en 응답에
`night-tail` · `glass-nav-dark` · `application/ld+json`이 있고 `F4F7FC`는 0건,
`og:image`도 정상적으로 나간다. 즉 **사용자 영향 없는 도달 불가 죽은 코드**다.

위험은 잠복성이다. 미들웨어 matcher나 `localePrefix: "as-needed"`가 바뀌는 순간
이 라우트가 되살아나 영문 사용자에게 라이트 테마 · 비로케일 · OG 없는 페이지를
서빙한다. 삭제가 맞아 보이나 이번 라운드 범위 밖이므로 후보로만 남긴다.

### 건드리지 않은 발견 (나) — 큐레이션 23곳이 로케일 문자열로 검색되지 않는다

ko 로케일에서 `인천` 검색 → **0건**. I5-4가 채택한 전략(검색=영문 원문,
표시=로케일)의 논리적 귀결이며 설계상 의도된 동작이다. 검색 인덱스와 표시 계층이
분리돼 있다는 점 자체는 §2-1을 지키기 위한 올바른 선택이다.

다만 UX 갭은 실재한다: ko 사용자에게 드롭다운은 "인천국제공항"이라고 보여주는데
(`SearchBar.tsx:575,584`의 `getCuratedBrief`) 그 문자열로는 찾을 수 없다. 보여준
이름으로 검색이 안 되는 상태다.

해결 후보 — **큐레이션 23곳 한정 별칭 인덱스**. 이미 검증된 로케일 표기를 매칭
키로 재사용하는 것이라 새 추정치를 만들지 않고, §2-1 위반 없이 해결된다. 비큐레이트
7,894곳은 영문 매칭 그대로 두면 된다. 범위 밖이므로 기록만.

### 부수 관찰 — 이 문서의 stale 서술

`transportService.ts`를 현재형 미완료 항목으로 서술하는 줄이 남아 있다
(482행 "is **dead**...", 689행, 813행 B6 잔여 목록). 419행에 삭제 완료가 명시돼
있어 오독 위험은 낮으나, B6 잔여 목록은 실제로는 `lib/airportGuides.ts` 한 건만
남았다. 정리는 하지 않았다.

## I7 — 세로 tern 위치 + Safari 툴바 색상 (2026-07-28)

### I7-1. 세로에서 tern 이 globe/route 와 분리돼 떠 있던 문제

**원인은 I6-b2-3 이 심은 것이다.** `TernSequence` 는 위치를 **월드 공간**에서
계산한다(`spin.localToWorld` 궤도, 카메라 unproject 로 구한 패스 정착점).
그런데 `tern`/`trail`/`pass`/`sparks` 는 전부 `root` 의 자식이고, `root` 는
`PortraitComposition` 의 스케일·이동된 group 안에 있다. 월드 벡터를 자식의
`.position` 에 넣으면 **로컬 값으로 해석**되므로 실제 렌더 위치는
`scale*p + offset` 이 됐다. group 이 없던 시절엔 local == world 라서
드러나지 않았다.

**수정**: 월드 공간 **생산자** 5곳에서 group-local 로 변환(`compToLocal`).
소비자(꼬리 방출, 브레이크어웨이 제어점, radial/tangent 프레임)가 훨씬 많아
생산자 쪽에서 한 번 맞추는 편이 안전하다.
- `unproject` — 화면 고정 타깃이므로 변환해야 화면상 같은 지점에 남는다
- `orbitWorld`, `ambientPoint` — `spin` 이 group 안이라 이미 스케일이 실려 있다
- `spin.getWorldPosition(globeCenter)` 2곳, `globeR` 은 `/ heroComp.scale`

**부모→자식 전달을 쓰지 않았다**: R3F 의 `useFrame` 은 구독(=마운트) 순서로
돌고 자식이 부모보다 먼저 마운트되므로, 자식이 **한 프레임 낡은** 변환을
읽는다. 대신 `portraitTransform(aspect)` 순수 함수를 양쪽이 같은 프레임에
각각 계산한다 — 순서 의존이 아예 없다.

**증빙 — 궤도 불변량**: 궤도 구간에서
`ratio = |tern_world − globe_center| / globe_radius` 는 aspect 와 무관하게
`ORBIT_ALT = 1.16` 이어야 한다. 로컬 좌표만 보면 판별 불가라
`__ternState()` 에 `orbit` 필드를 추가했다.

| t (ms) | before 세로 | after 세로 | before 데스크톱 |
|---|---|---|---|
| 1600 | **1.338** | 1.16 | 1.16 |
| 2500 | 1.115 | 1.16 | 1.16 |
| 3400 | **0.447** | 1.16 | 1.16 |
| 4200 | **0.782** | 1.16 | 1.16 |

0.447 은 구체 표면(1.0) **안쪽**이다. 데스크톱은 before 에도 1.16 —
**세로 전용 회귀**였음이 수치로 확인된다.
캡처: `docs/screenshots/i7-{before,after}-{mobile,desktop}-orbit.png`
(before 는 `compToLocal` 을 일시 무효화해 재현했다. 커밋된 상태에는 측정
훅이 없기 때문이며, 재현용 플래그는 커밋 전에 제거했다.)

캡처의 트레일이 검게 보이는 것은 `__ternReplay` seek+freeze 가 트레일 색
버퍼를 채우기 전에 정지시키는 하네스 아티팩트다. before/after 동일하게
나타나므로 비교를 오염시키지 않는다.

### I7-2. Safari 하단바가 스크롤 중 흑↔백으로 바뀌던 문제

**원인 2개.** 프로젝트에 `theme-color` 선언이 **아예 없었고**(전체 검색 0건),
Safari 가 페이지를 샘플링해 툴바 색을 정하고 있었다. 게다가 `body` 가
여전히 라이트 토큰 `--color-background: #ffffff` 를 쓰고 있어서, 모든 라우트가
그 위에 다크 그라디언트를 덮더라도 **iOS 러버밴드 오버스크롤에서 흰색이
드러난다.**

**수정**:
- `app/[locale]/layout.tsx` 에 `viewport` export — `themeColor: "#0A0F1E"`,
  `colorScheme: "dark"`. 라이트/다크 미디어 쌍을 쓰지 않았다: 모든 라우트가
  ink→dusk 다크(home/booking/guide/signin/not-found 전부 확인)이므로 라이트
  변형은 항상 틀린 값이 된다. `#0A0F1E` 는 `--ink-900`, 그 그라디언트의 0%
  스톱이자 툴바에 실제로 인접한 색이다.
- `body { background-color: var(--ink-900) }`. `--color-background` 토큰은
  건드리지 않았다 — 컴포넌트 팔레트가 기반하는 라이트 서피스 토큰이고,
  실제로 그걸로 칠해지던 것은 `body` 뿐이었다(`bg-background` 사용처 0).

증빙(서빙된 응답 본문):
`/`, `/ko`, `/booking`, `/signin` 전부
`<meta name="theme-color" content="#0A0F1E"/>` + `color-scheme: dark`.
서빙된 CSS: `body{background-color:var(--ink-900);...}`

### 건드리지 않은 발견 — 404 는 흰 화면이다 (기존 문제)

매칭되지 않는 경로(`/nope-404`, `/ko/nope-404`)는 커스텀 다크
`app/[locale]/not-found.tsx` 가 아니라 **Next 기본 404**(`next-error-h1`)를
렌더한다. 여기엔 `theme-color` 가 없고 인라인 `body{background:#fff}` 가 있어
**툴바가 흰색이 된다.** 즉 커스텀 404 는 실질적으로 도달 불가로 보인다.

**고치지 않았다.** 루트 not-found 를 붙이려면 `app/layout.tsx` 를 새로 만들어야
하는데 이 프로젝트의 루트 레이아웃은 `app/[locale]/layout.tsx` 이고,
그 구조를 건드리는 것은 §3 불가침(next-intl 로케일 시스템)에 걸린다.
I7 범위 밖이므로 후보로만 남긴다.

## I6 — 실행 완료, 커밋 승인 대기 (2026-07-27)

아래 진단 3건 중 **I6-a(교통편 재배치) · I6-a2(커서) · I6-c(토글 제거)를
구현**했다. I6-b는 의도된 설계로 확인되어 미착수.

측정 (1440×900, `/booking?from=ICN&to=NRT&departureDate=2026-09-15`):

| 항목 | before | after |
|---|---|---|
| 첫 예약 카드 위치 | 877px (0.97 뷰포트분) | **579px (0.64)** |
| 교통편 섹션 위치 | 515px (예약 카드 **위**) | **2493px (아래)** |
| SmartPick `cursor` | `default` | **`pointer`** |
| Show Offers 토글 | 존재 | **없음** |

SmartPick 클릭 회귀 없음: 정렬 `duration → price`, `scrollY 210`
(= `scrollToOffer` 정상 동작).

증빙: `docs/screenshots/i6-{before,after}-booking-order.png`,
`i6-{before,after}-home-flights.png` — 재현 스크립트 `scripts/i6-shots.mjs`,
측정 스크립트 `scripts/i6-verify.mjs`.

> 주의: 원래 이 절이 인용하던 `i6-diag-booking-order.png`는 이번 검증 중
> 같은 경로에 덮어써져 소실됐다(untracked라 복구 불가). 동일한 변경 전
> 상태는 `i6-before-booking-order.png`가 대체한다. `i6-diag-mobile-hero.png`는
> 그대로 있다.

### I6-a. /booking에서 실제 예약 카드까지 스크롤이 길다

**측정값**: 1440×900에서 첫 `[id^="flight-card-"]`의 문서 상단 기준 위치가
**901px** — 뷰포트(900px) **정확히 한 개분**을 지나야 Select 버튼이 처음
나온다. 문서 전체 높이는 3,551px.

**현재 순서** (`app/[locale]/booking/BookingContent.tsx`):
1. 주문 확인 배너(`linkOrderId` 있을 때만) — L218
2. WHY SHOP ON TERN 패널 — L226
3. 검색 요약 칩 + FiltersBar — L254
4. SmartPickCards — L278
5. AirportGuideCards(Uber 등) — L287
6. 가격 알림 배너(조건부) — L291
7. **OfferList ← 실제 예약 카드** — L320
8. PriceTrendChart / PriceAlertPanel / LoyaltyCardTips — L345~

**의도된 설계인가**: 부분적으로 그렇다. 2~4번은 "무엇을 비교하는지 먼저
보여준다"는 기존 방침의 산물이고 SmartPickCards는 스캔 우선 요약 행으로
설계됐다(컴포넌트 주석). 다만 **5번 AirportGuideCards가 구매 결정 이전에
오는 것은 근거가 약하다** — 공항 교통편은 예약을 마친 뒤에 필요한 정보다.

**"클릭 안 되는 라벨"은 사용자 인지가 맞고, 기능은 반대다.**
SmartPickCard는 실제로 `<button>`이고 클릭하면 정렬을 바꾸고 해당 항공권으로
스무스 스크롤한다(`onPick` → `setSortTab` + `scrollToOffer`). 그런데
브라우저에서 측정한 `getComputedStyle(...).cursor === "default"`다. 원인:
`cursor: pointer`가 `.glass-row`에만 정의돼 있고(globals.css L527)
SmartPickCard는 `glass-panel tilt-card`만 쓴다. 즉 **기능은 있는데 어포던스가
없다.** 홈의 항공사 피커는 `.glass-row`를 써서 포인터가 붙는 대조군이다.

**재배치 시 걸리는 것**:
- SmartPickCards의 `scrollToOffer`는 OfferList가 **아래에 있다는 전제**로
  동작한다. 순서를 바꾸면 스크롤 방향이 뒤집히므로 같이 손봐야 한다.
- `data-fx-*` 스크롤 리빌(ScrollFX)이 DOM 순서에 묶여 있어 재배치 시
  등장 스태거가 어긋날 수 있다.
- `linkOrderId` 주문 확인 배너는 Duffel 반환 레그의 성공 신호라 **반드시
  최상단**이어야 한다(I5-1에서 검증한 경로).

**세 제약 확인 결과 (2026-07-27, 구현 시점):**
1. `scrollToOffer` — 손볼 필요 없었다. 옮긴 것은 **AirportGuideCards**이고
   SmartPickCards는 OfferList **위에 그대로** 남았다. 전제가 유지되므로
   스크롤 방향은 그대로이고 이동 거리만 짧아졌다. 클릭 실측 `scrollY 210`.
2. ScrollFX — 스태거 어긋남 없음. `ScrollTrigger.batch`가 **DOM 순서가 아니라
   뷰포트 진입**을 기준으로 묶기 때문에, 옮긴 블록은 더 늦은 배치에 합류할 뿐
   리빌 자체는 정상. after 캡처에서 교통편 카드가 보이는 것으로 확인.
3. `linkOrderId` 배너 — **건드리지 않았다** (L218, 최상단 유지).

### I6-b3. 모바일 globe 적응형 활성화 — 구현 완료, 커밋 승인 대기 (2026-07-28)

`innerWidth < 768` / `hardwareConcurrency <= 4` 하드 게이트 **제거**.
capability 판정을 실측 프레임타임(drei `PerformanceMonitor`)으로 대체.
`prefers-reduced-motion` 은 안전망으로 유지(사용자 명시 선호는 성능 추측이 아님).

- 신규 `components/canvas/quality.ts` — full → lite → static **단방향** 티어
- dpr 캡 1.5 (기존 full 은 2)
- earth 텍스처 2048×1024 → 1024×512 (GPU 10.7MB → 2.7MB each)

검증 (프로덕션 빌드, 390×844):

| 항목 | 결과 |
|---|---|
| 모바일 globe | 표시됨 (before: static) |
| dpr 실효 | 585/390 = **1.50** |
| CPU 4x, 45초 소크 | `full` 유지 — 거짓 강등 없음 |
| CPU 6x | `full → lite → static` |
| static 도달 | `data-hero-static=1`, 보딩패스 카드, draws 30 → **1** |
| reduced-motion | canvas 미생성, draws 0 |

**튜닝 중 실제로 틀린 것 2건** (§9 에 반영):
1. `bounds` 를 refreshrate 비율로만 잡으면 120Hz 패널에서 84fps 를 요구해
   정상 기기를 강등한다 → 절대 fps 상한 `min(rr*0.7, 45)`.
2. 상한을 도달 가능하게 두니 **60fps 기기가 incline↔decline 플립플롭으로
   static 까지 떨어졌다.** 사다리가 단방향이라 incline 이 무의미하므로
   상한을 도달 불가(`rr*2`)로 바꿨다.

**히어로 구도 (별도 문제, 함께 해결)**: globe 반지름이 `planeH` 기준이라
세로 화면에서 지름이 화면 **폭보다 커져** 카피를 덮었다. 첫 캡처에서
"Chase the horizon." 이 판독 불가. 해결:
- `PortraitComposition` — aspect 0.95→0.45 구간에서 씬 scale 1→0.44, y 0→1.35
- `HeroGlobe` 세로 딤 — 기존 `uFade` 경로 재사용, 세로에서 ×0.42

데스크톱은 aspect 보간값이 0 이라 **완전 무변경**(캡처 대조 확인).
중간값 iPad 세로(aspect 0.69)도 정상.

증빙: `docs/screenshots/i6b-{before,after}-mobile-hero.png`,
`i6b-after-ipadport-hero.png`, `i6b-{before,after}-desktop-hero.png`,
`i6b-after-fallback-cpu{4,6}x.png`.
스크립트: `scripts/i6b-{globe-probe,globe-probe2,globe-probe3,fallback-verify,soak4x,shots}.mjs`

**여전히 미측정**: 실기기 배터리·발열. `hardwareConcurrency` 게이트가
없어졌으므로 "아이폰이 4를 보고하면 아무 일도 안 일어난다"는 리스크는 해소.

**후보 (지금 넣지 않음) — 탭 재활성 시 티어 1회 재평가**: 강등이 단방향이라
일시적 부하(다른 탭의 무거운 작업 등)로 static 까지 떨어지면 페이지를 새로
열 때까지 복구되지 않는다. `visibilitychange` 에서 1회 재평가하는 방안이
있으나, **흔치 않은 엣지케이스로 판단해 보류**했다(2026-07-28 결정).
진동 방지가 단방향 설계의 목적이므로, 재평가를 넣을 때는 플립플롭 재발
여부를 소크 테스트로 다시 확인해야 한다.

### I6-b2. 모바일 globe 활성화 — 성능 측정 (2026-07-27)

코드 미수정. 게이트만 페이지 컨텍스트에서 우회해 측정
(`scripts/i6b-globe-probe{,2,3}.mjs`). 390×844 mobile emulation,
호스트 GPU = AMD Radeon iGPU(ANGLE/D3D11), 6초 창 ×3 ×3회 반복.

| 구성 | 캔버스 px | 정착 FPS | p95 | draws/f | 텍스처 |
|---|---|---|---|---|---|
| A. static (현행) | 585×1266 | **59.9** (3/3 동일) | 40 | 1 | 0.2MB |
| B. globe, CPU 1x | 780×1688 | 40.2–59.5 (진동) | 39.8 | ~20 | 35.8MB |
| C. globe, CPU 4x | 780×1688 | **24.0** | 15–17 | ~20 | 35.8MB |
| E. globe, dpr1.5, CPU 4x | 585×1266 | **29.9** | 17–20 | ~19 | 35.8MB |
| F. static, CPU 4x | 585×1266 | 40.0 | 29.9 | 1 | 0.2MB |

- **모바일은 이미 WebGL을 켜고 있다.** `<768`은 "off"가 아니라 `lite`
  (ambient motes 60개, dpr [1,1.5]). globe 추가는 0→1이 아니라 증분 비용.
- CPU 4x 기준 static 40fps → globe 24fps (**-40%**).
- dpr 2 → 1.5 만으로 24 → 29.9fps (**+25%**). 부하가 fill-rate 쪽에 있다.
- 정점 17.5k/frame — **폴리곤은 병목이 아니다.** 폴리곤 감축은 효과 없음.
- **post-processing 없음** (EffectComposer 미사용, Stage 4에서 bloom 반려).
  경량화로 뺄 것이 애초에 없다.
- 텍스처 35.8MB는 **일회성 업로드** (2번째 창 Δ0.00MB). earth-day/night 둘 다
  2048×1024. globe 실제 렌더 지름은 500 device px 미만 → 과대 샘플링.
- 히어로를 지나쳐 스크롤하면 **draws/frame 0** (drei View 컬링). 상시
  배터리 드레인은 아니다. rAF 루프는 계속 돔(120fps 공전) — CPU 소소.

**미해결 — 이게 결정적이다**: 두 파일 모두 `hardwareConcurrency <= 4`를
**하드 off 게이트**로 쓴다(`GlobalCanvasInner.tsx:26`, `HeroTernView.tsx:1298`).
실제 아이폰 Safari가 4 이하를 보고하면 **폭 조건만 풀어도 아무 변화가 없다.**
실기기 확인 필요.

**측정 못 한 것**: 배터리(mAh), 실제 모바일 GPU 시간, 발열/스로틀링.
데스크톱 iGPU 수치로 아이폰을 추정할 수 없다 — 실기기 프로파일링 필요.

### I6-b. 모바일 홈에서 히어로 globe 없음 — **의도된 설계, 회귀 아님**

`components/canvas/HeroTernView.tsx` L1295–1300:
```
isStatic = window.innerWidth < 768
        || (navigator.hardwareConcurrency ?? 8) <= 4
        || prefers-reduced-motion
```
390×844 실측: `innerWidth 390`, `hardwareConcurrency 12`, `.hero-twilight`에
`data-hero-static="1"` 부착됨 → **폭 조건으로 정적 분기**. 저사양 경로가
아니다. 정적일 때 히어로 카피를 중앙 정렬하는 CSS 훅까지 갖춘 의도적 설계이고,
모바일은 빈 화면이 아니라 **정적 보딩패스**를 렌더한다(캡처 확인).

도입 시점: `9956dc5` (Stage 3: scroll-driven 3D) / `a3a5e8f`. 최근 회귀가
아니다. 남은 판단은 "모바일에서도 globe를 보여줄 것인가"라는 **제품 결정**이지
버그 수정이 아니다.

### I6-c. "Show Offers" 토글 — 스타일 이탈 + **아무것도 제어하지 않음**

위치 정정: 신고는 "검색결과 상단"이지만 실제로는 **홈페이지**의
"완벽한 항공편 고르기" 섹션이다(`app/[locale]/HomeContent.tsx` L1010–1012).
`/booking`에는 이 토글이 없다.

**스타일 이탈보다 큰 문제 — 죽은 컨트롤이다.** `showOffers` 상태는
선언(L495)·토글(L1011)·노브 위치(L1012)에만 쓰이고, **이 값으로 무엇을
가리는 조건부 렌더가 한 곳도 없다.** 눌러도 토글 모양만 바뀐다.

실측한 이탈 항목:
- `cursor: default` — 포인터 없음
- `role`/`aria-checked`/`aria-label` **전부 null** — 스위치 시맨틱 부재
- 높이 **24px** — I2 라운드가 세운 44px 터치 타깃 기준 미달
- off 상태가 `bg-gray-300` (원시 Tailwind 회색). Civil Twilight 토큰이 아니라
  다크 배경에서 밝은 회색 덩어리로 뜬다. on 상태는 `bg-primary`로 토큰을 쓴다.

**판단 필요**: 고칠 대상이 스타일인지, 아니면 제어할 것이 없으므로 **제거**할
대상인지. 후자가 유력해 보인다 — 홈의 샘플 항공편 3건은 항상 보여야 할
데모 콘텐츠이고 숨길 이유가 없다.

### 확인했으나 문제 아님

"인기 노선" 칩이 모바일 캡처에서 비어 보였으나, DOM 측정 결과
`opacity: 1` / 텍스트 `ICN → NRT 서울 · 도쿄` 정상. 캡처 타이밍 아티팩트였다.

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

### I5-4 airports.json 로케일화 — 완료 (전략 판단 포함)

실측: 데이터셋은 **7,917개** 공항(브리프의 "약 5,000"보다 많음), 800KB,
도시명 6,488종, 국가코드 236종(ISO 3166-1 alpha-2).

**전략 판단**

- **(i) 전량 번역 — 반려.** 공항명 7,917 + 도시명 6,488 × 3로케일 ≈ 43,000
  문자열. "New York Skyports Seaplane Base" 같은 고유명사에는 권위 있는
  ko/ja/zh 표기가 존재하지 않아, 생성물은 검증 불가한 추정치가 된다 →
  **§2-1 위반**. 부수적으로 번들도 800KB → 3MB+.
- **(ii) 도시명만 로케일화 — 부분 반려.** 도시명 6,488개도 검증된 소스가 없다.
  CLDR에는 일반 도시 데이터베이스가 없어 같은 §2-1 문제에 걸린다.
- **채택: "검증된 소스가 있는 필드만 로케일화."**
  1. **국가** → `Intl.DisplayNames`(CLDR). 권위 있는 published 소스이지 기계
     번역이 아니다. 실측 커버리지 236종 중 **235종** 해석. 유일한 실패
     `KS`는 애초에 유효한 ISO 코드가 아니며(데이터셋이 코소보에 사용),
     ISO 사용자할당 코드 `XK`로 1건 매핑 — 이름을 지어낸 게 아니라 코드 보정.
     번들 증가 0바이트.
  2. **도시·공항명** → 큐레이션 23곳은 손으로 검증한 로케일 표기 사용,
     나머지 7,894곳은 **원문 유지**.

**범위**: 7,917개 전량이 대상이다(국가 로케일화는 런타임 포맷팅이라 전량
적용에 비용이 없다). "전량 번역"만 반려된 것이지 범위를 23곳으로 축소한 게
아니다.

**구현**: `lib/countryNames.ts` 신설. `lib/airportBrief.ts`에
`getCuratedBrief()` 추가 — 기존 `getAirportBrief()`는 비큐레이트 공항에
`"ATL 공항"` 같은 **플레이스홀더**를 반환하므로, 그대로 표시하면 실제
공항명을 지어낸 이름으로 덮어써 §2-1을 정면 위반한다(구현 중 발견해 수정).
자동완성과 `/booking`에 같은 규칙 적용.

**검증** — `scripts/i5-4-autocomplete.mjs`(행 텍스트 매트릭스),
`scripts/i5-4-shots.mjs`(캡처):
`docs/screenshots/i5-4-{en,ko,ja,zh}-{autocomplete-noncurated,booking-noncurated}.png`

- 큐레이션 ICN: `서울 / 인천국제공항 / 대한민국`, `ソウル / 仁川国際空港 / 韓国`,
  `首尔 / 仁川国际机场 / 韩国`
- 비큐레이트 ATL: 4로케일 모두 `Atlanta / Hartsfield Jackson Atlanta
  International Airport` 원문 유지 + 국가만 `미국 / アメリカ合衆国 / 美国`
- **검색 무손상**: 영문("atlanta")·IATA("LGW") 입력 모두 정상 매칭. 매칭은
  서버에서 영문 데이터로 수행되고 로케일화는 표시 계층에만 적용되므로 영향 없음.

부수 수정: 국가를 추가하니 드롭다운 행이 3줄로 줄바꿈되어, 행을
2줄(코드·도시·국가 / 공항명 truncate)로 재구성.

**주의 — 백로그 예시가 틀렸었다:** 이전 항목이 비큐레이트 예로 든 CDG·GRU·DXB는
셋 다 큐레이션 23곳에 **포함**된다. 실제 비큐레이트 검증에는 ATL·LGW를 썼다.

### I5-5 transportService.ts — 삭제 완료

`lib/transportService.ts`(861줄)와 그것만 쓰던 `lib/types/transport.ts`(311줄),
합계 **1,172줄 삭제**. `lib/types/` 디렉터리도 비어서 사라졌다.

**연결하지 않고 삭제한 근거** (파일 자체 docstring이 이미 다 적어두고 있었다):

1. **명시적 목 데이터.** 파일 제목이 "Transport Service - Mock Data Provider",
   섹션 헤더가 "Mock Data: Incheon Airport (ICN)". UI에 연결하는 것 자체가
   §2-1("추정치·더미·플레이스홀더로 UI를 채우지 않는다") 위반이다.
2. **지어낸 제휴 ID.** `SMARTFLIGHT_KR` / `SMARTFLIGHT_UBER` affiliateTracking
   블록은 실재하지 않는 파트너 식별자다. docstring도 "placeholders invented
   before that was confirmed, not real partner IDs / **do not wire this into
   the UI**"라고 못박아 두었다. 더미 콘텐츠보다 나쁘다.
3. **검증 안 된 요금.** 공항 픽업비 5,000/10,000/15,000 KRW, 통행료 ~7,000 KRW,
   AREX 시각표·배차 간격이 하드코딩. 출처 없고 쉽게 낡는다.
4. **가짜 API.** 모든 함수가 `setTimeout(300~400ms)`으로 "Simulate API delay"만
   하고 상수를 돌려준다. 데이터 소스가 아니라 프로토타입 스캐폴드다.
5. **ICN 전용.** 다른 공항에는 전부 `null`/`[]`. 연결해도 23개 가이드 중
   1곳에서만 동작한다.
6. **실제 후속 기능이 이미 출시돼 있다.** 라이드헤일링은
   `lib/rideDeepLinks.ts`(Uber의 실제 공개 딥링크 API)가 가이드 페이지와
   /booking에 연결돼 동작 중이고, 교통 안내 산문은 `lib/airportGuides.ts`의
   transit 섹션이 담당하며 I4에서 23공항 × 4로케일로 이미 로케일화됐다.

**연결 비용 대비 가치**: 요금·제휴 데이터를 검증된 소스로 전부 교체해야 하는데
그런 소스가 없고(공개 API·제휴 프로그램 부재는 이 파일 docstring이 확인한 사실),
1,172줄을 3개 로케일로 번역해야 하며(I4 원칙상 검증 없는 기계번역 불가),
결과물은 이미 출시된 기능과 중복되면서 공항 1곳에서만 동작한다. 가치가 음수다.

검증(§5 삭제 증빙): tsc EXIT=0, eslint 0 problems, npm run build EXIT=0
(159 정적 페이지). 코드 내 잔여 참조 0건.

### 다음 라운드 대상 (I5에서 미착수)

- 없음 — I5-0 ~ I5-5 전부 처리됨.

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
  wire it up before it's worth localizing. → **I5-5에서 삭제됨.**
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
  (→ I5-5에서 목 데이터로 판명되어 삭제. 로케일화 대상이 아니었다.)
- Destination-card date ranges on the homepage render as English data
  strings ("24 Dec 2025 - 07 Jan 2026") and are also stale — replace
  with locale-formatted, dynamically computed ranges.

Recommended shape: move guide content into per-locale data modules (or
messages namespaces keyed by IATA), mirroring how LoyaltyCard content
was localized earlier.
