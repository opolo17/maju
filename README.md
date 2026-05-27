# MAJU

다대다 압박 면접 AI 시뮬레이터 **MAJU** 모노레포입니다.

## 폴더 구조

```
MAJU/
├── apps/
│   ├── landing/          # Waitlist · 마케팅 랜딩 페이지 (기존 작업물)
│   └── web/              # 실제 서비스 웹 (면접 시뮬레이션 앱)
├── package.json          # npm workspaces 루트
└── README.md
```

### `apps/landing`

- 사전 신청(Waitlist) 랜딩 페이지
- SheetDB 연동, 다국어(ko / en / ja)
- 배포 시 이 앱만 빌드·호스팅하면 됩니다

### `apps/web`

- 로그인, 면접 시뮬레이션, 대시보드 등 **실제 제품** 개발용
- 현재는 스캐폴드만 포함 (추후 기능 추가)

## 실행 방법

루트에서 의존성 설치 (최초 1회):

```bash
npm install
```

| 명령 | 설명 | URL |
|------|------|-----|
| `npm run dev:landing` | 랜딩 개발 서버 | http://localhost:5173 |
| `npm run dev:web` | 서비스 웹 개발 서버 | http://localhost:5174 |
| `npm run build:landing` | 랜딩 프로덕션 빌드 | `apps/landing/dist` |
| `npm run build:web` | 서비스 웹 프로덕션 빌드 | `apps/web/dist` |
| `npm run build` | 전체 빌드 | |

## Vercel 배포 (프로젝트 2개)

**GitHub 레포는 하나** (`opolo17/maju`), **Vercel 프로젝트는 두 개** 만듭니다.

### 1) 랜딩 — `maju-landing` (예시 이름)

| 설정 | 값 |
|------|-----|
| Repository | `opolo17/maju` |
| Root Directory | *(비워 두기 = 레포 루트)* |
| Framework Preset | Vite |
| Install Command | `npm install` |
| Build Command | `npm run build:landing` |
| Output Directory | `apps/landing/dist` |

도메인 예: `maju.com`, `www.maju.com`

### 2) 서비스 웹 — `maju-web` (예시 이름)

| 설정 | 값 |
|------|-----|
| Repository | `opolo17/maju` (동일 레포) |
| Root Directory | *(비워 두기)* |
| Framework Preset | Vite |
| Install Command | `npm install` |
| Build Command | `npm run build:web` |
| Output Directory | `apps/web/dist` |

도메인 예: `app.maju.com`

### Vercel에서 새 프로젝트 추가 순서

1. [vercel.com](https://vercel.com) → **Add New…** → **Project**
2. GitHub `maju` 레포 **Import**
3. 위 표대로 **Build / Output** 입력 후 Deploy
4. 같은 레포로 **한 번 더** Import → 두 번째 프로젝트(서비스용) 생성
5. **Settings → Domains** 에서 각각 도메인 연결

### 기존에 루트에 배포 중이었다면

예전 설정(Output `dist`, Root 루트의 단일 Vite)은 더 이상 맞지 않습니다.  
랜딩 프로젝트의 **Output Directory** 를 `apps/landing/dist` 로, **Build Command** 를 `npm run build:landing` 으로 바꿔 주세요.

### 환경 변수

SheetDB 등은 랜딩 코드에 URL이 포함되어 있으면 Vercel env 없이 동작합니다.  
나중에 API 키를 분리하면 **랜딩 프로젝트**에만 Environment Variables 추가하면 됩니다.
