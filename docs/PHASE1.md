# Phase 1 — MVP Core

> **목표:** 사용자가 면접 설정 → Live 진행 → AI 리포트까지 **한 판** 완주  
> Phase 0 완료 기준: Supabase Auth, `/dashboard`, API `/health` · `/me`

---

## Phase 1 범위 (한국어 MVP)

| 항목 | Phase 1 결정 |
|------|----------------|
| 언어 | 한국어 (`ko`) 우선 |
| AI | OpenAI (STT → GPT → TTS, Step 3 PoC 후 연결) |
| 아바타 | 정적 이미지 + TTS |
| Peer 지원자 | 프리셋 답변 (동적 LLM은 Phase 2) |
| 면접 시간 | 15 / 30 / 45분 선택 |

---

## Step 1 — 면접 설정 UI + 세션 API ✅

**목표:** 면접 설정을 저장하고 대시보드에서 목록을 볼 수 있다.

### 프론트 (`apps/web`)

| Route | 설명 |
|-------|------|
| `/interview/new` | 채용 공고, 족보(선택), 페르소나, 난이도, 시간 |
| `/dashboard` | 세션 목록 + 「새 면접 시작」 CTA |

### API (`services/api`)

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/sessions` | `draft` 세션 생성 (`config` JSON) |
| `GET` | `/sessions` | 내 세션 목록 (최신순) |
| `GET` | `/sessions/:id` | 세션 상세 |

### DB

- `interview_sessions` — `status: draft`, `config` jsonb

### 완료 기준

- [x] `/interview/new`에서 설정 제출 → Supabase `interview_sessions` 행 생성
- [x] `/dashboard`에 생성된 세션이 목록에 표시
- [x] 인증 없이 API 호출 불가 (401)

---

## Step 2 — Live UI 정적 목업 ✅

**목표:** AI 없이 4분할 면접 화면 + mic/cam 테스트

| Route | 설명 |
|-------|------|
| `/interview/:id/lobby` | 장치 테스트 |
| `/interview/:id/live` | 4타일 UI (랜딩 `video` 섹션 이식) |
| `/interview/demo` | 데모용 (세션 없이 레이아웃만) |

### 완료 기준

- [x] 카메라·마이크 권한 후 4타일 UI 표시
- [x] 대시보드 draft 세션 → lobby 이동

---

## Step 3 — AI PoC (한 턴) ✅

**목표:** STT → LLM → TTS end-to-end 검증 (스크립트 또는 API)

- `services/api/.env`에 `OPENAI_API_KEY` 추가
- 면접관 1턴: 사용자 음성 → 텍스트 → 질문 생성 → TTS 재생

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/poc/turn` | JSON `{ text }` 또는 multipart `audio` |

| Route (web) | 설명 |
|-------------|------|
| `/interview/poc` | 브라우저 PoC UI |

CLI:
```bash
npm run poc:turn -w @maju/api -- "지원자 답변 텍스트"
```

### 완료 기준

- [x] API `/poc/turn` — Whisper → GPT-4o-mini → TTS
- [x] `/interview/poc` 웹 UI (녹음 + 텍스트)
- [x] CLI `poc:turn` 스크립트

---

## Step 4 — Live AI 루프 ✅

**목표:** 실제 면접 Q&A + `session_turns` 저장

| API | 설명 |
|-----|------|
| `POST /sessions/:id/start` | `live` 전환 + 첫 질문 TTS |
| `POST /sessions/:id/turn` | 답변(audio/text) → AI 응답 + TTS |
| `POST /sessions/:id/end` | 종료 + AI 리포트 |
| `GET /sessions/:id/turns` | 대화 기록 |

| Route (web) | 설명 |
|-------------|------|
| `/interview/:id/live` | Live AI Q&A |
| `/interview/:id/report` | 면접 리포트 |

### 완료 기준

- [x] Live 면접 Q&A (녹음 → STT → LLM → TTS)
- [x] `session_turns`에 대화 기록
- [x] 종료 시 리포트 생성

---

## Step 5 — HUD 코치 (클라이언트) ✅

**목표:** 말 속도·시선 이탈 실시간 경고

- 오디오 RMS → 말 속도 (`useSpeechPace`, Web Speech API 음절 rate)
- MediaPipe Face Landmarker → 시선/머리 turn (`useGazeDetection`)
- `useHudCoach` → Live · Demo UI 우측 HUD

### 완료 기준

- [x] Live 중 HUD 알림 표시 (말 속도 ↑, 시선 이탈)
- [x] `/interview/demo`에서 HUD 테스트 가능

---

## Step 6 — 리포트 + 대시보드 완성 ✅

**목표:** 면접 종료 후 AI 리포트

| Route | 설명 |
|-------|------|
| `/interview/:id/report` | 요약·강점·개선점 · Delivery · 대화 기록 |

| API | 설명 |
|-----|------|
| `GET /sessions/:id/report` | 리포트 + 대화 턴 조회 |

### 완료 기준

- [x] 면접 종료 → 리포트 페이지까지 한 사이클
- [x] 대시보드에서 완료 세션 · 재도전

---

## Phase 1 전체 사용자 흐름 (완료 시)

```
로그인 → 대시보드 → 새 면접 설정 → lobby (장치 테스트)
  → live (4분할 + HUD + AI 면접관) → 종료 → 리포트 → 대시보드 목록
```

---

## 구현 순서 요약

| Step | 내용 | 예상 |
|------|------|------|
| **1** | 설정 UI + 세션 API | 1주 |
| **2** | Live UI 목업 | 3~4일 |
| **3** | AI PoC | 3~5일 |
| **4** | Live AI 루프 | 1~2주 |
| **5** | HUD | 3~5일 |
| **6** | 리포트 | 1주 |

---

## 관련 파일

| 파일 | 용도 |
|------|------|
| `packages/types/src/index.ts` | `InterviewConfig`, 세션 API 타입 |
| `services/api/src/routes/` | REST 엔드포인트 |
| `apps/web/src/pages/NewInterviewPage.jsx` | Step 1 설정 폼 |
| `apps/web/src/lib/api.js` | 인증 포함 API 클라이언트 |
| `supabase/migrations/` | DB 스키마 |
