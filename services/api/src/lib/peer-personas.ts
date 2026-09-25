import type { InterviewConfig, PeerPersona, PeerPersonas, PeerStyle } from '@maju/types';
import OpenAI from 'openai';
import { env } from '../env.js';
import { peerPersonaLanguageGuide, resolveInterviewLanguage } from './interview-language.js';
import { getSupabaseAdmin } from './supabase.js';

let client: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.requireOpenAI() });
  }
  return client;
}

const FALLBACK_PEER_PERSONAS: PeerPersonas = {
  peer1: {
    name: '이서연',
    headline: '연세대 경영학 · 그로스 마케팅 2년',
    background:
      '연세대 경영학을 졸업한 뒤 B2B SaaS 스타트업에서 퍼포먼스 마케팅을 담당했습니다. 데이터 기반 실험과 사용자 인사이트를 강조하며 같은 포지션에 지원했습니다.',
    experiences: [
      "교내 창업 동아리 'Y-Startup'에서 PM으로 1년 활동, 온보딩 funnel A/B 테스트로 가입 전환율 23% 개선",
      '카카오테크 부트캠프 팀 프로젝트에서 잠재 고객 인터뷰 30명 진행 후 랜딩 카피·CTA 구조 재설계',
      '네이버 커넥트재단 1784 해커톤 우수상 — B2B 리드 스코어링 대시보드 MVP 기획·출시',
    ],
    style: 'model',
    tone: '차분하고 논리적이며 STAR 구조를 선호',
  },
  peer2: {
    name: '정도현',
    headline: '고려대 컴퓨터공학 · 백엔드 3년',
    background:
      '고려대 컴퓨터공학 졸업 후 핀테크·AI 스타트업에서 백엔드와 LLM 파이프라인을 설계했습니다. 수치와 기술적 깊이를 강조하는 경쟁형 지원자입니다.',
    experiences: [
      '교내 창업 동아리에서 백엔드 리드, 다대다 면접 AI 시뮬레이터에서 면접관·경쟁자 페르소나 엔진과 STT 파이프라인 구축',
      '핀테크 인턴십에서 결제 API 레이트리밋·큐 설계, 피크 TPS 3배 구간에서 p99 지연 40% 단축',
      '교내 AI 해커톤 대상 — Whisper+GPT 실시간 회의록 봇, end-to-end 지연 800ms 이하 달성',
    ],
    style: 'rival',
    tone: '자신감 있고 수치·성과·기술 디테일을 강조하는 압박형',
  },
};

function isPeerStyle(value: unknown): value is PeerStyle {
  return value === 'model' || value === 'rival';
}

function parseExperiences(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function parsePeerPersona(raw: unknown, style: PeerStyle): PeerPersona | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const headline = typeof input.headline === 'string' ? input.headline.trim() : '';
  const background = typeof input.background === 'string' ? input.background.trim() : '';
  const tone = typeof input.tone === 'string' ? input.tone.trim() : '';
  const experiences = parseExperiences(input.experiences);
  if (!name || !headline || !background) return null;
  return {
    name,
    headline,
    background,
    experiences,
    style,
    tone: tone || (style === 'model' ? '차분하고 논리적' : '자신감 있고 구체적'),
  };
}

export function parsePeerPersonas(raw: unknown): PeerPersonas | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;
  const peer1 = parsePeerPersona(input.peer1, 'model');
  const peer2 = parsePeerPersona(input.peer2, 'rival');
  if (!peer1 || !peer2) return null;
  if (peer1.name === peer2.name) return null;
  return { peer1, peer2 };
}

export function hasPeerPersonas(config: InterviewConfig): config is InterviewConfig & {
  peerPersonas: PeerPersonas;
} {
  return Boolean(parsePeerPersonas(config.peerPersonas));
}

function peerPersonasNeedRefresh(config: InterviewConfig): boolean {
  const parsed = parsePeerPersonas(config.peerPersonas);
  if (!parsed) return true;
  if (parsed.peer1.experiences.length === 0 || parsed.peer2.experiences.length === 0) {
    return true;
  }
  const lang = resolveInterviewLanguage(config);
  const hasKoreanName = /[가-힣]/.test(parsed.peer1.name);
  const hasJapaneseName = /[\u3040-\u30ff\u4e00-\u9faf]/.test(parsed.peer1.name);
  if (lang === 'en' && (hasKoreanName || hasJapaneseName)) return true;
  if (lang === 'ja' && !hasJapaneseName && hasKoreanName) return true;
  if (lang === 'ko' && !hasKoreanName && !hasJapaneseName) return true;
  return false;
}

function buildJobContext(config: InterviewConfig): string {
  return [
    config.jobPostingText ? `채용 공고:\n${config.jobPostingText}` : '',
    config.cheatSheetText ? `면접 족보:\n${config.cheatSheetText}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export async function generatePeerPersonas(config: InterviewConfig): Promise<PeerPersonas> {
  if (!env.openaiConfigured) {
    return FALLBACK_PEER_PERSONAS;
  }

  const jobContext = buildJobContext(config);
  const language = resolveInterviewLanguage(config);
  const langGuide = peerPersonaLanguageGuide(language);

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.85,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'Generate **virtual candidate personas** for a group interview simulator.',
            'Create **two different virtual candidates** applying for the same job.',
            langGuide,
            'peer1(model): structured model-answer style — calm and logical.',
            'peer2(rival): rival style — confident, specific metrics and technical detail.',
            '',
            '- name: unique name per peer',
            '- headline: school/major/career one-liner',
            '- background: 2–3 sentence summary',
            '- experiences: **3 concrete projects/activities** (string array), each with project name, role, measurable outcome',
            '- tone: speaking style one-liner',
            '',
            '규칙:',
            '- 두 사람은 학교·전공·프로젝트·경험이 겹치지 않게 설계.',
            '- experiences는 면접 답변에 바로 인용할 수 있을 만큼 구체적으로.',
            '- 실제 사용자 정보는 알 수 없으므로 가상 인물만 생성.',
            '- JSON만 반환.',
            '형식: {"peer1":{"name":"","headline":"","background":"","experiences":["","",""],"tone":""},"peer2":{...}}',
            jobContext ? `\n참고:\n${jobContext}` : '',
          ].join('\n'),
        },
        {
          role: 'user',
          content: '위 채용 맥락에 맞는 가상 지원자 peer1·peer2 페르소나 JSON을 생성하세요.',
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as { peer1?: unknown; peer2?: unknown };
    const peer1 = parsePeerPersona(parsed.peer1, 'model');
    const peer2 = parsePeerPersona(parsed.peer2, 'rival');
    if (!peer1 || !peer2 || peer1.name === peer2.name) {
      return FALLBACK_PEER_PERSONAS;
    }
    return { peer1, peer2 };
  } catch {
    return FALLBACK_PEER_PERSONAS;
  }
}

export function formatPeerPersonaForPrompt(persona: PeerPersona): string {
  const experienceLines =
    persona.experiences?.length > 0
      ? persona.experiences.map((exp) => `  · ${exp}`).join('\n')
      : '  · (배경 요약 참고)';

  return [
    `- 이름: ${persona.name} (${persona.style === 'model' ? '모범형' : '경쟁형'})`,
    `- 한 줄 소개: ${persona.headline}`,
    `- 배경 요약: ${persona.background}`,
    `- 구체적 경험·활동 (답변 시 1개 이상 반드시 인용):`,
    experienceLines,
    `- 말투: ${persona.tone}`,
    `- 반드시 ${persona.name} 1인칭으로만 답변하세요.`,
  ].join('\n');
}

export function buildPeerIdentityRules(): string {
  return [
    '**중요 — 정체성 규칙:**',
    '- 가상 지원자는 미리 정의된 페르소나만 사용합니다.',
    '- 옆자리 실제 지원자(user)의 이름·학교·회사·경력·프로젝트·자기소개 내용을 가상 지원자에게 복사하거나 재사용하지 마세요.',
    '- user 답변은 같은 질문에 대한 다른 지원자의 답변 흐름 참고용일 뿐, 표현·경력·프로젝트·이름은 반드시 페르소나의 experiences에 있는 내용만 사용하세요.',
    '- 자기소개·경험 질문이면 각 가상 지원자는 자신의 experiences 중 하나를 골라 구체적으로 이야기하세요.',
    '- user와 비슷한 주제(예: 창업 동아리)라도 프로젝트명·역할·성과는 페르소나 고유 경험으로 구분하세요.',
  ].join('\n');
}

export async function ensurePeerPersonas(
  sessionId: string,
  config: InterviewConfig,
): Promise<InterviewConfig> {
  if (hasPeerPersonas(config) && !peerPersonasNeedRefresh(config)) {
    return config;
  }

  const peerPersonas = await generatePeerPersonas(config);
  const updatedConfig: InterviewConfig = { ...config, peerPersonas };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('interview_sessions')
    .update({ config: updatedConfig })
    .eq('id', sessionId);

  if (error) throw new Error(error.message);
  return updatedConfig;
}
