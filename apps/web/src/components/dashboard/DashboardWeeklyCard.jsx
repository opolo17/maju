import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageContext.jsx';

const WEEKLY_GOAL = 5;

function ProgressRing({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <svg viewBox="0 0 88 88" className="h-[5.5rem] w-[5.5rem] shrink-0" aria-hidden>
      <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="#2ad175"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
      />
      <text x="44" y="46" textAnchor="middle" fill="#2a2a2a" fontSize="16" fontWeight="700">
        {pct}%
      </text>
    </svg>
  );
}

export default function DashboardWeeklyCard({ weeklyCount = 0 }) {
  const { t } = useI18n();

  return (
    <section className="flex h-full min-h-[11.5rem] flex-col items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
      <p className="w-full text-left text-xs font-medium text-maju-muted">
        {t('dashboard.weeklyCard.label')}
      </p>

      <ProgressRing value={weeklyCount} max={WEEKLY_GOAL} />

      <div className="w-full space-y-2">
        <p className="text-xs leading-relaxed text-maju-muted">
          {t('dashboard.weeklyCard.summary', { n: weeklyCount, target: WEEKLY_GOAL })}
        </p>
        <Link
          to="/insights"
          className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-maju-text transition hover:border-maju-accent/40 hover:bg-maju-highlight/20"
        >
          {t('dashboard.weeklyCard.cta')}
        </Link>
      </div>
    </section>
  );
}
