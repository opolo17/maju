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

export const STATUS_LABELS = {
  draft: '설정 완료',
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
  if (score >= 70) return 'text-[#2AD175]';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-500';
}
