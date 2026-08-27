import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@maju/ui';
import { Mic, Square } from 'lucide-react';
import InterviewRoom from '../components/interview/InterviewRoom.jsx';
import { PERSONA_LABELS } from '../constants/interview.js';
import {
  endSession,
  getSession,
  playBase64AudioAndWait,
  startSession,
  submitSessionTurnAudio,
} from '../lib/api.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { useHudCoach } from '../hooks/useHudCoach.js';
import { useMediaStream } from '../hooks/useMediaStream.js';

export default function InterviewLivePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { stream, micEnabled, camEnabled, status, error, stopStream, toggleMic, toggleCam } =
    useMediaStream();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder({ enabled: false });

  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('starting');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [lastUserAnswer, setLastUserAnswer] = useState('');
  const [actionError, setActionError] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const startedRef = useRef(false);

  const hudEnabled =
    status === 'ready' && phase !== 'starting' && phase !== 'ending' && phase !== 'error';
  /** Respondent answer window only — excludes interviewer TTS and processing. */
  const trackHudMetrics =
    hudEnabled && (phase === 'listening' || isRecording);
  const { alerts: hudAlerts, analysisVideoRef, getHudMetrics } = useHudCoach({
    stream,
    micEnabled,
    camEnabled,
    enabled: hudEnabled,
    trackMetrics: trackHudMetrics,
  });

  const beginInterview = useCallback(async () => {
    setPhase('starting');
    setActionError('');
    try {
      const data = await startSession(id);
      setSession(data.session);
      setCurrentQuestion(data.interviewerText);
      setPhase('speaking');
      await playBase64AudioAndWait(data.audioBase64, data.audioMimeType);
      setPhase('listening');
    } catch (err) {
      setActionError(err.message ?? '면접 시작에 실패했습니다.');
      setPhase('error');
    }
  }, [id]);

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
        if (mounted) setLoadError(err.message ?? '세션을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, beginInterview, navigate]);

  async function handleAnswerToggle() {
    setActionError('');

    if (isRecording) {
      setPhase('processing');
      try {
        const blob = await stopRecording();
        const data = await submitSessionTurnAudio(id, blob);
        setLastUserAnswer(data.userTranscript);
        setTurnCount((count) => count + 1);
        setCurrentQuestion(data.interviewerText);
        setPhase('speaking');
        await playBase64AudioAndWait(data.audioBase64, data.audioMimeType);
        setPhase('listening');
      } catch (err) {
        setActionError(err.message ?? '답변 처리에 실패했습니다.');
        setPhase('listening');
      }
      return;
    }

    if (phase !== 'listening') return;
    await startRecording();
  }

  async function handleEnd() {
    if (!window.confirm('면접을 종료하고 리포트를 생성할까요?')) return;

    setActionError('');
    const hudMetrics = getHudMetrics();
    setPhase('ending');
    try {
      stopStream();
      const data = await endSession(id, hudMetrics);
      navigate(`/interview/${id}/report`, { state: { report: data.report, session: data.session } });
    } catch (err) {
      setActionError(err.message ?? '면접 종료에 실패했습니다.');
      setPhase('listening');
    }
  }

  if (loading) {
    return <p className="text-sm text-white/60">면접실 입장 중…</p>;
  }

  if (loadError || !session) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError || '세션을 찾을 수 없습니다.'}
        </p>
        <Link to="/dashboard">
          <Button variant="secondary">대시보드로</Button>
        </Link>
      </div>
    );
  }

  const personaLabel = PERSONA_LABELS[session.config.persona] ?? session.config.persona;
  const phaseLabel =
    phase === 'starting'
      ? '면접관 입장 중…'
      : phase === 'speaking'
        ? '면접관 발언 중'
        : phase === 'processing'
          ? '답변 분석 중…'
          : phase === 'ending'
            ? '리포트 생성 중…'
            : phase === 'listening'
              ? '답변해 주세요'
              : '';

  return (
    <div className="space-y-6">
      <section className="text-center">
        <p className="text-sm font-semibold text-[#2AD175]">Live · {personaLabel}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight">다대다 면접 진행 중</h1>
        <p className="mt-2 text-sm text-white/50">{phaseLabel} · {turnCount}턴 완료</p>
      </section>

      {(error || actionError) && (
        <p className="mx-auto max-w-3xl rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {actionError || error}
        </p>
      )}

      {status === 'ready' ? (
        <>
          <InterviewRoom
            stream={stream}
            micEnabled={micEnabled}
            camEnabled={camEnabled}
            onToggleMic={toggleMic}
            onToggleCam={toggleCam}
            onEnd={handleEnd}
            subtitle={currentQuestion}
            showHud
            hudAlerts={hudAlerts}
            analysisVideoRef={analysisVideoRef}
          />

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
            {lastUserAnswer ? (
              <p className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                <span className="font-semibold text-[#2AD175]">내 답변: </span>
                {lastUserAnswer}
              </p>
            ) : null}

            <Button
              size="lg"
              variant={isRecording ? 'secondary' : 'primary'}
              disabled={phase !== 'listening' && !isRecording}
              onClick={handleAnswerToggle}
            >
              {isRecording ? (
                <>
                  <Square className="mr-2 inline h-4 w-4" />
                  답변 종료 & 전송
                </>
              ) : (
                <>
                  <Mic className="mr-2 inline h-4 w-4" />
                  답변 녹음
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-white/60">
          {status === 'requesting' ? '카메라·마이크 연결 중…' : '미디어 장치를 준비할 수 없습니다.'}
        </p>
      )}
    </div>
  );
}
