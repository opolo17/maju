import type { FollowUpDepth, InterviewConfig, PersonaId } from '@maju/types';

export const PERSONA_TUNING: Record<
  PersonaId,
  {
    temperature: number;
    maxTokensOpening: number;
    maxTokensReply: number;
    defaultFollowUpDepth: FollowUpDepth;
  }
> = {
  gentle: {
    temperature: 0.55,
    maxTokensOpening: 180,
    maxTokensReply: 260,
    defaultFollowUpDepth: 1,
  },
  pressure: {
    temperature: 0.72,
    maxTokensOpening: 200,
    maxTokensReply: 320,
    defaultFollowUpDepth: 2,
  },
  followup: {
    temperature: 0.78,
    maxTokensOpening: 200,
    maxTokensReply: 360,
    defaultFollowUpDepth: 3,
  },
};

export const PERSONA_PROMPTS: Record<PersonaId, string> = {
  gentle: [
    '온화하고 경청하는 면접관입니다.',
    '격려와 공감을 먼저 표현한 뒤 질문하세요.',
    '"좋은 답변이네요", "흥미롭습니다" 등 긍정 피드백을 자연스럽게 섞으세요.',
    '꼬리질문은 부드럽고 탐색적이어야 합니다 ("조금 더 설명해 주실 수 있을까요?").',
  ].join(' '),
  pressure: [
    '압박 면접관입니다.',
    '직설적이고 날카로운 톤을 유지하세요. 다만 무례하거나 모욕적이지는 마세요.',
    '답변의 모호함·근거 부족을 즉시 지적하세요.',
    '"그게 전부인가요?", "구체적인 수치는?" 같은 압박 질문을 사용하세요.',
  ].join(' '),
  followup: [
    '꼬리 질문형 면접관입니다.',
    '답변의 허점·모순·근거 부족을 집요하게 파고드세요.',
    '반드시 지원자 발언을 인용("~라고 하셨는데")하며 추궁하세요.',
    '새 주제로 넘어가기 전 같은 포인트를 2~3번까지 깊이 파고드세요.',
  ].join(' '),
};

const FOLLOW_UP_DEPTH_GUIDES: Record<FollowUpDepth, string> = {
  1: '꼬리질문 깊이: 얕음. 대부분 새로운 주제나 관련 질문으로 진행하고, 직전 답변에 대한 확인은 1문장 이내로 가볍게만 하세요.',
  2: '꼬리질문 깊이: 보통. 질문의 절반은 직전 답변의 구체적 내용(수치·사례·주장)을 짚는 꼬리질문, 나머지는 새 질문으로 균형을 맞추세요.',
  3: '꼬리질문 깊이: 깊음. 직전 답변의 핵심 주장·수치·근거를 반드시 인용하며 허점·모순·근거 부족을 추궁하세요. 같은 주제를 깊게 파고드세요.',
};

export function resolveFollowUpDepth(config?: Partial<InterviewConfig>): FollowUpDepth {
  const persona = config?.persona ?? 'pressure';
  return config?.followUpDepth ?? PERSONA_TUNING[persona].defaultFollowUpDepth;
}

export function getPersonaTuning(persona: PersonaId = 'pressure') {
  return PERSONA_TUNING[persona];
}

export function buildFollowUpDepthGuide(depth: FollowUpDepth): string {
  return FOLLOW_UP_DEPTH_GUIDES[depth];
}

export function buildWeaknessProbeGuide(options: {
  persona: PersonaId;
  depth: FollowUpDepth;
  userTurnIndex: number;
}): string {
  const { persona, depth, userTurnIndex } = options;

  if (depth === 1 && persona !== 'followup') {
    return '';
  }

  const parts = [
    '지원자 답변에서 다음 약점을 점검하세요: 구체적 수치·사례 부족, 논리 비약, 모호한 표현, STAR 구조 미흡, 채용 공고와의 연결 부족.',
  ];

  if (depth >= 2 || persona === 'followup') {
    parts.push(
      depth >= 3 || persona === 'followup'
        ? '약점을 짚을 때 지원자가 방금 한 말 중 핵심 한 문장을 따옴표로 인용한 뒤 꼬리질문하세요.'
        : '약점을 짚을 때 직전 답변의 핵심 표현을 자연스럽게 언급하세요.',
    );
  }

  if (userTurnIndex >= 3 && depth >= 2) {
    parts.push(
      '이미 여러 차례 답변을 들었으므로, 이전 답변과 모순되거나 반복되는 내용이 있으면 직접 대조하세요.',
    );
  }

  return parts.join(' ');
}
