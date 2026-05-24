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
import { useLanguage } from './LanguageContext.jsx';

const PAIN_ICONS = [User, Brain, MessageSquare];
const FEATURE_VISUALS = ['peers', 'hud', 'persona'];
const PARTICIPANT_IMGS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
];

const GRADIENT_BTN =
  'bg-gradient-to-r from-[#2AD175] to-[#E3F58F] text-[#2A2A2A] font-bold';

const INPUT_BASE =
  'w-full rounded-xl px-4 tracking-tight outline-none transition-shadow disabled:opacity-60';

const EMAIL_FIELD = `${INPUT_BASE} border-2 border-gray-200 bg-white py-4 text-base font-medium text-[#2A2A2A] shadow-sm placeholder:font-normal placeholder:text-[#64748B] focus:border-[#2AD175] focus:ring-2 focus:ring-[#2AD175]/25`;

const OPTIONAL_FIELD = `${INPUT_BASE} resize-none border border-dashed border-gray-200 bg-[#F8FAFC] py-2.5 text-sm text-[#64748B] placeholder:text-[#94A3B8] focus:border-[#2AD175]/60 focus:ring-1 focus:ring-[#2AD175]/15`;

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

async function submitToSheetDB(email, featureRequest = '') {
  const meta = await getVisitorMeta();

  const response = await fetch(SHEETDB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [
        {
          email: email.trim(),
          feature_request: featureRequest.trim(),
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

function MarkerHighlight({ children }) {
  return (
    <span className="relative inline whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute bottom-[0.06em] left-[-0.05em] right-[-0.05em] z-0 h-[0.52em] -skew-x-3 rounded-[2px] bg-[#E3F58F]"
      />
    </span>
  );
}

function HeroHeadlineLine({ line, mark }) {
  if (!mark) return line;

  const index = line.indexOf(mark);
  if (index === -1) return line;

  return (
    <>
      {line.slice(0, index)}
      <MarkerHighlight>{mark}</MarkerHighlight>
      {line.slice(index + mark.length)}
    </>
  );
}

function LangToggle() {
  const { lang, toggleLang, t } = useLanguage();
  const isKo = lang === 'ko';

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="relative inline-flex h-8 w-[4.25rem] shrink-0 rounded-full border border-gray-200 bg-[#F8FAFC] p-0.5"
      aria-label={t.langToggle}
      aria-pressed={!isKo}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
          isKo ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'
        }`}
      />
      <span
        className={`relative z-10 flex flex-1 items-center justify-center text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${
          isKo ? 'text-[#2A2A2A]' : 'text-[#64748B]'
        }`}
      >
        ko
      </span>
      <span
        className={`relative z-10 flex flex-1 items-center justify-center text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${
          isKo ? 'text-[#64748B]' : 'text-[#2A2A2A]'
        }`}
      >
        en
      </span>
    </button>
  );
}

function BenefitEmphasis({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#E3F58F] px-2.5 py-0.5 text-sm font-bold text-[#2A2A2A] sm:px-3 sm:py-1 sm:text-base">
      {children}
    </span>
  );
}

function EarlyBirdBenefit({ className = '' }) {
  const { t } = useLanguage();
  const b = t.benefit;

  return (
    <p
      className={`text-center text-base leading-[1.85] text-[#64748B] sm:text-left sm:text-lg sm:leading-relaxed ${className}`}
    >
      <span className="inline sm:inline">
        {b.prefix}{' '}
        <BenefitEmphasis>{b.badge}</BenefitEmphasis> {b.suffix}
      </span>
      <br className="sm:hidden" />
      <span className="hidden sm:inline">&nbsp;</span>
      <span className="inline sm:inline">
        <BenefitEmphasis>{b.highlight}</BenefitEmphasis>
        {b.end}
      </span>
    </p>
  );
}

function WaitlistForm({ className = '' }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [featureRequest, setFeatureRequest] = useState('');
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
      await submitToSheetDB(trimmed, featureRequest);
      setSubmitted(true);
    } catch {
      setError(t.form.error);
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
              {t.form.successTitle}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#64748B]">
              {t.form.successDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-lg ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <input
          type="email"
          required
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.form.emailPlaceholder}
          className={EMAIL_FIELD}
          aria-label={t.form.emailLabel}
        />
        <textarea
          disabled={loading}
          value={featureRequest}
          onChange={(e) => setFeatureRequest(e.target.value)}
          placeholder={t.form.featurePlaceholder}
          rows={2}
          className={OPTIONAL_FIELD}
          aria-label={t.form.featureLabel}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl px-6 py-3.5 transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 ${GRADIENT_BTN}`}
        >
          {loading ? t.form.submitting : t.form.submit}
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

function VideoGridMockup() {
  const { t } = useLanguage();
  const participants = t.video.participants.map((p, i) => ({
    ...p,
    img: PARTICIPANT_IMGS[i],
    highlight: i === 0,
  }));

  return (
    <div className="relative w-full max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#1a1a1a] shadow-2xl shadow-gray-200/80">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#2d2d2d] px-4 py-2.5">
          <span className="text-xs font-medium tracking-tight text-white/90">
            {t.video.title}
          </span>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0.5 bg-[#0f0f0f] p-0.5">
          {participants.map((p) => (
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
            <span className="text-xs font-bold">{t.video.end}</span>
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
            {t.video.coachHint}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureVisual({ type }) {
  const { t } = useLanguage();
  const v = t.features.visual;

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
                {i === 2 ? v.me : `${v.candidate} ${i}`}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 w-full max-w-xs rounded-lg bg-white/90 px-3 py-2 text-center text-xs font-medium tracking-tight text-[#2A2A2A] shadow sm:max-w-sm">
          {v.peerBanner}
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
              {v.gaze}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 shadow-md">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium tracking-tight text-amber-900">
              {v.speed}
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
      {v.personas.map((label, i) => (
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
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white tracking-tight antialiased">
      {/* 1. Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-24">
          <img
            src="/logo.png"
            alt="MAJU"
            className="h-7 w-auto object-contain sm:h-8"
          />
          <LangToggle />
        </nav>
      </header>

      <main>
        {/* 2. Hero */}
        <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-between px-6 pb-12 pt-24 lg:flex-row lg:px-24">
          <div className="mb-12 flex flex-1 flex-col justify-center lg:mb-0 lg:max-w-xl lg:pr-8">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-[#2A2A2A] lg:text-6xl">
              {t.hero.h1.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  <HeroHeadlineLine
                    line={line}
                    mark={
                      t.hero.h1Mark?.lineIndex === i ? t.hero.h1Mark.word : undefined
                    }
                  />
                </span>
              ))}
            </h1>
            <p className="mb-8 text-base leading-relaxed text-[#64748B] lg:text-lg">
              {t.hero.desc}
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
            {t.pain.title.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {t.pain.cards.map((card, index) => {
              const Icon = PAIN_ICONS[index];
              return (
              <article
                key={card.title}
                className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2AD175]/20 to-[#E3F58F]/30">
                  <Icon className="h-6 w-6 text-[#2A2A2A]" strokeWidth={1.75} />
                </div>
                <h3 className="mb-3 text-lg font-bold text-[#2A2A2A]">{card.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748B]">{card.desc}</p>
              </article>
            );
            })}
          </div>
        </section>

        {/* 4. Features */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="mb-16 text-center text-3xl font-bold leading-snug text-[#2A2A2A] lg:text-4xl">
            {t.features.title.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <div className="space-y-20 lg:space-y-28">
            {t.features.items.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex w-full flex-col items-stretch gap-10 lg:gap-16 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                <div className="w-full lg:flex-1">
                  <FeatureVisual type={FEATURE_VISUALS[index]} />
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
            {t.reverse.title.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 lg:text-lg">
            {t.reverse.desc}
          </p>
        </section>

        {/* 6. Bottom CTA & Footer */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-[#88F26C]/20 to-[#E3F58F]/20 p-8 text-center sm:p-12">
            <h2 className="mb-4 text-2xl font-bold leading-snug text-[#2A2A2A] sm:text-3xl">
              {t.cta.title[0]}
              <br />
              {t.cta.title[1]}
              <br className="sm:hidden" />
              <span className="hidden sm:inline">&nbsp;</span>
              {t.cta.title[2]}
            </h2>
            <EarlyBirdBenefit className="mb-8" />
            <div className="flex justify-center">
              <WaitlistForm className="justify-center" />
            </div>
          </div>

          <footer className="mt-16 text-center text-sm text-[#64748B]/80">
            {t.footer}
          </footer>
        </section>
      </main>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-[#2A2A2A] shadow-md backdrop-blur transition-transform duration-300 hover:scale-105"
        aria-label={t.scrollTop}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
