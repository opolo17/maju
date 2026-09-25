import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Input, OptionCard, PageHeader, inputFocusClass } from '@maju/ui';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../i18n/interviewLabels.js';
import { loadUserPrefs, saveUserPrefs } from '../lib/user-preferences.js';

const fieldClass = `w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-maju-text outline-none transition-colors ${inputFocusClass}`;
const labelClass = 'mb-1.5 block text-sm font-medium text-maju-muted';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateDisplayName, signOut } = useAuth();
  const { t } = useI18n();
  const { personaOptions, peerIntensityOptions, durationOptions } = useInterviewLabels();

  const stored = loadUserPrefs(user?.id);

  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name ?? '');
  const [defaultPersona, setDefaultPersona] = useState(stored.defaultPersona);
  const [defaultPeerIntensity, setDefaultPeerIntensity] = useState(stored.defaultPeerIntensity);
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(stored.defaultDurationMinutes);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setDisplayName(user?.user_metadata?.display_name ?? '');
  }, [user?.user_metadata?.display_name]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const trimmedName = displayName.trim();
      if (trimmedName !== (user?.user_metadata?.display_name ?? '')) {
        await updateDisplayName(trimmedName);
      }

      saveUserPrefs(user?.id, {
        defaultPersona,
        defaultPeerIntensity,
        defaultDurationMinutes,
      });

      setSuccess(t('settings.saved'));
    } catch (err) {
      setError(err.message ?? t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError('');
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message ?? t('settings.logoutFailed'));
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        back={{ label: t('common.backToDashboard'), onClick: () => navigate('/dashboard') }}
        eyebrow={t('settings.label')}
        title={t('settings.title')}
        description={t('settings.desc')}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {error ? <Alert>{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-maju-text">{t('settings.profileTitle')}</h2>

          <div>
            <label htmlFor="displayName" className={labelClass}>
              {t('auth.displayName')}
            </label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('auth.displayNamePlaceholder')}
              maxLength={40}
            />
          </div>

          <p className="text-xs text-maju-subtle">{user?.email}</p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-maju-text">{t('settings.defaultsTitle')}</h2>
            <p className="mt-1 text-sm text-maju-muted">{t('settings.defaultsDesc')}</p>
          </div>

          <div className="space-y-3">
            <p className={labelClass}>{t('interview.new.personaSection')}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {personaOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={defaultPersona === option.id}
                  title={option.label}
                  description={option.description}
                  onSelect={() => setDefaultPersona(option.id)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className={labelClass}>{t('interview.new.peerSection')}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {peerIntensityOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  selected={defaultPeerIntensity === option.id}
                  title={option.label}
                  description={option.description}
                  onSelect={() => setDefaultPeerIntensity(option.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="defaultDuration" className={labelClass}>
              {t('interview.new.duration')}
            </label>
            <select
              id="defaultDuration"
              value={defaultDurationMinutes}
              onChange={(e) => setDefaultDurationMinutes(Number(e.target.value))}
              className={fieldClass}
            >
              {durationOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? t('common.processing') : t('settings.save')}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-maju-text">{t('settings.accountTitle')}</h2>
          <p className="mt-1 text-sm text-maju-muted">{t('settings.logoutDesc')}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={loggingOut}
          onClick={handleLogout}
        >
          {loggingOut ? t('common.processing') : t('nav.logout')}
        </Button>
      </section>
    </div>
  );
}
