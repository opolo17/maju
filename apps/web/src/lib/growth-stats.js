const RUBRIC_KEYS = ['structure', 'clarity', 'confidence', 'relevance'];

function sessionCompletedAt(session) {
  return session.endedAt ?? session.createdAt;
}

function toDayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** @param {import('@maju/types').InterviewSession[]} completedSessions */
function computePracticeStreak(completedSessions) {
  const dayKeys = new Set(
    completedSessions
      .map((session) => sessionCompletedAt(session))
      .filter(Boolean)
      .map((iso) => toDayKey(new Date(iso))),
  );

  if (dayKeys.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < 366; i += 1) {
    const key = toDayKey(cursor);
    if (dayKeys.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (i === 0) return 0;
    break;
  }

  return streak;
}

/** @param {import('@maju/types').InterviewSession[]} completedSessions */
function computeWeeklyCompletedCount(completedSessions) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return completedSessions.filter((session) => {
    const at = sessionCompletedAt(session);
    return at && new Date(at).getTime() >= weekAgo;
  }).length;
}

/** @param {Record<string, number> | null | undefined} rubricAverages */
export function getLowestRubricEntry(rubricAverages) {
  if (!rubricAverages) return null;
  const sorted = RUBRIC_KEYS.map((key) => [key, rubricAverages[key] ?? 0]).sort(
    (a, b) => a[1] - b[1],
  );
  const [key, score] = sorted[0] ?? [];
  return key != null ? { key, score } : null;
}

/** @param {import('@maju/types').SessionReport | null | undefined} report */
export function getSessionFeedbackSnippet(report) {
  const improvement = report?.improvements?.find((item) => item?.trim());
  if (improvement) return improvement.trim();
  const summary = report?.summary?.trim();
  if (summary) return summary;
  return null;
}

/** @param {import('@maju/types').InterviewSession[]} sessions */
export function buildGrowthStats(sessions, { recentLimit = 5, weaknessLimit = 3, weaknessSessionLimit = 10 } = {}) {
  const completed = sessions
    .filter((s) => s.status === 'completed' && s.report?.overallScore != null)
    .sort((a, b) => new Date(sessionCompletedAt(b)).getTime() - new Date(sessionCompletedAt(a)).getTime());

  const recentForChart = [...completed.slice(0, recentLimit)].reverse();

  const scoreTrend = recentForChart.map((session) => ({
    id: session.id,
    score: session.report.overallScore,
    date: sessionCompletedAt(session),
    title: session.config?.title?.trim() || null,
  }));

  const rubricTotals = Object.fromEntries(RUBRIC_KEYS.map((key) => [key, 0]));
  let rubricCount = 0;
  for (const session of completed.slice(0, recentLimit)) {
    if (!session.report?.rubric) continue;
    rubricCount += 1;
    for (const key of RUBRIC_KEYS) {
      rubricTotals[key] += session.report.rubric[key] ?? 0;
    }
  }

  const rubricAverages =
    rubricCount > 0
      ? Object.fromEntries(
          RUBRIC_KEYS.map((key) => [key, Math.round(rubricTotals[key] / rubricCount)]),
        )
      : null;

  const weaknessCounts = new Map();
  for (const session of completed.slice(0, weaknessSessionLimit)) {
    for (const item of session.report?.improvements ?? []) {
      const key = item.trim();
      if (!key) continue;
      weaknessCounts.set(key, (weaknessCounts.get(key) ?? 0) + 1);
    }
  }

  const topWeaknesses = [...weaknessCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, weaknessLimit)
    .map(([text, count]) => ({ text, count }));

  const recentScores = completed.slice(0, recentLimit).map((s) => s.report.overallScore);
  const avgScore =
    recentScores.length > 0
      ? Math.round(recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length)
      : null;

  const deltaScore =
    scoreTrend.length >= 2 ? scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score : null;

  const lowestRubric = getLowestRubricEntry(rubricAverages);

  return {
    completedCount: completed.length,
    scoreTrend,
    rubricAverages,
    topWeaknesses,
    avgScore,
    deltaScore,
    practiceStreak: computePracticeStreak(completed),
    weeklyCompletedCount: computeWeeklyCompletedCount(completed),
    lowestRubric,
  };
}

export { RUBRIC_KEYS };
