import type {
  FollowUpDepth,
  InterviewConfig,
  InterviewSession,
  Locale,
  PeerIntensity,
  PersonaId,
} from '@maju/types';

const PERSONAS: PersonaId[] = ['gentle', 'pressure', 'followup'];
const LOCALES: Locale[] = ['ko', 'en', 'ja'];
const PEER_INTENSITIES: PeerIntensity[] = ['low', 'medium', 'high'];
const FOLLOW_UP_DEPTHS: FollowUpDepth[] = [1, 2, 3];
const DURATIONS = [15, 30, 45] as const;

export function parseInterviewConfig(raw: unknown): InterviewConfig | null {
  if (!raw || typeof raw !== 'object') return null;

  const input = raw as Record<string, unknown>;
  const persona = input.persona;
  const language = input.language;
  const peerIntensity = input.peerIntensity;
  const durationMinutes = input.durationMinutes;

  if (!PERSONAS.includes(persona as PersonaId)) return null;
  if (!LOCALES.includes(language as Locale)) return null;
  if (!PEER_INTENSITIES.includes(peerIntensity as PeerIntensity)) return null;
  if (!DURATIONS.includes(durationMinutes as 15 | 30 | 45)) return null;

  const jobPostingText =
    typeof input.jobPostingText === 'string' ? input.jobPostingText.trim() : '';
  const cheatSheetText =
    typeof input.cheatSheetText === 'string' ? input.cheatSheetText.trim() : '';

  if (!jobPostingText && !cheatSheetText) return null;

  let title: string | undefined;
  if (typeof input.title === 'string') {
    const trimmedTitle = input.title.trim();
    if (trimmedTitle.length > 80) return null;
    title = trimmedTitle || undefined;
  }

  let followUpDepth: FollowUpDepth | undefined;
  if (input.followUpDepth !== undefined && input.followUpDepth !== null) {
    if (!FOLLOW_UP_DEPTHS.includes(input.followUpDepth as FollowUpDepth)) return null;
    followUpDepth = input.followUpDepth as FollowUpDepth;
  }

  return {
    title,
    jobPostingText: jobPostingText || undefined,
    cheatSheetText: cheatSheetText || undefined,
    persona: persona as PersonaId,
    language: language as Locale,
    peerIntensity: peerIntensity as PeerIntensity,
    durationMinutes: durationMinutes as 15 | 30 | 45,
    followUpDepth,
  };
}

type SessionRow = {
  id: string;
  user_id: string;
  status: InterviewSession['status'];
  config: InterviewConfig;
  started_at: string | null;
  ended_at: string | null;
  report: InterviewSession['report'];
  created_at: string;
};

export function mapSessionRow(row: SessionRow): InterviewSession {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    config: row.config,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    report: row.report,
    createdAt: row.created_at,
  };
}
