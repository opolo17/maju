import { useCallback, useEffect, useRef, useState } from 'react';

/** Tunable HUD speech-pace thresholds (syllables per second via Web Speech API). */
const TUNING = {
  tickMs: 500,
  rateWindowMs: 3000,
  calibrationMs: 7000,
  calibrationSamplesMin: 3,
  alertCooldownMs: 6000,
  fastStreakRequired: 3,
  slowStreakRequired: 3,
  baselineMultiplier: 1.32,
  slowBaselineMultiplier: 0.68,
  absoluteFastRate: 5.5,
  defaultBaseline: 3.8,
  speakingIdleMs: 1500,
  /** Minimum silence duration recorded as an episode (ms). */
  silenceMinMs: 3000,
};

const DEBUG =
  import.meta.env.DEV
  || (typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('hudDebug'));

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function countHangulSyllables(text) {
  return (text.match(/[\uAC00-\uD7A3]/g) || []).length;
}

function collectTranscript(event) {
  let text = '';
  for (let i = 0; i < event.results.length; i += 1) {
    text += event.results[i][0].transcript;
  }
  return text.trim();
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function average(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function computeSyllableRate(events, windowMs, now) {
  const recent = events.filter((e) => now - e.t <= windowMs);
  const total = recent.reduce((sum, e) => sum + e.n, 0);
  return total / (windowMs / 1000);
}

function logHudSpeech(label, payload) {
  if (!DEBUG) return;
  console.log(`[HUD speech] ${label}`, payload);
}

function createEmptyMetrics() {
  return {
    baselineSyllableRate: null,
    avgSyllableRate: null,
    fastSpeechAlerts: 0,
    slowSpeechAlerts: 0,
    silenceEpisodes: [],
    totalSilenceMs: 0,
    longestSilenceMs: 0,
    trackedMs: 0,
  };
}

/**
 * Speech pace via Web Speech API — counts recognized Hangul syllables over time.
 * Also tracks silence episodes and slow speech for session reports.
 */
export function useSpeechPace({ micEnabled, enabled = true, trackMetrics = true }) {
  const [alert, setAlert] = useState(null);
  const trackMetricsRef = useRef(trackMetrics);
  trackMetricsRef.current = trackMetrics;
  const syllableEventsRef = useRef([]);
  const lastSyllableCountRef = useRef(0);
  const lastSpeechAtRef = useRef(0);
  const baselineRateRef = useRef(null);
  const calibrationRatesRef = useRef([]);
  const lastCalibrationSampleAtRef = useRef(0);
  const startedAtRef = useRef(0);
  const fastStreakRef = useRef(0);
  const slowStreakRef = useRef(0);
  const lastAlertRef = useRef(0);
  const lastSlowAlertRef = useRef(0);
  const lastDebugLogAtRef = useRef(0);
  const latestTranscriptRef = useRef('');
  const rateSamplesRef = useRef([]);
  const metricsRef = useRef(createEmptyMetrics());
  const silenceStartedAtRef = useRef(null);
  const hadSpeechRef = useRef(false);
  const calibrationTrackedMsRef = useRef(0);
  const metricsTrackedMsRef = useRef(0);
  const wasTrackingRef = useRef(false);

  const getMetrics = useCallback(() => {
    const openSilenceMs =
      silenceStartedAtRef.current && trackMetricsRef.current
        ? Date.now() - silenceStartedAtRef.current
        : 0;

    return {
      ...metricsRef.current,
      baselineSyllableRate: baselineRateRef.current,
      avgSyllableRate: average(rateSamplesRef.current),
      totalSilenceMs: metricsRef.current.totalSilenceMs + openSilenceMs,
      longestSilenceMs: Math.max(metricsRef.current.longestSilenceMs, openSilenceMs),
      trackedMs: metricsTrackedMsRef.current,
    };
  }, []);

  useEffect(() => {
    if (!enabled || !micEnabled) {
      setAlert(null);
      return undefined;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      logHudSpeech('unsupported', 'Web Speech API not available in this browser');
      return undefined;
    }

    startedAtRef.current = Date.now();
    baselineRateRef.current = null;
    calibrationRatesRef.current = [];
    syllableEventsRef.current = [];
    lastSyllableCountRef.current = 0;
    lastSpeechAtRef.current = 0;
    lastCalibrationSampleAtRef.current = 0;
    fastStreakRef.current = 0;
    slowStreakRef.current = 0;
    lastDebugLogAtRef.current = 0;
    latestTranscriptRef.current = '';
    rateSamplesRef.current = [];
    metricsRef.current = createEmptyMetrics();
    silenceStartedAtRef.current = null;
    hadSpeechRef.current = false;
    calibrationTrackedMsRef.current = 0;
    metricsTrackedMsRef.current = 0;
    wasTrackingRef.current = false;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let stopped = false;

    recognition.onresult = (event) => {
      const transcript = collectTranscript(event);
      latestTranscriptRef.current = transcript;
      const syllables = countHangulSyllables(transcript);

      if (syllables < lastSyllableCountRef.current) {
        lastSyllableCountRef.current = syllables;
        return;
      }

      const delta = syllables - lastSyllableCountRef.current;
      if (delta > 0) {
        lastSyllableCountRef.current = syllables;

        if (!trackMetricsRef.current) return;

        const now = Date.now();
        syllableEventsRef.current.push({ t: now, n: delta });
        lastSpeechAtRef.current = now;
        hadSpeechRef.current = true;

        if (silenceStartedAtRef.current) {
          const durationMs = now - silenceStartedAtRef.current;
          if (durationMs >= TUNING.silenceMinMs) {
            metricsRef.current.silenceEpisodes.push({
              durationMs,
              atMs: silenceStartedAtRef.current - startedAtRef.current,
            });
            metricsRef.current.longestSilenceMs = Math.max(
              metricsRef.current.longestSilenceMs,
              durationMs,
            );
            logHudSpeech('silence episode', { durationMs });
          }
          metricsRef.current.totalSilenceMs += durationMs;
          silenceStartedAtRef.current = null;
        }

        logHudSpeech('syllables', {
          delta,
          total: syllables,
          snippet: transcript.slice(-30),
        });
      }
    };

    recognition.onerror = (event) => {
      logHudSpeech('error', { code: event.error, message: event.message });
    };

    recognition.onend = () => {
      if (!stopped) {
        try {
          recognition.start();
        } catch {
          // ignore restart race
        }
      }
    };

    try {
      recognition.start();
      logHudSpeech('start', { method: 'stt', lang: recognition.lang });
    } catch (err) {
      logHudSpeech('start failed', { message: err.message });
      return undefined;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const tracking = trackMetricsRef.current;

      if (tracking) {
        metricsTrackedMsRef.current += TUNING.tickMs;

        if (!wasTrackingRef.current) {
          // Entering respondent answer window — exclude prior interviewer audio from STT window
          syllableEventsRef.current = [];
          lastSpeechAtRef.current = 0;
          silenceStartedAtRef.current = null;
          fastStreakRef.current = 0;
          slowStreakRef.current = 0;
          lastSyllableCountRef.current = countHangulSyllables(latestTranscriptRef.current);
          hadSpeechRef.current = false;
          logHudSpeech('answer window open', {
            syllableBaseline: lastSyllableCountRef.current,
          });
        }

        if (baselineRateRef.current === null) {
          calibrationTrackedMsRef.current += TUNING.tickMs;
        }

        wasTrackingRef.current = true;
      } else if (wasTrackingRef.current) {
        // Leaving answer window — discard in-progress silence (e.g. interviewer turn)
        silenceStartedAtRef.current = null;
        fastStreakRef.current = 0;
        slowStreakRef.current = 0;
        wasTrackingRef.current = false;
      }

      syllableEventsRef.current = syllableEventsRef.current.filter(
        (e) => now - e.t <= TUNING.rateWindowMs,
      );

      const syllableRate = computeSyllableRate(
        syllableEventsRef.current,
        TUNING.rateWindowMs,
        now,
      );
      const recentlySpeaking =
        tracking
        && lastSpeechAtRef.current > 0
        && now - lastSpeechAtRef.current < TUNING.speakingIdleMs;
      const calibrating = baselineRateRef.current === null;

      if (calibrating && tracking) {
        if (
          recentlySpeaking
          && syllableRate > 0.5
          && now - lastCalibrationSampleAtRef.current >= TUNING.tickMs
        ) {
          calibrationRatesRef.current.push(syllableRate);
          lastCalibrationSampleAtRef.current = now;
        }

        if (calibrationTrackedMsRef.current >= TUNING.calibrationMs) {
          if (calibrationRatesRef.current.length >= TUNING.calibrationSamplesMin) {
            baselineRateRef.current = Math.max(median(calibrationRatesRef.current), 2.5);
          } else {
            baselineRateRef.current = TUNING.defaultBaseline;
          }
          logHudSpeech('calibration done', {
            baseline: baselineRateRef.current.toFixed(2),
            samples: calibrationRatesRef.current.map((v) => v.toFixed(2)),
            trackedCalibrationSec: (calibrationTrackedMsRef.current / 1000).toFixed(1),
            fallback: calibrationRatesRef.current.length < TUNING.calibrationSamplesMin,
          });
        }
      } else if (tracking && hadSpeechRef.current && !recentlySpeaking) {
        if (!silenceStartedAtRef.current) {
          silenceStartedAtRef.current = now;
        }
        fastStreakRef.current = 0;
        slowStreakRef.current = 0;
      } else if (!recentlySpeaking || !tracking) {
        fastStreakRef.current = 0;
        slowStreakRef.current = 0;
      } else {
        if (syllableRate > 0.4) {
          rateSamplesRef.current.push(syllableRate);
          if (rateSamplesRef.current.length > 120) rateSamplesRef.current.shift();
        }

        const alertThreshold = Math.max(
          baselineRateRef.current * TUNING.baselineMultiplier,
          TUNING.absoluteFastRate,
        );
        const slowThreshold = Math.max(
          baselineRateRef.current * TUNING.slowBaselineMultiplier,
          2.2,
        );

        if (syllableRate >= alertThreshold) {
          fastStreakRef.current += 1;
        } else {
          fastStreakRef.current = 0;
        }

        if (
          syllableRate > 0.3
          && syllableRate <= slowThreshold
        ) {
          slowStreakRef.current += 1;
        } else {
          slowStreakRef.current = 0;
        }

        if (
          fastStreakRef.current >= TUNING.fastStreakRequired
          && now - lastAlertRef.current >= TUNING.alertCooldownMs
        ) {
          lastAlertRef.current = now;
          fastStreakRef.current = 0;
          metricsRef.current.fastSpeechAlerts += 1;
          setAlert('speed');
          logHudSpeech('ALERT fast', {
            syllableRate: syllableRate.toFixed(2),
            alertThreshold: alertThreshold.toFixed(2),
          });
          setTimeout(() => setAlert(null), 3500);
        }

        if (
          slowStreakRef.current >= TUNING.slowStreakRequired
          && now - lastSlowAlertRef.current >= TUNING.alertCooldownMs
        ) {
          lastSlowAlertRef.current = now;
          slowStreakRef.current = 0;
          metricsRef.current.slowSpeechAlerts += 1;
          logHudSpeech('slow speech', {
            syllableRate: syllableRate.toFixed(2),
            slowThreshold: slowThreshold.toFixed(2),
          });
        }
      }

      if (DEBUG && now - lastDebugLogAtRef.current >= TUNING.tickMs) {
        lastDebugLogAtRef.current = now;
        const alertThreshold = baselineRateRef.current === null
          ? null
          : Math.max(
              baselineRateRef.current * TUNING.baselineMultiplier,
              TUNING.absoluteFastRate,
            );
        const slowThreshold = baselineRateRef.current === null
          ? null
          : Math.max(baselineRateRef.current * TUNING.slowBaselineMultiplier, 2.2);

        logHudSpeech('tick', {
          method: 'stt',
          phase: calibrating ? 'calibrating' : 'monitoring',
          tracking,
          calibrationTrackedSec: (calibrationTrackedMsRef.current / 1000).toFixed(1),
          metricsTrackedSec: (metricsTrackedMsRef.current / 1000).toFixed(1),
          syllableRate: syllableRate.toFixed(2),
          baseline: baselineRateRef.current?.toFixed(2) ?? '—',
          alertThreshold: alertThreshold?.toFixed(2) ?? '—',
          slowThreshold: slowThreshold?.toFixed(2) ?? '—',
          silenceMs: silenceStartedAtRef.current
            ? now - silenceStartedAtRef.current
            : 0,
          fastAlerts: metricsRef.current.fastSpeechAlerts,
          slowAlerts: metricsRef.current.slowSpeechAlerts,
          transcript: latestTranscriptRef.current.slice(-40) || '—',
        });
      }
    }, TUNING.tickMs);

    return () => {
      stopped = true;
      clearInterval(intervalId);
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      logHudSpeech('stop', {
        totalSyllables: lastSyllableCountRef.current,
        metrics: getMetrics(),
      });
    };
  }, [micEnabled, enabled, getMetrics]);

  return { alert, getMetrics };
}
