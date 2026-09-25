import type { InterviewConfig, PeerIntensity } from '@maju/types';
import OpenAI from 'openai';
import { env } from '../env.js';
import {
  buildPeerIdentityRules,
  formatPeerPersonaForPrompt,
  hasPeerPersonas,
} from './peer-personas.js';
import {
  outputLanguageRule,
  peerOutputLanguageRule,
  peerPersonaLanguageGuide,
  resolveInterviewLanguage,
} from './interview-language.js';

let client: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.requireOpenAI() });
  }
  return client;
}

const INTENSITY_GUIDE: Record<PeerIntensity, string> = {
  low: 'peer1(모범 답변)만 생성. peer2는 null.',
  medium: 'peer1(모범)과 peer2(경쟁자) 둘 다 생성.',
  high: 'peer1과 peer2 둘 다. peer2는 더 자신감 있고 구체적 수치·성과를 강조해 심리적 압박을 줌.',
};

export type PeerAnswerResult = {
  peer1: string;
  peer2: string | null;
};

export async function generatePeerAnswers(options: {
  question: string;
  userAnswer: string;
  config: InterviewConfig;
}): Promise<PeerAnswerResult> {
  const { question, userAnswer, config } = options;
  const intensity = config.peerIntensity ?? 'medium';
  const includePeer2 = intensity !== 'low';
  const language = resolveInterviewLanguage(config);

  if (!hasPeerPersonas(config)) {
    throw new Error('Peer personas are not configured for this session');
  }

  const { peer1: peer1Persona, peer2: peer2Persona } = config.peerPersonas;

  const contextParts = [
    config.jobPostingText ? `채용 공고:\n${config.jobPostingText}` : '',
    config.cheatSheetText ? `면접 족보:\n${config.cheatSheetText}` : '',
  ].filter(Boolean);

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: intensity === 'high' ? 0.85 : 0.7,
    max_tokens: intensity === 'high' ? 450 : 380,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: [
          'Virtual candidate answer generator for a group interview simulator.',
          peerOutputLanguageRule(language),
          outputLanguageRule(language),
          INTENSITY_GUIDE[intensity],
          buildPeerIdentityRules(),
          '',
          '=== peer1 페르소나 (모범 답변) ===',
          formatPeerPersonaForPrompt(peer1Persona),
          'peer1 답변: 같은 질문에 대한 **모범 답변** — 페르소나 experiences 중 1~2개를 구체적으로 인용, STAR 구조, 4~6문장.',
          '',
          '=== peer2 페르소나 (경쟁자) ===',
          formatPeerPersonaForPrompt(peer2Persona),
          'peer2 답변: **경쟁 지원자** — peer1보다 자신감·구체성·수치가 강하고, experiences의 프로젝트·성과를 적극 인용, 4~6문장.',
          '',
          '**답변 품질 규칙:**',
          '- 각 peer는 자신의 experiences에 적힌 프로젝트/동아리/인턴만 언급하세요.',
          '- user 답변과 문장 구조·단어를 베끼지 마세요. 경험 내용은 완전히 다르게.',
          '- "교내 창업 동아리", "백엔드", "STT"처럼 user와 겹치는 키워드가 있어도 프로젝트명·역할·성과는 페르소나 고유값만 쓰세요.',
          contextParts.length ? `\n참고 맥락:\n${contextParts.join('\n\n')}` : '',
          includePeer2
            ? 'JSON 형식: {"peer1":"...","peer2":"..."}'
            : 'JSON 형식: {"peer1":"...","peer2":null}',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          `면접관 질문:\n${question}`,
          `\n옆자리 실제 지원자(user) 답변 — 참고만 하고 이름·경력을 복사하지 마세요:\n${userAnswer}`,
          `\n위 질문에 대해 peer1(${peer1Persona.name})과${includePeer2 ? ` peer2(${peer2Persona.name})` : ''} 각자의 페르소나로 1인칭 답변 JSON을 생성하세요.`,
        ].join('\n'),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as { peer1?: string; peer2?: string | null };

  const peer1 = parsed.peer1?.trim();
  if (!peer1) throw new Error('Peer model answer generation failed');

  const peer2 =
    includePeer2 && parsed.peer2?.trim() ? parsed.peer2.trim() : null;

  return { peer1, peer2 };
}

export function shouldIncludePeer2(intensity: PeerIntensity): boolean {
  return intensity !== 'low';
}
