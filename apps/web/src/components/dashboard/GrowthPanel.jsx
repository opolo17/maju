import { scoreAccentClass } from '../../constants/interview.js';
import { ClipboardList, TrendingDown, TrendingUp } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../../i18n/interviewLabels.js';

const ACCENT = '#2ad175';
const HIGHLIGHT = '#e3f58f';
const ANALYTICS_CARD = 'rounded-xl border border-gray-100 bg-white p-4 shadow-sm';

const CHART = {
  width: 640,
  height: 132,
  pad: { top: 8, right: 16, bottom: 22, left: 28 },
};

function plotMetrics() {
  const plotW = CHART.width - CHART.pad.left - CHART.pad.right;
  const plotH = CHART.height - CHART.pad.top - CHART.pad.bottom;
  const plotBottom = CHART.pad.top + plotH;
  const plotRight = CHART.width - CHART.pad.right;
  return { plotW, plotH, plotBottom, plotRight };
}

function chartPoint(index, count, score) {
  const { plotW, plotH } = plotMetrics();
  const x =
    count <= 1
      ? CHART.pad.left + plotW / 2
      : CHART.pad.left + (index / (count - 1)) * plotW;
  const y = CHART.pad.top + plotH - (score / 100) * plotH;
  return { x, y };
}

function buildSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

function MiniSparkline({ scoreTrend }) {
  if (scoreTrend.length < 2) return null;

  const W = 88;
  const H = 32;
  const pad = 3;
  const plotW = W - pad * 2;
  const plotH = H - pad * 2;

  const points = scoreTrend.map((point, index) => {
    const x = pad + (index / (scoreTrend.length - 1)) * plotW;
    const y = pad + plotH - (point.score / 100) * plotH;
    return { x, y };
  });

  const path = buildSmoothPath(points);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-[5.5rem] shrink-0" aria-hidden>
      <defs>
        <linearGradient id="majuSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {path ? (
        <>
          <path
            d={`${path} L ${points[points.length - 1].x} ${H - pad} L ${points[0].x} ${H - pad} Z`}
            fill="url(#majuSparkFill)"
          />
          <path d={path} fill="none" stroke={ACCENT} strokeWidth="1.75" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

function ScoreTrendChart({ scoreTrend, t, compact = false }) {
  if (scoreTrend.length === 0) return null;

  const count = scoreTrend.length;
  const points = scoreTrend.map((point, index) => ({
    ...point,
    ...chartPoint(index, count, point.score),
  }));

  const { plotH, plotBottom, plotRight } = plotMetrics();
  const curvePath = buildSmoothPath(points);
  const areaPath =
    curvePath && points.length > 1
      ? `${curvePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`
      : '';

  const gridScores = [0, 50, 100];

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      <h3 className="text-sm font-semibold text-maju-text">{t('dashboard.growth.scoreTrend')}</h3>
      <div className="rounded-lg bg-maju-surface/40 px-1.5 py-2 sm:px-3">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="block h-28 w-full sm:h-32"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t('dashboard.growth.scoreTrend')}
        >
          <defs>
            <linearGradient id="majuScoreTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
              <stop offset="55%" stopColor={HIGHLIGHT} stopOpacity="0.12" />
              <stop offset="100%" stopColor={HIGHLIGHT} stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridScores.map((value) => {
            const y = CHART.pad.top + plotH - (value / 100) * plotH;
            return (
              <g key={value}>
                <line
                  x1={CHART.pad.left}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={CHART.pad.left - 4}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="8"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {areaPath ? <path d={areaPath} fill="url(#majuScoreTrendFill)" /> : null}

          {curvePath ? (
            <path
              d={curvePath}
              fill="none"
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((point, index) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="#ffffff"
                stroke={ACCENT}
                strokeWidth="1.75"
              >
                <title>
                  {point.score}
                  {t('dashboard.growth.pointsSuffix')}
                </title>
              </circle>
              <text
                x={point.x}
                y={CHART.height - 4}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
              >
                {String(index + 1).padStart(2, '0')}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const DEFAULT_SECTIONS = ['header', 'summary', 'chart', 'rubric', 'weaknesses'];

export default function GrowthPanel({
  stats,
  sections = DEFAULT_SECTIONS,
  split = false,
}) {
  const { t } = useI18n();
  const { rubricLabels } = useInterviewLabels();

  if (!stats || stats.completedCount === 0) return null;

  const show = (name) => sections.includes(name);

  const deltaLabel =
    stats.deltaScore == null
      ? null
      : stats.deltaScore > 0
        ? t('dashboard.growth.deltaUp', { n: stats.deltaScore })
        : stats.deltaScore < 0
          ? t('dashboard.growth.deltaDown', { n: Math.abs(stats.deltaScore) })
          : t('dashboard.growth.deltaFlat');

  const cardClass = split ? ANALYTICS_CARD : '';
  const innerSpace = 'space-y-4';

  const deltaTone =
    stats.deltaScore == null
      ? ''
      : stats.deltaScore > 0
        ? 'text-maju-accent'
        : stats.deltaScore < 0
          ? 'text-red-500'
          : 'text-maju-muted';

  const avgScoreCard = (
    <div className={`${split ? ANALYTICS_CARD : ''} flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <p className="text-xs font-medium text-maju-muted">{t('dashboard.growth.avgScore')}</p>
        <div className="mt-1 flex flex-wrap items-end gap-2">
          <p className={`text-2xl font-bold tabular-nums leading-none ${scoreAccentClass(stats.avgScore ?? 0)}`}>
            {stats.avgScore ?? '—'}
            <span className="ml-0.5 text-sm font-normal text-maju-subtle">/100</span>
          </p>
          {deltaLabel ? (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${deltaTone}`}>
              {stats.deltaScore > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              ) : stats.deltaScore < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" aria-hidden />
              ) : null}
              {deltaLabel}
            </span>
          ) : null}
        </div>
      </div>
      <MiniSparkline scoreTrend={stats.scoreTrend} />
    </div>
  );

  const completedCard = (
    <div className={`${split ? ANALYTICS_CARD : ''} flex items-center justify-between gap-3`}>
      <div className="min-w-0">
        <p className="text-xs font-medium text-maju-muted">{t('dashboard.growth.completed')}</p>
        <p className="mt-1 text-xl font-bold leading-none text-maju-text">
          {t('dashboard.growth.completedSessions', { n: stats.completedCount })}
        </p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-maju-accent/10 text-maju-accent">
        <ClipboardList className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
    </div>
  );

  const streakCard =
    stats.practiceStreak > 0 ? (
      <div className={`${split ? ANALYTICS_CARD : ''} flex flex-col justify-center`}>
        <p className="text-xs font-medium text-maju-muted">{t('dashboard.growth.streakLabel')}</p>
        <p className="mt-1 text-xl font-bold leading-none text-maju-text">
          {t('dashboard.growth.streak', { n: stats.practiceStreak })}
        </p>
      </div>
    ) : null;

  const summaryBlock = show('summary') ? (
    split ? (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {avgScoreCard}
        {completedCard}
        {streakCard}
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {avgScoreCard}
        {completedCard}
      </div>
    )
  ) : null;

  const chartBlock = show('chart') ? (
    <ScoreTrendChart scoreTrend={stats.scoreTrend} t={t} compact={split} />
  ) : null;

  const rubricBlock =
    show('rubric') && stats.rubricAverages ? (
      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-maju-text">{t('dashboard.growth.rubricAvg')}</h3>
        <div className="space-y-2.5">
          {Object.entries(stats.rubricAverages).map(([key, score]) => (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-maju-text">{rubricLabels[key] ?? key}</span>
                <span className={`shrink-0 font-semibold tabular-nums ${scoreAccentClass(score)}`}>
                  {score}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-maju-accent transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const weaknessesBlock =
    show('weaknesses') && stats.topWeaknesses.length > 0 ? (
      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-maju-text">{t('dashboard.growth.weaknesses')}</h3>
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
          {stats.topWeaknesses.slice(0, 3).map((item, index) => (
            <li
              key={item.text}
              className="flex items-start justify-between gap-3 px-3 py-2 text-xs"
            >
              <span className="flex min-w-0 items-start gap-2 text-maju-text">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-maju-muted">
                  {index + 1}
                </span>
                <span className="line-clamp-2 leading-relaxed">{item.text}</span>
              </span>
              <span className="shrink-0 text-[11px] font-medium text-maju-subtle">
                {t('dashboard.growth.weaknessCount', { n: item.count })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const headerBlock = show('header') ? (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-maju-subtle">
          {t('dashboard.growth.label')}
        </p>
        <h2 className="mt-0.5 text-base font-semibold text-maju-text">{t('dashboard.growth.title')}</h2>
      </div>
      {!split && stats.practiceStreak > 0 ? (
        <span className="rounded-lg border border-gray-100 bg-maju-surface/60 px-2.5 py-1 text-xs font-medium text-maju-muted">
          {t('dashboard.growth.streak', { n: stats.practiceStreak })}
        </span>
      ) : null}
    </div>
  ) : null;

  if (split) {
    const hasSidePanel = rubricBlock || weaknessesBlock;

    return (
      <div className="space-y-3">
        {summaryBlock}
        <div className={`grid gap-3 ${hasSidePanel ? 'lg:grid-cols-5' : ''}`}>
          {chartBlock ? (
            <div className={`${cardClass} ${hasSidePanel ? 'lg:col-span-3' : ''}`}>{chartBlock}</div>
          ) : null}
          {hasSidePanel ? (
            <div className="flex flex-col gap-3 lg:col-span-2">
              {rubricBlock ? <div className={cardClass}>{rubricBlock}</div> : null}
              {weaknessesBlock ? <div className={cardClass}>{weaknessesBlock}</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <section className={`${ANALYTICS_CARD} ${innerSpace}`}>
      {headerBlock}
      {summaryBlock}
      {chartBlock}
      {rubricBlock}
      {weaknessesBlock}
    </section>
  );
}
