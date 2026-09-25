import { Button } from '@maju/ui';
import { useI18n } from '../../i18n/LanguageContext.jsx';

const STEP_KEYS = ['step1', 'step2', 'step3'];

export default function DashboardTutorial({ onDismiss, onStart }) {
  const { t } = useI18n();

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-3 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-maju-subtle">
            {t('dashboard.tutorial.label')}
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-maju-text">{t('dashboard.tutorial.title')}</h2>
          <p className="mt-1.5 text-sm text-maju-muted">{t('dashboard.tutorial.desc')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          {t('dashboard.tutorial.dismiss')}
        </Button>
      </div>

      <ol className="grid gap-2 sm:grid-cols-3">
        {STEP_KEYS.map((key, index) => (
          <li key={key} className="rounded-lg border border-gray-100 p-2.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-maju-surface text-[10px] font-medium text-maju-muted">
              {index + 1}
            </span>
            <p className="mt-1.5 text-sm font-medium text-maju-text">
              {t(`dashboard.tutorial.${key}.title`)}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-maju-muted">
              {t(`dashboard.tutorial.${key}.desc`)}
            </p>
          </li>
        ))}
      </ol>

      <Button size="sm" onClick={onStart}>{t('dashboard.tutorial.cta')}</Button>
    </section>
  );
}
