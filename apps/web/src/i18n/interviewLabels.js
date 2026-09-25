import { useMemo } from 'react';
import {
  DEFAULT_FOLLOW_UP_DEPTH,
  formatTimelineSec,
  INTERVIEW_FLOW_STEP_INDEX,
  scoreAccentClass,
} from '../constants/interview.js';
import { LOCALE_BCP47 } from './index.js';
import { useI18n } from './LanguageContext.jsx';

const PERSONA_IDS = ['gentle', 'pressure', 'followup'];
const PEER_INTENSITY_IDS = ['low', 'medium', 'high'];
const DURATION_IDS = [15, 30, 45];
const FOLLOW_UP_DEPTH_IDS = ['auto', 1, 2, 3];
const RUBRIC_KEYS = ['structure', 'clarity', 'confidence', 'relevance'];
const FLOW_STEP_IDS = ['setup', 'lobby', 'live', 'report'];
const INTERVIEW_LANGUAGE_IDS = ['ko', 'en', 'ja'];

export function getFlowSteps(t) {
  return FLOW_STEP_IDS.map((id) => ({
    id,
    label: t(`interview.flow.${id}`),
  }));
}

export function getPersonaOptions(t) {
  return PERSONA_IDS.map((id) => ({
    id,
    label: t(`interview.persona.${id}.label`),
    description: t(`interview.persona.${id}.description`),
  }));
}

export function getPersonaLabel(t, personaId) {
  const key = `interview.persona.${personaId}.label`;
  const label = t(key);
  return label === key ? personaId : label;
}

export function getPeerIntensityOptions(t) {
  return PEER_INTENSITY_IDS.map((id) => ({
    id,
    label: t(`interview.peerIntensity.${id}.label`),
    description: t(`interview.peerIntensity.${id}.description`),
  }));
}

export function getFollowUpDepthOptions(t, persona) {
  return FOLLOW_UP_DEPTH_IDS.map((id) => {
    const key = String(id);
    let description = t(`interview.followUpDepth.${key}.description`);
    if (id === 'auto') {
      description = `${description} (${t('interview.new.followUpAutoHint', {
        depth: DEFAULT_FOLLOW_UP_DEPTH[persona] ?? 2,
      })})`;
    }
    return {
      id,
      label: t(`interview.followUpDepth.${key}.label`),
      description,
    };
  });
}

export function getDurationOptions(t) {
  return DURATION_IDS.map((id) => ({
    id,
    label: t(`interview.duration.${id}`),
  }));
}

export function getInterviewLanguageOptions(t) {
  return INTERVIEW_LANGUAGE_IDS.map((id) => ({
    id,
    label: t(`interview.language.${id}`),
  }));
}

export function getStatusLabel(t, status) {
  const key = `interview.status.${status}`;
  const label = t(key);
  return label === key ? status : label;
}

export function getRubricLabels(t) {
  return Object.fromEntries(RUBRIC_KEYS.map((key) => [key, t(`interview.rubric.${key}`)]));
}

export function getScoreLabel(t, score) {
  if (score >= 85) return t('interview.score.excellent');
  if (score >= 70) return t('interview.score.good');
  if (score >= 50) return t('interview.score.fair');
  return t('interview.score.needsWork');
}

export function resolveFollowUpDepthLabel(config, t) {
  const depth = config.followUpDepth ?? DEFAULT_FOLLOW_UP_DEPTH[config.persona] ?? 2;
  return t(`interview.followUpDepth.${depth}.label`);
}

export function buildPeerTurnLabels(config, t) {
  const peers = config?.peerPersonas;
  return {
    peer1: peers?.peer1?.name
      ? `${peers.peer1.name} · ${t('interview.participants.modelSuffix')}`
      : `${t('interview.participants.peer1')} (${t('interview.participants.modelSuffix')})`,
    peer2: peers?.peer2?.name
      ? `${peers.peer2.name} · ${t('interview.participants.rivalSuffix')}`
      : `${t('interview.participants.peer2')} (${t('interview.participants.rivalSuffix')})`,
  };
}

export function buildInterviewParticipants(config, t) {
  const peers = config?.peerPersonas;
  const base = [
    {
      key: 'me',
      label: t('interview.participants.me'),
      sub: t('interview.participants.meSub'),
      badge: null,
      isMe: true,
    },
    {
      key: 'interviewer',
      label: t('interview.participants.interviewer'),
      sub: t('interview.participants.interviewerSub'),
      badge: t('interview.participants.hostBadge'),
      isMe: false,
    },
    {
      key: 'peer1',
      label: t('interview.participants.peer1'),
      sub: t('interview.participants.peer1Sub'),
      badge: null,
      isMe: false,
    },
    {
      key: 'peer2',
      label: t('interview.participants.peer2'),
      sub: t('interview.participants.peer2Sub'),
      badge: null,
      isMe: false,
    },
  ];

  return base.map((participant) => {
    if (participant.key === 'peer1' && peers?.peer1) {
      return {
        ...participant,
        label: peers.peer1.name,
        sub: `${peers.peer1.headline} · ${t('interview.participants.modelSuffix')}`,
      };
    }
    if (participant.key === 'peer2' && peers?.peer2) {
      return {
        ...participant,
        label: peers.peer2.name,
        sub: `${peers.peer2.headline} · ${t('interview.participants.rivalSuffix')}`,
      };
    }
    return participant;
  });
}

export function getTurnRoleLabels(config, t) {
  return {
    user: t('interview.participants.me'),
    interviewer: t('interview.participants.interviewer'),
    ...buildPeerTurnLabels(config, t),
  };
}

export function formatSessionDate(iso, locale) {
  const bcp47 = LOCALE_BCP47[locale] ?? LOCALE_BCP47.ko;
  return new Date(iso).toLocaleString(bcp47, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function useInterviewLabels() {
  const { t, locale } = useI18n();

  return useMemo(
    () => ({
      t,
      locale,
      flowSteps: getFlowSteps(t),
      flowStepIndex: INTERVIEW_FLOW_STEP_INDEX,
      personaOptions: getPersonaOptions(t),
      getPersonaLabel: (id) => getPersonaLabel(t, id),
      peerIntensityOptions: getPeerIntensityOptions(t),
      getFollowUpDepthOptions: (persona) => getFollowUpDepthOptions(t, persona),
      durationOptions: getDurationOptions(t),
      interviewLanguageOptions: getInterviewLanguageOptions(t),
      getStatusLabel: (status) => getStatusLabel(t, status),
      rubricLabels: getRubricLabels(t),
      getScoreLabel: (score) => getScoreLabel(t, score),
      resolveFollowUpDepthLabel: (config) => resolveFollowUpDepthLabel(config, t),
      buildPeerTurnLabels: (config) => buildPeerTurnLabels(config, t),
      buildInterviewParticipants: (config) => buildInterviewParticipants(config, t),
      getTurnRoleLabels: (config) => getTurnRoleLabels(config, t),
      formatSessionDate: (iso) => formatSessionDate(iso, locale),
      formatTimelineSec,
      scoreAccentClass,
      hudMessages: {
        speed: t('interview.hud.speed'),
        gaze: t('interview.hud.gaze'),
        noFace: t('interview.hud.noFace'),
      },
    }),
    [t, locale],
  );
}

export { formatTimelineSec, scoreAccentClass, INTERVIEW_FLOW_STEP_INDEX };
