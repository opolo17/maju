import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createHudMetricsPayload } from '../lib/hud-metrics.js';
import { HUD_MESSAGES } from '../constants/hud.js';
import { useGazeDetection } from './useGazeDetection.js';
import { useSpeechPace } from './useSpeechPace.js';

/** Combines speech-pace and gaze HUD for Live interview. */
export function useHudCoach({
  stream,
  micEnabled,
  camEnabled,
  enabled = true,
  trackMetrics = true,
}) {
  const analysisVideoRef = useRef(null);

  useEffect(() => {
    const video = analysisVideoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => {});
  }, [stream]);

  const { alert: speedAlert, getMetrics: getSpeechMetrics } = useSpeechPace({
    micEnabled,
    enabled,
    trackMetrics,
  });
  const { alert: gazeAlert, getMetrics: getGazeMetrics } = useGazeDetection({
    videoRef: analysisVideoRef,
    camEnabled,
    enabled: enabled && Boolean(stream),
  });

  const getHudMetrics = useCallback(
    () => createHudMetricsPayload({
      speech: getSpeechMetrics(),
      gaze: getGazeMetrics(),
      collectedAt: new Date().toISOString(),
    }),
    [getSpeechMetrics, getGazeMetrics],
  );

  const alerts = useMemo(() => {
    const items = [];
    if (speedAlert) {
      items.push({ id: 'speed', type: 'speed', message: HUD_MESSAGES.speed });
    }
    if (gazeAlert === 'gaze') {
      items.push({ id: 'gaze', type: 'gaze', message: HUD_MESSAGES.gaze });
    }
    if (gazeAlert === 'noFace') {
      items.push({ id: 'noFace', type: 'gaze', message: HUD_MESSAGES.noFace });
    }
    return items;
  }, [speedAlert, gazeAlert]);

  return { alerts, analysisVideoRef, getHudMetrics };
}
