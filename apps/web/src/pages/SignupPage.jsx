import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Input } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
} from '../layouts/AuthLayout.jsx';

export default function SignupPage() {
  const { signUp, user, isConfigured } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isConfigured) {
    return <Navigate to="/setup" replace />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signUp(email.trim(), password, displayName.trim());
      setSuccess(t('auth.signupSuccess'));
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message ?? t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title={t('auth.signupTitle')} subtitle={t('auth.signupSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        {success ? <Alert variant="success">{success}</Alert> : null}

        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-maju-muted">
            {t('auth.displayName')}
          </label>
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('auth.displayNamePlaceholder')}
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordMinPlaceholder')}
          />
        </div>

        <AuthSubmitButton loading={loading}>{t('auth.signupSubmit')}</AuthSubmitButton>
      </form>

      <AuthFooterLink
        prompt={t('auth.hasAccount')}
        linkText={t('auth.loginLink')}
        to="/login"
      />
    </AuthLayout>
  );
}
