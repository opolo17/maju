import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Textarea } from '@maju/ui';
import { Mic, Square } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import LoadingState from '../components/LoadingState.jsx';
import InterviewRoom from '../components/interview/InterviewRoom.jsx';
import LiveSessionBar from '../components/interview/LiveSessionBar.jsx';
import { useSharedMediaStream } from '../context/MediaStreamContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../i18n/interviewLabels.js';
import { useInterviewTimer } from '../hooks/useInterviewTimer.js';
import {
  endSession,
  getSession,
  playBase64AudioAndWait,
  requestClosingRemark,
  startSession,
  stopInterviewAudio,
  submitSessionTurnAudio,
  submitSessionTurnText,
} from '../lib/api.js';
import { estimateQuestionCount, getSessionDisplayTitle } from '../lib/interview-session.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { useHudCoach } from '../hooks/useHudCoach.js';

async function processTurnResponse({
  data,
  session,
  playPeerTurns,
  playInterviewerTurn,
  setSession,
  setLastUserAnswer,
  setTurnCount,
  isEnding,
}) {
  if (isEnding()) return;
  setLastUserAnswer(data.userTranscript);
  setTurnCount((count) => count + 1);
  await playPeerTurns(data.peers, session?.config ?? data.session?.config);
  if (isEnding()) return;
  await playInterviewerTurn(data.interviewerText, data.audioBase64, data.audioMimeType);
  if (data.session && !isEnding()) setSession(data.session);
}

export default function InterviewLivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const labels = useInterviewLabels();

  const { stream, micEnabled, camEnabled, status, error, stopStream, toggleMic, toggleCam } =
    useSharedMediaStream();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder({ enabled: false });

  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('starting');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleLabel, setSubtitleLabel] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [lastUserAnswer, setLastUserAnswer] = useState('');
  const [actionError, setActionError] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [textAnswerMode, setTextAnswerMode] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const startedRef = useRef(false);
  const pendingAudioRef = useRef(null);
  const timeUpHandledRef = useRef(false);
  const pendingTimeUpRef = useRef(false);
  const endingRef = useRef(false);

  const remainingSec = useInterviewTimer({
    startedAt: session?.startedAt,
    durationMinutes: session?.config?.durationMinutes,
    active: session?.status === 'live' && phase !== 'starting' && phase !== 'ending',
  });

  const estimatedQuestions = session?.config?.durationMinutes
    ? estimateQuestionCount(session.config.durationMinutes)
    : 0;

  const sessionTitle = session
    ? getSessionDisplayTitle(session, labels.getPersonaLabel, t)
    : '';

  const hudEnabled =
    status === 'ready' &&
    phase !== 'starting' &&
    phase !== 'closing' &&
    phase !== 'ending' &&
    phase !== 'error';
  const trackHudMetrics = hudEnabled && (phase === 'listening' || isRecording);
  const { alerts: hudAlerts, analysisVideoRef, getHudMetrics } = useHudCoach({
    stream,
    micEnabled,
    camEnabled,
    enabled: hudEnabled,
    trackMetrics: trackHudMetrics,
  });

  const isEnding = useCallback(() => endingRef.current, []);

  const playInterviewerTurn = useCallback(
    async (interviewerText, audioBase64, audioMimeType) => {
      if (endingRef.current) return false;

      setCurrentQuestion(interviewerText);
      setSubtitle(interviewerText);
      setSubtitleLabel(t('interview.live.interviewerQuestion'));
      setActiveSpeaker('interviewer');
      setPhase('speaking');

      const { interrupted } = await playBase64AudioAndWait(audioBase64, audioMimeType);
      if (interrupted || endingRef.current) {
        setActiveSpeaker(null);
        setSubtitleLabel('');
        return false;
      }

      setActiveSpeaker(null);
      setSubtitleLabel('');
      if (!endingRef.current) setPhase('listening');
      return true;
    },
    [t],
  );

  const playPeerTurns = useCallback(
    async (peers, config) => {
      if (!peers?.length || endingRef.current) return;

      const peerLabels = labels.buildPeerTurnLabels(config);

      for (const peer of peers) {
        if (endingRef.current) return;

        setSubtitle(peer.text);
        setSubtitleLabel(
          peer.kind === 'rival'
            ? `${peerLabels[peer.role] ?? peer.role} · ${t('interview.participants.rivalAnswer')}`
            : `${peerLabels[peer.role] ?? peer.role} · ${t('interview.participants.modelAnswer')}`,
        );
        setActiveSpeaker(peer.role);
        setPhase('peer-speaking');

        const { interrupted } = await playBase64AudioAndWait(peer.audioBase64, peer.audioMimeType);
        if (interrupted || endingRef.current) {
          setActiveSpeaker(null);
          setSubtitleLabel('');
          return;
        }
      }

      setActiveSpeaker(null);
      setSubtitleLabel('');
    },
    [labels, t],
  );

  const finishInterviewWithClosing = useCallback(async () => {
    stopInterviewAudio();
    endingRef.current = true;
    setActiveSpeaker(null);
    setActionError('');
    setPhase('closing');
    setSubtitleLabel(t('interview.live.closingRemark'));

    try {
      const closing = await requestClosingRemark(id);
      if (closing.interviewerText) {
        setCurrentQuestion(closing.interviewerText);
        setSubtitle(closing.interviewerText);
        setSubtitleLabel(t('interview.live.closingRemark'));
        setActiveSpeaker('interviewer');
        await playBase64AudioAndWait(closing.audioBase64, closing.audioMimeType);
        setActiveSpeaker(null);
      }
    } catch (err) {
      setActionError(err.message ?? t('interview.live.closingFailed'));
    }

    setPhase('ending');
    setSubtitleLabel(t('interview.live.ending'));
    try {
      stopStream();
      const data = await endSession(id, getHudMetrics());
      navigate(`/interview/${id}/report`, {
        state: { report: data.report, session: data.session },
      });
    } catch (err) {
      setActionError(err.message ?? t('interview.live.endFailed'));
      endingRef.current = false;
      setPhase('listening');
    }
  }, [getHudMetrics, id, navigate, stopStream, t]);

  const tryFinishAfterTimeUp = useCallback(() => {
    if (timeUpHandledRef.current || !pendingTimeUpRef.current) return;
    timeUpHandledRef.current = true;
    pendingTimeUpRef.current = false;
    finishInterviewWithClosing();
  }, [finishInterviewWithClosing]);

  useEffect(() => {
    if (remainingSec !== 0 || timeUpHandledRef.current) return;
    if (phase === 'starting' || phase === 'ending' || phase === 'closing' || phase === 'error') {
      return;
    }

    const busy =
      phase === 'processing' ||
      phase === 'peer-speaking' ||
      phase === 'speaking' ||
      isRecording;

    if (busy) {
      pendingTimeUpRef.current = true;
      return;
    }

    timeUpHandledRef.current = true;
    finishInterviewWithClosing();
  }, [remainingSec, phase, isRecording, finishInterviewWithClosing]);

  useEffect(() => {
    if (!pendingTimeUpRef.current || timeUpHandledRef.current) return;
    if (phase !== 'listening') return;
    tryFinishAfterTimeUp();
  }, [phase, tryFinishAfterTimeUp]);

  useEffect(() => () => stopInterviewAudio(), []);

  const beginInterview = useCallback(async () => {
    setPhase('starting');
    setActionError('');
    try {
      const data = await startSession(id);
      setSession(data.session);
      if (data.turns?.length) {
        setTurnCount(data.turns.filter((turn) => turn.role === 'user').length);
      }
      await playInterviewerTurn(data.interviewerText, data.audioBase64, data.audioMimeType);
    } catch (err) {
      setActionError(err.message ?? t('interview.live.startFailed'));
      setPhase('error');
    }
  }, [id, playInterviewerTurn, t]);

  useEffect(() => {
    let mounted = true;

    getSession(id)
      .then((data) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session.status === 'completed') {
          navigate(`/interview/${id}/report`, { replace: true });
          return;
        }
        if (!startedRef.current) {
          startedRef.current = true;
          beginInterview();
        }
      })
      .catch((err) => {
        if (mounted) setLoadError(err.message ?? t('interview.lobby.loadFailed'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, beginInterview, navigate, t]);

  async function handleAnswerToggle() {
    setActionError('');

    if (isRecording) {
      setPhase('processing');
      setSubtitleLabel(t('interview.live.analyzing'));
      try {
        const blob = await stopRecording();
        pendingAudioRef.current = blob;
        const data = await submitSessionTurnAudio(id, blob);
        pendingAudioRef.current = null;
        await processTurnResponse({
          data,
          session,
          playPeerTurns,
          playInterviewerTurn,
          setSession,
          setLastUserAnswer,
          setTurnCount,
          isEnding,
        });
      } catch (err) {
        if (!endingRef.current) {
          setActionError(err.message ?? t('interview.live.turnFailed'));
          setActiveSpeaker(null);
          setPhase('listening');
        }
      }
      return;
    }

    if (phase !== 'listening' || endingRef.current) return;
    setTextAnswerMode(false);
    await startRecording();
  }

  async function handleRetryTurn() {
    setActionError('');
    setPhase('processing');
    setSubtitleLabel(t('interview.live.analyzing'));

    try {
      if (pendingAudioRef.current) {
        const data = await submitSessionTurnAudio(id, pendingAudioRef.current);
        pendingAudioRef.current = null;
        await processTurnResponse({
          data,
          session,
          playPeerTurns,
          playInterviewerTurn,
          setSession,
          setLastUserAnswer,
          setTurnCount,
          isEnding,
        });
        return;
      }

      const trimmed = textAnswer.trim();
      if (trimmed) {
        const data = await submitSessionTurnText(id, trimmed);
        setTextAnswer('');
        setTextAnswerMode(false);
        await processTurnResponse({
          data,
          session,
          playPeerTurns,
          playInterviewerTurn,
          setSession,
          setLastUserAnswer,
          setTurnCount,
          isEnding,
        });
      }
    } catch (err) {
      if (!endingRef.current) {
        setActionError(err.message ?? t('interview.live.turnFailed'));
        setActiveSpeaker(null);
        setPhase('listening');
      }
    }
  }

  async function handleRetryStart() {
    startedRef.current = true;
    await beginInterview();
  }

  async function handleTextSubmit(event) {
    event.preventDefault();
    const trimmed = textAnswer.trim();
    if (!trimmed || phase !== 'listening') return;

    setActionError('');
    setPhase('processing');
    setSubtitleLabel(t('interview.live.analyzing'));
    try {
      const data = await submitSessionTurnText(id, trimmed);
      setTextAnswer('');
      setTextAnswerMode(false);
      await processTurnResponse({
        data,
        session,
        playPeerTurns,
        playInterviewerTurn,
        setSession,
        setLastUserAnswer,
        setTurnCount,
        isEnding,
      });
    } catch (err) {
      if (!endingRef.current) {
        setActionError(err.message ?? t('interview.live.turnFailed'));
        setActiveSpeaker(null);
        setPhase('listening');
      }
    }
  }

  async function handleConfirmEnd() {
    setShowEndConfirm(false);
    if (isRecording) {
      await stopRecording();
    }
    await finishInterviewWithClosing();
  }

  if (loading) {
    return <LoadingState message={t('interview.live.loading')} dark />;
  }

  if (loadError || !session) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError || t('interview.errors.sessionNotFound')}
        </p>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          {t('common.toDashboard')}
        </Button>
      </div>
    );
  }

  const personaLabel = labels.getPersonaLabel(session.config.persona);
  const followUpLabel = labels.resolveFollowUpDepthLabel(session.config);
  const isInterviewerSpeaking = phase === 'speaking' && activeSpeaker === 'interviewer';
  const participants = labels.buildInterviewParticipants(session.config);
  const isBusyPhase =
    phase === 'starting' || phase === 'processing' || phase === 'closing' || phase === 'ending';
  const busyOverlayMessage =
    phase === 'starting'
      ? t('interview.live.connecting')
      : phase === 'processing'
        ? t('interview.live.analyzingOverlay')
        : phase === 'closing'
          ? t('interview.live.closingRemark')
          : phase === 'ending'
            ? t('interview.live.ending')
            : '';

  const phaseLabel =
    phase === 'starting'
      ? t('interview.live.phaseStarting')
      : phase === 'speaking'
        ? t('interview.live.phaseSpeaking')
        : phase === 'peer-speaking'
          ? t('interview.live.phasePeer')
          : phase === 'processing'
            ? t('interview.live.phaseProcessing')
            : phase === 'closing'
              ? t('interview.live.phaseClosing')
              : phase === 'ending'
                ? t('interview.live.phaseEnding')
                : phase === 'listening'
                  ? t('interview.live.phaseListening')
                  : '';

  const displaySubtitle = subtitle || currentQuestion;
  const canAnswer = phase === 'listening' && !isBusyPhase;
  const isTimeUp = remainingSec === 0;

  return (
    <div className="space-y-6">
      <section className="text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-md border border-maju-accent/30 bg-maju-accent/10 px-2.5 py-0.5 text-xs font-medium text-maju-accent">
            {personaLabel}
          </span>
          <span className="rounded-md border border-white/15 px-2.5 py-0.5 text-xs font-medium text-white/50">
            {t('interview.live.followUpBadge', { depth: followUpLabel })}
          </span>
        </div>
        <h1 className="mt-3 text-lg font-semibold tracking-tight text-white">{t('interview.live.title')}</h1>
        <p className="mt-2 text-sm text-white/50">{phaseLabel}</p>
      </section>

      <LiveSessionBar
        remainingSec={remainingSec}
        turnCount={turnCount}
        estimatedQuestions={estimatedQuestions}
        sessionTitle={session.config.title?.trim() ? sessionTitle : null}
      />

      {isTimeUp && phase === 'listening' ? (
        <p className="mx-auto max-w-3xl rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
          {t('interview.live.timeUpNotice')}
        </p>
      ) : null}

      {(error || actionError) && (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
          <p className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {actionError || error}
          </p>
          {actionError && phase === 'listening' ? (
            <Button variant="secondary" onClick={handleRetryTurn}>
              {t('interview.live.retryTurn')}
            </Button>
          ) : null}
        </div>
      )}

      {phase === 'error' ? (
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-6">
          <p className="text-center text-sm text-red-100">
            {actionError || t('interview.live.startFailed')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={handleRetryStart}>{t('interview.live.retryStart')}</Button>
            <Button variant="secondary" onClick={() => navigate(`/interview/${id}/lobby`)}>
              {t('interview.live.backToLobby')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              {t('common.toDashboard')}
            </Button>
          </div>
        </div>
      ) : null}

      {status === 'ready' && phase !== 'error' ? (
        <>
          <div className="relative mx-auto w-full max-w-3xl">
            <InterviewRoom
              participants={participants}
              stream={stream}
              micEnabled={micEnabled}
              camEnabled={camEnabled}
              onToggleMic={toggleMic}
              onToggleCam={toggleCam}
              onEnd={() => setShowEndConfirm(true)}
              subtitle={displaySubtitle}
              subtitleLabel={
                isBusyPhase && phase === 'processing'
                  ? t('interview.live.analyzing')
                  : subtitleLabel
              }
              subtitleEmphasis={isInterviewerSpeaking}
              personaBadge={personaLabel}
              activeSpeaker={activeSpeaker}
              showHud={!isBusyPhase}
              hudAlerts={hudAlerts}
              analysisVideoRef={analysisVideoRef}
            />
            {isBusyPhase ? (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/70 backdrop-blur-[2px]"
                role="status"
                aria-live="polite"
              >
                <div
                  className="h-7 w-7 animate-spin rounded-full border border-white/15 border-t-maju-accent"
                  aria-hidden
                />
                <p className="mt-3 text-sm font-medium text-white/90">{busyOverlayMessage}</p>
              </div>
            ) : null}
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
            {lastUserAnswer ? (
              <p className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                <span className="font-semibold text-maju-accent">{t('interview.live.myAnswer')}</span>
                {lastUserAnswer}
              </p>
            ) : null}

            {textAnswerMode ? (
              <form onSubmit={handleTextSubmit} className="w-full space-y-3">
                <Textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={t('interview.live.textAnswerPlaceholder')}
                  rows={4}
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
                  disabled={!canAnswer}
                />
                <div className="flex flex-wrap justify-center gap-2">
                  <Button type="submit" size="lg" disabled={!canAnswer || !textAnswer.trim()}>
                    {t('interview.live.textAnswerSubmit')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    disabled={!canAnswer}
                    onClick={() => {
                      setTextAnswerMode(false);
                      setTextAnswer('');
                    }}
                  >
                    {t('interview.live.backToVoice')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="lg"
                  variant={isRecording ? 'secondary' : 'primary'}
                  disabled={(phase !== 'listening' && !isRecording) || isBusyPhase}
                  onClick={handleAnswerToggle}
                >
                  {isRecording ? (
                    <>
                      <Square className="mr-2 inline h-4 w-4" />
                      {t('interview.live.recordStop')}
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 inline h-4 w-4" />
                      {t('interview.live.recordStart')}
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={!canAnswer || isRecording}
                  onClick={() => setTextAnswerMode(true)}
                >
                  {t('interview.live.textAnswerMode')}
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <LoadingState
          message={
            status === 'requesting'
              ? t('interview.live.mediaConnecting')
              : t('interview.live.mediaFailed')
          }
          dark
        />
      )}

      <ConfirmDialog
        open={showEndConfirm}
        title={t('interview.live.endTitle')}
        message={t('interview.live.endMessage')}
        confirmLabel={t('interview.live.endConfirm')}
        cancelLabel={t('interview.live.endCancel')}
        onConfirm={handleConfirmEnd}
        onCancel={() => setShowEndConfirm(false)}
      />
    </div>
  );
}
