# Phase 2 — 차별화 기능

> **목표:** Phase 1 「한 판 완주」 위에 **다대다 면접의 긴장감**과 **제품 완성도**를 더한다.  
> Phase 1 완료 기준: 설정 → Live AI Q&A → HUD → 리포트 → 대시보드 재도전 ✅

---

## Phase 1 → Phase 2 갭


| 영역       | Phase 1 (현재)          | Phase 2 목표                              |
| -------- | --------------------- | --------------------------------------- |
| 가상 지원자   | 정적 이미지만, 무음           | LLM 답변 + TTS, 타이밍 기반 Peer Pressure      |
| 페르소나     | 3종 프롬프트, 단일 깊이        | `peerIntensity`·꼬리질문 깊이·interrupt 빈도 반영 |
| 리포트      | 종합 점수 + 요약 + Delivery | 루브릭 점수, 질문별 피드백, 타임라인                   |
| UI 언어    | 한국어 고정                | ko / en / ja (랜딩 i18n 재사용)              |
| Waitlist | 랜딩 SheetDB만           | 가입 시 Premium 패스 redeem                  |


---

## Phase 2 범위 (결정)


| 항목       | Phase 2 결정                                   |
| -------- | -------------------------------------------- |
| Peer     | **동적 LLM** — peer1(모범) / peer2(경쟁)           |
| Peer 타이밍 | `config.peerIntensity` (low / medium / high) |
| TTS      | OpenAI TTS 유지, peer별 voice/style 분리 검토       |
| 아바타      | Phase 1과 동일 — 정적 이미지 + speaking 표시           |
| Realtime | HTTP 턴 기반 유지 (WebSocket은 Phase 3+)           |
| 출시 언어    | web UI 3언어, **면접 AI는 Phase 2 후반 en/ja 확장**   |


---



## Step 1 — 동적 Peer Pressure

**목표:** 사용자 답변 직후(또는 설정 강도에 따라) 가상 지원자 2명의 답변을 재생해 압박감을 만든다.

### UX

```
사용자 답변 종료
  → (processing) 면접관 질문 생성
  → peer1 TTS 재생 (모범 답변) — 타일 하이라이트 + 자막
  → peer2 TTS 재생 (경쟁자) — peerIntensity에 따라 생략/축소 가능
  → 면접관 TTS 재생
```


| `peerIntensity` | 동작                                      |
| --------------- | --------------------------------------- |
| `low`           | peer1만, 면접관 질문 **후** 1회                 |
| `medium`        | peer1 + peer2, 사용자 답변 **직후**            |
| `high`          | peer1 + peer2, 더 짧은 간격 · 더 긴/압박 톤 rival |




### API (`services/api`)


| 변경                   | 설명                                                               |
| -------------------- | ---------------------------------------------------------------- |
| `processLiveTurn` 확장 | user turn 저장 후 peer1/peer2 텍스트 LLM 생성                            |
| `insertSessionTurn`  | `role: peer1` | `peer2` + metadata `{ kind: 'model' | 'rival' }` |
| 응답 JSON              | `peer1Text`, `peer1AudioBase64`, `peer2Text`, … (optional)       |


신규 모듈: `services/api/src/lib/peer-pressure.ts`

```typescript
// generatePeerAnswers({ userTranscript, config, history })
// → { peer1: string, peer2: string }
```

프롬프트 가이드:

- **peer1:** 같은 질문에 대한 구조화된 모범 답변 (30~45초 분량)
- **peer2:** 더 자신감·구체적 수치·경쁁 톤 (psychological pressure)



### 프론트 (`apps/web`)


| 파일                      | 변경                                 |
| ----------------------- | ---------------------------------- |
| `InterviewLivePage.jsx` | 턴 처리 후 peer 오디오 순차 재생, phase 상태 추가 |
| `InterviewRoom.jsx`     | peer 타일 speaking 상태, 자막 오버레이       |
| `participants.js`       | peer 라벨 i18n 키 연결 (Step 4)         |




### 완료 기준

- [x] Live 면접 1턴에서 peer1 TTS 재생 + 타일 UI 반응
- [x] `session_turns`에 peer1/peer2 기록
- [x] `peerIntensity: medium/high`일 때 peer2 재생 (`low`는 peer1만)
- [x] 면접관 TTS는 peer 재생 **이후** (압박 → 질문 리듬)

**예상:** 1.5~2주

---



## Step 2 — 페르소나 · 꼬리질문 깊이

**목표:** 3종 페르소나 차이가 체감되고, `peerIntensity`·시간·족보가 질문 깊이에 반영된다.

### API


| 변경                 | 설명                                                    |
| ------------------ | ----------------------------------------------------- |
| `openai.ts`        | persona별 `temperature`, `max_tokens`, follow-up 지시 강화 |
| `InterviewConfig`  | (선택) `followUpDepth: 1 | 2 | 3` 필드 추가                 |
| `runInterviewTurn` | 이전 user turn weakness 힌트 → 꼬리질문                       |


페르소나별 튜닝 예:


| Persona    | 톤               | 꼬리질문      |
| ---------- | --------------- | --------- |
| `gentle`   | 격려 + 부드러운 추가 질문 | 얕음, 1단계   |
| `pressure` | 직접 반박, 압박       | 중~깊음      |
| `followup` | 답변 허점 추적        | 깊음, 2~3단계 |




### 프론트

- `NewInterviewPage` — follow-up depth UI (고급 설정 collapsible)
- Live UI — 현재 페르소나 배지 + 면접관 subtitle 강조



### 완료 기준

- [ ] 3 페르소나 A/B 테스트 시 질문 톤·깊이 차이 명확
- [ ] `followup` 페르소나가 이전 답변을 인용한 꼬리질문
- [ ] 설정 UI에서 depth 선택 → API config 반영

**예상:** 1주

---



## Step 3 — 리포트 고도화

**목표:** Phase 1 리포트를 **코칭에 쓸 수 있는 수준**으로 확장.

### 리포트 스키마 확장 (`packages/types`)

```typescript
interface SessionReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  generatedAt: string;
  deliveryInsights?: DeliveryInsights;
  // Phase 2 추가
  rubric?: {
    structure: number;
    clarity: number;
    confidence: number;
    relevance: number;
  };
  timeline?: Array<{
    atSec: number;
    type: 'question' | 'answer' | 'peer' | 'hud';
    label: string;
  }>;
  questionFeedback?: Array<{
    question: string;
    answerSummary: string;
    score: number;
    tip: string;
  }>;
}
```



### API


| Method                     | Path | 설명                                  |
| -------------------------- | ---- | ----------------------------------- |
| `GET /sessions/:id/report` | 기존   | 확장된 `SessionReport` 반환              |
| `generateSessionReport`    |      | peer turns + HUD + transcript 통합 분석 |




### 프론트


| Route                   | 변경                               |
| ----------------------- | -------------------------------- |
| `/interview/:id/report` | 루브릭 4항목 차트, 질문별 카드, 타임라인(간단 리스트) |




### 완료 기준

- [ ] 리포트에 structure/clarity/confidence/relevance 점수
- [ ] 면접관 질문별 피드백 1개 이상
- [ ] peer 재생·HUD 이벤트가 timeline에 표시 (가능한 범위)
- [ ] 기존 Delivery 섹션 유지

**예상:** 1~1.5주

---



## Step 4 — Web 다국어 UI

**목표:** `apps/web` UI를 ko / en / ja로 전환 (면접 AI 언어는 `config.language`와 연동).

### 구조

```
apps/web/src/i18n/
  index.js          # COPY ko/en/ja
  LanguageContext.jsx
```

- 랜딩 `apps/landing/src/i18n.js` 카피·용어 정렬 (면접관, HUD, peer 등)
- `Profile.locale` 또는 localStorage `maju-locale` → UI 언어
- `InterviewConfig.language` — AI STT/LLM/TTS 언어 (Step 2/1과 독립 설정 가능)



### 범위


| 포함                      | 제외 (Phase 3)            |
| ----------------------- | ----------------------- |
| 로그인, 대시보드, 설정, 면접 UI 라벨 | LLM 프롬프트 en/ja 품질 튜닝 전면 |
| 리포트 섹션 제목               | 법무/개인정보 다국어 정책 페이지      |




### 완료 기준

- [x] 헤더/설정에서 UI 언어 전환
- [x] dashboard · interview · report 주요 문자열 3언어
- [ ] `config.language: en` 세션 STT/LLM 영어 동작 (smoke test)

**예상:** 1~1.5주

---



## Step 5 — Waitlist Premium Redeem

**목표:** 랜딩 사전신청자(선착순 100명)에게 **1년 Premium** 부여.

### DB (`supabase/migrations/`)

```sql
create table public.waitlist_grants (
  email text primary key,
  granted_at timestamptz not null default now(),
  redeemed_by uuid references public.profiles(id),
  redeemed_at timestamptz,
  premium_until timestamptz
);
```

`profiles.plan` — `waitlist_lifetime` + `premium_until` (또는 metadata)

### API


| Method  | Path                    | 설명                               |
| ------- | ----------------------- | -------------------------------- |
| `POST`  | `/waitlist/redeem`      | `{ email }` → plan 업그레이드         |
| (admin) | `POST /waitlist/import` | CSV/SheetDB batch (MVP: 수동 스크립트) |




### 프론트


| Route                  | 설명              |
| ---------------------- | --------------- |
| `/signup?ref=waitlist` | 가입 후 redeem CTA |
| `/settings` (신규)       | 현재 플랜 표시        |




### 완료 기준

- [ ] grant 테이블에 이메일 등록 → 해당 계정 redeem 시 `plan` 변경
- [ ] 이미 redeem된 이메일 재사용 불가
- [ ] 대시보드/설정에 플랜 배지 (Free / Waitlist Premium)

**예상:** 3~5일

---



## Phase 2 권장 구현 순서

```
Step 1 Peer Pressure  ──→  Step 2 Persona depth
         │                          │
         └──────────┬───────────────┘
                    ▼
            Step 3 Report v2
                    │
         Step 4 i18n (병렬 가능)
                    │
            Step 5 Waitlist redeem
```

**이유:** Peer + Persona가 제품 정체성의 핵심이고, 리포트·i18n·waitlist는 독립적으로 병렬 가능.

---



## Phase 2 전체 사용자 흐름 (완료 시)

```
로그인 → (waitlist redeem) → 대시보드 → 새 면접 (언어·페르소나·peer 강도)
  → lobby → live
      → 내 답변 → peer1/2 답변 재생 → 면접관 질문 + HUD
  → 종료 → 고도화 리포트 (루브릭·질문별·타임라인)
  → 재도전 / UI 언어 전환
```

---



## 기술 · 리스크


| 리스크                          | 대응                                                |
| ---------------------------- | ------------------------------------------------- |
| Peer TTS로 턴 지연 증가            | peer 오디오 **짧은 버전** 옵션, 로딩 UI 「다른 지원자 답변 중…」       |
| LLM 비용 3배 (user+peer1+peer2) | peer2 `high`만, 또는 peer1만 TTS·peer2는 자막 only (A/B) |
| 동시 오디오 재생 혼란                 | **순차 재생** 고정, 사용자 mic mute during peer            |
| en/ja STT 품질                 | `config.language`별 Whisper language param 명시      |


---



## Phase 2 완료 기준 (전체)

- [ ] Live에서 peer 답변 TTS로 Peer Pressure 체감
- [ ] 3 페르소나 차별화 + 꼬리질문
- [ ] 리포트 루브릭 + 질문별 피드백
- [ ] Web UI 3언어
- [ ] Waitlist 100명 redeem 경로

---



## 예상 일정


| Step   | 내용               | 예상                             |
| ------ | ---------------- | ------------------------------ |
| **1**  | 동적 Peer Pressure | 1.5~2주                         |
| **2**  | 페르소나 · 꼬리질문      | 1주                             |
| **3**  | 리포트 고도화          | 1~1.5주                         |
| **4**  | Web i18n         | 1~1.5주                         |
| **5**  | Waitlist redeem  | 3~5일                           |
| **합계** |                  | **5~7주** (1인 기준, 일부 병렬 시 4~5주) |


---



## 관련 파일 (Phase 2 touchpoints)


| 파일                                                    | Step    |
| ----------------------------------------------------- | ------- |
| `services/api/src/lib/peer-pressure.ts`               | 1 (신규)  |
| `services/api/src/lib/live-session.ts`                | 1, 2    |
| `services/api/src/lib/openai.ts`                      | 1, 2, 3 |
| `apps/web/src/pages/InterviewLivePage.jsx`            | 1       |
| `apps/web/src/components/interview/InterviewRoom.jsx` | 1       |
| `packages/types/src/index.ts`                         | 1, 3    |
| `apps/web/src/pages/InterviewReportPage.jsx`          | 3       |
| `apps/web/src/i18n/`                                  | 4 (신규)  |
| `supabase/migrations/*_waitlist.sql`                  | 5       |
| `services/api/src/routes/waitlist.ts`                 | 5 (신규)  |


---



## Phase 3 미리보기 (참고)

Phase 2 완료 후: Stripe 구독, 사용량 cap, 녹화 opt-in, mid-session resume, API 배포(Railway/Fly).

---

*Phase 2 kickoff 시 Step 1부터 착수. 우선순위 조정이 필요하면 Peer(Step 1) vs Report(Step 3) 순서만 논의하면 됩니다.*