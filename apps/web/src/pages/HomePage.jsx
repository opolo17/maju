import { useNavigate } from 'react-router-dom';
import { Button, Logo, MarkerHighlight } from '@maju/ui';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isConfigured } = useAuth();
  const { t } = useI18n();

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageSwitcher />
        </div>
        <Logo className="text-3xl" />
        <p className="mt-4 text-maju-muted">{t('home.alreadyLoggedIn')}</p>
        <Button className="mt-6" size="lg" onClick={() => navigate('/dashboard')}>
          {t('home.goDashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <Logo className="text-3xl" />
      <h1 className="mt-8 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-maju-text">
        {t('home.heroLine')}{' '}
        <MarkerHighlight>{t('home.heroMark')}</MarkerHighlight>
        {t('home.heroEnd')}
      </h1>
      <p className="mt-4 max-w-md text-maju-muted">{t('home.tagline')}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {isConfigured ? (
          <>
            <Button size="lg" onClick={() => navigate('/signup')}>
              {t('home.getStarted')}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              {t('home.login')}
            </Button>
          </>
        ) : (
          <Button size="lg" onClick={() => navigate('/setup')}>
            {t('home.setupGuide')}
          </Button>
        )}
      </div>
    </div>
  );
}
