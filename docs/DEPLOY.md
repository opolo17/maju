# MAJU 배포 가이드 (MVP)

결제·Waitlist redeem·월간 한도·API rate limit은 **출시 후** 추가합니다.  
이 문서는 **랜딩 + 웹 + API** 를 프로덕션에 올리는 최소 절차입니다.

---

## 아키텍처

| 서비스 | 호스팅 | 빌드/시작 |
|--------|--------|-----------|
| Landing | Vercel 프로젝트 A | `npm run build:landing` → `apps/landing/dist` |
| Web | Vercel 프로젝트 B | `npm run build:web` → `apps/web/dist` |
| API | Railway (권장) | `npm run start:api` |

도메인 예: `maju.com` (랜딩), `app.maju.com` (웹), `*.up.railway.app` 또는 `api.maju.com` (API).

---

## 0. 사전 준비

1. GitHub에 **최신 코드 push** (로컬만 있으면 Vercel/Railway가 옛 코드를 빌드합니다).
2. [Supabase](https://supabase.com/dashboard) 프로젝트 + `supabase/migrations/20260827000000_initial.sql` 적용.
3. OpenAI API 키 준비.

---

## 1. API (Railway)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → `maju` 레포.
2. **Settings**
   - Root Directory: *(비움 — 레포 루트)*
   - `railway.toml` 이 start/build 를 사용합니다.
3. **Variables** (Production):

   | Variable | 예시 |
   |----------|------|
   | `NODE_ENV` | `production` |
   | `PORT` | Railway가 주입 — **수동 설정 불필요** (있으면 `3001`도 OK) |
   | `SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role (비공개) |
   | `OPENAI_API_KEY` | `sk-...` |
   | `CORS_ORIGIN` | `https://app.maju.com` (웹 **실제 URL**, trailing slash 없음) |

4. Deploy 후 **Public Networking** 켜기 → URL 복사 (예: `https://maju-api-production.up.railway.app`).
5. 확인: `GET https://<api-url>/health` → `status: ok`, `openaiConfigured: true`, `supabaseConfigured: true`.

---

## 2. Web (Vercel — `maju-web`)

1. Vercel → **Add Project** → 같은 GitHub 레포 (랜딩과 **별도 프로젝트**).
2. **Build & Development Settings**

   | 항목 | 값 |
   |------|-----|
   | Framework | Vite |
   | Install Command | `npm install` |
   | Build Command | `npm run build:web` |
   | Output Directory | `apps/web/dist` |
   | Root Directory | *(비움)* |

3. **Environment Variables** (Production + Preview 권장):

   | Variable | 값 |
   |----------|-----|
   | `VITE_SUPABASE_URL` | Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | anon public key |
   | `VITE_API_URL` | Railway API URL (예: `https://...up.railway.app`) |

   `VITE_ENABLE_DEV_TOOLS` 는 **설정하지 않음** (POC/데모 라우트 비활성).

4. Deploy → 도메인 `app.maju.com` 연결.
5. **Supabase** → Authentication → URL Configuration:
   - Site URL: `https://app.maju.com`
   - Redirect URLs: `https://app.maju.com/**`

6. Railway `CORS_ORIGIN` 을 웹 URL과 **정확히 일치**시킨 뒤 API 재배포.

루트 `vercel.json` 이 SPA 새로고침(`/dashboard` 등)을 `index.html` 로 넘깁니다.

---

## 3. Landing (Vercel — `maju-landing`)

기존 프로젝트가 있다면 설정만 확인:

| 항목 | 값 |
|------|-----|
| Build Command | `npm run build:landing` |
| Output Directory | `apps/landing/dist` |

CTA 링크를 `https://app.maju.com/signup` 등으로 맞춥니다 (`apps/landing` 코드 확인).

---

## 4. 배포 후 스모크 테스트

1. 랜딩 → 앱 가입 URL 이동
2. `/signup` → 이메일 가입 → `/dashboard`
3. 새 면접 → 로비 → Live 1턴 → 종료 → 리포트
4. 브라우저 Network: API 요청이 `VITE_API_URL` 로 가고 401/ CORS 없음

---

## 5. 자주 나는 문제

| 증상 | 원인 | 조치 |
|------|------|------|
| `/dashboard` 새로고침 404 | SPA rewrite 없음 | 루트 `vercel.json` 포함 여부, Vercel 재배포 |
| CORS error | `CORS_ORIGIN` 불일치 | Railway env = 웹 origin 정확히 |
| Live 면접 503 | OpenAI 미설정 | Railway `OPENAI_API_KEY` |
| 로그인 후 API 500 | Supabase service role / migration | env + SQL migration |
| 빌드는 옛 UI | main 미 push | git push 후 Redeploy |

---

## 6. 나중에 (이번 배포 범위 밖)

- Stripe / Premium
- Waitlist redeem (`waitlist_grants`)
- Free 플랜 월 N회 제한
- API rate limit

---

## 로컬과 동일하게 확인

```bash
npm install
npm run dev:api    # :3001
npm run dev:web    # :5174
```

프로덕션 env 템플릿: [`.env.example`](../.env.example)
