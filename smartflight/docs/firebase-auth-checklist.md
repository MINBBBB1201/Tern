# Firebase 로그인 점검 체크리스트 (smartflight-70ae5)

## 먼저: "24시간째 승인 대기"의 정체

Firebase에는 **승인 대기라는 절차가 없습니다.** 프로바이더 활성화·도메인 추가는
저장 즉시 반영됩니다. "기다려도 안 되는" 증상의 실제 원인은 코드에 있었고
(아래 참고), 콘솔에서 확인할 것은 승인 여부가 아니라 **설정 누락**입니다.

> 코드 측 원인(수정 완료): 기존 코드는 `signInWithRedirect`를 사용했는데,
> 앱 도메인(flytern.site / localhost)과 `authDomain`
> (smartflight-70ae5.firebaseapp.com)이 서로 다른 origin이라 최신 브라우저의
> 서드파티 스토리지 차단(Chrome 115+, Safari ITP) 때문에 리다이렉트 결과를
> 앱이 읽지 못합니다. 에러도 없이 로그인이 영원히 "안 되는" 상태 —
> 승인 대기처럼 보이는 증상 그 자체. 현재는 팝업 우선(`signInWithPopup`),
> 팝업 차단 시에만 리다이렉트 폴백으로 동작합니다.

## Firebase 콘솔에서 확인 (console.firebase.google.com → smartflight-70ae5)

1. **Google 프로바이더 활성화**
   - 경로: `Authentication → Sign-in method(로그인 방법) 탭 → Google`
   - "사용 설정(Enable)" 토글이 켜져 있어야 하고, **프로젝트 지원 이메일**이
     선택되어 있어야 저장됩니다.

2. **Email/Password 프로바이더 활성화** (A6에서 추가된 이메일 로그인/가입용)
   - 경로: `Authentication → Sign-in method → 이메일/비밀번호`
   - "사용 설정" 토글 ON. (하단의 "이메일 링크"는 켜지 않아도 됨)

3. **Authorized domains에 서비스 도메인 추가**
   - 경로: `Authentication → Settings(설정) 탭 → Authorized domains(승인된 도메인)`
   - 목록에 반드시 있어야 하는 것:
     - `flytern.site`
     - `www.flytern.site` (www로도 접속된다면)
     - Vercel 프리뷰로도 로그인 테스트를 한다면 해당 `*.vercel.app` 도메인
     - `localhost` (기본 포함 — 지워졌다면 다시 추가)
   - 없으면 `auth/unauthorized-domain` 에러가 나며, 이제 이 에러는 화면에
     그대로 표시되도록 코드에 반영해 두었습니다.

## Google Cloud 콘솔에서 확인 (console.cloud.google.com → 같은 프로젝트 선택)

4. **OAuth 동의 화면(Consent screen) 게시 상태**
   - 경로: `APIs & Services → OAuth consent screen`
     (새 UI에서는 `Google Auth Platform → Branding / Audience`)
   - **Publishing status가 "Testing"이면 테스트 사용자 목록에 등록된 계정만
     로그인 가능**합니다. 본인 계정이 Test users에 없으면 로그인이 거부됩니다.
     - 해결: "Publish app"으로 **In production** 전환(외부 사용자 대상), 또는
       Test users에 본인 Gmail 추가.
   - "In production"으로 게시해도 Google의 **브랜드 검증(verification)** 은
     별개이며, 검증 전에는 로그인 화면에 "확인되지 않은 앱" 경고가 뜰 뿐
     로그인 자체는 됩니다(민감 스코프를 안 쓰는 지금 구성 기준).

5. **승인된 자바스크립트 원본 / 리디렉션 URI** (보통 Firebase가 자동 관리 —
   직접 만졌을 때만 확인)
   - 경로: `APIs & Services → Credentials → OAuth 2.0 Client IDs →
     Web client (auto created by Google Service)`
   - Authorized JavaScript origins에 `https://flytern.site`,
     Authorized redirect URIs에
     `https://smartflight-70ae5.firebaseapp.com/__/auth/handler`
     가 있는지 확인.

## 배포 환경(Vercel) 확인

6. **환경변수** — `NEXT_PUBLIC_FIREBASE_*` 6개가 Vercel 프로젝트 설정에도
   등록되어 있는지 확인 (`.env.local`은 로컬 전용).

## 빠른 자가진단

- 사이트에서 로그인 버튼 클릭 → 팝업이 뜨는가?
  - 팝업조차 안 뜸 → 브라우저 팝업 차단 또는 JS 에러 (콘솔 확인)
  - 팝업에서 계정 선택 후 "액세스 차단됨: 이 앱의 요청이 잘못되었습니다" →
    3번(도메인) 또는 5번(리디렉션 URI) 문제
  - "이 앱은 Google에서 확인하지 않았습니다" 경고 → 4번의 검증 관련 —
    "고급 → 이동"으로 통과 가능, 로그인 자체는 정상
  - 팝업 닫힌 뒤 아무 일도 없음 + 화면에 에러 문구 → 문구가 그대로 원인
    (unauthorized-domain / operation-not-allowed 등)
