import { useCallback, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
} from 'lucide-react';
import { INTERVIEW_PARTICIPANTS, PARTICIPANT_IMAGES } from '../../constants/participants.js';
import { attachStreamToVideo } from '../../hooks/useMediaStream.js';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import HudOverlay from './HudOverlay.jsx';

function ParticipantTile({ participant, imageIndex, stream, camEnabled, isSpeaking, analysisVideoRef }) {
  const videoRef = useRef(null);
  const isMe = participant.isMe;
  const image = PARTICIPANT_IMAGES[imageIndex];

  const bindVideoRef = useCallback(
    (el) => {
      videoRef.current = el;
      if (isMe && analysisVideoRef) {
        analysisVideoRef.current = el;
      }
    },
    [isMe, analysisVideoRef],
  );

  useEffect(() => {
    if (!isMe || !stream || !camEnabled) return;
    attachStreamToVideo(videoRef.current, stream);
  }, [isMe, stream, camEnabled]);

  const speakingRing =
    isSpeaking && participant.key === 'interviewer'
      ? 'ring-2 ring-maju-accent ring-inset'
      : isSpeaking
        ? 'ring-2 ring-amber-400 ring-inset'
        : isMe
          ? 'ring-2 ring-maju-accent/40 ring-inset'
          : '';

  return (
    <div className={`relative aspect-video overflow-hidden bg-gray-800 ${speakingRing}`}>
      {isMe ? (
        camEnabled && stream ? (
          <video
            ref={bindVideoRef}
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
        <img
          src={image}
          alt=""
          className={`h-full w-full object-cover transition-opacity ${
            isSpeaking ? 'opacity-100' : 'opacity-90'
          }`}
        />
      )}

      {isSpeaking ? (
        <div className="absolute inset-0 bg-amber-400/10" aria-hidden />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-tight text-white sm:text-xs">
            {participant.label}
          </p>
          <p className="text-[9px] text-white/60 sm:text-[10px]">{participant.sub}</p>
        </div>
        {participant.badge ? (
          <span className="rounded bg-maju-accent px-1.5 py-0.5 text-[8px] font-bold text-maju-text">
            {participant.badge}
          </span>
        ) : null}
        {isSpeaking && !participant.badge ? (
          <span className="rounded bg-amber-400/90 px-1.5 py-0.5 text-[8px] font-bold text-[#2A2A2A]">
            발언 중
          </span>
        ) : null}
      </div>

      {isMe ? (
        <span className="absolute left-2 top-2 rounded bg-maju-accent/90 px-1.5 py-0.5 text-[8px] font-bold text-maju-text">
          YOU
        </span>
      ) : null}
    </div>
  );
}

export default function InterviewRoom({
  title,
  participants = INTERVIEW_PARTICIPANTS,
  stream,
  micEnabled,
  camEnabled,
  onToggleMic,
  onToggleCam,
  onEnd,
  subtitle,
  subtitleLabel,
  subtitleEmphasis = false,
  personaBadge,
  showHud = true,
  hudAlerts = [],
  analysisVideoRef,
  activeSpeaker = null,
}) {
  const { t } = useI18n();
  const roomTitle = title ?? t('interview.live.roomTitle');
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-gray-700 bg-maju-dark-panel shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/10 bg-maju-dark-elevated px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-xs font-medium tracking-tight text-white/90">{roomTitle}</span>
            {personaBadge ? (
              <span className="shrink-0 rounded-full bg-maju-accent/20 px-2 py-0.5 text-[9px] font-semibold text-maju-accent">
                {personaBadge}
              </span>
            ) : null}
          </div>
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
          {participants.map((participant, index) => (
            <ParticipantTile
              key={participant.key}
              participant={participant}
              imageIndex={index}
              stream={stream}
              camEnabled={camEnabled}
              isSpeaking={activeSpeaker === participant.key}
              analysisVideoRef={participant.isMe ? analysisVideoRef : null}
            />
          ))}
        </div>

        {subtitle ? (
          <div
            className={`border-t px-4 py-3 ${
              subtitleEmphasis
                ? 'border-maju-accent/30 bg-[#1f2a24]'
                : 'border-white/10 bg-[#252525]'
            }`}
          >
            {subtitleLabel ? (
              <p
                className={`mb-1 text-center text-[10px] font-semibold uppercase tracking-wide ${
                  subtitleEmphasis ? 'text-maju-accent' : 'text-amber-300/90'
                }`}
              >
                {subtitleLabel}
              </p>
            ) : null}
            <p
              className={`text-center text-xs sm:text-sm ${
                subtitleEmphasis ? 'font-medium text-white/90' : 'text-white/70'
              }`}
            >
              {subtitle}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-4 bg-maju-dark-elevated px-4 py-3">
          <button
            type="button"
            onClick={onToggleMic}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              micEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
            }`}
            aria-label={micEnabled ? t('interview.live.micOff') : t('interview.live.micOn')}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleCam}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              camEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
            }`}
            aria-label={camEnabled ? t('interview.live.camOff') : t('interview.live.camOn')}
          >
            {camEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="flex h-10 min-w-10 items-center justify-center rounded-full bg-red-500/90 px-3 text-white"
            aria-label={t('interview.live.endAria')}
          >
            <span className="text-xs font-bold">{t('interview.live.endButton')}</span>
          </button>
        </div>
      </div>

      {showHud ? <HudOverlay alerts={hudAlerts} /> : null}
    </div>
  );
}
