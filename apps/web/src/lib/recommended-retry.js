const RUBRIC_KEYS = ['structure', 'clarity', 'confidence', 'relevance'];

/**
 * Build prefill payload + i18n reason key for recommended retry.
 * @param {import('@maju/types').InterviewConfig} config
 * @param {import('@maju/types').SessionReport | null | undefined} report
 */
export function buildRecommendedRetryPrefill(config, report) {
  let persona = config.persona;
  let reasonKey = 'interview.report.recommend.balanced';
  let lowestRubricKey = null;

  if (report?.rubric) {
    const sorted = RUBRIC_KEYS.map((key) => [key, report.rubric[key] ?? 0]).sort(
      (a, b) => a[1] - b[1],
    );
    const [key, score] = sorted[0] ?? [];
    lowestRubricKey = key ?? null;

    if (key && score < 70) {
      if (key === 'confidence') {
        persona = 'gentle';
        reasonKey = 'interview.report.recommend.confidence';
      } else if (key === 'structure' || key === 'relevance') {
        persona = 'followup';
        reasonKey = 'interview.report.recommend.structure';
      } else if (key === 'clarity') {
        persona = 'gentle';
        reasonKey = 'interview.report.recommend.clarity';
      }
    }
  } else if (report?.improvements?.length) {
    reasonKey = 'interview.report.recommend.improvements';
  }

  const { peerPersonas: _peers, ...rest } = config;

  return {
    prefill: {
      ...rest,
      persona,
    },
    reasonKey,
    lowestRubricKey,
  };
}

/** Strip server-generated fields before create/retry. */
export function sanitizeInterviewConfig(config) {
  if (!config) return config;
  const { peerPersonas, ...rest } = config;
  return rest;
}
