const STORAGE_KEY = 'maju-interview-presets';
const MAX_PRESETS = 5;

export function loadInterviewPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistPresets(presets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.slice(0, MAX_PRESETS)));
}

export function saveInterviewPreset(preset) {
  const existing = loadInterviewPresets().filter((item) => item.id !== preset.id);
  persistPresets([preset, ...existing]);
}

export function deleteInterviewPreset(id) {
  persistPresets(loadInterviewPresets().filter((item) => item.id !== id));
}

export function createPresetFromForm({ name, form }) {
  const followUpDepth =
    form.followUpDepth === 'auto' || form.followUpDepth == null
      ? undefined
      : form.followUpDepth;

  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    savedAt: new Date().toISOString(),
    config: {
      title: form.sessionTitle?.trim() || undefined,
      jobPostingText: form.jobPostingText?.trim() || undefined,
      cheatSheetText: form.cheatSheetText?.trim() || undefined,
      persona: form.persona,
      peerIntensity: form.peerIntensity,
      durationMinutes: form.durationMinutes,
      language: form.interviewLanguage,
      followUpDepth,
    },
  };
}

/** @param {import('@maju/types').InterviewSession[]} sessions */
export function extractRecentSetups(sessions, limit = 3) {
  const seen = new Set();
  const results = [];

  for (const session of sessions) {
    const job = session.config?.jobPostingText?.trim();
    const cheat = session.config?.cheatSheetText?.trim();
    const signature = `${job ?? ''}::${cheat ?? ''}`;
    if (!job && !cheat) continue;
    if (seen.has(signature)) continue;
    seen.add(signature);
    results.push({
      id: session.id,
      title: session.config?.title?.trim() || null,
      jobPostingText: job ?? '',
      cheatSheetText: cheat ?? '',
      persona: session.config.persona,
      peerIntensity: session.config.peerIntensity,
      durationMinutes: session.config.durationMinutes,
      language: session.config.language,
      followUpDepth: session.config.followUpDepth,
    });
    if (results.length >= limit) break;
  }

  return results;
}
