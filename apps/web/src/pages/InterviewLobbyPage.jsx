import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@maju/ui';
import { Mic, Video } from 'lucide-react';
import { getSession } from '../lib/api.js';
import { PERSONA_LABELS } from '../constants/interview.js';
import { useMediaStream } from '../hooks/useMediaStream.js';

function DeviceCheck({ ok, label }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        ok ? 'border-[#2AD175]/40 bg-[#2AD175]/10 text-[#E3F58F]' : 'border-white/10 bg-white/5 text-white/50'
      }`}
    >
      {ok ? '✓' : '…'} {label}
    </div>
  );
}

export default function InterviewLobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stream, micEnabled, camEnabled, status, error, toggleMic, toggleCam } = useMediaStream();

  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSession(id)
      .then((data) => {
        if (mounted) setSession(data.session);
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
  }, [id]);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream && camEnabled) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, camEnabled]);

  const mediaReady = status === 'ready' && Boolean(stream);
  const canStart = mediaReady && session?.status === 'draft';

  if (loading) {
    return <p className="text-sm text-white/60">면접 정보 불러오는 중…</p>;
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

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section>
        <p className="text-sm font-semibold text-[#2AD175]">면접 준비</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{personaLabel} · {session.config.durationMinutes}분</h1>
        <p className="mt-2 text-sm text-white/60">
          카메라와 마이크를 확인한 뒤 면접을 시작하세요. (Step 2 — AI 연동 전 UI 테스트)
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]">
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
              {status === 'requesting' ? '카메라 연결 중…' : '카메라 미리보기'}
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
            aria-label="마이크 토글"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleCam}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              camEnabled ? 'bg-white/10 text-white' : 'bg-red-500/30 text-red-200'
            }`}
            aria-label="카메라 토글"
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
        <DeviceCheck ok={mediaReady} label="카메라 · 마이크 연결" />
        <DeviceCheck ok={micEnabled} label="마이크 활성" />
        <DeviceCheck ok={camEnabled} label="카메라 활성" />
        <DeviceCheck ok={session.status === 'draft'} label="세션 준비 완료" />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" disabled={!canStart} onClick={() => navigate(`/interview/${id}/live`)}>
          면접 시작
        </Button>
        {!mediaReady && status !== 'requesting' ? (
          <Button variant="secondary" size="lg" onClick={() => window.location.reload()}>
            권한 다시 요청
          </Button>
        ) : null}
      </div>
    </div>
  );
}
