# Supabase setup (Phase 0)

MAJU는 Supabase를 **Auth + PostgreSQL** 용도로 사용합니다.

## 1. 프로젝트 생성

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Region: `Northeast Asia (Seoul)` 권장
3. Database password 저장

## 2. 스키마 적용

**방법 A — SQL Editor (가장 빠름)**

1. Dashboard → **SQL Editor** → New query
2. `supabase/migrations/20260827000000_initial.sql` 내용 전체 붙여넣기
3. **Run**

**방법 B — Supabase CLI**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

## 3. Auth 설정

Dashboard → **Authentication** → **Providers**

- **Email**: Enabled (Confirm email — 개발 중에는 Off 가능)
- **Google** (선택): OAuth client ID/secret 설정

Dashboard → **Authentication** → **URL Configuration**

| 항목 | 로컬 개발 | 프로덕션 |
|------|-----------|----------|
| Site URL | `http://localhost:5174` | `https://app.maju.com` |
| Redirect URLs | `http://localhost:5174/**` | `https://app.maju.com/**` |

## 4. API 키 복사

Dashboard → **Project Settings** → **API**

| 키 | 용도 | 어디에 |
|----|------|--------|
| Project URL | Supabase endpoint | `SUPABASE_URL`, `VITE_SUPABASE_URL` |
| anon public | 클라이언트 (RLS 적용) | `VITE_SUPABASE_ANON_KEY` |
| service_role | 서버 전용 (**비공개**) | `SUPABASE_SERVICE_ROLE_KEY` |

## 5. 로컬 env 연결

```bash
cp .env.example .env
# 값 채운 뒤
cp .env apps/web/.env.local
cp .env services/api/.env
```

## 6. 동작 확인

```bash
npm install
npm run dev:api    # http://localhost:3001/health
npm run dev:web    # http://localhost:5174
```

1. `/signup`에서 계정 생성
2. Supabase **Table Editor** → `profiles`에 행 자동 생성 확인
3. 로그인 후 `/dashboard` 접근
4. (선택) 브라우저에서 access token으로 `GET http://localhost:3001/me` 호출
