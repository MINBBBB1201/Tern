# Backlog — B/C/D/E/F/G/H series (2026-07-17 → 2026-07-22)

## I12 — 모바일 히어로 궤적·티켓 모프 버그 (2026-08-02)

### I12-0. 진단 — 둘 다 재현됨. I7 회귀 아님

390/360/414 전부에서 신고와 동일한 화면이 재현됐다
(`i12-390-orbit-before.png`, `i12-390-pass-before.png`).

**근본 원인 (하나).** `.hero-twilight` 는 `minHeight:100vh` 지만 실제 높이는
**콘텐츠** 다. 모바일에서 검색바가 세로로 쌓이므로 히어로는 390×**1382**(aspect
0.282) 가 된다. 그런데 히어로 전체가 drei `<View>` 의 추적 rect(= 3D 스테이지)
였다. 스테이지 aspect 가 카메라 aspect 를 정하고, `portraitTransform` ·
`GLOBE_R_FRAC` · `SETTLE` 이 전부 그 aspect 의 함수다. 즉 **사용자가 볼 수 없는
프레임을 기준으로 씬을 구성**하고 있었다 → 지구본 지름이 화면 폭의 **106%**,
탑승권은 오른쪽으로 밀려 잘림. 데스크톱은 히어로가 정확히 1 뷰포트(900px)라
이 버그가 존재할 수 없었다 — 그래서 PC 에서만 멀쩡했다.

**I7 회귀가 아니다.** I7 이 고친 월드→로컬 변환(`compToLocal`)은 정상 동작
중이다: 궤도 불변량 `dist/radius` 가 4개 폭 전부에서 **1.160** (=`ORBIT_ALT`)
으로 측정됐다. 새로 뚫린 별개의 결함이다.

**"사각형 마커"의 정체 = 윙트레일 재질.** 항로선은 연속 `THREE.Line` 이라 점선이
될 수 없다. 트레일은 `PointsMaterial` + `vertexColors` 였는데, PointsMaterial 의
프래그먼트 알파는 `opacity * mapAlpha` 로 **vertex color 를 보지 않는다**
(`<color_fragment>` 는 rgb 만 곱한다). 그래서 페이드가 0 인 샘플이 rgb≈0,
**alpha=1** 로 기록된다. 캔버스는 `alpha:true` + 투명 클리어라 이건 no-op 이
아니라 **불투명 검정 사각형**이다. 데스크톱 before 캡처에 탑승권 외곽선을 따라
검은 점선 사각형이 그대로 찍혔다(`i12-desktop-orbit-before.png`). 여기에 트레일이
**프레임당 1점** 방출이라 — 새 속도는 wall-clock(`ORBIT_MS`) — 기기 fps 가 낮을수록
간격이 벌어져 "뚝뚝 끊어짐"이 가중된다.

**티켓 카드 ↔ POPULAR ROUTE 필: 데이터 버그 아님. 설계상 독립.**
탑승권은 `heroRoute`(= SearchBar 의 실제 출발/도착, 기본 ICN→LHR)를 그린다.
필은 `popularRoutes` 5개를 7초마다 순환하는 마케팅 콘텐츠이며, 코드 주석에
"가격·예약 활동 주장 없음"이라는 판단 근거까지 남아 있다. **연동하면 오히려
안 된다** — 필이 검색값을 따라가면 "인기 노선"이라는 라벨이 거짓이 된다.
혼동의 실제 원인은 데이터가 아니라 레이아웃이었다: 카드가 잘려 있고 검색바가
화면 밖이라 대조군이 안 보였다. 배치를 고치니 같은 화면에 검색바(ICN→LHR)가
들어와 관계가 스스로 설명된다. **카피·데이터 변경 없음.**

### I12-1. 스테이지를 뷰포트에 고정 + 트레일 재질/방출 수정

- `.hero-stage` (globals.css): `<View>` 박스를 `min(100svh, 100%)` 로. 스테이지
  aspect 0.282 → **0.462**(390), 0.26 → 0.45(360), 0.32 → 0.462(414).
  **데스크톱 1.6 → 1.6 불변.**
  - svh 폴백은 `@supports not (height: 100svh)` 로 뺐다. 같은 룰에 `height:` 를
    두 번 쓰는 고전적 폴백은 **CSS 옵티마이저가 뒤엣것만 남기고 접어버린다**
    (서빙된 청크를 직접 확인). 폴백이 없으면 svh 를 모르는 브라우저에서 height
    가 통째로 날아가고, bottom 없는 absolute 박스라 스테이지가 0 이 된다.
- 트레일 재질을 전용 `ShaderMaterial` 로 교체. 페이드를 vertex color 가 아니라
  **`aFade` 어트리뷰트**로 옮겨 rgb 와 alpha 를 함께 구동 → 페이드된 샘플이 두
  채널 모두에 0 을 기여한다(검정 사각형 소멸). 블렌딩을 명시(One/One alpha)한
  것은 투명 캔버스 합성에서 알파 가중치가 rgb 와 같아야 하기 때문.
  `gl_PointSize` 는 three 의 points 규약(`size*dpr*(cssH/2)/-z`)을 그대로 재현해
  가로 화면의 그레인을 보존.
- 방출을 **프레임당 1점 → 이동 거리당 1점**으로. 느린 프레임은 지나친 구간을
  채워 넣으므로 20fps 든 70fps 든 트레일이 동일하다. 스텝은 구도 스케일에
  비례하므로 세로 화면도 같은 그레인.
- 사각 기본 포인트 → 소프트 방사형 스프라이트(코너 스파크가 쓰던 것을 공유,
  새 시각 언어 없음). 피치를 스프라이트의 0.25 배로: 소프트 스프라이트의
  **가시 코어는 명목 크기의 ~40%** 라 피치≈크기면 여전히 구슬로 보인다.
  `TRAIL_N` 120→260 으로 길이 보존, `TRAIL_GAIN` 으로 겹침 증가분 상쇄.

### I12-2. 탑승권 배치

`SETTLE` 을 가로/세로 두 앵커로 나누고 기존 portrait 램프로 보간(브레이크포인트
점프 없음). 세로에서 y 0.225 → 0.135 — 헤드라인은 세로에서 중앙 전폭이라 원래
자리가 카피 위였다. x 는 0.72 유지(중앙으로 옮기면 지구본 캡 위로 돌아간다).
`.hero-content` 상단 리저브를 애니메이션 분기에도 부여(184px). 320px 리저브는
**정적 카드용**인데 셀렉터가 모든 폰에 걸려 있었고, 그게 히어로를 1558px 까지
부풀린 요인 중 하나였다 → `[data-hero-static]` 로 스코프.

### 증빙

`scripts/i12-shots.mjs`(before/after), `i12-trail-crop.mjs`, `i12-parity.mjs`,
`i12-morph-check.mjs`, `i12-mobile-times.mjs`. 리포트
`docs/screenshots/i12-{before,after}-report.json`.

| 폭 | 스테이지 aspect | 탑승권 L..R / 폭 | 우측 여백 | 화면 안 | 헤드라인 겹침 |
|---|---|---|---|---|---|
| 390 | 0.282 → **0.462** | 208.1..355.1 / 390 | 34.9px | ✅ | ❌ 없음 |
| 360 | 0.26 → **0.45** | 192.3..327.4 / 360 | 32.6px | ✅ | ❌ 없음 |
| 414 | 0.32 → **0.462** | 220.9..376.9 / 414 | 37.1px | ✅ | ❌ 없음 |
| desktop | 1.6 → **1.6** | 862.8..1219 / 1440 | 221px | ✅ | ❌ 없음 |

탑승권 경계는 눈대중이 아니라 `__ternState().passNdc`(네 모서리 NDC)를 스테이지
rect 로 환산한 값이다. 캡처는 **headful** Chrome(58–73fps 실측, 앱 내부
`PerformanceMonitor` 와 교차 확인) — headless SwiftShader 는 2–4fps 라 이번에
검증할 대상(트레일 연속성)을 그 자체로 왜곡한다(I6-b 교훈).

무손상: 궤도 불변량 1.160 불변, bird→ticket 모프 정상(`i12-morph-t*.png` —
검은 사각형이 사라지고 외곽선이 빛의 점선으로 응결), 적응형 품질 티어 미변경,
정적 페이지 **159 불변**, tsc EXIT=0, eslint 0 errors, build EXIT=0.

PC 패리티(`i12-parity.json`): 히어로 구성요소 10종 전부 모바일에서 렌더됨.
유일한 차이는 ScrollTrail(G2) 1개로, globals.css 에 "모바일 거터가 좁아
의도적으로 끔"이라고 명시된 기존 결정이다. **구조적 누락 없음.**

### 검증 필요

- **실기기 iPhone Safari.** 여기서 재현·수정한 것은 데스크톱 Chrome 의 모바일
  에뮬레이션이다. `100svh` 가 iOS 툴바 표시/숨김 전환에서 어떻게 리사이즈되는지,
  그리고 실제 기기 fps 에서 트레일이 의도대로 보이는지는 **신고자가 프로덕션
  배포 후 실기기로 확인**해야 한다. 거리 기반 방출이라 fps 의존성은 원리적으로
  제거됐지만, 실측은 못 했다.

## I11 — tier 2 얇은 콘텐츠 정리 (2026-08-01)

### I11-0. 범위 재확인

**tier 2 규모 = 정확히 7,894곳.** 산출: `airports.json` 7,917 − 큐레이션 23.
큐레이션 23곳이 전부 데이터셋에 존재함을 확인했으므로(누락 0) 단순 차집합이
성립한다.

**데이터셋 전체를 세는 쪽을 택했고, "/booking 검색에 실제로 나타나는 것만" 세지
않았다.** 근거: 리스크는 "크롤러가 도달할 수 있는가"인데 tier 2 URL은 **전부
라이브**다(라우트가 동적이라 7,894곳 모두 200을 반환했다). 검색 결과 노출 여부는
내부 링크 발견 경로 하나를 좁힐 뿐, URL 자체의 색인 가능성을 줄이지 않는다.
참고로 내부 링크만 보면 도달 가능 수는 사실상 0에 가깝다 — 크롤러는 검색을
수행하지 않고, 파라미터 없는 `/booking`의 기본값은 ICN→NRT(둘 다 tier 1)다.
즉 **실현 위험은 낮고 노출 면적은 넓은** 형태라, 비용이 0에 가까운 조치를
택하는 것이 합리적이다.

**함정 하나 — dev 서버는 모든 페이지에 `noindex`를 주입한다.** 최초 측정에서
tier 1인 `/guide/airport/ICN`까지 `<meta name="robots" content="noindex"/>`가
나와 "I5가 노출시킨 23개 가이드가 이미 죽어 있다"고 오판할 뻔했다. 실제 배포본
(`www.flytern.site`)을 확인하니 robots 메타가 **없었다**. robots 지시자 검증은
반드시 프로덕션 빌드에서 할 것. → §9 추가.

### I11-1. 정책 — (i)와 (ii) 둘 다 적용

**(i) `noindex, follow` — 적용.** tier 2 7,894곳은 이름·도시·국가만 다르고
본문이 전부 동일한 근사 중복이다. 색인되면 I5가 sitemap을 중심으로 키운
큐레이션 23곳과 같은 쿼리에서 경쟁한다. `follow`를 남긴 것은 링크를 계속
따라가게 해 크롤 예산을 낭비하지 않기 위해서다.

**(ii) 정직한 안내 문구 — 미루지 않고 적용.** 초안만 만들고 승인 대기하는
선택지도 있었으나 적용을 택했다. 근거: (i)은 **검색엔진에 대한** 정직함만
해결하고 **사용자에게 보이는** 문제는 그대로 남는다. tier 2 페이지는 상단에
"공항 가이드" 배지를 달고 제네릭 본문을 보여주므로, 사용자는 이것을 Tern이
ATL을 조사해 쓴 가이드로 읽는다. 배지가 페이지 내용보다 많은 것을 약속하는
상태이고, 이건 브랜드 보이스("확신 있되 정직")에 직접 걸린다. 미루면 되돌아올
계기가 없다.

`AirportGuide.genericNotice` 키를 4개 로케일에 추가하고, tier 2에서만
summary 아래 muted glass 패널로 렌더한다. 새 시각 언어 없음.

### 증빙 (프로덕션 빌드 — dev 는 robots 검증 불가)

robots 메타:

| URL | robots |
|---|---|
| `/guide/airport/ICN` (tier1) | **(없음 = 색인 가능)** |
| `/guide/airport/NRT` (tier1) | (없음) |
| `/ko/guide/airport/CDG` (tier1) | (없음) |
| `/guide/airport/ATL` (tier2) | `noindex, follow` |
| `/guide/airport/LGW` (tier2) | `noindex, follow` |
| `/{ko,ja,zh}/guide/airport/ATL` | `noindex, follow` |
| `/`, `/booking` | (없음) |

**큐레이션 23곳 전수 검사: 전부 `http=200` + robots 메타 없음 + 안내문 없음.**
이게 이번 라운드에서 가장 중요한 확인이다 — 여기 하나라도 걸렸으면 I5의
장기 자산이 검색에서 빠진다.

안내문 렌더: en/ko/ja/zh 4로케일 tier 2에서 표시, tier 1(ICN) 대조군에서 미표시.
캡처 `docs/screenshots/i11-{en,ko,ja,zh}-tier2.png` +
`i11-en-tier1-control.png`, 스크립트 `scripts/i11-shots.mjs`.

**측정 함정 하나 더**: 안내문 존재를 카피 문자열 grep으로 세면 tier 1에서도 1이
나온다 — next-intl이 **메시지 번들 전체를 HTML에 실어 보내기** 때문이다. 렌더
여부는 실제 엘리먼트(`<p class="mt-5 glass-chip...">`)로 세야 한다.

무손상: sitemap `<loc>` **144개 불변**, 고유 IATA 23곳 불변. 기존 라우트 18개
정상(`/guide/airport/ZZZ`=404, `/nope-404`=404 포함), OG 이미지 tier1·tier2 둘 다
200. 정적 페이지 **159 불변**. tsc EXIT=0, eslint 0 errors, build EXIT=0.

### 검증 필요 (원어민) — ja / zh 신규 카피 2건

`AirportGuide.genericNotice` 의 ja·zh 는 **이번에 새로 쓴 문장**이다. 내용은
Tern 자체 콘텐츠 상태에 대한 사실 서술이라 사실오류 위험은 없으나, **어투가
자연스러운지는 원어민 확인이 필요하다.** ko 는 직접 판단해 자연스러움을 확인했고
캡처로도 확인했다(en 은 원문).

```
ja: この空港の詳細ガイドはまだ用意できていません。以下はほとんどの空港に
    当てはまる一般的な案内です。個別の情報は空港の公式サイトでご確認ください。
zh: 我们尚未为该机场制作详细指南。以下是适用于大多数机场的通用建议，
    具体信息请以机场官网为准。
```

수정이 필요하면 `messages/{ja,zh}.json` 의 해당 한 줄만 고치면 된다 — 렌더 로직
변경 없음. 소유자가 4개 로케일 유지로 결정(2026-08-01), 문구 다듬기는 확인 후
별도 라운드.

### 부수 정리

I10이 추가한 `airportGuideExists()`는 **한 번도 호출되지 않은 죽은 export**였다.
이번에 실제로 필요한 `isCuratedAirportGuide()`로 교체했다.

### 건드리지 않은 발견

`airports.json`에 IATA 형식이 아닌 키가 1개 있다 — `"Niu"`. `getAirport()`가
입력을 대문자화해 조회하므로 `"NIU"`로는 매칭되지 않아 **도달 불가**이고
(`/guide/airport/Niu` → 404) 동작상 무해하다. 데이터셋 품질 흠으로만 기록한다.

## I10 — 존재하지 않는 IATA soft-404 제거 (2026-08-01)

### I10-0. 범위 재확인 — **"한 줄이면 된다"는 예상은 틀렸다**

I9 보고가 "`isKnownAirport()` 확인 후 `notFound()` 한 줄"이라고 낙관했는데,
사용처를 전부 훑으니 **고칠 지점이 3곳이고 결함도 1개가 아니라 2개**였다.

`DEFAULT_BRIEF`/`getAirportGuide` 폴백 사용처 전수:

| 사용처 | 존재하지 않는 IATA 를 만나면 | 조치 |
|---|---|---|
| `guide/airport/[iata]/page.tsx:14` (generateMetadata) | 가짜 title 생성 | **수정** |
| `guide/airport/[iata]/page.tsx:47` (본문) | 가짜 페이지 200 | **수정** |
| `guide/airport/[iata]/opengraph-image.tsx:31` | **가짜 OG 이미지 71,626B 생성** | **수정** |
| `app/sitemap.ts:54` | `getAllGuidedAirportCodes()` = 큐레이션 23곳만 | 영향 없음 |
| `booking/BookingContent.tsx:86` | I5-4 `resolveBrief` 가 이미 처리 | 영향 없음 |
| `components/SearchBar.tsx` | `getCuratedBrief` 는 null 반환 | 영향 없음 |
| `blog/[slug]/page.tsx:77` | `post.iata` 는 고정 집합 | 영향 없음 |

OG 이미지가 예상 밖이었다. `generateStaticParams` 가 큐레이션 23곳만 순회하는
것은 맞지만 **라우트는 동적으로 열려 있어서**, `/guide/airport/ZZZ/opengraph-image`
가 존재하지 않는 공항의 카드를 실제로 렌더했다(측정: 200 `image/png` 71,626B).

**결함이 2개였다** — 측정 결과:

```
BEFORE
/guide/airport/ICN  200  "Incheon International Airport (ICN)"   ← 정상
/guide/airport/ATL  200  "ATL Airport (ATL)"                     ← (2) 실존 공항인데 지어낸 이름
/guide/airport/ZZZ  200  "ZZZ Airport (ZZZ)"                     ← (1) soft-404
/guide/airport/QQQ  200  "QQQ Airport (QQQ)"
```

(1) 은 브리프가 지목한 soft-404. **(2) 는 브리프에 없던 것**이다 — ATL 은
`airports.json` 에 "Hartsfield Jackson Atlanta International Airport" 라는
검증된 이름이 있는데 페이지가 "ATL Airport" 를 지어내 덮어썼다. I5-4 가
`/booking` 에서 `resolveBrief` 로 이미 고친 §2-1 위반이 가이드 라우트에만
남아 있었다.

### I10-1. 3-tier 규칙 — 브리프의 구분 요청에 대한 답

브리프가 "존재하지 않는 공항"과 "아직 가이드를 안 쓴 실존 공항"을 혼동하지 말라고
했다. 코드에서 기존 의도를 확인한 결과 **구분이 필요하고, 이미 확립돼 있었다.**

근거 — `BookingContent.tsx:78-93` 의 주석이 규칙을 그대로 적어 두고 있다:
"showing an invented name where a verified one exists is the §2-1 problem…
The generic localized summary is kept either way: it is honest general advice,
not fabricated airport-specific detail." 가이드 라우트만 이 규칙을 못 받았다.

채택 (신규 `lib/airportGuideAccess.ts`, 서버 전용):

| tier | 대상 | 처리 |
|---|---|---|
| 1 | 큐레이션 23곳 | 기존 큐레이션 가이드 그대로 |
| 2 | `airports.json` 에 있는 실존 공항 | **200 유지**, 이름·도시·국가를 데이터셋 실값으로. 본문은 기존 제네릭 유지 |
| 3 | 둘 다 아님 | `notFound()` → I9 브랜드 404 |

**tier 2 를 404 로 하지 않은 결정적 이유**: `AirportGuideCards.tsx:100` 이
`/guide/airport/{iata}` 로 링크하는데 그 `iata` 는 **사용자가 검색한 공항**이다
(큐레이션 23곳이 아니라 7,917곳 중 아무거나). tier 2 를 404 로 만들면 대부분의
노선에서 `/booking` 이 깨진 링크를 뿜는다. 실측으로 확인함 —
`/booking?from=ATL&to=LGW` 의 카드가 `/guide/airport/{ATL,LGW}` 를 가리키고,
수정 후에도 둘 다 200 이다.

제네릭 본문을 남긴 것은 그것이 **지어낸 공항별 정보가 아니라 정직한 일반
안내**이기 때문이다("공식 택시 승강장을 이용하라", "국제선은 2시간 전 도착").
문제였던 것은 본문이 아니라 **이름**이었다. tier 2 는 sitemap 에 원래 없으므로
색인 대상이 새로 생기지도 않는다.

`lib/airportBrief.ts` 가 아니라 별도 파일에 둔 이유: 이 규칙은 `airportData`
(7,917개, 800KB)를 import 해야 하는데, `airportBrief` 는 홈의 `SearchBar` 가
클라이언트에서 import 한다. 거기 넣었으면 홈 번들에 800KB 가 실렸다.

### 증빙 (프로덕션 빌드)

```
AFTER
/guide/airport/ICN  200  "Incheon International Airport (ICN)"
/guide/airport/ATL  200  "Hartsfield Jackson Atlanta International Airport (ATL)"
/guide/airport/LGW  200  "London Gatwick Airport (LGW)"
/guide/airport/ZZZ  404   ko/ja/zh 도 전부 404 + 브랜드 404 카피 렌더
/guide/airport/QQQ  404   /guide/airport/XYZ 404
```

OG 이미지: ICN 200 86,756B · ko/ICN 200 75,258B · ATL 200 93,498B ·
**ZZZ 404 0B** (ko/ZZZ 도 404). 가짜 이미지 생성 중단 확인.

국가 표기는 CLDR(`lib/countryNames.ts`, I5-4)로 로케일화 — `/guide/airport/ATL`
= "Atlanta, United States", `/ko/guide/airport/ATL` = "Atlanta, 미국".
도시명이 ko 에서도 영문인 것은 I5-4 결정(검증된 도시명 표기 없음) 그대로다.

sitemap: `<loc>` 144개, 고유 IATA 23개(AMS…ZRH) **전부 200**, 가짜 IATA 없음.

무손상: 큐레이션 **23곳 전수 200**. 기존 라우트 17개 전부 정상
(`/` `/ko` `/ja` `/zh` `/booking` `/booking?from=ATL&to=LGW` `/about` `/support`
`/terms` `/privacy` `/signin` `/blog/*` `/sitemap.xml` `/robots.txt`
`/api/airports/search` `/opengraph-image` `/nope-404`=404).
자동완성 무손상(`atlanta`→ATL/FTY/PDK, `인천`→ICN, `ICN`→ICN).
정적 페이지 **159로 불변** — tier 2·3 은 원래 prerender 대상이 아니었다.

tsc EXIT=0, eslint 0 errors, build EXIT=0.
캡처 `docs/screenshots/i10-{en-404-nonexistent,ko-404-nonexistent,en-uncurated-real}.png`,
재현 스크립트 `scripts/i10-shots.mjs`.

### 남은 리스크

tier 2 페이지는 제네릭 본문이라 SEO 관점에선 얇은 콘텐츠다. sitemap 에 없어
적극 색인되진 않지만 `/booking` 링크를 통해 크롤러가 도달할 수는 있다. 지어낸
정보가 없다는 점에서 §2-1 은 통과하나, 장기적으로는 tier 2 에 "아직 상세
가이드가 없습니다" 류의 명시적 안내를 넣거나 `noindex` 를 다는 편이 정직하다.
이번 범위 밖이라 후보로만 남긴다.

## I9 — 404 흰 화면 수정 (2026-08-01)

### I9-0. 재확인 — I7의 "§3 저촉" 판단은 **틀렸다**

I7은 "루트 not-found를 붙이려면 `app/layout.tsx`를 새로 만들어야 하는데 이
프로젝트의 루트 레이아웃은 `app/[locale]/layout.tsx`라 §3 불가침에 걸린다"고
보류했다. 재확인 결과 **전제는 맞고 결론이 틀렸다.**

(a) 증상 재현 — 확인됨. 모든 garbage 경로가 Next 기본 404를 렌더했다.
`<title>404: This page could not be found.</title>`, 스타일시트 0개,
`body{color:#000;background:#fff}`, `theme-color` 없음. **상태 코드 자체는
이미 404로 정상**이었다(가짜 200 아님). `/en/nope-404`만 307(as-needed 접두어
제거)이다.

(b) `app/` 실사 — 루트 `app/layout.tsx`는 **없다**. 그런데
`app/[locale]/not-found.tsx`는 **이미 존재하고**, Civil Twilight로 완성돼 있으며
(ink→dusk 그라디언트, hero-stars, 컨트레일 + tern 글리프, 홈/서포트 CTA)
`NotFound` 메시지도 **4개 로케일 전부 채워져 있다.** 즉 디자인도 카피도 이미
있었고 **거기에 도달하는 경로만 없었다.**

(c) 판단 재구성 — I7의 추론은 "`app/not-found.tsx`는 루트 레이아웃을 요구한다"는
일반 제약에 기댄 것이고, 그 자체는 맞다. 놓친 것은 **이 Next 버전의 문서**다.
`node_modules/next/dist/docs/.../not-found.md`를 읽으니:

- `not-found.js`는 **해당 세그먼트 안에서 `notFound()`가 던져질 때만** 뜬다.
  진짜로 매칭 실패한 URL은 루트 `app/not-found.js`로 떨어진다 — 그게 없어서
  기본 페이지가 나왔다. 원인 확정.
- Next 15.4+에는 `global-not-found.js`가 있고, 문서가 적용 대상으로 **"루트
  레이아웃이 최상위 동적 세그먼트인 경우(`app/[country]/layout.tsx`)"**를 명시한다.
  이 프로젝트가 정확히 그 경우다.

**핵심 답: next-intl을 건드리지 않고 고칠 수 있다.** 필요한 것은 로케일 감지·
라우팅·메시지 변경이 아니라 "매칭 실패 시 무엇을 보여줄지" 하나뿐이다.
미들웨어·`i18n/routing.ts`·`i18n/request.ts`·`messages/*` 전부 **무수정**.

### I9-1. 구현 — `app/[locale]/[...rest]/page.tsx` (catch-all → `notFound()`)

`notFound()`만 호출하는 catch-all 페이지 하나. "매칭 실패"를 "`[locale]` 안에서
던져진 `notFound()`"로 바꿔 주므로 기존 `not-found.tsx`가 비로소 응답한다.
`[locale]` 아래에 있으니 레이아웃·폰트·메시지가 그대로 적용돼 **요청 언어로
공짜로 번역된다.**

`global-not-found.tsx`를 쓰지 않은 이유: (1) 아직 experimental 플래그가 필요하고,
(2) 레이아웃 렌더를 우회해 전역 스타일·폰트를 손으로 다시 import해야 하며,
(3) 전역이라 로케일 세그먼트가 없어 **번역할 근거가 없다.** 통과 기준이
로케일별 표시를 요구하므로 이 갈래는 요구사항에서 이미 진다.

증빙 (프로덕션 빌드, `scripts/i9-shots.mjs`):

| 로케일 | URL | http | h1 |
|---|---|---|---|
| en | `/nope-404` | 404 | You've flown off the route |
| ko | `/ko/nope-404` | 404 | 경로를 벗어났네요 |
| ja | `/ja/nope-404` | 404 | ルートを外れました |
| zh | `/zh/nope-404` | 404 | 偏离航线了 |

캡처 `docs/screenshots/i9-{en,ko,ja,zh}-404.png`.

**캡처 함정 하나 실제로 밟았다**: 첫 실행에서 en 캡처에 **한국어**가 찍혔다.
`localeDetection`이 켜져 있어 접두어 없는 `/nope-404`가 크롬의 Accept-Language를
따라 `/ko`로 리다이렉트된 것이다(정상 동작이지 버그가 아니다). 스크립트에서
로케일별로 Accept-Language를 고정하고 컨텍스트를 분리해 재캡처했다.

엣지 케이스: `/fr/booking`·`/fr`(존재하지 않는 로케일), `/guide`,
`/ko/guide/airport`(불완전 경로) 전부 404 + 브랜드 페이지. `/en/nope-404`는
307 유지(불변). `/api/nope`도 404 정상.

### 무손상 확인 (I8-1 수준으로 재확인)

catch-all은 라우트 충돌 위험이 있는 변경이라 실제로 확인했다. 프로덕션 빌드에서
20개 라우트 전부 200: `/` `/ko` `/ja` `/zh` `/booking` `/ko/booking` `/about`
`/ko/about` `/support` `/terms` `/privacy` `/signin` `/guide/airport/{ICN,NRT}`
+ ko/ja/zh, `/sitemap.xml` `/robots.txt` `/api/airports/search`.
가이드 본문 실렌더도 확인(h1 = `Incheon International Airport (ICN)` /
`인천국제공항 (ICN)`, JSON-LD 1개). OG 이미지 6종 전부 200 `image/png`
(86,756 / 75,258 / 77,245 / 76,841 / 103,604 ×2). 블로그 2종 200.
정적 페이지 **159로 불변**.

### 남은 한계 — 404 본문은 클라이언트 렌더다

서버가 보내는 HTML에는 `<main>`·`<h1>`·`<svg>`가 **0개**다. 404 카피는 RSC
페이로드에만 있고 JS 실행 후 그려진다(`<template
data-next-error-message="NEXT_HTTP_ERROR_FALLBACK;404">`). 정상 페이지와 달리
`<link rel="stylesheet">`도 걸리지 않는다.

**다만 흰 화면 문제 자체는 해결됐다.** JS를 끄고 측정하니 body 배경이
`rgba(0,0,0,0)`이고 실제 렌더는 **#111 다크**다 — `colorScheme: "dark"`(I7-2)가
브라우저 UA 기본값을 다크로 만들기 때문. light/dark 스킴 둘 다 다크로 나온다.
즉 JS 없이도 **흰 화면은 아니고**, 상태 코드 404와 `theme-color: #0A0F1E`는
서버가 보낸다. JS가 있으면 완성된 브랜드 페이지가 뜬다(캡처).

SEO 영향은 없다고 본다 — 검색엔진에 중요한 건 404 **상태 코드**이고 그건
서버에서 정확히 나간다. 색인되면 안 되는 페이지라 본문 SSR의 가치가 낮다.

서버 렌더까지 원하면 `global-not-found.tsx`가 유일한 경로이고, 그 대가는 위에
적은 experimental + 로케일 상실이다. **지금 채택하지 않는다.**

### 건드리지 않은 발견 — 존재하지 않는 IATA가 soft-404 (200)

`/guide/airport/ZZZ` → **200**, `<title>ZZZ Airport (ZZZ) Airport Guide ...`,
h1 `ZZZ Airport (ZZZ)`. `getAirportBrief`의 `DEFAULT_BRIEF`가 아무 3글자에나
"ZZZ 공항" 플레이스홀더를 만들어 실재하지 않는 공항 페이지를 200으로 찍어낸다.
검색엔진에는 soft-404이고, 지어낸 이름을 표시한다는 점에서 §2-1 취지에도
어긋난다. I5-4가 자동완성에 대해 같은 문제를 `getCuratedBrief`로 막았는데
가이드 라우트에는 적용되지 않았다.

고치려면 `generateMetadata`/페이지에서 `isKnownAirport()` 확인 후 `notFound()`를
부르면 되고, **I9-1 덕분에 이제 그게 브랜드 404로 뜬다.** I9 범위 밖이라
후보로만 남긴다.

## I8 — 죽은 라우트 제거 + 로케일 검색 별칭 + OG 307 판단 (2026-08-01)

### I8-1. `app/guide/airport/[iata]/page.tsx` 삭제 — **잠재 리그레션이 아니라 실제 장애였다**

브리프와 직전 라운드 보고는 이 파일을 "미들웨어 rewrite 덕에 무해한 죽은 코드"로
분류했다. **틀렸다.** 깨끗한 dev 서버에서 재확인하니 공항 가이드 라우트가 **4개
로케일 전부 404**였다.

```
/guide/airport/ICN    -> 404      /  -> 200
/ko/guide/airport/ICN -> 404      /booking -> 200
/ja/guide/airport/ICN -> 404      /about   -> 200
/zh/guide/airport/ICN -> 404
```

다른 라우트는 전부 정상이라 서버 문제가 아니다. 인과는 실험으로 확정했다 — 중복
파일 하나를 제거하자 같은 서버에서 **즉시 4개 전부 200**으로 바뀌었다.

직전 라운드가 200을 관측한 것도 사실이다. 즉 `app/guide/...`와
`app/[locale]/guide/...`가 같은 URL을 두고 충돌하면서 **컴파일 순서에 따라
비결정적으로** 승자가 갈렸다. "무해함"은 관측이 운이 좋았던 것이고, 재현되지
않는 200에 기대고 있었다.

**교훈으로 남길 것**: 라우트 충돌에서 한 번의 200은 안전의 증거가 아니다.
→ §9 추가함.

로직 손실 없음. `[locale]` 버전은 삭제본의 **상위집합**이다(삭제본에 없던
transitTips·SiteFooter·JSON-LD·generateMetadata·i18n을 모두 가짐). 삭제본에만
있던 것은 floorGuide 섹션의 영문 안내문 한 줄("Static facts only — exact walking
routes...")뿐이고, 대응하는 메시지 키(`floorGuideNote`)가 4개 로케일 어디에도
없다. 도달 불가였으므로 사용자가 보던 문구가 아니다. **이식하지 않았다** — 4개
로케일 신규 카피 작성은 I8 범위 밖이고 ja/zh 자연스러움 검증이 필요하다. 아래
"열린 항목"에 남긴다.

증빙 (프로덕션 빌드 `next start`, 응답 본문):

| URL | http | h1 | 다크 | 구버전 | JSON-LD |
|---|---|---|---|---|---|
| `/guide/airport/ICN` | 200 | Incheon International Airport (ICN) | 1 | 0 | 1 |
| `/ko/guide/airport/ICN` | 200 | 인천국제공항 (ICN) | 1 | 0 | 1 |
| `/ja/guide/airport/ICN` | 200 | 仁川国際空港 (ICN) | 1 | 0 | 1 |
| `/zh/guide/airport/ICN` | 200 | 仁川国际机场 (ICN) | 1 | 0 | 1 |
| `/guide/airport/NRT` | 200 | Narita International Airport (NRT) | 1 | 0 | 1 |

빌드 라우트 목록에서 비로케일 `/guide/...` 항목이 사라졌고 정적 페이지 수는
**159로 불변**(삭제분이 prerender 대상이 아니었음).

### I8-2. 큐레이션 23곳 로케일 별칭 검색 인덱스

`lib/airportBrief.ts`에 `getBriefSearchAliases()` 추가 — `BRIEFS`의 4개 로케일
`name`/`city`를 소문자 별칭으로 모아 IATA별로 반환. `app/api/airports/search/route.ts`가
모듈 스코프에서 한 번 만들어 쓴다.

**로케일 파라미터를 추가하지 않았다.** 모든 로케일의 별칭을 동시에 매칭하므로
라우트 시그니처가 그대로고, ko 사용자가 일본어 표기를 붙여넣어도 찾힌다. 표시
계층은 기존대로 로케일별(`getCuratedBrief`)이고 **매칭만 넓어진다.**

무손상은 **구조로** 보장했다 — 별칭 분기는 기존 영문/IATA 분기가 전부 실패한
경우(`score < 0`)에만 실행된다. ASCII 질의는 이 블록이 없던 때와 같은 점수를
받을 수밖에 없다.

증빙 — 구조 논증만으로는 §5를 만족하지 않으므로 실제 응답을 before/after로
떴다. 영문·IATA 20개 질의(`atlanta` `paris` `lon` `new york` `sao` `ICN` `LGW`
`GRU` `DXB` `ATL` `NRT` `JFK` 등)의 **순서 포함 전체 결과가 byte-identical**
(`diff` 무출력). 캡처 스크립트 `scratchpad/probe.mjs`, 산출물 `before.txt`/`after.txt`.

신규 동작 (프로덕션 빌드):

| 질의 | 결과 | 질의 | 결과 |
|---|---|---|---|
| 인천 | ICN | 히스로 | LHR |
| 成田 | NRT | 羽田 | HND |
| 戴高乐 | CDG | 창이 | SIN |

**브리프의 비큐레이트 예시가 또 틀렸다**: GRU·DXB는 둘 다 큐레이션 23곳에
**포함**된다(I5-4가 CDG·GRU·DXB에 대해 같은 정정을 이미 기록했다). 실제
비큐레이트 회귀 확인에는 `atlanta`(ATL/FTY/PDK)를 썼고 결과 불변이다.

### I8-3. en OG 307 홉 — **조치 불필요로 종결**

프로덕션(`www.flytern.site`) 실측:

```
GET /en/guide/airport/ICN/opengraph-image?dbc75e80dd9a5686
  -> 307, Location: /guide/airport/ICN/opengraph-image
  -> 200, image/png, 86,756 bytes (hops=1, 1.53s)
```

주요 스크레이퍼 User-Agent 4종 전부 **최종 200 image/png 86,756 bytes**:
`facebookexternalhit/1.1`, `Twitterbot/1.0`, `Slackbot-LinkExpanding`,
`LinkedInBot/1.0`. UA 기반 차단 없음. 대조군 ko는 hops=0 직행 200(75,258 bytes).

**판단: 고치지 않는다.** 실제 실패 모드(스크레이퍼가 이미지를 못 받음)가
반증됐다. 비용은 en 한정 왕복 1회뿐이고, 307에 `max-age=0, must-revalidate`가
붙어 매 스크레이프마다 홉을 치르지만 이미지 자체는 정상 전달된다.

수정 방안 2가지를 확인했고 **둘 다 채택하지 않았다**:

1. `generateMetadata`에서 `openGraph.images`를 직접 조립 — Next가 붙이는 콘텐츠
   해시(`?dbc75e80dd9a5686`, 캐시 무효화용)를 잃는다. 브리프가 인용한 기존 판단이
   맞다. 없는 이득에 캐시 정합성을 내주는 거래다.
2. 미들웨어 matcher에 `opengraph-image` 제외 추가
   (`(?!...|.*opengraph-image|...)`) — 해시를 **잃지 않고** 307을 없앨 수 있다.
   현재 matcher는 `.*\..*`로 확장자 있는 파일만 빼는데 `opengraph-image`는 확장자가
   없어 걸린다. 다만 이건 **§3 불가침(next-intl 로케일 시스템)** 수정이므로
   브리프 지시대로 구현하지 않고 방안만 남긴다.

**검증 필요**: 위는 HTTP 계층 확인이다. 페이스북/트위터 렌더러가 실제로 카드
미리보기를 그리는지는 디버거 로그인이 필요해 확인하지 못했다. 소유자가
`https://www.flytern.site/guide/airport/ICN`을 페이스북 공유 디버거에 한 번
넣어보면 종결된다.

### 열린 항목 (이번에 만들지 않고 남김)

- floorGuide 섹션 안내문이 4개 로케일 모두 없음. 삭제된 중복 라우트에만 영문으로
  있었다. 신규 카피 + ja/zh 검증이 필요해 범위 밖.
- dev 로그 경고: `The "middleware" file convention is deprecated. Please use
  "proxy" instead.` (Next 16.2.2). §3 불가침 영역이라 손대지 않음. 마이그레이션은
  별도 판단 필요.
- 워크스페이스 루트 경고: `C:\Users\mimin\package-lock.json`이 루트로 추론됨.
  `turbopack.root` 미설정. 빌드는 성공하나 경고가 매 실행 출력된다.

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

## I6 — 완료 (2026-07-27, 커밋 e8c4c2a·a805688·c6e9527)

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

### I6-b3. 모바일 globe 적응형 활성화 — 완료 (2026-07-28, 커밋 6860d16·f267c91·2c74ffd)

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
