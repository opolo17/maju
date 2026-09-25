export const PERSONA_OPTIONS = [
  {
    id: 'gentle',
    label: '온화한 경청형',
    description: '차분하게 듣고 부드럽게 질문합니다.',
  },
  {
    id: 'pressure',
    label: '압박 면접관',
    description: '날카롭게 파고들며 긴장감을 높입니다.',
  },
  {
    id: 'followup',
    label: '꼬리 질문형',
    description: '답변의 허점을 집요하게 추궁합니다.',
  },
];

export const PEER_INTENSITY_OPTIONS = [
  { id: 'low', label: '낮음', description: '가벼운 경쟁 분위기' },
  { id: 'medium', label: '보통', description: '실전에 가까운 긴장감' },
  { id: 'high', label: '높음', description: '강한 피어 프레셔' },
];

export const DURATION_OPTIONS = [
  { id: 15, label: '15분' },
  { id: 30, label: '30분' },
  { id: 45, label: '45분' },
];

/** 4-step interview flow labels (UI_UX_PLAN) */
export const INTERVIEW_FLOW_STEPS = [
  { id: 'setup', label: '면접 만들기' },
  { id: 'lobby', label: '준비하기' },
  { id: 'live', label: '면접 진행' },
  { id: 'report', label: '결과 보기' },
];

export const INTERVIEW_FLOW_STEP_INDEX = {
  setup: 0,
  lobby: 1,
  live: 2,
  report: 3,
};

export const DEFAULT_FOLLOW_UP_DEPTH = {
  gentle: 1,
  pressure: 2,
  followup: 3,
};

export const FOLLOW_UP_DEPTH_OPTIONS = [
  {
    id: 'auto',
    label: '자동',
    description: '선택한 페르소나에 맞게 설정',
  },
  {
    id: 1,
    label: '얕음',
    description: '새 질문 위주, 가벼운 확인만',
  },
  {
    id: 2,
    label: '보통',
    description: '꼬리질문과 새 질문을 균형 있게',
  },
  {
    id: 3,
    label: '깊음',
    description: '직전 답변 인용·추궁 중심',
  },
];

export const FOLLOW_UP_DEPTH_LABELS = {
  1: '얕음',
  2: '보통',
  3: '깊음',
};

export function resolveFollowUpDepthLabel(config) {
  const depth =
    config.followUpDepth ?? DEFAULT_FOLLOW_UP_DEPTH[config.persona] ?? 2;
  return FOLLOW_UP_DEPTH_LABELS[depth] ?? `${depth}`;
}

export function buildPeerTurnLabels(config) {
  const peers = config?.peerPersonas;
  return {
    peer1: peers?.peer1?.name ? `${peers.peer1.name} · 모범` : '가상 지원자 1 (모범)',
    peer2: peers?.peer2?.name ? `${peers.peer2.name} · 경쟁` : '가상 지원자 2 (경쟁)',
  };
}

export const RUBRIC_LABELS = {
  structure: '구조',
  clarity: '명확성',
  confidence: '자신감',
  relevance: '관련성',
};

export function formatTimelineSec(atSec) {
  const min = Math.floor(atSec / 60);
  const sec = atSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export const STATUS_LABELS = {
  draft: '준비 완료',
  live: '진행 중',
  completed: '완료',
  aborted: '중단',
};

export const PERSONA_LABELS = Object.fromEntries(
  PERSONA_OPTIONS.map((option) => [option.id, option.label]),
);

export function formatSessionDate(iso) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function scoreLabel(score) {
  if (score >= 85) return '우수';
  if (score >= 70) return '양호';
  if (score >= 50) return '보통';
  return '개선 필요';
}

export function scoreAccentClass(score) {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-maju-accent';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-500';
}
