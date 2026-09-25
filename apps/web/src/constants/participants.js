export const PARTICIPANT_IMAGES = [
  null,
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
];

export const INTERVIEW_PARTICIPANTS = [
  { key: 'me', label: '나', sub: '내 화면', badge: null, isMe: true },
  { key: 'interviewer', label: 'AI 면접관', sub: '압박 질문', badge: 'HOST', isMe: false },
  { key: 'peer1', label: '가상 지원자 1', sub: '모범 답변', badge: null, isMe: false },
  { key: 'peer2', label: '가상 지원자 2', sub: '경쟁자', badge: null, isMe: false },
];

export const DEMO_QUESTION =
  '먼저, 지원 동기와 해당 직무에 본인이 적합하다고 생각하는 이유를 1분 내외로 말씀해 주세요.';

export function buildInterviewParticipants(config) {
  const peers = config?.peerPersonas;
  return INTERVIEW_PARTICIPANTS.map((participant) => {
    if (participant.key === 'peer1' && peers?.peer1) {
      return {
        ...participant,
        label: peers.peer1.name,
        sub: `${peers.peer1.headline} · 모범`,
      };
    }
    if (participant.key === 'peer2' && peers?.peer2) {
      return {
        ...participant,
        label: peers.peer2.name,
        sub: `${peers.peer2.headline} · 경쟁`,
      };
    }
    return participant;
  });
}
