import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@maju/ui';
import { scoreAccentClass } from '../../constants/interview.js';
import { buildRecommendedRetryPrefill } from '../../lib/recommended-retry.js';
import { useInterviewLabels } from '../../i18n/interviewLabels.js';

export default function DashboardRecommendCard({ session, report, stats, t }) {
  const navigate = useNavigate();
  const { rubricLabels } = useInterviewLabels();
  const recommendation = buildRecommendedRetryPrefill(session.config, report);

  const lowestKey = recommendation.lowestRubricKey ?? stats?.lowestRubric?.key;
  const focusLabel = lowestKey
    ? t('dashboard.recommend.focusTitle', { rubric: rubricLabels[lowestKey] ?? lowestKey })
    : t('interview.report.recommendedRetry.title');

  const latestScore = report?.overallScore;
  const trend = stats?.scoreTrend ?? [];
  const prevScore = trend.length >= 2 ? trend[trend.length - 2].score : null;
  const scoreDelta = prevScore != null && latestScore != null ? latestScore - prevScore : null;

  function handleStart() {
    navigate('/interview/new', {
      state: {
        prefill: recommendation.prefill,
        recommendation: { reasonKey: recommendation.reasonKey },
      },
    });
  }

  return (
    <section className="relative flex min-h-[11.5rem] flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Target
        className="pointer-events-none absolute -bottom-3 right-2 h-24 w-24 text-maju-accent/10"
        strokeWidth={1.25}
        aria-hidden
      />

      <div className="relative z-[1] min-w-0 max-w-[85%]">
        <span className="inline-flex rounded-full bg-maju-highlight/70 px-2.5 py-0.5 text-[11px] font-semibold text-maju-text">
          {t('dashboard.recommend.badge')}
        </span>
        <h2 className="mt-2 text-lg font-bold text-maju-text sm:text-xl">{focusLabel}</h2>
        {latestScore != null ? (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-maju-muted">{t('dashboard.recommend.recentScore')}</span>
            <span className={`font-bold tabular-nums ${scoreAccentClass(latestScore)}`}>
              {latestScore}
              {t('dashboard.growth.pointsSuffix')}
            </span>
            {scoreDelta != null && scoreDelta !== 0 ? (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  scoreDelta > 0 ? 'text-maju-accent' : 'text-red-500'
                }`}
              >
                {scoreDelta > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                )}
                {scoreDelta > 0 ? '+' : ''}
                {scoreDelta}
              </span>
            ) : null}
          </p>
        ) : null}
        <p className="mt-1 line-clamp-2 text-xs text-maju-muted">{t(recommendation.reasonKey)}</p>
      </div>

      <Button
        className="relative z-[1] mt-4 w-full bg-gradient-to-r from-maju-accent to-maju-highlight text-maju-text shadow-sm hover:opacity-95"
        onClick={handleStart}
      >
        {t('dashboard.recommend.startPractice')}
        <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
      </Button>
    </section>
  );
}
