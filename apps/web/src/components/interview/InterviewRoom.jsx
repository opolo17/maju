import { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
} from 'lucide-react';
import { INTERVIEW_PARTICIPANTS, PARTICIPANT_IMAGES } from '../../constants/participants.js';
import { attachStreamToVideo } from '../../hooks/useMediaStream.js';
import HudOverlay from './HudOverlay.jsx';

function ParticipantTile({ participant, imageIndex, stream, camEnabled }) {
  const videoRef = useRef(null);
  const isMe = participant.isMe;
  const image = PARTICIPANT_IMAGES[imageIndex];

  useEffect(() => {
    if (!isMe || !stream || !camEnabled) return;
    attachStreamToVideo(videoRef.current, stream);
  }, [isMe, stream, camEnabled]);

  return (
    <div
      className={`relative aspect-video overflow-hidden bg-gray-800 ${
        isMe ? 'ring-2 ring-[#2AD175] ring-inset' : ''
      }`}
    >
      {isMe ? (
        camEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full scale-x-[-1] object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900 text-sm text-white/50">
            카메라 꺼짐
          </div>
        )
      ) : (
        <img src={image} alt="" className="h-full w-full object-cover opacity-90" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-tight text-white sm:text-xs">
            {participant.label}
          </p>
          <p className="text-[9px] text-white/60 sm:text-[10px]">{participant.sub}</p>
        </div>
        {participant.badge ? (
          <span className="rounded bg-[#2AD175] px-1.5 py-0.5 text-[8px] font-bold text-[#2A2A2A]">
            {participant.badge}
          </span>
        ) : null}
      </div>

      {isMe ? (
        <span className="absolute left-2 top-2 rounded bg-[#2AD175]/90 px-1.5 py-0.5 text-[8px] font-bold text-[#2A2A2A]">
          YOU
        </span>
      ) : null}
    </div>
  );
}

export default function InterviewRoom({
  title = 'MAJU · 다대다 면접 시뮬레이션',
  stream,
  micEnabled,
  camEnabled,
  onToggleMic,
  onToggleCam,
  onEnd,
  subtitle,
  showHud = true,
  hudAlerts = [],
  analysisVideoRef,
}) {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {analysisVideoRef ? (
        <video
          ref={analysisVideoRef}
          autoPlay
          muted
          playsInline
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-hidden
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-700 bg-[#1a1a1a] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#2d2d2d] px-4 py-2.5">
          <span className="text-xs font-medium tracking-tight text-white/90">{title}</span>
          <div className="flex items-center gap-2">
            {showHud && hudAlerts.length > 0 ? (
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-semibold text-amber-300">
                HUD
              </span>
            ) : null}
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0.5 bg-[#0f0f0f] p-0.5">
          {INTERVIEW_PARTICIPANTS.map((participant, index) => (
            <ParticipantTile
              key={participant.key}
              participant={participant}
              imageIndex={index}
              stream={stream}
              camEnabled={camEnabled}
            />
          ))}
        </div>

        {subtitle ? (
          <div className="border-t border-white/10 bg-[#252525] px-4 py-3">
            <p className="text-center text-xs text-white/70 sm:text-sm">{subtitle}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-4 bg-[#2d2d2d] px-4 py-3">
          <button
            type="button"
            onClick={onToggleMic}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              micEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
            }`}
            aria-label={micEnabled ? '마이크 끄기' : '마이크 켜기'}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleCam}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              camEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
            }`}
            aria-label={camEnabled ? '카메라 끄기' : '카메라 켜기'}
          >
            {camEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="flex h-10 min-w-10 items-center justify-center rounded-full bg-red-500/90 px-3 text-white"
          >
            <span className="text-xs font-bold">종료</span>
          </button>
        </div>
      </div>

      {showHud ? <HudOverlay alerts={hudAlerts} /> : null}
    </div>
  );
}
