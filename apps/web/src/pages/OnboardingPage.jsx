import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Logo, OptionCard } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { markOnboardingComplete } from '../lib/user-preferences.js';

const GOAL_OPTIONS = ['job', 'grad', 'general'];
const EXPERIENCE_OPTIONS = ['beginner', 'intermediate', 'advanced'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('job');
  const [experienceLevel, setExperienceLevel] = useState('beginner');

  function finish(destination = '/dashboard') {
    markOnboardingComplete(user?.id, { goal, experienceLevel });
    navigate(destination, { replace: true });
  }

  return (
    <div className="min-h-screen bg-white text-maju-text">
      <header className="border-b border-gray-100 px-6 py-4">
        <Logo />
      </header>

      <main className="mx-auto flex max-w-2xl flex-col px-6 py-12">
        {step === 0 ? (
          <section className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-maju-accent">{t('onboarding.welcome.label')}</p>
              <h1 className="text-3xl font-bold tracking-tight">{t('onboarding.welcome.title')}</h1>
              <p className="text-base leading-relaxed text-maju-muted">{t('onboarding.welcome.desc')}</p>
            </div>
            <Button size="lg" onClick={() => setStep(1)}>
              {t('onboarding.welcome.cta')}
            </Button>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-maju-muted">{t('onboarding.step', { n: 1, total: 2 })}</p>
              <h1 className="text-2xl font-bold">{t('onboarding.goal.title')}</h1>
              <p className="text-sm text-maju-muted">{t('onboarding.goal.desc')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {GOAL_OPTIONS.map((id) => (
                <OptionCard
                  key={id}
                  selected={goal === id}
                  title={t(`onboarding.goal.${id}.title`)}
                  description={t(`onboarding.goal.${id}.desc`)}
                  onSelect={() => setGoal(id)}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={() => setStep(2)}>
                {t('common.confirm')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setStep(0)}>
                {t('onboarding.back')}
              </Button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-maju-muted">{t('onboarding.step', { n: 2, total: 2 })}</p>
              <h1 className="text-2xl font-bold">{t('onboarding.experience.title')}</h1>
              <p className="text-sm text-maju-muted">{t('onboarding.experience.desc')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {EXPERIENCE_OPTIONS.map((id) => (
                <OptionCard
                  key={id}
                  selected={experienceLevel === id}
                  title={t(`onboarding.experience.${id}.title`)}
                  description={t(`onboarding.experience.${id}.desc`)}
                  onSelect={() => setExperienceLevel(id)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => finish('/interview/new')}>
                {t('onboarding.finishCreate')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => finish('/dashboard')}>
                {t('onboarding.finishDashboard')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setStep(1)}>
                {t('onboarding.back')}
              </Button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
