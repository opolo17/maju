import { useNavigate } from 'react-router-dom';
import { Button, PageHeader } from '@maju/ui';
import { useI18n } from '../i18n/LanguageContext.jsx';

const PLAN_KEYS = ['free', 'premium'];

export default function PricingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        back={{ label: t('common.backToDashboard'), onClick: () => navigate('/dashboard') }}
        eyebrow={t('pricing.label')}
        title={t('pricing.title')}
        description={t('pricing.desc')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {PLAN_KEYS.map((planKey) => {
          const isCurrent = planKey === 'free';
          const isPremium = planKey === 'premium';

          return (
            <article
              key={planKey}
              className={`flex flex-col rounded-xl border p-6 ${
                isPremium
                  ? 'border-maju-accent/30 bg-maju-highlight/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-maju-text">
                    {t(`pricing.${planKey}.name`)}
                  </h2>
                  <p className="mt-1 text-sm text-maju-muted">{t(`pricing.${planKey}.price`)}</p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-maju-muted">
                    {t('pricing.currentPlan')}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-maju-muted">
                {t(`pricing.${planKey}.desc`)}
              </p>

              <ul className="mt-4 flex-1 space-y-2 text-sm text-maju-text">
                {(t(`pricing.${planKey}.features`) || '').split('|').map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-maju-accent" aria-hidden>
                      ·
                    </span>
                    <span>{feature.trim()}</span>
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-6 w-full"
                  disabled
                >
                  {t('pricing.premiumComingSoon')}
                </Button>
              ) : null}
            </article>
          );
        })}
      </div>

      <p className="text-center text-xs text-maju-subtle">{t('pricing.footer')}</p>
    </div>
  );
}
