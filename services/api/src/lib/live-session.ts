import type {
  HudSessionMetricsPayload,
  InterviewConfig,
  PeerTurnPayload,
  SessionReport,
  SessionTurn,
} from '@maju/types';
import {
  generateClosingRemark,
  generateOpeningQuestion,
  runInterviewTurn,
  synthesizeSpeech,
  transcribeAudio,
} from './openai.js';
import { buildSessionReport } from './report-builder.js';
import { generatePeerAnswers, shouldIncludePeer2 } from './peer-pressure.js';
import { ensurePeerPersonas } from './peer-personas.js';
import { normalizeHudMetrics } from './hud-metrics.js';
import {
  looksLikeClosingRemark,
  resolveInterviewLanguage,
} from './interview-language.js';
import { mapSessionRow } from './sessions.js';
import {
  configFromSession,
  fetchSessionForUser,
  insertSessionTurn,
  listSessionTurns,
  turnsToConversation,
} from './session-turns.js';
import { getSupabaseAdmin } from './supabase.js';

function audioPayload(audio: Buffer) {
  return {
    audioBase64: audio.toString('base64'),
    audioMimeType: 'audio/mpeg' as const,
  };
}

function turnResponse(interviewerText: string, audio: Buffer, extras: Record<string, unknown> = {}) {
  return {
    interviewerText,
    ...audioPayload(audio),
    ...extras,
  };
}

function getLastInterviewerQuestion(turns: SessionTurn[]): string {
  const last = [...turns].reverse().find((turn) => turn.role === 'interviewer');
  return last?.content ?? '방금 면접관 질문';
}

async function buildPeerTurnPayloads(
  config: InterviewConfig,
  peerAnswers: { peer1: string; peer2: string | null },
): Promise<PeerTurnPayload[]> {
  const includePeer2 = shouldIncludePeer2(config.peerIntensity) && peerAnswers.peer2;

  const [peer1Audio, peer2Audio] = await Promise.all([
    synthesizeSpeech(peerAnswers.peer1, 'nova'),
    includePeer2
      ? synthesizeSpeech(peerAnswers.peer2!, 'echo')
      : Promise.resolve(null),
  ]);

  const peers: PeerTurnPayload[] = [
    {
      role: 'peer1',
      text: peerAnswers.peer1,
      kind: 'model',
      ...audioPayload(peer1Audio),
    },
  ];

  if (includePeer2 && peer2Audio) {
    peers.push({
      role: 'peer2',
      text: peerAnswers.peer2!,
      kind: 'rival',
      ...audioPayload(peer2Audio),
    });
  }

  return peers;
}

export async function startLiveSession(sessionId: string, userId: string) {
  const row = await fetchSessionForUser(sessionId, userId);
  if (!row) throw new Error('Session not found');

  let config = configFromSession(row);
  config = await ensurePeerPersonas(sessionId, config);
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
      ...turnResponse(lastInterviewer!.content, audio, { resumed: true, peers: [] }),
    };
  }

  const openingText = await generateOpeningQuestion({
    persona: config.persona,
    followUpDepth: config.followUpDepth,
    jobPostingText: config.jobPostingText,
    cheatSheetText: config.cheatSheetText,
    language: config.language,
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
    ...turnResponse(openingText, audio, { resumed: false, peers: [] }),
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

  let config = configFromSession(row);
  config = await ensurePeerPersonas(sessionId, config);
  const existingTurns = await listSessionTurns(sessionId);
  const history = turnsToConversation(existingTurns);
  const question = getLastInterviewerQuestion(existingTurns);

  let userTranscript = input.text?.trim() ?? '';
  if (input.audio) {
    userTranscript = await transcribeAudio(
      input.audio,
      input.filename ?? 'answer.webm',
      resolveInterviewLanguage(config),
    );
  }

  if (!userTranscript) {
    throw new Error('Empty answer transcript');
  }

  await insertSessionTurn(sessionId, 'user', userTranscript);

  const [peerAnswers, interviewResult] = await Promise.all([
    generatePeerAnswers({ question, userAnswer: userTranscript, config }),
    runInterviewTurn({
      userTranscript,
      config,
      history,
    }),
  ]);

  const peerPayloads = await buildPeerTurnPayloads(config, peerAnswers);

  for (const peer of peerPayloads) {
    await insertSessionTurn(sessionId, peer.role, peer.text, {
      kind: peer.kind,
    });
  }

  await insertSessionTurn(sessionId, 'interviewer', interviewResult.interviewerText);

  return {
    userTranscript: interviewResult.userTranscript,
    ...turnResponse(interviewResult.interviewerText, interviewResult.audio, {
      peers: peerPayloads,
    }),
  };
}

function isClosingTurn(content: string, language = 'ko'): boolean {
  return looksLikeClosingRemark(content, language as 'ko' | 'en' | 'ja');
}

export async function deliverClosingRemark(sessionId: string, userId: string) {
  const row = await fetchSessionForUser(sessionId, userId);
  if (!row) throw new Error('Session not found');
  if (row.status !== 'live') throw new Error('Session is not live');

  const config = configFromSession(row);
  const language = resolveInterviewLanguage(config);
  const existingTurns = await listSessionTurns(sessionId);
  const lastInterviewer = [...existingTurns].reverse().find((turn) => turn.role === 'interviewer');

  if (lastInterviewer && isClosingTurn(lastInterviewer.content, language)) {
    const audio = await synthesizeSpeech(lastInterviewer.content);
    return turnResponse(lastInterviewer.content, audio, { alreadyDelivered: true });
  }

  const history = turnsToConversation(existingTurns);
  const closingText = await generateClosingRemark({
    persona: config.persona,
    jobPostingText: config.jobPostingText,
    cheatSheetText: config.cheatSheetText,
    history,
    language,
  });

  await insertSessionTurn(sessionId, 'interviewer', closingText);
  const audio = await synthesizeSpeech(closingText);

  return turnResponse(closingText, audio, { alreadyDelivered: false });
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
  const allTurns = await listSessionTurns(sessionId);
  const report: SessionReport =
    allTurns.some((turn) => turn.role === 'user' || turn.role === 'interviewer')
      ? await buildSessionReport(allTurns, config, deliveryInsights, row.started_at)
      : {
          overallScore: 0,
          summary: '대화 기록이 없어 리포트를 생성하지 못했습니다.',
          strengths: [],
          improvements: [],
          generatedAt: new Date().toISOString(),
          deliveryInsights: deliveryInsights ?? undefined,
          timeline: [],
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
