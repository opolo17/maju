import OpenAI, { toFile } from 'openai';
import type { DeliveryInsights, InterviewConfig, PersonaId } from '@maju/types';
import { formatDeliveryInsightsForPrompt } from './hud-metrics.js';
import { env } from '../env.js';

let client: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.requireOpenAI() });
  }
  return client;
}

const PERSONA_PROMPTS: Record<PersonaId, string> = {
  gentle:
    '온화하고 경청하는 면접관입니다. 부드럽게 질문하고 지원자의 답변을 긍정적으로 받아주세요.',
  pressure:
    '압박 면접관입니다. 날카롭고 직접적으로 질문하며 긴장감을 유지하세요. 다만 무례하지는 마세요.',
  followup:
    '꼬리 질문형 면접관입니다. 답변의 허점·모순·근거 부족을 집요하게 파고드세요.',
};

export async function transcribeAudio(
  audio: Buffer,
  filename = 'audio.webm',
): Promise<string> {
  const openai = getOpenAI();
  const file = await toFile(audio, filename, { type: guessMimeType(filename) });

  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'ko',
  });

  return result.text.trim();
}

export type TurnMessage = { role: 'user' | 'interviewer'; content: string };

function buildSystemPrompt(options: {
  persona?: PersonaId;
  jobPostingText?: string;
  cheatSheetText?: string;
  opening?: boolean;
}): string {
  const persona = options.persona ?? 'pressure';
  const personaGuide = PERSONA_PROMPTS[persona];
  const contextParts = [
    options.jobPostingText ? `채용 공고:\n${options.jobPostingText}` : '',
    options.cheatSheetText ? `면접 족보:\n${options.cheatSheetText}` : '',
  ].filter(Boolean);

  return [
    '당신은 MAJU 다대다 면접 시뮬레이터의 AI 면접관입니다.',
    '항상 한국어로 응답하세요.',
    personaGuide,
    options.opening
      ? '면접을 시작합니다. 지원자에게 첫 질문을 1~2문장으로 하세요. 자기소개 또는 지원 동기부터 시작해도 좋습니다.'
      : '지원자의 답변을 듣고, 면접관으로서 1~3문장으로 반응하거나 후속 질문을 하세요. 질문은 하나만 하세요.',
    contextParts.length ? `\n참고 맥락:\n${contextParts.join('\n\n')}` : '',
  ].join('\n');
}

export async function generateOpeningQuestion(options: {
  persona?: PersonaId;
  jobPostingText?: string;
  cheatSheetText?: string;
}): Promise<string> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildSystemPrompt({ ...options, opening: true }) },
      { role: 'user', content: '면접을 시작해 주세요.' },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error('LLM returned empty opening question');
  return text;
}

export async function generateInterviewerReply(options: {
  userTranscript: string;
  persona?: PersonaId;
  jobPostingText?: string;
  cheatSheetText?: string;
  history?: TurnMessage[];
}): Promise<string> {
  const openai = getOpenAI();
  const system = buildSystemPrompt(options);

  const historyMessages = (options.history ?? []).map((turn) =>
    turn.role === 'user'
      ? ({ role: 'user' as const, content: `지원자 답변:\n${turn.content}` })
      : ({ role: 'assistant' as const, content: turn.content }),
  );

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      ...historyMessages,
      { role: 'user', content: `지원자 답변:\n${options.userTranscript}` },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('LLM returned empty response');
  }
  return text;
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const openai = getOpenAI();
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'onyx',
    input: text,
    response_format: 'mp3',
  });

  return Buffer.from(await response.arrayBuffer());
}

export async function runInterviewTurn(options: {
  userTranscript: string;
  config?: Partial<InterviewConfig>;
  history?: TurnMessage[];
}): Promise<{ userTranscript: string; interviewerText: string; audio: Buffer }> {
  const interviewerText = await generateInterviewerReply({
    userTranscript: options.userTranscript,
    persona: options.config?.persona,
    jobPostingText: options.config?.jobPostingText,
    cheatSheetText: options.config?.cheatSheetText,
    history: options.history,
  });

  const audio = await synthesizeSpeech(interviewerText);

  return {
    userTranscript: options.userTranscript,
    interviewerText,
    audio,
  };
}

export async function runInterviewTurnFromAudio(
  audio: Buffer,
  filename: string,
  config?: Partial<InterviewConfig>,
  history?: TurnMessage[],
) {
  const userTranscript = await transcribeAudio(audio, filename);
  if (!userTranscript) {
    throw new Error('음성에서 텍스트를 인식하지 못했습니다.');
  }
  return runInterviewTurn({ userTranscript, config, history });
}

export async function generateSessionReport(
  turns: TurnMessage[],
  config?: Partial<InterviewConfig>,
  deliveryInsights?: DeliveryInsights | null,
): Promise<{
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  generatedAt: string;
  deliveryInsights?: DeliveryInsights;
}> {
  const openai = getOpenAI();
  const transcript = turns
    .map((turn) => `${turn.role === 'user' ? '지원자' : '면접관'}: ${turn.content}`)
    .join('\n');

  const deliveryBlock = deliveryInsights
    ? `\n\n면접 중 HUD로 수집한 delivery 데이터:\n${formatDeliveryInsightsForPrompt(deliveryInsights)}\n\n위 delivery 데이터(침묵·말 속도·시선)를 improvements와 summary에 구체적으로 반영하세요.`
    : '';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          '면접 코치입니다. 아래 면접 transcript를 분석해 JSON만 반환하세요. 형식: {"overallScore":0-100,"summary":"...","strengths":["..."],"improvements":["..."]}',
      },
      {
        role: 'user',
        content: `페르소나: ${config?.persona ?? 'pressure'}\n\n${transcript}${deliveryBlock}`,
      },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as {
    overallScore?: number;
    summary?: string;
    strengths?: string[];
    improvements?: string[];
  };

  return {
    overallScore: Math.min(100, Math.max(0, parsed.overallScore ?? 70)),
    summary: parsed.summary ?? '면접이 완료되었습니다.',
    strengths: parsed.strengths ?? [],
    improvements: parsed.improvements ?? [],
    generatedAt: new Date().toISOString(),
    deliveryInsights: deliveryInsights ?? undefined,
  };
}

function guessMimeType(filename: string): string {
  if (filename.endsWith('.mp4')) return 'audio/mp4';
  if (filename.endsWith('.wav')) return 'audio/wav';
  if (filename.endsWith('.mpeg') || filename.endsWith('.mp3')) return 'audio/mpeg';
  return 'audio/webm';
}
