# MAJU Web — UI/UX · 제품 깊이 계획

> **작성 목적:** Phase 2 Step 4(다국어 UI) 및 이후 단계 진행 전, 웹 앱의 UI/UX와 **제품 깊이(재방문·성장·설정)** 를 함께 계획한다.  
> **범위:** `apps/web` (13 페이지, 3 레이아웃, 면접 플로우) + Phase 2 API 연동  
> **상태:** Phase A~G (waitlist redeem 제외) · Step 4 i18n 구현 완료 · **Phase D · Step 5 대기**

---

## 1. 현재 상태 요약

MAJU 웹은 크게 **3개 존(zone)** 으로 나뉜다.

| 존 | 페이지 | 레이아웃 | 톤 |
|----|--------|----------|-----|
| **마케팅/인증** | `/`, `/login`, `/signup`, `/setup` | 없음 / `AuthLayout` | 라이트, 미니멀 |
| **앱(관리)** | `/dashboard`, `/interview/new`, `/interview/:id/report` | `AppLayout` | 라이트 |
| **면접실** | `/interview/:id/lobby`, `/interview/:id/live`, `/interview/demo` | `InterviewLayout` | 다크 |

### 핵심 사용자 플로우

```
대시보드 → 새 면접 설정 → 로비(장치 확인) → Live → 리포트 → 대시보드
```

Phase 1~2 핵심 기능(Live AI, HUD, peer pressure, 리포트 고도화)은 연결되어 있으나, **「면접 1회 도구」** 에 가깝고 **「면접 훈련 코치 플랫폼」** 으로의 레이어는 아직 얇다.

### Phase 2 · UI/UX 진행 현황

| 구분 | 상태 | 비고 |
|------|------|------|
| Phase 2 Step 1 Peer Pressure | ✅ | peer TTS, intensity |
| Phase 2 Step 2 Persona depth | ✅ | followUpDepth, peer personas |
| Phase 2 Step 3 Report v2 | ✅ | rubric, timeline, questionFeedback, DELETE session |
| UI/UX Phase A 프로덕션 정리 | ✅ | dev 격리, 용어 통일 |
| UI/UX Phase B 플로우 UX | ✅ | Stepper, 로비, ConfirmDialog, LoadingState |
| Phase 2 Step 4 i18n | ✅ | `apps/web/src/i18n/`, LanguageSwitcher, 면접 AI 언어 선택 |
| UI/UX Phase C 디자인 시스템 | ✅ | Alert, OptionCard, EmptyState, PageHeader, @theme tokens |
| UI/UX Phase E Live 몰입 | ✅ | 타이머, 진행률, 세션 이름, 텍스트 답변 |
| Phase 2 Step 5 Waitlist redeem | ⬜ | Step 4와 병렬 가능 |

### 라우트 목록

| Route | 파일 | Auth |
|-------|------|------|
| `/` | `pages/HomePage.jsx` | Public |
| `/setup` | `pages/SetupPage.jsx` | Public |
| `/login`, `/signup` | `pages/LoginPage.jsx`, `SignupPage.jsx` | Public |
| `/dashboard` | `pages/DashboardPage.jsx` | Protected |
| `/interview/new` | `pages/NewInterviewPage.jsx` | Protected |
| `/interview/poc` | `pages/InterviewPocPage.jsx` | Protected (dev) |
| `/interview/demo` | `pages/InterviewDemoPage.jsx` | Protected (dev) |
| `/interview/:id/lobby` | `pages/InterviewLobbyPage.jsx` | Protected |
| `/interview/:id/live` | `pages/InterviewLivePage.jsx` | Protected |
| `/interview/:id/report` | `pages/InterviewReportPage.jsx` | Protected |

**미구현 라우트 (기획)**

| Route | 우선순위 | Phase |
|-------|----------|-------|
| `/onboarding` | P1 | G |
| `/settings` | P1 | G |
| `/billing` | P2 | Phase 3 |

---

## 2. 제품 깊이 갭 — 왜 「단순」하게 느껴지는가

핵심 루프(설정 → 면접 → 리포트)는 동작하지만, **제품 레이어**가 빠져 있다.

| 영역 | 현재 | 랜딩/기획에서 약속한 것 |
|------|------|------------------------|
| **진입** | 로그인 → 바로 대시보드 | 온보딩(목표·언어), waitlist redeem |
| **설정** | 텍스트 붙여넣기 + 옵션 카드 | 파일 업로드, 템플릿, 저장된 프리셋 |
| **면접 중** | 녹음 → AI 턴 | 타이머, 남은 시간, 면접 유형(기술/인성) |
| **면접 후** | 1회성 리포트 | 성장 추이, 약점 반복, 추천 연습 |
| **계정** | 이메일 + 로그아웃만 | 설정, 플랜, 프로필, UI 언어 |
| **발견성** | 홈이 CTA만 | How it works, 첫 면접 가이드 |

→ UI/UX Phase C~D(디자인·폴리시)와 **Phase E~G(제품 깊이)** 를 함께 진행해야 「단순함」이 해소된다.

### 기능 축 (제품 로드맵)

| 축 | 대표 기능 | 기대 효과 |
|----|-----------|-----------|
| **A. 재방문·성장** | 점수 추이, 약점 TOP 3, 추천 재도전 | 다시 오는 이유 |
| **B. 설정·준비** | 프리셋, 최근 공고, 면접 유형, 연습/실전 모드 | 매번 처음부터 설정 X |
| **C. Live 몰입** | 타이머, 진행률, 텍스트 답변 fallback, 일시정지 | 시뮬레이션 체감 |
| **D. 리포트·코칭** | PDF, 공유, 모범 답변 비교, STAR 리라이트 | Step 3 이후 확장 |
| **E. 계정·수익** | 설정, 온보딩, waitlist, 플랜 제한 | 랜딩과 일관성 |
| **F. 신뢰·완성도** | 첫 방문 가이드, 홈 강화, 에러 복구, 세션 이름 | 베타 느낌 감소 |

**의도적으로 미루는 것:** 결제/Stripe, WebRTC 멀티유저, lip-sync 아바타, 모바일 네이티브, 소셜 로그인 (retention 확인 후).

---

## 3. 발견된 주요 이슈

### P0 — 사용자에게 바로 보이는 문제

| # | 이슈 | 상태 | 위치 / 예시 |
|---|------|------|-------------|
| 1 | **개발/내부용 UI 노출** | ✅ 해결 | `VITE_ENABLE_DEV_TOOLS=true` + dev server일 때만 poc/demo |
| 2 | **면접 플로우 단계감 부재** | ✅ 해결 | `InterviewStepper` |
| 3 | **용어 불일치** | ✅ 해결 | 만들기 → 준비 → 진행 → 결과 |
| 4 | **로비 dead-end** | ✅ 해결 | live/completed 상태별 안내 |
| 5 | **라이트 ↔ 다크 급격한 전환** | ⬜ | `InterviewLayout` Logo variant (Phase C) |

### P1 — UX 품질 / 일관성

| # | 이슈 | 상태 | 상세 |
|---|------|------|------|
| 6 | **디자인 토큰 미사용** | ⬜ | hex 하드코딩 → Phase C |
| 7 | **공통 컴포넌트 부재** | 🔶 부분 | ConfirmDialog, LoadingState ✅ / OptionCard, EmptyState ⬜ |
| 8 | **로딩 상태 빈약** | 🔶 부분 | LoadingState 도입, Live overlay ✅ |
| 9 | **`<Link><Button>` 중첩** | 🔶 부분 | Phase A 일부 수정, Phase D 잔여 |
| 10 | **`window.confirm` 사용** | ✅ 해결 | ConfirmDialog |

### P2 — 폴리시 / 접근성 / 제품 깊이

| # | 이슈 | 상태 | 상세 |
|---|------|------|------|
| 11 | **접근성** | ⬜ | aria, route title, alt — Phase D |
| 12 | **모바일 Live/HUD** | ⬜ | Phase D |
| 13 | **랜딩 빈약** | ⬜ | How it works — Phase D |
| 14 | **Live 타이머·진행률 없음** | ✅ | Phase E |
| 15 | **성장 대시보드 없음** | ✅ | Phase F |
| 16 | **설정·온보딩 없음** | ✅ | Phase G (redeem 제외) |

---

## 4. 디자인 시스템 현황

### `@maju/ui` 사용 현황

| 사용 중 | 미사용 / 부족 |
|---------|---------------|
| `Button`, `Input`, `Textarea`, `Logo`, `MarkerHighlight` | `tokens.js` (색상 미참조) |
| | `Card`, `Select`, `Badge`, `Alert`, `Modal`, `Spinner` |

### 색상 토큰 (`packages/ui/src/tokens.js`)

```javascript
text: '#2A2A2A'
muted: '#64748B'
surface: '#F8FAFC'
accentStart: '#2AD175'
accentEnd: '#E3F58F'
highlight: '#E3F58F'
```

→ Tailwind `@theme` 또는 CSS 변수로 승격 후 semantic class 적용 (Phase C).

### 다크/라이트 존

| 존 | 배경 | 헤더 브랜드 |
|----|------|-------------|
| AppLayout | `#ffffff` | `<Logo>` (dark text) |
| InterviewLayout | `#0a0a0a` | plain text 「MAJU」 → Logo light variant |
| InterviewRoom | `#1a1a1a` | macOS-style dots |
| HudOverlay | light cards on dark | — |

---

## 5. 작업 계획 (Phase A ~ G)

UI/UX **Phase A~B**는 완료. 이후 **Phase C~D**(디자인·폴리시)와 **Phase E~G**(제품 깊이)를 Phase 2 Step 4~5와 병렬·교차 진행한다.

---

### Phase A — 프로덕션 정리 ✅

- Dev 라우트 `VITE_ENABLE_DEV_TOOLS` 격리
- 카피·용어 통일 (만들기 → 준비 → 진행 → 결과)

---

### Phase B — 면접 플로우 UX ✅

- `InterviewStepper`, 로비 상태 처리, `MediaStreamContext`
- `ConfirmDialog`, `LoadingState`, Live processing overlay
- 리포트 empty state

---

### Phase C — 디자인 시스템 정리 ✅

**목표:** i18n 전 UI 뼈대 공통화 (Step 4와 **병행** 권장)

| 작업 | 상세 | 관련 파일 |
|------|------|-----------|
| **Alert** | 에러/성공 배너 | `@maju/ui/Alert.jsx`, 전 페이지 |
| **OptionCard** | 선택 카드 통합 | `@maju/ui/OptionCard.jsx`, `NewInterviewPage` |
| **EmptyState** | 빈 목록/데이터 | `@maju/ui/EmptyState.jsx`, Dashboard, Report |
| **PageHeader** | 제목 + 설명 | `@maju/ui/PageHeader.jsx`, AppLayout 페이지 |
| **tokens → theme** | `@theme` CSS 변수 + semantic class | `index.css`, `packages/ui/tokens.js` |
| **Logo variant** | InterviewLayout light logo | `Logo.jsx` (기존 완료) |

**완료 기준**

- [x] 새 페이지 추가 시 공통 컴포넌트만 조합
- [x] 색상 hex 하드코딩 80% 이상 제거 (dev PoC/Demo 제외)
- [x] Interview 존 통일 Logo + `maju-*` 토큰

---

### Phase D — 폴리시 & 모바일 (1~2일)

**목표:** 완성도 및 접근성 (Step 4 **후반** 또는 병렬)

| 작업 | 상세 |
|------|------|
| Live 모바일 | 375px: 타일 스택 또는 발언 중 확대 |
| HUD 반응형 | `sm` 이하: 하단 배너 / collapsible |
| 리포트 | 대화 기록 accordion, 긴 transcript collapse |
| 접근성 | `aria-pressed`, route `<title>`, focus ring, peer `alt` |
| **랜딩 `/` 강화** | 3-step How it works, 스크린샷, FAQ |
| Link/Button | `Button asChild` 또는 styled `Link` |

**완료 기준**

- [ ] 모바일에서 Live·HUD 사용 가능
- [ ] WCAG 기본: 키보드, 라벨, alt
- [ ] 랜딩에서 MAJU 가치 proposition 전달

---

### Phase E — Live 몰입 ✅

**목표:** 「시뮬레이션」 체감 — 구현 대비 효과 큼

| 작업 | 상태 | 상세 |
|------|------|------|
| **세션 타이머** | ✅ | `useInterviewTimer` + `LiveSessionBar`, 5분/1분 경고 |
| **진행 표시** | ✅ | `질문 current/total` (duration 기반 추정) |
| **세션 이름** | ✅ | `config.title`, 대시보드·로비·Live·리포트 |
| **텍스트 답변 fallback** | ✅ | `submitSessionTurnText` UI |
| **일시 정지** | ⬜ | Phase E+ |
| **peer2 자막-only** | ⬜ | Phase E+ |

**완료 기준**

- [x] 설정한 면접 시간이 Live UI에 표시·카운트다운
- [x] 대시보드에서 세션을 이름으로 구분 가능
- [x] 텍스트 답변으로 턴 완료 가능

---

### Phase F — 성장·재방문 (1.5~2일)

**목표:** 「한 번 쓰고 끝」 방지 — DB에 쌓인 report 활용

| 작업 | 상세 | 우선순위 |
|------|------|----------|
| **성장 대시보드** | overallScore·루브릭·HUD 지표 시간 추이 (차트) | P0 |
| **약점 TOP 3** | 최근 N회 `improvements` 집계 | P1 |
| **추천 재도전** | 리포트 → 「이 설정으로 다시 연습」 원클릭 | P0 |
| **면접 프리셋** | 「백엔드 압박 30분」 등 2~3개 저장·재사용 | P1 |
| **최근 공고 불러오기** | 지난 jobPostingText 빠른 재시작 | P2 |
| **연습 스트릭** | 연속 연습 일수 (가벼운 배지) | P3 |

**관련 파일:** `DashboardPage.jsx`, `InterviewReportPage.jsx`, `NewInterviewPage.jsx`, 집계 API (신규)

**완료 기준**

- [x] 대시보드에 최근 5회 점수 추이 표시
- [x] 리포트에서 추천 설정으로 `/interview/new` prefill
- [x] (선택) 프리셋 1개 이상 저장·불러오기

**구현 메모 (2026-08-28)**

- `apps/web/src/lib/growth-stats.js` — 클라이언트 집계 (점수 추이·루브릭 평균·약점 TOP3·스트릭)
- `apps/web/src/components/dashboard/GrowthPanel.jsx` — 대시보드 성장 패널
- `apps/web/src/lib/recommended-retry.js` — 루브릭 기반 추천 prefill
- `apps/web/src/lib/interview-presets.js` — localStorage 프리셋 + 최근 공고 추출

---

### Phase G — 계정·신뢰 (2~3일)

**목표:** 랜딩 약속 이행 + 첫 방문 경험

| 작업 | 상세 | Phase 2 Step | 상태 |
|------|------|--------------|------|
| **`/settings`** | UI 언어, 기본 페르소나, 프로필 displayName | Step 4 연동 | ✅ |
| **`/onboarding`** | 목표(취업/대학원), 경험 수준, 첫 가이드 (1회) | P1 | ✅ |
| **Waitlist redeem** | 가입 시 Premium 패스 코드 | **Step 5** | ⬜ (별도) |
| **첫 방문 가이드** | 대시보드 3-step 튜토리얼 | P1 | ✅ |
| **에러 복구** | Live API 실패 → 재시도, 턴 복구 UI | P1 | ✅ |
| **플랜 배지** | Free 표시 (Premium은 Step 5 redeem 후) | Step 5 | ✅ Free only |

**완료 기준**

- [x] 설정 페이지에서 UI 언어 전환 (Step 4)
- [x] 신규 사용자 온보딩 1회 플로우
- [ ] Waitlist 코드 redeem → Premium 배지 (Step 5에서 별도 진행)

**구현 메모 (2026-08-28, redeem 제외)**

- `SettingsPage.jsx`, `OnboardingPage.jsx`, `RequireOnboarding.jsx`
- `lib/user-preferences.js` — 온보딩·기본값·튜토리얼 localStorage
- `DashboardTutorial.jsx` — 대시보드 3단계 가이드
- `InterviewLivePage.jsx` — 시작/턴 재시도 UI

---

## 6. 통합 로드맵 — 앞으로 어떤 순서로?

Phase 2 Step과 UI/UX Phase를 **한 타임라인**으로 정리한다.

```
                    Phase 2                    UI/UX · 제품
                    ───────                    ────────────
Week 1 (현재)       Step 3 Report ✅           Phase A · B ✅
Week 2              Step 4 i18n 시작           Phase C (병렬) + Phase E 시작
Week 3              Step 4 마무리              Phase E 마무리 + Phase F
Week 4              Step 5 Waitlist            Phase G (설정·redeem·온보딩)
Week 5              Phase 2 QA                 Phase D (모바일·랜딩·a11y)
Week 6+             Phase 3 kickoff            PDF·공유·파일업로드 등
```

### 권장 실행 순서 (상세)

| 순서 | 작업 | 예상 | 이유 |
|------|------|------|------|
| **1** | **Phase 2 Step 4 — Web i18n** | 1~1.5주 | 카피·컴포넌트 API 고정 전 마지막 대규모 문구 변경 |
| **2** | **Phase C — 디자인 시스템** | 1~1.5일 | Step 4와 병행: Alert/OptionCard/tokens → i18n 키만 추가 |
| **3** | **Phase E — Live 몰입** | 1~1.5일 | 단순함 해소 체감 최대 (타이머·세션 이름·진행률) |
| **4** | **Phase F — 성장·재방문** | 1.5~2일 | 리포트 데이터 활용, 재도전 루프 |
| **5** | **Phase 2 Step 5 — Waitlist redeem** | 3~5일 | 랜딩 약속; Phase G 설정과 통합 |
| **6** | **Phase G — 온보딩·신뢰** | 2~3일 | Step 5·4와 겹침; settings + onboarding |
| **7** | **Phase D — 폴리시·모바일** | 1~2일 | 레이아웃 안정 후; i18n 문자열 길이 반영 |
| **8** | **Phase 3 후보** | — | PDF, 공유 링크, 파일 업로드, Stripe, AI en/ja 튜닝 |

### Step 4(i18n)와 Phase C~G 관계

| Phase | 시점 | 이유 |
|-------|------|------|
| **C (디자인 시스템)** | Step 4 **병행** | 컴포넌트 API 고정 → `COPY.ko/en/ja`에 문구만 |
| **E (Live 몰입)** | Step 4 **직후** | 타이머/진행률 라벨을 i18n 키로 처음부터 작성 |
| **F (성장)** | Step 4 **직후** | 차트·추천 카피 번역 필요 |
| **G (설정·온보딩)** | Step 4 **+ Step 5** | `/settings`가 언어 전환 홈 |
| **D (폴리시·모바일)** | Step 4 **후반** | 레이아웃 변경은 i18n과 독립 |

Step 4에서 `apps/web/src/i18n/` 구조 생성 시, **Phase A+B에서 정리한 최종 카피** + Phase C 공통 컴포넌트 prop을 기준으로 키를 추출한다.

---

## 7. 우선순위 요약

| 순위 | 작업 | 기대 효과 |
|------|------|-----------|
| 1 | Step 4 i18n + Phase C | 글로벌·컴포넌트 기반 |
| 2 | Phase E Live 타이머·세션 이름 | 시뮬레이션 몰입 |
| 3 | Phase F 성장 대시보드·추천 재도전 | 재방문 |
| 4 | Step 5 + Phase G 설정·온보딩·redeem | 랜딩 일관성 |
| 5 | Phase D 모바일·랜딩·a11y | 실사용·신뢰 |
| 6 | Phase 3 PDF·공유·업로드·결제 | 수익화 |

---

## 8. 관련 파일 인덱스

| 영역 | 경로 |
|------|------|
| Router | `apps/web/src/App.jsx` |
| Dev flag | `apps/web/src/lib/dev.js` |
| Layouts | `apps/web/src/layouts/AppLayout.jsx`, `AuthLayout.jsx`, `InterviewLayout.jsx` |
| Pages | `apps/web/src/pages/*.jsx` |
| Interview UI | `apps/web/src/components/interview/InterviewRoom.jsx`, `InterviewStepper.jsx` |
| Shared UI | `ConfirmDialog.jsx`, `LoadingState.jsx` |
| Constants | `apps/web/src/constants/interview.js`, `participants.js` |
| Design system | `packages/ui/src/{Button,Input,Logo,Alert,OptionCard,EmptyState,PageHeader,tokens}.jsx/js` |
| Phase 2 API | `services/api/src/lib/report-builder.ts`, `routes/sessions.ts` |
| 기획 참고 | `docs/PHASE2.md`, `docs/IMPLEMENTATION_PLAN.md` |

---

## 9. 다음 액션

1. **Phase D** 마무리 (모바일, 랜딩, a11y)
2. **Step 5 — Waitlist redeem** (Premium 배지·코드 입력)
3. Step 4 잔여: `config.language: en` 세션 smoke test

---

*마지막 업데이트: 2026-08-28 — Phase A/B/Step3 완료 반영, 제품 깊이 갭·Phase E~G·통합 로드맵 추가*
