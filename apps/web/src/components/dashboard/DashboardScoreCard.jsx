import { TrendingDown, TrendingUp } from 'lucide-react';
import { scoreAccentClass } from '../../constants/interview.js';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import ScoreSparkline from './ScoreSparkline.jsx';

export default function DashboardScoreCard({ stats }) {
  const { t } = useI18n();

  if (!stats || stats.completedCount === 0) return null;

  const deltaLabel =
    stats.deltaScore == null
      ? null
      : stats.deltaScore > 0
        ? t('dashboard.scoreCard.deltaUp', { n: stats.deltaScore })
        : stats.deltaScore < 0
          ? t('dashboard.scoreCard.deltaDown', { n: Math.abs(stats.deltaScore) })
          : t('dashboard.growth.deltaFlat');

  const deltaTone =
    stats.deltaScore == null
      ? 'text-maju-muted'
      : stats.deltaScore > 0
        ? 'text-maju-accent'
        : stats.deltaScore < 0
          ? 'text-red-500'
          : 'text-maju-muted';

  return (
    <section className="flex h-full min-h-[11.5rem] flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-medium text-maju-muted">{t('dashboard.scoreCard.label')}</p>
        <p className="mt-1 flex items-baseline gap-1">
          <span className={`text-3xl font-bold tabular-nums ${scoreAccentClass(stats.avgScore ?? 0)}`}>
            {stats.avgScore ?? '—'}
          </span>
          <span className="text-sm font-medium text-maju-subtle">/ 100</span>
        </p>
      </div>

      {stats.scoreTrend?.length >= 2 ? (
        <ScoreSparkline
          scoreTrend={stats.scoreTrend}
          gradientId="majuScoreCardSpark"
          className="h-12 w-full max-w-[10rem]"
        />
      ) : null}

      {deltaLabel ? (
        <p className={`flex items-center gap-1 text-xs font-semibold ${deltaTone}`}>
          {stats.deltaScore > 0 ? (
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          ) : stats.deltaScore < 0 ? (
            <TrendingDown className="h-3.5 w-3.5" aria-hidden />
          ) : null}
          {deltaLabel}
        </p>
      ) : (
        <p className="text-xs text-maju-subtle">{t('dashboard.scoreCard.vsPrev')}</p>
      )}
    </section>
  );
}
