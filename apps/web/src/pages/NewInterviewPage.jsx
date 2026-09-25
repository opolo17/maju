import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Input, OptionCard, PageHeader, Textarea, inputFocusClass } from '@maju/ui';
import InterviewStepper from '../components/interview/InterviewStepper.jsx';
import { createSession, listSessions } from '../lib/api.js';
import {
  createPresetFromForm,
  deleteInterviewPreset,
  extractRecentSetups,
  loadInterviewPresets,
  saveInterviewPreset,
} from '../lib/interview-presets.js';
import { loadUserPrefs } from '../lib/user-preferences.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../i18n/interviewLabels.js';

const fieldClass = `w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-maju-text outline-none transition-colors ${inputFocusClass}`;
const labelClass = 'mb-1.5 block text-sm font-medium text-maju-muted';

function applyConfigToForm(config, setters) {
  if (config.title) setters.setSessionTitle(config.title);
  if (config.jobPostingText) setters.setJobPostingText(config.jobPostingText);
  if (config.cheatSheetText) setters.setCheatSheetText(config.cheatSheetText);
  if (config.persona) setters.setPersona(config.persona);
  if (config.peerIntensity) setters.setPeerIntensity(config.peerIntensity);
  if (config.durationMinutes) setters.setDurationMinutes(config.durationMinutes);
  if (config.language) setters.setInterviewLanguage(config.language);
  if (config.followUpDepth != null) {
    setters.setFollowUpDepth(config.followUpDepth);
    setters.setShowAdvanced(true);
  }
}

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const userPrefs = loadUserPrefs(user?.id);
  const {
    flowStepIndex,
    personaOptions,
    peerIntensityOptions,
    durationOptions,
    interviewLanguageOptions,
    getFollowUpDepthOptions,
    getPersonaLabel,
  } = useInterviewLabels();

  const [jobPostingText, setJobPostingText] = useState('');
  const [cheatSheetText, setCheatSheetText] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [persona, setPersona] = useState(userPrefs.defaultPersona);
  const [peerIntensity, setPeerIntensity] = useState(userPrefs.defaultPeerIntensity);
  const [durationMinutes, setDurationMinutes] = useState(userPrefs.defaultDurationMinutes);
  const [interviewLanguage, setInterviewLanguage] = useState(locale);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [followUpDepth, setFollowUpDepth] = useState('auto');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState(() => loadInterviewPresets());
  const [recentSetups, setRecentSetups] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [showPresetSave, setShowPresetSave] = useState(false);

  const recommendation = location.state?.recommendation;
  const prefillApplied = location.state?.prefillApplied;

  const formSetters = {
    setSessionTitle,
    setJobPostingText,
    setCheatSheetText,
    setPersona,
    setPeerIntensity,
    setDurationMinutes,
    setInterviewLanguage,
    setFollowUpDepth,
    setShowAdvanced,
  };

  useEffect(() => {
    let mounted = true;
    listSessions()
      .then((data) => {
        if (!mounted) return;
        setRecentSetups(extractRecentSetups(data.sessions ?? []));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const prefill = location.state?.prefill;
    if (!prefill || prefillApplied) return;

    applyConfigToForm(prefill, formSetters);

    if (recommendation && prefill.title) {
      setSessionTitle(`${prefill.title} ${t('interview.new.retrySuffix')}`);
    }

    navigate(location.pathname, {
      replace: true,
      state: {
        ...location.state,
        prefillApplied: true,
      },
    });
  }, [location.state?.prefill, location.state?.prefillApplied, location.pathname, navigate, recommendation, t]);

  const followUpDepthOptions = getFollowUpDepthOptions(persona);

  function getCurrentForm() {
    return {
      sessionTitle,
      jobPostingText,
      cheatSheetText,
      persona,
      peerIntensity,
      durationMinutes,
      interviewLanguage,
      followUpDepth,
    };
  }

  function handleLoadPreset(preset) {
    applyConfigToForm(preset.config, formSetters);
  }

  function handleLoadRecentSetup(setup) {
    applyConfigToForm(setup, formSetters);
  }

  function handleSavePreset() {
    const name = presetName.trim();
    if (!name) {
      setError(t('interview.new.presetNameRequired'));
      return;
    }

    const preset = createPresetFromForm({ name, form: getCurrentForm() });
    saveInterviewPreset(preset);
    setPresets(loadInterviewPresets());
    setPresetName('');
    setShowPresetSave(false);
    setError('');
  }

  function handleDeletePreset(id) {
    deleteInterviewPreset(id);
    setPresets(loadInterviewPresets());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const trimmedJob = jobPostingText.trim();
    const trimmedCheat = cheatSheetText.trim();

    if (!trimmedJob && !trimmedCheat) {
      setError(t('interview.new.needInput'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        jobPostingText: trimmedJob || undefined,
        cheatSheetText: trimmedCheat || undefined,
        title: sessionTitle.trim() || undefined,
        persona,
        language: interviewLanguage,
        peerIntensity,
        durationMinutes,
      };

      if (followUpDepth !== 'auto') {
        payload.followUpDepth = followUpDepth;
      }

      const { session } = await createSession(payload);
      navigate(`/interview/${session.id}/lobby`, { replace: true });
    } catch (err) {
      setError(err.message ?? t('interview.new.createFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <InterviewStepper currentStep={flowStepIndex.setup} />

      <PageHeader
        back={{ label: t('common.backToDashboard'), onClick: () => navigate('/dashboard') }}
        title={t('interview.new.title')}
        description={t('interview.new.subtitle')}
      />

      {recommendation?.reasonKey ? (
        <Alert variant="info">{t(recommendation.reasonKey)}</Alert>
      ) : null}

      {presets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-maju-text">{t('interview.new.presetsTitle')}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => handleLoadPreset(preset)}
                >
                  <p className="truncate text-sm font-semibold text-maju-text">{preset.name}</p>
                  <p className="mt-0.5 truncate text-xs text-maju-subtle">
                    {getPersonaLabel(preset.config.persona)} ·{' '}
                    {t('common.minutes', { n: preset.config.durationMinutes })}
                  </p>
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shrink-0 text-red-600 hover:border-red-200 hover:bg-red-50"
                  onClick={() => handleDeletePreset(preset.id)}
                >
                  {t('common.delete')}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {recentSetups.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-maju-text">{t('interview.new.recentSetupsTitle')}</h2>
          <div className="space-y-2">
            {recentSetups.map((setup) => (
              <button
                key={setup.id}
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-maju-surface/60 px-4 py-3 text-left transition-colors hover:border-maju-accent/30"
                onClick={() => handleLoadRecentSetup(setup)}
              >
                <p className="truncate text-sm font-medium text-maju-text">
                  {setup.title || setup.jobPostingText.slice(0, 60) || t('interview.new.untitledSetup')}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-maju-subtle">
                  {setup.jobPostingText || setup.cheatSheetText}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        {error ? <Alert>{error}</Alert> : null}

        <section className="space-y-4">
          <div>
            <label htmlFor="sessionTitle" className={labelClass}>
              {t('interview.new.sessionTitle')}
            </label>
            <Input
              id="sessionTitle"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder={t('interview.new.sessionTitlePlaceholder')}
              maxLength={80}
            />
          </div>

          <div>
            <label htmlFor="jobPosting" className={labelClass}>
              {t('interview.new.jobPosting')}
            </label>
            <Textarea
              id="jobPosting"
              value={jobPostingText}
              onChange={(e) => setJobPostingText(e.target.value)}
              placeholder={t('interview.new.jobPostingPlaceholder')}
              rows={6}
              variant="default"
            />
          </div>

          <div>
            <label htmlFor="cheatSheet" className={labelClass}>
              {t('interview.new.cheatSheet')}
            </label>
            <Textarea
              id="cheatSheet"
              value={cheatSheetText}
              onChange={(e) => setCheatSheetText(e.target.value)}
              placeholder={t('interview.new.cheatSheetPlaceholder')}
              rows={4}
            />
          </div>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>{t('interview.new.personaSection')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {personaOptions.map((option) => (
              <OptionCard
                key={option.id}
                selected={persona === option.id}
                title={option.label}
                description={option.description}
                onSelect={() => setPersona(option.id)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className={labelClass}>{t('interview.new.peerSection')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {peerIntensityOptions.map((option) => (
              <OptionCard
                key={option.id}
                selected={peerIntensity === option.id}
                title={option.label}
                description={option.description}
                onSelect={() => setPeerIntensity(option.id)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <label htmlFor="interviewLanguage" className={labelClass}>
              {t('interview.language.label')}
            </label>
            <p className="mb-2 text-xs text-maju-subtle">{t('interview.language.hint')}</p>
            <select
              id="interviewLanguage"
              value={interviewLanguage}
              onChange={(e) => setInterviewLanguage(e.target.value)}
              className={fieldClass}
            >
              {interviewLanguageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setShowAdvanced((open) => !open)}
            aria-expanded={showAdvanced}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-medium text-maju-text">{t('interview.new.advanced')}</p>
              <p className="mt-0.5 text-xs text-maju-muted">{t('interview.new.advancedHint')}</p>
            </div>
            <span className="text-sm text-maju-muted">{showAdvanced ? '▲' : '▼'}</span>
          </button>

          {showAdvanced ? (
            <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3">
              <p className={labelClass}>{t('interview.new.followUpSection')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {followUpDepthOptions.map((option) => (
                  <OptionCard
                    key={String(option.id)}
                    selected={followUpDepth === option.id}
                    title={option.label}
                    description={option.description}
                    onSelect={() => setFollowUpDepth(option.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <label htmlFor="duration" className={labelClass}>
            {t('interview.new.duration')}
          </label>
          <select
            id="duration"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className={fieldClass}
          >
            {durationOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-lg border border-dashed border-gray-200 bg-white p-4 space-y-3">
          {showPresetSave ? (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <label htmlFor="presetName" className={labelClass}>
                  {t('interview.new.presetName')}
                </label>
                <Input
                  id="presetName"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder={t('interview.new.presetNamePlaceholder')}
                  maxLength={40}
                />
              </div>
              <Button type="button" size="sm" onClick={handleSavePreset}>
                {t('interview.new.presetSaveConfirm')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setShowPresetSave(false);
                  setPresetName('');
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          ) : (
            <Button type="button" variant="secondary" onClick={() => setShowPresetSave(true)}>
              {t('interview.new.presetSave')}
            </Button>
          )}
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? t('interview.new.creating') : t('interview.new.submit')}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
