import { useNavigate } from 'react-router-dom';
import InterviewRoom from '../components/interview/InterviewRoom.jsx';
import { DEMO_QUESTION } from '../constants/participants.js';
import { useHudCoach } from '../hooks/useHudCoach.js';
import { useMediaStream } from '../hooks/useMediaStream.js';

export default function InterviewDemoPage() {
  const navigate = useNavigate();
  const { stream, micEnabled, camEnabled, status, error, stopStream, toggleMic, toggleCam } =
    useMediaStream();

  const { alerts: hudAlerts, analysisVideoRef } = useHudCoach({
    stream,
    micEnabled,
    camEnabled,
    enabled: status === 'ready',
  });

  function handleEnd() {
    stopStream();
    navigate('/dashboard');
  }

  return (
    <div className="space-y-6">
      <section className="text-center">
        <p className="text-sm font-semibold text-[#2AD175]">Demo</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight">4분할 면접 UI + HUD 코치</h1>
        <p className="mt-2 text-sm text-white/50">
          말하기 빠르게·시선 이탈 시 우측 HUD 경고가 표시됩니다.
        </p>
      </section>

      {error ? (
        <p className="mx-auto max-w-3xl rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {status === 'ready' ? (
        <InterviewRoom
          stream={stream}
          micEnabled={micEnabled}
          camEnabled={camEnabled}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onEnd={handleEnd}
          subtitle={DEMO_QUESTION}
          showHud
          hudAlerts={hudAlerts}
          analysisVideoRef={analysisVideoRef}
        />
      ) : (
        <p className="text-center text-sm text-white/60">
          {status === 'requesting' ? '카메라·마이크 연결 중…' : '미디어 권한을 허용해 주세요.'}
        </p>
      )}
    </div>
  );
}
