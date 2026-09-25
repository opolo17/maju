import { TrendingDown, TrendingUp } from 'lucide-react';
import { scoreAccentClass } from '../../constants/interview.js';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import ScoreSparkline from './ScoreSparkline.jsx';

export default function DashboardKpiStrip({
  stats,
  variant = 'stacked',
  className = '',
  sparklineId = 'majuDashSpark',
}) {
  const { t } = useI18n();

  if (!stats || stats.completedCount === 0) return null;

  const deltaLabel =
    stats.deltaScore == null
      ? null
      : stats.deltaScore > 0
        ? t('dashboard.growth.deltaUp', { n: stats.deltaScore })
        : stats.deltaScore < 0
          ? t('dashboard.growth.deltaDown', { n: Math.abs(stats.deltaScore) })
          : t('dashboard.growth.deltaFlat');

  const deltaTone =
    stats.deltaScore == null
      ? 'text-maju-muted'
      : stats.deltaScore > 0
        ? 'text-maju-accent'
        : stats.deltaScore < 0
          ? 'text-red-500'
          : 'text-maju-muted';

  if (variant === 'inline') {
    return (
      <div
        className={`flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-2 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0 ${className}`}
      >
        {stats.scoreTrend?.length >= 2 ? (
          <ScoreSparkline scoreTrend={stats.scoreTrend} gradientId={sparklineId} />
        ) : null}

        <div className="flex items-baseline gap-2">
          <span className="whitespace-nowrap text-xs text-maju-muted">
            {t('dashboard.growth.avgScore')}
          </span>
          <span
            className={`text-2xl font-bold tabular-nums leading-none ${scoreAccentClass(stats.avgScore ?? 0)}`}
          >
            {stats.avgScore ?? '—'}
          </span>
        </div>

        {deltaLabel ? (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${deltaTone}`}>
            {stats.deltaScore > 0 ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            ) : stats.deltaScore < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden />
            ) : null}
            {deltaLabel}
          </span>
        ) : null}

        <span className="whitespace-nowrap text-xs text-maju-muted">
          {t('dashboard.weeklyCount', { n: stats.weeklyCompletedCount ?? 0 })}
        </span>

        {stats.practiceStreak > 0 ? (
          <span className="whitespace-nowrap text-xs text-maju-muted">
            {t('dashboard.growth.streak', { n: stats.practiceStreak })}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm shadow-sm ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-maju-muted">{t('dashboard.growth.avgScore')}</span>
        <span className={`text-xl font-bold tabular-nums leading-none ${scoreAccentClass(stats.avgScore ?? 0)}`}>
          {stats.avgScore ?? '—'}
        </span>
      </div>

      {deltaLabel ? (
        <div className={`flex items-center gap-1 text-xs font-medium ${deltaTone}`}>
          {stats.deltaScore > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : stats.deltaScore < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : null}
          <span className="truncate">{deltaLabel}</span>
        </div>
      ) : null}

      <div className="space-y-1 border-t border-gray-100 pt-2 text-xs text-maju-muted">
        <p>{t('dashboard.growth.completedSessions', { n: stats.completedCount })}</p>
        {stats.practiceStreak > 0 ? (
          <p>{t('dashboard.growth.streak', { n: stats.practiceStreak })}</p>
        ) : null}
      </div>
    </div>
  );
}
