import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, TrendingUp } from 'lucide-react';
import { RUBRIC_KEYS } from '../../lib/growth-stats.js';
import ScoreSparkline from './ScoreSparkline.jsx';
import { useInterviewLabels } from '../../i18n/interviewLabels.js';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import { scoreAccentClass } from '../../constants/interview.js';

export default function DashboardCoachSidebar({ stats }) {
  const { t } = useI18n();
  const { rubricLabels } = useInterviewLabels();

  if (!stats || stats.completedCount === 0) return null;

  const rising = stats.deltaScore != null && stats.deltaScore > 0;

  return (
    <aside className="flex min-h-full flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-maju-text">{t('dashboard.coach.label')}</p>
        {stats.scoreTrend.length >= 2 ? (
          <div className="mt-2 flex items-center gap-2">
            <ScoreSparkline scoreTrend={stats.scoreTrend} gradientId="majuSidebarSpark" className="h-9 w-24" />
            {rising ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-maju-accent">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                {t('dashboard.coach.rising')}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {stats.rubricAverages ? (
        <div className="space-y-2.5 border-t border-gray-100 pt-3">
          {RUBRIC_KEYS.map((key) => {
            const score = stats.rubricAverages[key] ?? 0;
            const isFocus = stats.lowestRubric?.key === key;
            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className={`w-16 shrink-0 truncate text-[11px] font-medium ${
                    isFocus ? 'text-maju-accent' : 'text-maju-muted'
                  }`}
                >
                  {rubricLabels[key] ?? key}
                </span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${isFocus ? 'bg-maju-accent' : 'bg-maju-accent/50'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span
                  className={`w-7 shrink-0 text-right text-[11px] font-bold tabular-nums ${
                    isFocus ? scoreAccentClass(score) : 'text-maju-muted'
                  }`}
                >
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-auto rounded-xl border border-maju-highlight/60 bg-maju-highlight/25 p-3">
        <div className="flex items-start gap-2">
          <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-maju-accent" aria-hidden />
          <p className="text-xs leading-relaxed text-maju-text">{t('dashboard.coach.quote')}</p>
        </div>
      </div>

      <Link
        to="/insights"
        className="flex items-center justify-between gap-2 rounded-lg bg-maju-accent/10 px-3 py-2 text-xs font-semibold text-maju-text transition hover:bg-maju-accent/15"
      >
        {t('dashboard.viewInsights')}
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-maju-accent" aria-hidden />
      </Link>
    </aside>
  );
}
