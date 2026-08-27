import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

let landmarkerPromise = null;

function loadFaceLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM_BASE).then((vision) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
      }),
    );
  }
  return landmarkerPromise;
}

/** MediaPipe Face Landmarker — head turn / gaze away from center. */
export function useGazeDetection({ videoRef, camEnabled, enabled = true }) {
  const [alert, setAlert] = useState(null);
  const [ready, setReady] = useState(false);
  const lastAlertRef = useRef(0);
  const rafRef = useRef(null);
  const gazeAwayAlertsRef = useRef(0);
  const noFaceAlertsRef = useRef(0);

  const getMetrics = useCallback(() => ({
    gazeAwayAlerts: gazeAwayAlertsRef.current,
    noFaceAlerts: noFaceAlertsRef.current,
  }), []);

  useEffect(() => {
    if (!enabled || !camEnabled) {
      setAlert(null);
      return undefined;
    }

    let cancelled = false;

    loadFaceLandmarker()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
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
            if (Date.now() - lastAlertRef.current > 6000) {
              lastAlertRef.current = Date.now();
              noFaceAlertsRef.current += 1;
              setAlert('noFace');
              setTimeout(() => setAlert(null), 3000);
            }
          } else {
            const nose = landmarks[1];
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];
            const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
            const faceWidth = Math.abs(rightCheek.x - leftCheek.x) || 0.001;
            const offset = Math.abs(nose.x - faceCenterX) / faceWidth;

            if (offset > 0.14 && Date.now() - lastAlertRef.current > 5000) {
              lastAlertRef.current = Date.now();
              gazeAwayAlertsRef.current += 1;
              setAlert('gaze');
              setTimeout(() => setAlert(null), 3500);
            }
          }
        } catch {
          // skip frame
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
