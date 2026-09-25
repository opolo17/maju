import OpenAI, { toFile } from 'openai';
import type {
  DeliveryInsights,
  FollowUpDepth,
  InterviewConfig,
  Locale,
  PersonaId,
  QuestionFeedback,
  SessionReport,
  SessionTurn,
} from '@maju/types';
import { formatDeliveryInsightsForPrompt } from './hud-metrics.js';
import {
  candidateAnswerLabel,
  cheatSheetLabel,
  closingUserPrompt,
  defaultClosingRemark,
  defaultQuestionFeedbackTip,
  defaultReportSummary,
  jobPostingLabel,
  openingUserPrompt,
  outputLanguageRule,
  resolveInterviewLanguage,
  sttEmptyError,
  whisperLanguageCode,
} from './interview-language.js';
import {
  buildFollowUpDepthGuide,
  buildWeaknessProbeGuide,
  getPersonaTuning,
  PERSONA_PROMPTS,
  resolveFollowUpDepth,
} from './persona.js';
import { env } from '../env.js';

let client: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.requireOpenAI() });
  }
  return client;
}

export async function transcribeAudio(
  audio: Buffer,
  filename = 'audio.webm',
  language: Locale = 'ko',
): Promise<string> {
  const openai = getOpenAI();
  const file = await toFile(audio, filename, { type: guessMimeType(filename) });

  const result = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: whisperLanguageCode(language),
  });

  return result.text.trim();
}

export type TurnMessage = { role: 'user' | 'interviewer'; content: string };

function buildSystemPrompt(options: {
  persona?: PersonaId;
  followUpDepth?: FollowUpDepth;
  jobPostingText?: string;
  cheatSheetText?: string;
  opening?: boolean;
  userTurnIndex?: number;
  language?: Locale;
}): string {
  const persona = options.persona ?? 'pressure';
  const depth = options.followUpDepth ?? resolveFollowUpDepth({ persona });
  const personaGuide = PERSONA_PROMPTS[persona];
  const language = options.language ?? 'ko';
  const contextParts = [
    options.jobPostingText
      ? `${jobPostingLabel(language)}:\n${options.jobPostingText}`
      : '',
    options.cheatSheetText
      ? `${cheatSheetLabel(language)}:\n${options.cheatSheetText}`
      : '',
  ].filter(Boolean);

  const replyGuides = options.opening
    ? [
        language === 'en'
          ? 'Start the interview. Ask the first question in 1–2 sentences. Self-introduction or motivation is fine.'
          : language === 'ja'
            ? '面接を開始してください。最初の質問を1〜2文で。自己紹介または志望動機から始めても構いません。'
            : '면접을 시작합니다. 지원자에게 첫 질문을 1~2문장으로 하세요. 자기소개 또는 지원 동기부터 시작해도 좋습니다.',
      ]
    : [
        language === 'en'
          ? "Listen to the candidate's answer and respond as the interviewer in 1–3 sentences, or ask one follow-up question only."
          : language === 'ja'
            ? '候補者の回答を聞き、面接官として1〜3文で反応するか、フォローアップ質問を1つだけしてください。'
            : '지원자의 답변을 듣고, 면접관으로서 1~3문장으로 반응하거나 후속 질문을 하세요. 질문은 하나만 하세요.',
        buildFollowUpDepthGuide(depth),
        buildWeaknessProbeGuide({
          persona,
          depth,
          userTurnIndex: options.userTurnIndex ?? 1,
        }),
      ].filter(Boolean);

  const roleIntro =
    language === 'en'
      ? 'You are the AI interviewer in the MAJU group interview simulator.'
      : language === 'ja'
        ? 'あなたはMAJUグループ面接シミュレーターのAI面接官です。'
        : '당신은 MAJU 다대다 면접 시뮬레이터의 AI 면접관입니다.';

  return [
    roleIntro,
    outputLanguageRule(language),
    personaGuide,
    ...replyGuides,
    contextParts.length ? `\nContext:\n${contextParts.join('\n\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildUserTurnMessage(
  userTranscript: string,
  options: {
    persona?: PersonaId;
    followUpDepth?: FollowUpDepth;
    userTurnIndex?: number;
    language?: Locale;
  },
): string {
  const persona = options.persona ?? 'pressure';
  const depth = options.followUpDepth ?? resolveFollowUpDepth({ persona });
  const userTurnIndex = options.userTurnIndex ?? 1;
  const language = options.language ?? 'ko';

  let message = `${candidateAnswerLabel(language, userTurnIndex)}:\n${userTranscript}`;

  if (depth >= 2 || persona === 'followup') {
    const hiddenNote =
      language === 'en'
        ? '\n\n[Interviewer internal note — do not include in output]'
        : language === 'ja'
          ? '\n\n[面接官向け内部指示 — 出力に含めないでください]'
          : '\n\n[면접관 내부 지시 — 출력에 포함하지 마세요]';
    message += hiddenNote;
    message += `\n${buildWeaknessProbeGuide({ persona, depth, userTurnIndex })}`;
  }

  return message;
}

export async function generateOpeningQuestion(options: {
  persona?: PersonaId;
  followUpDepth?: FollowUpDepth;
  jobPostingText?: string;
  cheatSheetText?: string;
  language?: Locale;
}): Promise<string> {
  const persona = options.persona ?? 'pressure';
  const language = options.language ?? 'ko';
  const tuning = getPersonaTuning(persona);
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt({ ...options, language, opening: true }),
      },
      { role: 'user', content: openingUserPrompt(language) },
    ],
    temperature: tuning.temperature,
    max_tokens: tuning.maxTokensOpening,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error('LLM returned empty opening question');
  return text;
}

export async function generateClosingRemark(options: {
  persona?: PersonaId;
  jobPostingText?: string;
  cheatSheetText?: string;
  history?: TurnMessage[];
  language?: Locale;
}): Promise<string> {
  const persona = options.persona ?? 'pressure';
  const language = options.language ?? 'ko';
  const personaGuide = PERSONA_PROMPTS[persona];
  const userTurnCount = options.history?.filter((turn) => turn.role === 'user').length ?? 0;

  const contextParts = [
    options.jobPostingText
      ? `${jobPostingLabel(language)}:\n${options.jobPostingText}`
      : '',
    options.cheatSheetText
      ? `${cheatSheetLabel(language)}:\n${options.cheatSheetText}`
      : '',
  ].filter(Boolean);

  const candidateLabel =
    language === 'en' ? 'Candidate answer' : language === 'ja' ? '候補者の回答' : '지원자 답변';

  const openai = getOpenAI();
  const historyMessages = (options.history ?? [])
    .filter((turn) => turn.role === 'user' || turn.role === 'interviewer')
    .slice(-6)
    .map((turn) =>
      turn.role === 'user'
        ? ({ role: 'user' as const, content: `${candidateLabel}:\n${turn.content}` })
        : ({ role: 'assistant' as const, content: turn.content }),
    );

  const roleIntro =
    language === 'en'
      ? 'You are the AI interviewer in the MAJU group interview simulator.'
      : language === 'ja'
        ? 'あなたはMAJUグループ面接シミュレーターのAI面接官です。'
        : '당신은 MAJU 다대다 면접 시뮬레이터의 AI 면접관입니다.';

  const closingRules =
    language === 'en'
      ? [
          'Interview **time is up**. Give a **closing remark** only.',
          outputLanguageRule(language),
          personaGuide,
          'Closing rules: 2–4 sentences, thank the candidate, no new questions.',
          userTurnCount === 0 ? 'If no answers, close politely due to time.' : '',
        ]
      : language === 'ja'
        ? [
            '面接**時間終了**。締めの挨拶のみ。',
            outputLanguageRule(language),
            personaGuide,
            '締めルール: 2〜4文、感謝、新しい質問禁止。',
            userTurnCount === 0 ? '回答がなければ時間の関係で丁寧に締める。' : '',
          ]
        : [
            '면접 **시간 종료**. **마무리 인사**만 하세요.',
            outputLanguageRule(language),
            personaGuide,
            '마무리 규칙: 2~4문장, 감사, 새 질문 금지.',
            userTurnCount === 0 ? '답변이 없으면 시간 관계로 정중히 마무리.' : '',
          ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          roleIntro,
          ...closingRules.filter(Boolean),
          contextParts.length ? `\nContext:\n${contextParts.join('\n\n')}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
      ...historyMessages,
      {
        role: 'user',
        content: closingUserPrompt(language),
      },
    ],
    temperature: 0.55,
    max_tokens: 180,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    return defaultClosingRemark(language);
  }
  return text;
}

export async function generateInterviewerReply(options: {
  userTranscript: string;
  persona?: PersonaId;
  followUpDepth?: FollowUpDepth;
  jobPostingText?: string;
  cheatSheetText?: string;
  history?: TurnMessage[];
  userTurnIndex?: number;
  language?: Locale;
}): Promise<string> {
  const persona = options.persona ?? 'pressure';
  const language = options.language ?? 'ko';
  const followUpDepth = options.followUpDepth ?? resolveFollowUpDepth({ persona });
  const userTurnIndex =
    options.userTurnIndex ??
    (options.history?.filter((turn) => turn.role === 'user').length ?? 0) + 1;
  const tuning = getPersonaTuning(persona);
  const openai = getOpenAI();
  const system = buildSystemPrompt({
    ...options,
    language,
    followUpDepth,
    userTurnIndex,
    opening: false,
  });

  const candidateLabel =
    language === 'en' ? 'Candidate answer' : language === 'ja' ? '候補者の回答' : '지원자 답변';

  const historyMessages = (options.history ?? []).map((turn) =>
    turn.role === 'user'
      ? ({ role: 'user' as const, content: `${candidateLabel}:\n${turn.content}` })
      : ({ role: 'assistant' as const, content: turn.content }),
  );

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      ...historyMessages,
      {
        role: 'user',
        content: buildUserTurnMessage(options.userTranscript, {
          persona,
          followUpDepth,
          userTurnIndex,
          language,
        }),
      },
    ],
    temperature: tuning.temperature,
    max_tokens: tuning.maxTokensReply,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('LLM returned empty response');
  }
  return text;
}

export async function synthesizeSpeech(text: string, voice: 'onyx' | 'nova' | 'echo' = 'onyx'): Promise<Buffer> {
  const openai = getOpenAI();
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
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
  const persona = options.config?.persona;
  const language = resolveInterviewLanguage(options.config);
  const followUpDepth = resolveFollowUpDepth(options.config);
  const userTurnIndex =
    (options.history?.filter((turn) => turn.role === 'user').length ?? 0) + 1;

  const interviewerText = await generateInterviewerReply({
    userTranscript: options.userTranscript,
    persona,
    followUpDepth,
    jobPostingText: options.config?.jobPostingText,
    cheatSheetText: options.config?.cheatSheetText,
    history: options.history,
    userTurnIndex,
    language,
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
  const language = resolveInterviewLanguage(config);
  const userTranscript = await transcribeAudio(audio, filename, language);
  if (!userTranscript) {
    throw new Error(sttEmptyError(language));
  }
  return runInterviewTurn({ userTranscript, config, history });
}

function formatTurnsForReport(turns: SessionTurn[], config?: Partial<InterviewConfig>): string {
  const peer1Name = config?.peerPersonas?.peer1?.name ?? '가상지원자1';
  const peer2Name = config?.peerPersonas?.peer2?.name ?? '가상지원자2';

  return turns
    .filter((turn) => turn.role !== 'hud')
    .map((turn) => {
      switch (turn.role) {
        case 'user':
          return `지원자: ${turn.content}`;
        case 'interviewer':
          return `면접관: ${turn.content}`;
        case 'peer1':
          return `가상지원자(${peer1Name}·모범): ${turn.content}`;
        case 'peer2':
          return `가상지원자(${peer2Name}·경쟁): ${turn.content}`;
        default:
          return `${turn.role}: ${turn.content}`;
      }
    })
    .join('\n\n');
}

function normalizeRubric(raw: unknown): SessionReport['rubric'] {
  if (!raw || typeof raw !== 'object') return undefined;
  const input = raw as Record<string, unknown>;
  const clamp = (value: unknown, fallback = 70) => {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(100, Math.max(0, Math.round(num)));
  };
  return {
    structure: clamp(input.structure),
    clarity: clamp(input.clarity),
    confidence: clamp(input.confidence),
    relevance: clamp(input.relevance),
  };
}

function normalizeQuestionFeedback(raw: unknown, language: Locale): QuestionFeedback[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const question = typeof row.question === 'string' ? row.question.trim() : '';
      const answerSummary =
        typeof row.answerSummary === 'string' ? row.answerSummary.trim() : '';
      const tip = typeof row.tip === 'string' ? row.tip.trim() : '';
      const scoreRaw = typeof row.score === 'number' ? row.score : Number(row.score);
      const score = Number.isFinite(scoreRaw)
        ? Math.min(100, Math.max(0, Math.round(scoreRaw)))
        : 70;
      if (!question || !answerSummary) return null;
      return { question, answerSummary, score, tip: tip || defaultQuestionFeedbackTip(language) };
    })
    .filter((item): item is QuestionFeedback => item !== null);
}

export async function generateSessionReport(
  turns: SessionTurn[],
  config?: Partial<InterviewConfig>,
  deliveryInsights?: DeliveryInsights | null,
): Promise<SessionReport> {
  const openai = getOpenAI();
  const transcript = formatTurnsForReport(turns, config);

  const deliveryBlock = deliveryInsights
    ? `\n\n면접 중 HUD로 수집한 delivery 데이터:\n${formatDeliveryInsightsForPrompt(deliveryInsights)}\n\n위 delivery 데이터(침묵·말 속도·시선)를 improvements, rubric.confidence, summary에 구체적으로 반영하세요.`
    : '';

  const followUpDepth = resolveFollowUpDepth(config);
  const language = resolveInterviewLanguage(config);

  const reportLanguageRule =
    language === 'en'
      ? 'Write all JSON string values (summary, strengths, improvements, tips) in English.'
      : language === 'ja'
        ? 'JSON内の文字列（summary, strengths, improvements, tips）はすべて日本語で書いてください。'
        : 'JSON 문자열(summary, strengths, improvements, tip)은 모두 한국어로 작성하세요.';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          'You are an interview coach. Analyze the transcript and return JSON only.',
          reportLanguageRule,
          'Virtual peer answers are for comparison; evaluate the **candidate** only.',
          '형식:',
          '{"overallScore":0-100,"summary":"...","strengths":["..."],"improvements":["..."],',
          '"rubric":{"structure":0-100,"clarity":0-100,"confidence":0-100,"relevance":0-100},',
          '"questionFeedback":[{"question":"면접관 질문","answerSummary":"지원자 답변 요약","score":0-100,"tip":"코칭 팁"}]}',
          'questionFeedback: 면접관 질문마다 1개씩, 최소 1개 이상.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: `페르소나: ${config?.persona ?? 'pressure'}\n꼬리질문 깊이: ${followUpDepth}\n\n${transcript}${deliveryBlock}`,
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
    rubric?: unknown;
    questionFeedback?: unknown;
  };

  return {
    overallScore: Math.min(100, Math.max(0, parsed.overallScore ?? 70)),
    summary: parsed.summary ?? defaultReportSummary(language),
    strengths: parsed.strengths ?? [],
    improvements: parsed.improvements ?? [],
    generatedAt: new Date().toISOString(),
    deliveryInsights: deliveryInsights ?? undefined,
    rubric: normalizeRubric(parsed.rubric),
    questionFeedback: normalizeQuestionFeedback(parsed.questionFeedback, language),
  };
}

function guessMimeType(filename: string): string {
  if (filename.endsWith('.mp4')) return 'audio/mp4';
  if (filename.endsWith('.wav')) return 'audio/wav';
  if (filename.endsWith('.mpeg') || filename.endsWith('.mp3')) return 'audio/mpeg';
  return 'audio/webm';
}
