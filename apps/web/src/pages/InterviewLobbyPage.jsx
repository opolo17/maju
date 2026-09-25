import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@maju/ui';
import { Mic, Video } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import { getSession } from '../lib/api.js';
import { getSessionDisplayTitle } from '../lib/interview-session.js';
import { useSharedMediaStream } from '../context/MediaStreamContext.jsx';
import { useI18n } from '../i18n/LanguageContext.jsx';
import { useInterviewLabels } from '../i18n/interviewLabels.js';

function DeviceCheck({ ok, label }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        ok
          ? 'border-maju-accent/40 bg-maju-accent/10 text-white/90'
          : 'border-white/10 bg-white/5 text-white/50'
      }`}
    >
      {ok ? '✓' : '…'} {label}
    </div>
  );
}

export default function InterviewLobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { getPersonaLabel } = useInterviewLabels();
  const { stream, micEnabled, camEnabled, status, error, startStream, toggleMic, toggleCam } =
    useSharedMediaStream();

  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSession(id)
      .then((data) => {
        if (!mounted) return;
        setSession(data.session);
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
  }, [id, t]);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream && camEnabled) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, camEnabled]);

  const mediaReady = status === 'ready' && Boolean(stream);
  const sessionStatus = session?.status;

  if (loading) {
    return <LoadingState message={t('interview.lobby.loading')} dark />;
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

  if (sessionStatus === 'completed') {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t('interview.lobby.completedTitle')}</h1>
        <p className="text-sm text-white/60">{t('interview.lobby.completedDesc')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => navigate(`/interview/${id}/report`)}>
            {t('dashboard.viewReport')}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
            {t('common.toDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  const personaLabel = getPersonaLabel(session.config.persona);
  const sessionTitle = getSessionDisplayTitle(session, getPersonaLabel, t);
  const peerPersonas = session.config.peerPersonas;
  const canEnterLive = mediaReady && sessionStatus === 'draft';
  const isResume = sessionStatus === 'live';

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section>
        <p className="text-sm font-semibold text-maju-accent">{t('interview.lobby.prepLabel')}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{sessionTitle}</h1>
        <p className="mt-1 text-xs text-white/50">
          {personaLabel} · {t('common.minutes', { n: session.config.durationMinutes })}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {isResume ? t('interview.lobby.resumeHint') : t('interview.lobby.enterHint')}
        </p>
      </section>

      {peerPersonas ? (
        <section className="space-y-3">
          <p className="text-sm font-medium text-white/80">{t('interview.lobby.peersTitle')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[peerPersonas.peer1, peerPersonas.peer2].map((peer) => (
              <div
                key={peer.name}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-semibold text-maju-highlight">{peer.name}</p>
                <p className="mt-0.5 text-xs text-white/50">{peer.headline}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/70">{peer.background}</p>
                {peer.experiences?.length ? (
                  <ul className="mt-2 space-y-1 text-left text-[11px] leading-relaxed text-white/60">
                    {peer.experiences.map((exp) => (
                      <li key={exp} className="flex gap-1.5">
                        <span className="shrink-0 text-maju-accent">·</span>
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-maju-dark-panel">
        <div className="aspect-video bg-gray-900">
          {mediaReady && camEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full scale-x-[-1] object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
              {status === 'requesting'
                ? t('interview.lobby.cameraConnecting')
                : t('interview.lobby.cameraPreview')}
            </div>
          )}
        </div>
        <div className="flex justify-center gap-3 border-t border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              micEnabled ? 'bg-white/10 text-white' : 'bg-red-500/30 text-red-200'
            }`}
            aria-label={t('interview.lobby.micToggle')}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleCam}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              camEnabled ? 'bg-white/10 text-white' : 'bg-red-500/30 text-red-200'
            }`}
            aria-label={t('interview.lobby.camToggle')}
          >
            <Video className="h-4 w-4" />
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <DeviceCheck ok={mediaReady} label={t('interview.lobby.checkMedia')} />
        <DeviceCheck ok={micEnabled} label={t('interview.lobby.checkMic')} />
        <DeviceCheck ok={camEnabled} label={t('interview.lobby.checkCam')} />
        <DeviceCheck
          ok={sessionStatus === 'draft' || sessionStatus === 'live'}
          label={isResume ? t('interview.lobby.checkResume') : t('interview.lobby.checkReady')}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        {isResume ? (
          <Button size="lg" disabled={!mediaReady} onClick={() => navigate(`/interview/${id}/live`)}>
            {t('dashboard.continue')}
          </Button>
        ) : (
          <Button size="lg" disabled={!canEnterLive} onClick={() => navigate(`/interview/${id}/live`)}>
            {t('interview.lobby.enterRoom')}
          </Button>
        )}
        {!mediaReady && status !== 'requesting' ? (
          <Button variant="secondary" size="lg" onClick={() => startStream()}>
            {t('interview.lobby.retryPermission')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
