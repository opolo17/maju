import type { DeliveryInsights, HudSessionMetricsPayload } from '@maju/types';

export function normalizeHudMetrics(raw: HudSessionMetricsPayload | null | undefined): DeliveryInsights | null {
  if (!raw || typeof raw !== 'object') return null;

  const speech = raw.speech ?? {};
  const gaze = raw.gaze ?? {};

  const totalSilenceMs = Number(speech.totalSilenceMs) || 0;
  const longestSilenceMs = Number(speech.longestSilenceMs) || 0;
  const episodes = Array.isArray(speech.silenceEpisodes) ? speech.silenceEpisodes : [];

  return {
    baselineSyllableRate:
      typeof speech.baselineSyllableRate === 'number' ? speech.baselineSyllableRate : null,
    avgSyllableRate: typeof speech.avgSyllableRate === 'number' ? speech.avgSyllableRate : null,
    fastSpeechAlerts: Number(speech.fastSpeechAlerts) || 0,
    slowSpeechAlerts: Number(speech.slowSpeechAlerts) || 0,
    silenceEpisodeCount: episodes.length,
    totalSilenceSec: Math.round(totalSilenceMs / 100) / 10,
    longestSilenceSec: Math.round(longestSilenceMs / 100) / 10,
    gazeAwayAlerts: Number(gaze.gazeAwayAlerts) || 0,
    noFaceAlerts: Number(gaze.noFaceAlerts) || 0,
    trackedSec: Math.round((Number(speech.trackedMs) || 0) / 10) / 100,
  };
}

export function formatDeliveryInsightsForPrompt(insights: DeliveryInsights): string {
  const lines = [
    `- 추적 시간: 약 ${insights.trackedSec}초`,
    `- 말하기 baseline(음절/초): ${insights.baselineSyllableRate?.toFixed(1) ?? '측정 없음'}`,
    `- 평균 말하기 속도(음절/초): ${insights.avgSyllableRate?.toFixed(1) ?? '측정 없음'}`,
    `- 빠른 발화 HUD 감지: ${insights.fastSpeechAlerts}회`,
    `- 느린 발화 HUD 감지: ${insights.slowSpeechAlerts}회`,
    `- 침묵/정적 구간: ${insights.silenceEpisodeCount}회, 총 ${insights.totalSilenceSec}초 (최장 ${insights.longestSilenceSec}초)`,
    `- 시선 이탈: ${insights.gazeAwayAlerts}회`,
    `- 얼굴 미검출: ${insights.noFaceAlerts}회`,
  ];
  return lines.join('\n');
}
