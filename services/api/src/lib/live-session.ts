import type { HudSessionMetricsPayload, InterviewConfig, SessionReport } from '@maju/types';
import {
  generateOpeningQuestion,
  generateSessionReport,
  runInterviewTurn,
  runInterviewTurnFromAudio,
  synthesizeSpeech,
  transcribeAudio,
} from './openai.js';
import { normalizeHudMetrics } from './hud-metrics.js';
import { mapSessionRow } from './sessions.js';
import {
  configFromSession,
  fetchSessionForUser,
  insertSessionTurn,
  listSessionTurns,
  turnsToConversation,
} from './session-turns.js';
import { getSupabaseAdmin } from './supabase.js';

function turnResponse(interviewerText: string, audio: Buffer, extras: Record<string, unknown> = {}) {
  return {
    interviewerText,
    audioBase64: audio.toString('base64'),
    audioMimeType: 'audio/mpeg',
    ...extras,
  };
}

export async function startLiveSession(sessionId: string, userId: string) {
  const row = await fetchSessionForUser(sessionId, userId);
  if (!row) throw new Error('Session not found');

  const config = configFromSession(row);
  const supabase = getSupabaseAdmin();

  if (row.status === 'completed' || row.status === 'aborted') {
    throw new Error('Interview already ended');
  }

  if (row.status === 'draft') {
    const { error } = await supabase
      .from('interview_sessions')
      .update({ status: 'live', started_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw new Error(error.message);
  }

  const existingTurns = await listSessionTurns(sessionId);
  if (existingTurns.some((turn) => turn.role === 'interviewer')) {
    const lastInterviewer = [...existingTurns].reverse().find((t) => t.role === 'interviewer');
    const audio = await synthesizeSpeech(lastInterviewer!.content);
    const { data: updated } = await supabase
      .from('interview_sessions')
      .select('id, user_id, status, config, started_at, ended_at, report, created_at')
      .eq('id', sessionId)
      .single();

    return {
      session: mapSessionRow(updated!),
      turns: existingTurns,
      ...turnResponse(lastInterviewer!.content, audio, { resumed: true }),
    };
  }

  const openingText = await generateOpeningQuestion({
    persona: config.persona,
    jobPostingText: config.jobPostingText,
    cheatSheetText: config.cheatSheetText,
  });

  await insertSessionTurn(sessionId, 'interviewer', openingText);
  const audio = await synthesizeSpeech(openingText);

  const { data: updated } = await supabase
    .from('interview_sessions')
    .select('id, user_id, status, config, started_at, ended_at, report, created_at')
    .eq('id', sessionId)
    .single();

  return {
    session: mapSessionRow(updated!),
    turns: await listSessionTurns(sessionId),
    ...turnResponse(openingText, audio, { resumed: false }),
  };
}

export async function processLiveTurn(
  sessionId: string,
  userId: string,
  input: { text?: string; audio?: Buffer; filename?: string },
) {
  const row = await fetchSessionForUser(sessionId, userId);
  if (!row) throw new Error('Session not found');
  if (row.status !== 'live') throw new Error('Session is not live');

  const config = configFromSession(row);
  const history = turnsToConversation(await listSessionTurns(sessionId));

  let userTranscript = input.text?.trim() ?? '';
  if (input.audio) {
    userTranscript = await transcribeAudio(input.audio, input.filename ?? 'answer.webm');
  }

  if (!userTranscript) {
    throw new Error('Empty answer transcript');
  }

  await insertSessionTurn(sessionId, 'user', userTranscript);

  const result = await runInterviewTurn({
    userTranscript,
    config,
    history,
  });

  await insertSessionTurn(sessionId, 'interviewer', result.interviewerText);

  return {
    userTranscript: result.userTranscript,
    ...turnResponse(result.interviewerText, result.audio),
  };
}

export async function endLiveSession(
  sessionId: string,
  userId: string,
  hudMetrics?: HudSessionMetricsPayload,
) {
  const row = await fetchSessionForUser(sessionId, userId);
  if (!row) throw new Error('Session not found');
  if (row.status !== 'live' && row.status !== 'draft') {
    throw new Error('Session already ended');
  }

  const deliveryInsights = normalizeHudMetrics(hudMetrics);
  if (deliveryInsights) {
    await insertSessionTurn(sessionId, 'hud', 'Delivery metrics summary', {
      deliveryInsights,
      raw: hudMetrics ?? null,
    });
  }

  const config = configFromSession(row);
  const conversation = turnsToConversation(await listSessionTurns(sessionId));
  const report: SessionReport =
    conversation.length > 0
      ? await generateSessionReport(conversation, config, deliveryInsights)
      : {
          overallScore: 0,
          summary: '대화 기록이 없어 리포트를 생성하지 못했습니다.',
          strengths: [],
          improvements: [],
          generatedAt: new Date().toISOString(),
          deliveryInsights: deliveryInsights ?? undefined,
        };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('interview_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      report,
    })
    .eq('id', sessionId)
    .select('id, user_id, status, config, started_at, ended_at, report, created_at')
    .single();

  if (error) throw new Error(error.message);

  return {
    session: mapSessionRow(data),
    report,
    turns: await listSessionTurns(sessionId),
  };
}
