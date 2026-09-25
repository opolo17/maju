/**
 * Estimated interviewer questions for a session length (~3 min per cycle).
 * @param {number} durationMinutes
 */
export function estimateQuestionCount(durationMinutes) {
  return Math.max(4, Math.round(durationMinutes / 3));
}

/** @param {number} totalSeconds */
export function formatTimerDisplay(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const min = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

/**
 * @param {{ config?: { title?: string; persona?: string; durationMinutes?: number } }} session
 * @param {(personaId: string) => string} getPersonaLabel
 * @param {(key: string, vars?: Record<string, unknown>) => string} t
 */
export function getSessionDisplayTitle(session, getPersonaLabel, t) {
  const title = session?.config?.title?.trim();
  if (title) return title;
  const persona = getPersonaLabel(session.config.persona);
  return `${persona} · ${t('common.minutes', { n: session.config.durationMinutes })}`;
}
