import { useCallback, useEffect, useRef, useState } from 'react';

export function useMediaStream({ enabled = true } = {}) {
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const startStream = useCallback(async () => {
    setError('');
    setStatus('requesting');

    try {
      stopStream();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setMicEnabled(true);
      setCamEnabled(true);
      setStatus('ready');
      return mediaStream;
    } catch (err) {
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setError('카메라·마이크 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.');
      } else if (err.name === 'NotFoundError') {
        setError('카메라 또는 마이크를 찾을 수 없습니다.');
      } else {
        setError(err.message ?? '미디어 장치를 시작하지 못했습니다.');
      }
      return null;
    }
  }, [stopStream]);

  useEffect(() => {
    if (!enabled) {
      stopStream();
      setStatus('idle');
      return undefined;
    }

    startStream();
    return () => stopStream();
  }, [enabled, startStream, stopStream]);

  const toggleMic = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    if (tracks.length === 0) return;
    const next = !tracks[0].enabled;
    tracks.forEach((track) => {
      track.enabled = next;
    });
    setMicEnabled(next);
  }, []);

  const toggleCam = useCallback(() => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    if (tracks.length === 0) return;
    const next = !tracks[0].enabled;
    tracks.forEach((track) => {
      track.enabled = next;
    });
    setCamEnabled(next);
  }, []);

  return {
    stream,
    micEnabled,
    camEnabled,
    status,
    error,
    startStream,
    stopStream,
    toggleMic,
    toggleCam,
  };
}

export function attachStreamToVideo(videoEl, stream) {
  if (!videoEl) return;
  videoEl.srcObject = stream;
}
