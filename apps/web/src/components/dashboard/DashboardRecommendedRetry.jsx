import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@maju/ui';
import { buildRecommendedRetryPrefill } from '../../lib/recommended-retry.js';
import DashboardKpiStrip from './DashboardKpiStrip.jsx';

export default function DashboardRecommendedRetry({ session, report, t, stats = null }) {
  const navigate = useNavigate();
  const recommendation = buildRecommendedRetryPrefill(session.config, report);

  function handleStart() {
    navigate('/interview/new', {
      state: {
        prefill: recommendation.prefill,
        recommendation: { reasonKey: recommendation.reasonKey },
      },
    });
  }

  return (
    <section className="flex w-full flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-maju-accent/10 text-maju-accent">
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-maju-subtle">
            {t('dashboard.hero.nextStep')}
          </p>
          <h2 className="text-sm font-semibold text-maju-text">
            {t('interview.report.recommendedRetry.title')}
          </h2>
          <p className="line-clamp-1 text-xs text-maju-muted">{t(recommendation.reasonKey)}</p>
        </div>
      </div>

      <Button size="sm" className="w-full shrink-0 lg:w-auto" onClick={handleStart}>
        {t('interview.report.recommendedRetry.cta')}
      </Button>

      {stats ? <DashboardKpiStrip stats={stats} variant="inline" /> : null}
    </section>
  );
}
