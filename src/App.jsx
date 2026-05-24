import { useState } from 'react';
import {
  User,
  Brain,
  MessageSquare,
  ArrowUp,
  CheckCircle2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  AlertTriangle,
  Target,
} from 'lucide-react';

const GRADIENT_BTN =
  'bg-gradient-to-r from-[#2AD175] to-[#E3F58F] text-[#2A2A2A] font-bold';

const SHEETDB_URL = 'https://sheetdb.io/api/v1/1j6wm08550b5m';

async function getVisitorMeta() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  const date = now.toLocaleDateString('ko-KR', { timeZone: timezone });
  const datetime = now.toLocaleString('ko-KR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  let country = '';
  let countryCode = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      country = data.country_name || '';
      countryCode = data.country_code || '';
    }
  } catch {
    // IP 조회 실패 시 브라우저 로케일로 대체
  }

  if (!country) {
    const locale = navigator.language || 'ko-KR';
    const region = locale.split('-')[1]?.toUpperCase();
    if (region) {
      countryCode = region;
      try {
        const lang = locale.split('-')[0] || 'ko';
        country =
          new Intl.DisplayNames([lang], { type: 'region' }).of(region) || region;
      } catch {
        country = region;
      }
    } else {
      country = timezone;
    }
  }

  return { date, datetime, country, countryCode, timezone };
}

async function submitToSheetDB(email) {
  const meta = await getVisitorMeta();

  const response = await fetch(SHEETDB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [
        {
          email: email.trim(),
          date: meta.date,
          datetime: meta.datetime,
          country: meta.country,
          country_code: meta.countryCode,
          timezone: meta.timezone,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('SheetDB submit failed');
  }
}

function EarlyBirdBenefit({ className = '' }) {
  return (
    <p className={`text-sm text-[#64748B] ${className}`}>
      지금 사전 신청 시,{' '}
      <span className="inline-flex items-center rounded-full bg-[#E3F58F] px-2 py-0.5 text-xs font-bold text-[#2A2A2A]">
        선착순 100명
      </span>
      에게{' '}
      <span className="font-bold text-[#2A2A2A]">평생 50% 할인권</span>
      을 드립니다.
    </p>
  );
}

function WaitlistForm({ className = '' }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError('');

    try {
      await submitToSheetDB(trimmed);
      setSubmitted(true);
    } catch {
      setError('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}
        role="status"
      >
        <div className="h-1 bg-gradient-to-r from-[#2AD175] to-[#E3F58F]" />
        <div className="flex items-start gap-4 px-5 py-5 sm:items-center sm:px-6 sm:py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2AD175]/20 to-[#E3F58F]/35">
            <CheckCircle2 className="h-5 w-5 text-[#2AD175]" strokeWidth={2.25} />
          </div>
          <div className="text-left">
            <p className="font-bold tracking-tight text-[#2A2A2A] sm:text-base">
              사전 예약이 완료되었습니다!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#64748B]">
              출시 후 가장 먼저 안내해 드리겠습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-lg ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력해 주세요"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[#2A2A2A] tracking-tight placeholder:text-[#64748B] outline-none transition-shadow focus:border-[#2AD175] focus:ring-2 focus:ring-[#2AD175]/20 disabled:opacity-60"
          aria-label="이메일"
        />
        <button
          type="submit"
          disabled={loading}
          className={`whitespace-nowrap rounded-xl px-6 py-3.5 transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 ${GRADIENT_BTN}`}
        >
          {loading ? '신청 중...' : '무료 얼리액세스 신청하기'}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-center text-sm text-red-600 sm:text-left" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const PARTICIPANTS = [
  {
    label: '나',
    sub: '내 화면',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    highlight: true,
  },
  {
    label: 'AI 면접관',
    sub: '압박 질문',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    badge: 'HOST',
  },
  {
    label: '가상 지원자 1',
    sub: '모범 답변',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
  },
  {
    label: '가상 지원자 2',
    sub: '경쟁자',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
  },
];

function VideoGridMockup() {
  return (
    <div className="relative w-full max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#1a1a1a] shadow-2xl shadow-gray-200/80">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#2d2d2d] px-4 py-2.5">
          <span className="text-xs font-medium tracking-tight text-white/90">
            MAJU · 다대다 면접 시뮬레이션
          </span>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0.5 bg-[#0f0f0f] p-0.5">
          {PARTICIPANTS.map((p) => (
            <div
              key={p.label}
              className={`relative aspect-video overflow-hidden bg-gray-800 ${
                p.highlight ? 'ring-2 ring-[#2AD175] ring-inset' : ''
              }`}
            >
              <img
                src={p.img}
                alt=""
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-tight text-white sm:text-xs">
                    {p.label}
                  </p>
                  <p className="text-[9px] text-white/60 sm:text-[10px]">{p.sub}</p>
                </div>
                {p.badge && (
                  <span className="rounded bg-[#2AD175] px-1.5 py-0.5 text-[8px] font-bold text-[#2A2A2A]">
                    {p.badge}
                  </span>
                )}
              </div>
              {p.highlight && (
                <span className="absolute left-2 top-2 rounded bg-[#2AD175]/90 px-1.5 py-0.5 text-[8px] font-bold text-[#2A2A2A]">
                  YOU
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 bg-[#2d2d2d] px-4 py-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
            aria-hidden
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
            aria-hidden
          >
            <Video className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/90 text-white"
            aria-hidden
          >
            <span className="text-xs font-bold">종료</span>
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/40"
            aria-hidden
          >
            <MicOff className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/40"
            aria-hidden
          >
            <VideoOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="absolute -right-2 top-8 hidden rounded-lg border border-amber-200/50 bg-amber-50 px-3 py-2 shadow-lg sm:block lg:-right-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[10px] font-medium tracking-tight text-amber-900">
            말이 빨라지고 있어요. 숨 고르고 천천히.
          </p>
        </div>
      </div>
    </div>
  );
}

const PAIN_CARDS = [
  {
    icon: User,
    title: '혼자 하는 독백',
    desc: '1:1 녹화 방식은 면접장의 팽팽한 공기를 절대 담아내지 못합니다.',
  },
  {
    icon: Brain,
    title: '멘탈 붕괴',
    desc: "실제 탈락의 가장 큰 원인은 '옆 지원자의 유창한 답변'에서 오는 비교와 위축입니다.",
  },
  {
    icon: MessageSquare,
    title: '뻔한 질문',
    desc: '내 대답을 듣지 않고 준비된 질문만 던지는 봇은 실력 향상에 도움이 안 됩니다.',
  },
];

const FEATURES = [
  {
    title: '다대다 피어 프레셔 (Peer Pressure) 구현',
    desc: '가상 경쟁자 AI가 내뱉는 모범 답안을 듣고도 평정심을 유지하는 진짜 멘탈 훈련을 시작하세요.',
    visual: 'peers',
  },
  {
    title: '실시간 고스트 코치 HUD',
    desc: '답변 도중 눈동자가 흔들리거나 말이 빨라지면, 화면 구석에 즉시 힌트와 경고가 표시됩니다.',
    visual: 'hud',
  },
  {
    title: '내 맞춤형 빌런 페르소나',
    desc: '공고문과 족보를 입력하세요. 온화한 면접관부터 꼬리 질문으로 물어뜯는 압박 면접관까지 완벽하게 동기화됩니다.',
    visual: 'persona',
  },
];

function FeatureVisual({ type }) {
  if (type === 'peers') {
    return (
      <div className="relative flex w-full min-h-[260px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#2AD175]/30 to-[#E3F58F]/40 px-4 py-8 sm:px-6">
        <div className="grid w-full max-w-xs grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur ${
                i === 2 ? 'ring-2 ring-[#2AD175] sm:scale-105' : ''
              }`}
            >
              <User className="h-6 w-6 text-[#64748B]" />
              <span className="mt-1 text-[9px] font-medium text-[#64748B]">
                {i === 2 ? '나' : `지원자 ${i}`}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 w-full max-w-xs rounded-lg bg-white/90 px-3 py-2 text-center text-xs font-medium tracking-tight text-[#2A2A2A] shadow sm:max-w-sm">
          옆 지원자 모범 답변 재생 중…
        </div>
      </div>
    );
  }

  if (type === 'hud') {
    return (
      <div className="relative min-h-[260px] w-full rounded-2xl bg-gradient-to-tr from-[#E3F58F]/40 to-[#2AD175]/30 p-6">
        <div className="min-h-[180px] w-full rounded-xl border border-white/50 bg-[#2A2A2A]/5 backdrop-blur-sm" />
        <div className="absolute right-4 top-4 space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-md">
            <Sparkles className="h-4 w-4 text-[#2AD175]" />
            <span className="text-xs font-medium tracking-tight text-[#2A2A2A]">
              시선 고정 유지
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 shadow-md">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium tracking-tight text-amber-900">
              말 속도 ↑
            </span>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 right-6 h-1.5 overflow-hidden rounded-full bg-white/60">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#2AD175] to-[#E3F58F]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col justify-center gap-3 rounded-2xl bg-gradient-to-bl from-[#2AD175]/25 via-[#E3F58F]/35 to-[#88F26C]/20 p-6 py-8">
      {['온화한 면접관', '압박 면접관', '꼬리 질문형'].map((label, i) => (
        <div
          key={label}
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${
            i === 1
              ? 'bg-gradient-to-r from-[#2AD175] to-[#E3F58F] shadow-md'
              : 'bg-white/70'
          }`}
        >
          <Target className={`h-4 w-4 ${i === 1 ? 'text-[#2A2A2A]' : 'text-[#64748B]'}`} />
          <span
            className={`text-sm font-semibold tracking-tight ${
              i === 1 ? 'text-[#2A2A2A]' : 'text-[#64748B]'
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white tracking-tight antialiased">
      {/* 1. Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-24">
          <span className="text-2xl font-extrabold tracking-tighter text-[#2A2A2A]">
            MAJU
          </span>
          <span className="rounded-full bg-[#E3F58F] px-3 py-1 text-xs font-semibold text-[#2A2A2A]">
            [Waitlist Open]
          </span>
        </nav>
      </header>

      <main>
        {/* 2. Hero */}
        <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-between px-6 pb-12 pt-24 lg:flex-row lg:px-24">
          <div className="mb-12 flex flex-1 flex-col justify-center lg:mb-0 lg:max-w-xl lg:pr-8">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-[#2A2A2A] lg:text-6xl">
              외로운 독백 면접은
              <br />
              끝났습니다.
              <br />
              이제, 압박 면접과
              <br />
              마주할 시간.
            </h1>
            <p className="mb-8 text-base leading-relaxed text-[#64748B] lg:text-lg">
              옆자리 지원자의 화려한 답변에 멘탈이 털린 적 있나요? 나를 합격으로
              이끌어줄 든든하고 상쾌한 AI 스터디 파트너와 함께, 가장 실전에 가까운
              다대다 면접을 경험하세요.
            </p>
            <WaitlistForm />
            <EarlyBirdBenefit className="mt-4" />
          </div>

          <div className="flex flex-1 items-center justify-center lg:justify-end">
            <VideoGridMockup />
          </div>
        </section>

        {/* 3. Pain Point */}
        <section className="bg-[#F8FAFC] px-6 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold leading-snug text-[#2A2A2A]">
            왜 AI 모의 면접을 연습해도
            <br />
            실전에서 무너질까요?
          </h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {PAIN_CARDS.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2AD175]/20 to-[#E3F58F]/30">
                  <Icon className="h-6 w-6 text-[#2A2A2A]" strokeWidth={1.75} />
                </div>
                <h3 className="mb-3 text-lg font-bold text-[#2A2A2A]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 4. Features */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="mb-16 text-center text-3xl font-bold leading-snug text-[#2A2A2A] lg:text-4xl">
            압도적인 실전 감각,
            <br />
            MAJU만의 3가지 스파링 모드
          </h2>
          <div className="space-y-20 lg:space-y-28">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex w-full flex-col items-stretch gap-10 lg:gap-16 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                <div className="w-full lg:flex-1">
                  <FeatureVisual type={feature.visual} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-xl font-bold text-[#2A2A2A] lg:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed text-[#64748B] lg:text-lg">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Reverse Thinking */}
        <section className="bg-[#2A2A2A] px-6 py-20 text-center text-white">
          <h2 className="mb-6 text-2xl font-bold leading-snug tracking-tight sm:text-3xl lg:text-4xl">
            다대다 면접이 없다고요?
            <br />
            가장 매운맛으로 훈련하면,
            <br />
            1:1 면접은 대화처럼 편안해집니다.
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            실전에서 겪을 수 있는 최악의 압박 상황을 겪고 나면, 어떤 면접에서도
            당신의 페이스를 유지할 수 있습니다.
          </p>
        </section>

        {/* 6. Bottom CTA & Footer */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-[#88F26C]/20 to-[#E3F58F]/20 p-8 text-center sm:p-12">
            <h2 className="mb-4 text-2xl font-bold leading-snug text-[#2A2A2A] sm:text-3xl">
              면접장의 숨 막히는 긴장감,
              <br />
              MAJU와 함께라면
              <br className="sm:hidden" />
              <span className="hidden sm:inline">&nbsp;</span>
              상쾌한 자신감으로 바뀝니다.
            </h2>
            <EarlyBirdBenefit className="mb-8 text-sm sm:text-base" />
            <div className="flex justify-center">
              <WaitlistForm className="justify-center" />
            </div>
          </div>

          <footer className="mt-16 text-center text-sm text-[#64748B]/80">
            © 2026 MAJU. All rights reserved.
          </footer>
        </section>
      </main>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-[#2A2A2A] shadow-md backdrop-blur transition-transform duration-300 hover:scale-105"
        aria-label="맨 위로 올라가기"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
