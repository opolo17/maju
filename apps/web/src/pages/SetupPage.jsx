import { Link } from 'react-router-dom';
import { Button, Logo } from '@maju/ui';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';

export default function SetupPage() {
  const { t } = useI18n();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <div className="absolute right-0 top-0">
        <LanguageSwitcher />
      </div>
      <Logo className="text-2xl" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight">{t('setup.title')}</h1>
      <p className="mt-3 text-sm leading-relaxed text-maju-muted">{t('setup.desc')}</p>

      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-maju-text">
        <li>
          {t('setup.step1', {
            envExample: '.env.example',
            envLocal: 'apps/web/.env.local',
          })}
        </li>
        <li>{t('setup.step2')}</li>
        <li>{t('setup.step3', { migrations: 'supabase/migrations/' })}</li>
        <li>{t('setup.step4')}</li>
      </ol>

      <p className="mt-6 text-sm text-maju-muted">
        {t('setup.hint', { readme: 'supabase/README.md' })}
      </p>

      <Link to="/" className="mt-8 inline-block">
        <Button variant="secondary">{t('setup.home')}</Button>
      </Link>
    </div>
  );
}
