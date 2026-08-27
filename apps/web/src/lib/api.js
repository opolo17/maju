import { apiBaseUrl, requireSupabase } from './supabase.js';

async function getAccessToken() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  return token;
}

export async function apiFetch(path, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message ?? data.error ?? `API error (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export function createSession(config) {
  return apiFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify({ config }),
  });
}

export function listSessions() {
  return apiFetch('/sessions');
}

export function getSession(id) {
  return apiFetch(`/sessions/${id}`);
}

export function pocTurnText({ text, persona, jobPostingText, cheatSheetText }) {
  return apiFetch('/poc/turn', {
    method: 'POST',
    body: JSON.stringify({ text, persona, jobPostingText, cheatSheetText }),
  });
}

export async function pocTurnAudio(formData) {
  const token = await getAccessToken();
  const response = await fetch(`${apiBaseUrl}/poc/turn`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message ?? data.error ?? `API error (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export function startSession(id) {
  return apiFetch(`/sessions/${id}/start`, { method: 'POST' });
}

export function submitSessionTurnText(id, text) {
  return apiFetch(`/sessions/${id}/turn`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function submitSessionTurnAudio(id, blob) {
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append('audio', blob, 'answer.webm');

  const response = await fetch(`${apiBaseUrl}/sessions/${id}/turn`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message ?? data.error ?? `API error (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export function endSession(id, hudMetrics) {
  return apiFetch(`/sessions/${id}/end`, {
    method: 'POST',
    body: JSON.stringify(hudMetrics ? { hudMetrics } : {}),
  });
}

export function getSessionTurns(id) {
  return apiFetch(`/sessions/${id}/turns`);
}

export function getSessionReport(id) {
  return apiFetch(`/sessions/${id}/report`);
}

export function retrySession(config) {
  return createSession(config);
}

export function playBase64Audio(audioBase64, mimeType = 'audio/mpeg') {
  const audio = createAudioFromBase64(audioBase64, mimeType);
  return audio.play();
}

export function playBase64AudioAndWait(audioBase64, mimeType = 'audio/mpeg') {
  const audio = createAudioFromBase64(audioBase64, mimeType);
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

function createAudioFromBase64(audioBase64, mimeType) {
  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  return audio;
}
