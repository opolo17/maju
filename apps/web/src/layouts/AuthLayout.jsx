import { Link } from 'react-router-dom';
import { Alert, Button, Logo } from '@maju/ui';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <Logo className="text-2xl" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-maju-text">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-maju-muted">{subtitle}</p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}

export function AuthFooterLink({ prompt, linkText, to }) {
  return (
    <p className="mt-6 text-center text-sm text-maju-muted">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-maju-text underline-offset-2 hover:underline">
        {linkText}
      </Link>
    </p>
  );
}

export function AuthError({ message }) {
  return <Alert variant="error">{message}</Alert>;
}

export function AuthSubmitButton({ loading, children }) {
  const { t } = useI18n();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={loading}>
      {loading ? t('common.processing') : children}
    </Button>
  );
}
