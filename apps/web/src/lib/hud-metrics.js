/** Build API payload from HUD hook snapshot refs. */
export function createHudMetricsPayload({ speech, gaze, collectedAt }) {
  return {
    speech: speech ?? {},
    gaze: gaze ?? {},
    collectedAt: collectedAt ?? new Date().toISOString(),
  };
}
