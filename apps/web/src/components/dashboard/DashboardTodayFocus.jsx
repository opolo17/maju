import { Target } from 'lucide-react';
import RubricMiniBars from './RubricMiniBars.jsx';
import { useInterviewLabels } from '../../i18n/interviewLabels.js';

const FOCUS_TIP_KEYS = {
  structure: 'interview.report.recommend.structure',
  clarity: 'interview.report.recommend.clarity',
  confidence: 'interview.report.recommend.confidence',
  relevance: 'interview.report.recommend.structure',
};

export default function DashboardTodayFocus({ stats, t }) {
  const { rubricLabels } = useInterviewLabels();

  if (!stats?.rubricAverages || !stats.lowestRubric) return null;

  const { key, score } = stats.lowestRubric;
  const tipKey = FOCUS_TIP_KEYS[key] ?? 'interview.report.recommend.balanced';
  const topWeakness = stats.topWeaknesses[0];

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-start gap-3 lg:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:max-w-md">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-maju-highlight/60 text-maju-text">
              <Target className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-maju-subtle">
                {t('dashboard.focus.label')}
              </p>
              <h2 className="text-sm font-semibold text-maju-text">
                {t('dashboard.focus.rubricTitle', {
                  rubric: rubricLabels[key] ?? key,
                  score,
                })}
              </h2>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-maju-muted">{t(tipKey)}</p>
          {topWeakness ? (
            <p className="rounded-lg bg-maju-surface/80 px-2.5 py-2 text-xs text-maju-text">
              <span className="font-medium text-maju-muted">{t('dashboard.focus.weaknessLabel')} </span>
              {topWeakness.text}
              <span className="text-maju-subtle">
                {' '}
                · {t('dashboard.growth.weaknessCount', { n: topWeakness.count })}
              </span>
            </p>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 lg:max-w-sm lg:border-l lg:border-gray-100 lg:pl-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-maju-subtle">
            {t('dashboard.focus.rubricOverview')}
          </p>
          <RubricMiniBars
            averages={stats.rubricAverages}
            labels={rubricLabels}
            highlightKey={key}
            compact
          />
        </div>
      </div>
    </section>
  );
}
