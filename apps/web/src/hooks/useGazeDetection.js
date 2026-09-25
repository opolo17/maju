import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const DEBUG =
  import.meta.env.DEV
  || (typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('hudDebug'));

let landmarkerPromise = null;

function logGaze(label, payload) {
  if (!DEBUG) return;
  console.log(`[HUD gaze] ${label}`, payload);
}

async function createLandmarker(vision, delegate) {
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
  });
}

function loadFaceLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
      try {
        const gpu = await createLandmarker(vision, 'GPU');
        logGaze('ready', { delegate: 'GPU' });
        return gpu;
      } catch (gpuError) {
        logGaze('gpu failed, fallback CPU', { message: gpuError.message });
        const cpu = await createLandmarker(vision, 'CPU');
        logGaze('ready', { delegate: 'CPU' });
        return cpu;
      }
    })().catch((err) => {
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}

/** MediaPipe Face Landmarker — head turn / gaze away from center. */
export function useGazeDetection({ videoRef, camEnabled, enabled = true }) {
  const [alert, setAlert] = useState(null);
  const [ready, setReady] = useState(false);
  const lastGazeAlertRef = useRef(0);
  const lastNoFaceAlertRef = useRef(0);
  const rafRef = useRef(null);
  const gazeAwayAlertsRef = useRef(0);
  const noFaceAlertsRef = useRef(0);
  const lastDebugLogAtRef = useRef(0);

  const getMetrics = useCallback(() => ({
    gazeAwayAlerts: gazeAwayAlertsRef.current,
    noFaceAlerts: noFaceAlertsRef.current,
  }), []);

  useEffect(() => {
    if (!enabled || !camEnabled) {
      setAlert(null);
      setReady(false);
      return undefined;
    }

    let cancelled = false;

    loadFaceLandmarker()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        logGaze('init failed', { message: err.message });
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      setReady(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, camEnabled]);

  useEffect(() => {
    if (!ready || !enabled || !camEnabled) return undefined;

    let cancelled = false;
    let landmarker = null;

    loadFaceLandmarker().then((instance) => {
      if (cancelled) return;
      landmarker = instance;

      const tick = () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || !landmarker) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        try {
          const result = landmarker.detectForVideo(video, performance.now());
          const landmarks = result.faceLandmarks?.[0];

          if (!landmarks) {
            if (Date.now() - lastNoFaceAlertRef.current > 6000) {
              lastNoFaceAlertRef.current = Date.now();
              noFaceAlertsRef.current += 1;
              setAlert('noFace');
              logGaze('ALERT noFace', { count: noFaceAlertsRef.current });
              setTimeout(() => setAlert(null), 3000);
            }
          } else {
            const nose = landmarks[1];
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];
            const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
            const faceWidth = Math.abs(rightCheek.x - leftCheek.x) || 0.001;
            const offset = Math.abs(nose.x - faceCenterX) / faceWidth;

            if (offset > 0.14 && Date.now() - lastGazeAlertRef.current > 5000) {
              lastGazeAlertRef.current = Date.now();
              gazeAwayAlertsRef.current += 1;
              setAlert('gaze');
              logGaze('ALERT gaze', { offset: offset.toFixed(3), count: gazeAwayAlertsRef.current });
              setTimeout(() => setAlert(null), 3500);
            }
          }

          if (DEBUG && Date.now() - lastDebugLogAtRef.current > 1000) {
            lastDebugLogAtRef.current = Date.now();
            logGaze('tick', {
              readyState: video.readyState,
              videoSize: `${video.videoWidth}x${video.videoHeight}`,
              hasFace: Boolean(landmarks),
            });
          }
        } catch (err) {
          logGaze('frame error', { message: err.message });
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, enabled, camEnabled, videoRef]);

  return { alert, getMetrics };
}
