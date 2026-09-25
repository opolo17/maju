import { Link, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '@maju/ui';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import InterviewStepper from '../components/interview/InterviewStepper.jsx';
import { MediaStreamProvider } from '../context/MediaStreamContext.jsx';
import { INTERVIEW_FLOW_STEP_INDEX } from '../constants/interview.js';
import { useI18n } from '../i18n/LanguageContext.jsx';

function resolveInterviewStep(pathname) {
  if (pathname.includes('/live')) return INTERVIEW_FLOW_STEP_INDEX.live;
  if (pathname.includes('/lobby')) return INTERVIEW_FLOW_STEP_INDEX.lobby;
  return null;
}

export default function InterviewLayout() {
  const { pathname } = useLocation();
  const currentStep = resolveInterviewStep(pathname);
  const { t } = useI18n();

  return (
    <MediaStreamProvider>
      <div className="min-h-screen bg-maju-dark text-white">
        <header className="border-b border-white/10">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link to="/dashboard" className="shrink-0">
                <Logo variant="light" />
              </Link>
              <div className="flex items-center gap-3">
                <LanguageSwitcher dark />
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                >
                  {t('common.backToDashboard')}
                </Link>
              </div>
            </div>
            {currentStep != null ? (
              <div className="mt-4">
                <InterviewStepper currentStep={currentStep} dark />
              </div>
            ) : null}
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </MediaStreamProvider>
  );
}
