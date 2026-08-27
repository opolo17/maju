import type { InterviewConfig, SessionTurn, TurnRole } from '@maju/types';
import { getSupabaseAdmin } from './supabase.js';

type TurnRow = {
  id: string;
  session_id: string;
  role: TurnRole;
  content: string;
  audio_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export function mapTurnRow(row: TurnRow): SessionTurn {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    audioUrl: row.audio_url,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export async function fetchSessionForUser(sessionId: string, userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('id, user_id, status, config, started_at, ended_at, report, created_at')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function listSessionTurns(sessionId: string): Promise<SessionTurn[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('session_turns')
    .select('id, session_id, role, content, audio_url, metadata, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTurnRow);
}

export async function insertSessionTurn(
  sessionId: string,
  role: TurnRole,
  content: string,
  metadata: Record<string, unknown> | null = null,
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('session_turns')
    .insert({ session_id: sessionId, role, content, metadata })
    .select('id, session_id, role, content, audio_url, metadata, created_at')
    .single();

  if (error) throw new Error(error.message);
  return mapTurnRow(data);
}

export function configFromSession(row: { config: InterviewConfig }): InterviewConfig {
  return row.config as InterviewConfig;
}

export type ConversationMessage = { role: 'user' | 'interviewer'; content: string };

export function turnsToConversation(turns: SessionTurn[]): ConversationMessage[] {
  return turns
    .filter((turn) => turn.role === 'user' || turn.role === 'interviewer')
    .map((turn) => ({
      role: turn.role as 'user' | 'interviewer',
      content: turn.content,
    }));
}
