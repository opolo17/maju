import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
} from '../layouts/AuthLayout.jsx';

export default function LoginPage() {
  const { signInWithPassword, user, isConfigured } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isConfigured) {
    return <Navigate to="/setup" replace />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithPassword(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message ?? t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-maju-muted">
            {t('auth.email')}
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-maju-muted">
            {t('auth.password')}
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <AuthSubmitButton loading={loading}>{t('auth.loginSubmit')}</AuthSubmitButton>
      </form>

      <AuthFooterLink
        prompt={t('auth.noAccount')}
        linkText={t('auth.signupLink')}
        to="/signup"
      />
    </AuthLayout>
  );
}
