import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import LoadingState from './LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { listSessions } from '../lib/api.js';
import { isOnboardingComplete, markOnboardingComplete } from '../lib/user-preferences.js';

export default function RequireOnboarding() {
  const { user } = useAuth();
  const { t } = useI18n();
  const userId = user?.id;
  const [ready, setReady] = useState(isOnboardingComplete(userId));

  useEffect(() => {
    if (!userId || isOnboardingComplete(userId)) {
      setReady(true);
      return undefined;
    }

    let mounted = true;

    listSessions()
      .then((data) => {
        if (!mounted) return;
        if ((data.sessions?.length ?? 0) > 0) {
          markOnboardingComplete(userId, { skipped: true });
        }
        setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (!ready) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (!isOnboardingComplete(userId)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
