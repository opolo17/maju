import { CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../i18n/LanguageContext.jsx';

export default function DashboardHeader({ weeklyCount = 0, subtitle }) {
  const { user } = useAuth();
  const { t } = useI18n();

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    t('nav.defaultUser');

  return (
    <header className="flex flex-wrap items-start justify-between gap-3 pb-1">
      <div className="min-w-0">
        <p className="text-sm text-maju-muted">
          {t('dashboard.greeting', { name: displayName })}
        </p>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-maju-text sm:text-2xl">
          {t('dashboard.heroTitle')}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-maju-muted">{subtitle}</p>
        ) : null}
      </div>

      {weeklyCount > 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-maju-accent/20 bg-maju-highlight/40 px-3 py-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-maju-accent" strokeWidth={2} aria-hidden />
          <span className="text-sm font-semibold text-maju-text">
            {t('dashboard.weeklyPractice', { n: weeklyCount })}
          </span>
        </div>
      ) : null}
    </header>
  );
}
