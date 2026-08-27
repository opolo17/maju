import type {
  ApiSessionReportResponse,
  ApiSessionResponse,
  ApiSessionsResponse,
  CreateSessionRequest,
  HudSessionMetricsPayload,
} from '@maju/types';
import { Hono } from 'hono';
import { env } from '../env.js';
import { endLiveSession, processLiveTurn, startLiveSession } from '../lib/live-session.js';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { mapSessionRow, parseInterviewConfig } from '../lib/sessions.js';
import { listSessionTurns, fetchSessionForUser } from '../lib/session-turns.js';
import { requireAuth, type AuthVariables } from '../middleware/auth.js';

const sessions = new Hono<{ Variables: AuthVariables }>();

function openaiGuard(c: { json: (body: unknown, status?: number) => Response }) {
  if (!env.openaiConfigured) {
    return c.json(
      {
        error: 'openai_not_configured',
        message: 'OPENAI_API_KEY is required in MAJU/.env or services/api/.env',
      },
      503,
    );
  }
  return null;
}

sessions.post('/', requireAuth, async (c) => {
  let body: CreateSessionRequest;
  try {
    body = await c.req.json<CreateSessionRequest>();
  } catch {
    return c.json({ error: 'invalid_json', message: 'Request body must be JSON' }, 400);
  }

  const config = parseInterviewConfig(body?.config);
  if (!config) {
    return c.json(
      {
        error: 'invalid_config',
        message:
          'config requires persona, language, peerIntensity, durationMinutes, and at least jobPostingText or cheatSheetText',
      },
      400,
    );
  }

  const userId = c.get('userId') as string;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: userId,
      status: 'draft',
      config,
    })
    .select('id, user_id, status, config, started_at, ended_at, report, created_at')
    .single();

  if (error) {
    return c.json({ error: 'session_create_failed', message: error.message }, 500);
  }

  const response: ApiSessionResponse = { session: mapSessionRow(data) };
  return c.json(response, 201);
});

sessions.get('/', requireAuth, async (c) => {
  const userId = c.get('userId') as string;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('interview_sessions')
    .select('id, user_id, status, config, started_at, ended_at, report, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: 'sessions_fetch_failed', message: error.message }, 500);
  }

  const response: ApiSessionsResponse = {
    sessions: (data ?? []).map(mapSessionRow),
  };
  return c.json(response);
});

sessions.post('/:id/start', requireAuth, async (c) => {
  const blocked = openaiGuard(c);
  if (blocked) return blocked;

  const userId = c.get('userId') as string;
  const sessionId = c.req.param('id') as string;

  try {
    const result = await startLiveSession(sessionId, userId);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Start failed';
    const status = message === 'Session not found' ? 404 : 400;
    return c.json({ error: 'session_start_failed', message }, status);
  }
});

sessions.post('/:id/turn', requireAuth, async (c) => {
  const blocked = openaiGuard(c);
  if (blocked) return blocked;

  const userId = c.get('userId') as string;
  const sessionId = c.req.param('id') as string;
  const contentType = c.req.header('content-type') ?? '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      const audioEntry = body.audio;
      if (!audioEntry || typeof audioEntry === 'string') {
        return c.json({ error: 'invalid_audio', message: 'audio file is required' }, 400);
      }
      const arrayBuffer = await audioEntry.arrayBuffer();
      const result = await processLiveTurn(sessionId, userId, {
        audio: Buffer.from(arrayBuffer),
        filename: audioEntry.name || 'answer.webm',
      });
      return c.json(result);
    }

    const json = await c.req.json<{ text?: string }>();
    if (!json.text?.trim()) {
      return c.json({ error: 'invalid_text', message: 'text is required' }, 400);
    }
    const result = await processLiveTurn(sessionId, userId, { text: json.text });
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Turn failed';
    const status = message === 'Session not found' ? 404 : 400;
    return c.json({ error: 'session_turn_failed', message }, status);
  }
});

sessions.post('/:id/end', requireAuth, async (c) => {
  const blocked = openaiGuard(c);
  if (blocked) return blocked;

  const userId = c.get('userId') as string;
  const sessionId = c.req.param('id') as string;

  let hudMetrics;
  try {
    const body = await c.req.json<{ hudMetrics?: unknown }>();
    hudMetrics = body?.hudMetrics;
  } catch {
    hudMetrics = undefined;
  }

  try {
    const result = await endLiveSession(
      sessionId,
      userId,
      hudMetrics as HudSessionMetricsPayload | undefined,
    );
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'End failed';
    const status = message === 'Session not found' ? 404 : 400;
    return c.json({ error: 'session_end_failed', message }, status);
  }
});

sessions.get('/:id/turns', requireAuth, async (c) => {
  const userId = c.get('userId') as string;
  const sessionId = c.req.param('id') as string;
  const row = await fetchSessionForUser(sessionId, userId);
  if (!row) {
    return c.json({ error: 'not_found', message: 'Session not found' }, 404);
  }

  try {
    const turns = await listSessionTurns(sessionId);
    return c.json({ turns });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch turns failed';
    return c.json({ error: 'turns_fetch_failed', message }, 500);
  }
});

sessions.get('/:id/report', requireAuth, async (c) => {
  const userId = c.get('userId') as string;
  const sessionId = c.req.param('id') as string;
  const row = await fetchSessionForUser(sessionId, userId);

  if (!row) {
    return c.json({ error: 'not_found', message: 'Session not found' }, 404);
  }

  const session = mapSessionRow(row);
  if (!session.report) {
    return c.json(
      { error: 'report_not_found', message: '이 세션의 리포트가 아직 없습니다.' },
      404,
    );
  }

  try {
    const allTurns = await listSessionTurns(sessionId);
    const turns = allTurns.filter(
      (turn) => turn.role === 'user' || turn.role === 'interviewer',
    );
    const response: ApiSessionReportResponse = {
      session,
      report: session.report,
      turns,
    };
    return c.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch report failed';
    return c.json({ error: 'report_fetch_failed', message }, 500);
  }
});

sessions.get('/:id', requireAuth, async (c) => {
  const userId = c.get('userId') as string;
  const sessionId = c.req.param('id') as string;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('interview_sessions')
    .select('id, user_id, status, config, started_at, ended_at, report, created_at')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return c.json({ error: 'session_fetch_failed', message: error.message }, 500);
  }

  if (!data) {
    return c.json({ error: 'not_found', message: 'Session not found' }, 404);
  }

  const response: ApiSessionResponse = { session: mapSessionRow(data) };
  return c.json(response);
});

export { sessions };