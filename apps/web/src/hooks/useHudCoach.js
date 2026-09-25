import { useCallback, useMemo, useRef } from 'react';
import { createHudMetricsPayload } from '../lib/hud-metrics.js';
import { useInterviewLabels } from '../i18n/interviewLabels.js';
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
  const { hudMessages } = useInterviewLabels();
  /** Points at the visible "me" tile video (set by InterviewRoom). */
  const analysisVideoRef = useRef(null);

  const { alert: speedAlert, getMetrics: getSpeechMetrics } = useSpeechPace({
    micEnabled,
    enabled,
    trackMetrics,
  });
  const { alert: gazeAlert, getMetrics: getGazeMetrics } = useGazeDetection({
    videoRef: analysisVideoRef,
    camEnabled,
    enabled: enabled && Boolean(stream) && camEnabled,
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
      items.push({ id: 'speed', type: 'speed', message: hudMessages.speed });
    }
    if (gazeAlert === 'gaze') {
      items.push({ id: 'gaze', type: 'gaze', message: hudMessages.gaze });
    }
    if (gazeAlert === 'noFace') {
      items.push({ id: 'noFace', type: 'gaze', message: hudMessages.noFace });
    }
    return items;
  }, [speedAlert, gazeAlert, hudMessages]);

  return { alerts, analysisVideoRef, getHudMetrics };
}
