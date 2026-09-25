import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, EmptyState, PageHeader } from '@maju/ui';
import InterviewStepper from '../components/interview/InterviewStepper.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { getSessionReport, retrySession } from '../lib/api.js';
import { getSessionDisplayTitle } from '../lib/interview-session.js';
import { buildRecommendedRetryPrefill } from '../lib/recommended-retry.js';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../i18n/interviewLabels.js';

const TIMELINE_STYLES = {
  question: 'border-gray-200 bg-maju-surface text-maju-text',
  answer: 'border-gray-200 bg-white text-maju-muted',
  peer: 'border-gray-200 bg-maju-surface text-maju-muted',
  hud: 'border-gray-200 bg-maju-surface text-maju-muted',
};

function RubricBar({ label, score, scoreAccentClass }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-maju-muted">{label}</span>
        <span className={`font-bold ${scoreAccentClass(score)}`}>{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-maju-accent transition-all"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewReportPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const labels = useInterviewLabels();

  const [session, setSession] = useState(location.state?.session ?? null);
  const [report, setReport] = useState(location.state?.report ?? null);
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getSessionReport(id);
        if (!mounted) return;
        setSession(data.session);
        setReport(data.report);
        setTurns(data.turns ?? []);
      } catch (err) {
        if (!mounted) return;
        if (location.state?.report && location.state?.session) {
          setSession(location.state.session);
          setReport(location.state.report);
          setError('');
        } else {
          setError(err.message ?? t('interview.report.loadFailed'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, location.state?.report, location.state?.session, t]);

  const recommendedRetry = useMemo(() => {
    if (!session?.config || !report) return null;
    return buildRecommendedRetryPrefill(session.config, report);
  }, [session?.config, report]);

  async function handleRetry() {
    if (!session?.config) return;
    setRetrying(true);
    try {
      const { session: newSession } = await retrySession(session.config);
      navigate(`/interview/${newSession.id}/lobby`);
    } catch (err) {
      setError(err.message ?? t('interview.report.retryFailed'));
    } finally {
      setRetrying(false);
    }
  }

  function handleRecommendedRetry() {
    if (!recommendedRetry) return;
    navigate('/interview/new', {
      state: {
        prefill: recommendedRetry.prefill,
        recommendation: { reasonKey: recommendedRetry.reasonKey },
      },
    });
  }

  if (loading) {
    return <LoadingState message={t('interview.report.loading')} />;
  }

  if (error || !session) {
    return (
      <div className="space-y-4">
        <Alert>{error || t('interview.errors.sessionNotFound')}</Alert>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          {t('common.toDashboard')}
        </Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <InterviewStepper currentStep={labels.flowStepIndex.report} />
        <EmptyState title={t('interview.report.emptyTitle')} description={t('interview.report.emptyDesc')}>
          {session.status === 'live' || session.status === 'draft' ? (
            <Button onClick={() => navigate(`/interview/${id}/live`)}>
              {t('dashboard.continue')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            {t('common.toDashboard')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/interview/new')}>
            {t('interview.report.newInterview')}
          </Button>
        </EmptyState>
      </div>
    );
  }

  const personaLabel = labels.getPersonaLabel(session.config.persona);
  const sessionTitle = getSessionDisplayTitle(session, labels.getPersonaLabel, t);
  const userTurnCount = turns.filter((turn) => turn.role === 'user').length;
  const turnRoleLabels = labels.getTurnRoleLabels(session.config);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <InterviewStepper currentStep={labels.flowStepIndex.report} />

      <PageHeader
        back={{ label: t('common.backToDashboard'), onClick: () => navigate('/dashboard') }}
        eyebrow={t('interview.report.title')}
        title={sessionTitle}
        description={`${personaLabel} · ${labels.getStatusLabel(session.status)}${
          session.endedAt ? ` · ${labels.formatSessionDate(session.endedAt)}` : ''
        }`}
      />

      {report ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-maju-muted">{t('interview.report.overallScore')}</p>
              <p className={`mt-1 text-4xl font-semibold tabular-nums ${labels.scoreAccentClass(report.overallScore)}`}>
                {report.overallScore}
              </p>
              <p className="mt-1 text-sm font-medium text-maju-muted">
                {labels.getScoreLabel(report.overallScore)}
              </p>
            </div>
            <p className="text-xs text-maju-subtle">
              {t('interview.report.turnsAnswered', { n: userTurnCount })} ·{' '}
              {t('interview.report.aiGenerated', {
                date: labels.formatSessionDate(report.generatedAt),
              })}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-maju-muted">{t('interview.report.summary')}</p>
            <p className="mt-2 text-sm leading-relaxed text-maju-text">{report.summary}</p>
          </div>
          {report.strengths?.length ? (
            <div>
              <p className="text-sm font-semibold text-maju-muted">{t('interview.report.strengths')}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-maju-text">
                {report.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.improvements?.length ? (
            <div>
              <p className="text-sm font-semibold text-maju-muted">{t('interview.report.improvements')}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-maju-text">
                {report.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {report?.rubric ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold">{t('interview.report.rubricTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(labels.rubricLabels).map(([key, label]) => (
              <RubricBar
                key={key}
                label={label}
                score={report.rubric[key] ?? 0}
                scoreAccentClass={labels.scoreAccentClass}
              />
            ))}
          </div>
        </section>
      ) : null}

      {report?.questionFeedback?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">{t('interview.report.feedbackTitle')}</h2>
          <div className="space-y-3">
            {report.questionFeedback.map((item, index) => (
              <article
                key={`${item.question}-${index}`}
                className="rounded-xl border border-gray-200 bg-white p-4 space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-maju-text">{item.question}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${labels.scoreAccentClass(item.score)} bg-maju-surface`}
                  >
                    {t('common.points', { n: item.score })}
                  </span>
                </div>
                <p className="text-sm text-maju-muted">
                  <span className="font-medium text-maju-text">{t('interview.report.myAnswer')}</span>
                  {item.answerSummary}
                </p>
                <p className="rounded-lg bg-maju-surface px-3 py-2 text-sm text-maju-text">
                  <span className="font-medium text-maju-muted">{t('interview.report.coaching')}</span>
                  {item.tip}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {report?.timeline?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">{t('interview.report.timelineTitle')}</h2>
          <ol className="space-y-2">
            {report.timeline.map((entry, index) => (
              <li
                key={`${entry.atSec}-${entry.type}-${index}`}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${TIMELINE_STYLES[entry.type] ?? TIMELINE_STYLES.answer}`}
              >
                <span className="shrink-0 font-mono text-xs font-bold opacity-80">
                  {labels.formatTimelineSec(entry.atSec)}
                </span>
                <span className="leading-relaxed">{entry.label}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {report?.deliveryInsights ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold">{t('interview.report.deliveryTitle')}</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-maju-muted">{t('interview.report.avgPace')}</dt>
              <dd className="font-semibold text-maju-text">
                {report.deliveryInsights.avgSyllableRate != null
                  ? t('interview.report.syllablesPerSec', {
                      n: report.deliveryInsights.avgSyllableRate.toFixed(1),
                    })
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-maju-muted">{t('interview.report.baselinePace')}</dt>
              <dd className="font-semibold text-maju-text">
                {report.deliveryInsights.baselineSyllableRate != null
                  ? t('interview.report.syllablesPerSec', {
                      n: report.deliveryInsights.baselineSyllableRate.toFixed(1),
                    })
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-maju-muted">{t('interview.report.silence')}</dt>
              <dd className="font-semibold text-maju-text">
                {t('interview.report.silenceDetail', {
                  count: report.deliveryInsights.silenceEpisodeCount,
                  total: report.deliveryInsights.totalSilenceSec,
                })}
                {report.deliveryInsights.longestSilenceSec > 0
                  ? t('interview.report.silenceLongest', {
                      n: report.deliveryInsights.longestSilenceSec,
                    })
                  : ''}
              </dd>
            </div>
            <div>
              <dt className="text-maju-muted">{t('interview.report.tempo')}</dt>
              <dd className="font-semibold text-maju-text">
                {t('interview.report.tempoDetail', {
                  fast: report.deliveryInsights.fastSpeechAlerts,
                  slow: report.deliveryInsights.slowSpeechAlerts,
                })}
              </dd>
            </div>
            <div>
              <dt className="text-maju-muted">{t('interview.report.gaze')}</dt>
              <dd className="font-semibold text-maju-text">
                {t('interview.report.gazeDetail', {
                  away: report.deliveryInsights.gazeAwayAlerts,
                  noFace: report.deliveryInsights.noFaceAlerts,
                })}
              </dd>
            </div>
            <div>
              <dt className="text-maju-muted">{t('interview.report.tracked')}</dt>
              <dd className="font-semibold text-maju-text">
                {t('interview.report.trackedDetail', {
                  n: report.deliveryInsights.trackedSec,
                })}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">
          {t('interview.report.transcriptTitle', { n: turns.length })}
        </h2>
        {turns.length === 0 ? (
          <p className="text-sm text-maju-muted">{t('interview.report.transcriptEmpty')}</p>
        ) : (
          <div className="space-y-3">
            {turns.map((turn) => (
              <div
                key={turn.id}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  turn.role === 'user'
                    ? 'border-gray-200 bg-maju-surface'
                    : turn.role === 'peer1'
                      ? 'border-sky-200 bg-sky-50'
                      : turn.role === 'peer2'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-maju-accent/20 bg-white'
                }`}
              >
                <p className="text-xs font-semibold uppercase text-maju-muted">
                  {turnRoleLabels[turn.role] ?? turn.role}
                </p>
                <p className="mt-1 leading-relaxed text-maju-text">{turn.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div>
          <p className="text-sm font-semibold text-maju-text">
            {t('interview.report.recommendedRetry.title')}
          </p>
          <p className="mt-1 text-sm text-maju-muted">
            {t(recommendedRetry?.reasonKey ?? 'interview.report.recommend.balanced')}
          </p>
        </div>
        <Button onClick={handleRecommendedRetry}>
          {t('interview.report.recommendedRetry.cta')}
        </Button>
      </section>

      <section className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          {t('common.toDashboard')}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/interview/new')}>
          {t('interview.report.newInterview')}
        </Button>
        <Button variant="secondary" disabled={retrying} onClick={handleRetry}>
          {retrying ? t('common.creating') : t('dashboard.retry')}
        </Button>
      </section>
    </div>
  );
}
