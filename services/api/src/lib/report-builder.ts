import type {
  DeliveryInsights,
  InterviewConfig,
  ReportTimelineEntry,
  ReportTimelineType,
  SessionReport,
  SessionTurn,
  TurnRole,
} from '@maju/types';
import { generateSessionReport } from './openai.js';

const TIMELINE_TYPE_BY_ROLE: Partial<Record<TurnRole, ReportTimelineType>> = {
  interviewer: 'question',
  user: 'answer',
  peer1: 'peer',
  peer2: 'peer',
  hud: 'hud',
};

function peerName(config: InterviewConfig, role: 'peer1' | 'peer2'): string {
  return config.peerPersonas?.[role]?.name ?? (role === 'peer1' ? '가상 지원자 1' : '가상 지원자 2');
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function timelineLabel(turn: SessionTurn, config: InterviewConfig): string {
  switch (turn.role) {
    case 'interviewer':
      return `면접관 질문 · ${truncate(turn.content, 48)}`;
    case 'user':
      return `내 답변 · ${truncate(turn.content, 48)}`;
    case 'peer1':
      return `${peerName(config, 'peer1')} (모범) · ${truncate(turn.content, 40)}`;
    case 'peer2':
      return `${peerName(config, 'peer2')} (경쟁) · ${truncate(turn.content, 40)}`;
    case 'hud':
      return 'HUD · delivery metrics 수집';
    default:
      return turn.role;
  }
}

export function buildReportTimeline(
  turns: SessionTurn[],
  config: InterviewConfig,
  startedAt: string | null,
): ReportTimelineEntry[] {
  const relevant = turns.filter((turn) => TIMELINE_TYPE_BY_ROLE[turn.role]);
  if (relevant.length === 0) return [];

  const anchorMs = startedAt
    ? new Date(startedAt).getTime()
    : new Date(relevant[0]!.createdAt).getTime();

  return relevant.map((turn) => {
    const atSec = Math.max(
      0,
      Math.round((new Date(turn.createdAt).getTime() - anchorMs) / 1000),
    );
    return {
      atSec,
      type: TIMELINE_TYPE_BY_ROLE[turn.role]!,
      label: timelineLabel(turn, config),
    };
  });
}

export async function buildSessionReport(
  turns: SessionTurn[],
  config: InterviewConfig,
  deliveryInsights: DeliveryInsights | null | undefined,
  startedAt: string | null,
): Promise<SessionReport> {
  const timeline = buildReportTimeline(turns, config, startedAt);
  const hasConversation = turns.some(
    (turn) => turn.role === 'user' || turn.role === 'interviewer',
  );

  if (!hasConversation) {
    return {
      overallScore: 0,
      summary: '대화 기록이 없어 리포트를 생성하지 못했습니다.',
      strengths: [],
      improvements: [],
      generatedAt: new Date().toISOString(),
      deliveryInsights: deliveryInsights ?? undefined,
      timeline,
    };
  }

  const llmReport = await generateSessionReport(turns, config, deliveryInsights);
  return {
    ...llmReport,
    deliveryInsights: deliveryInsights ?? llmReport.deliveryInsights,
    timeline,
  };
}

export function formatTimelineSec(atSec: number): string {
  const min = Math.floor(atSec / 60);
  const sec = atSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}
