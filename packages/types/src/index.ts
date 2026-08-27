/** Supported UI / interview language */
export type Locale = 'ko' | 'en' | 'ja';

/** AI interviewer persona presets */
export type PersonaId = 'gentle' | 'pressure' | 'followup';

/** Virtual peer rivalry intensity */
export type PeerIntensity = 'low' | 'medium' | 'high';

export type PlanId = 'free' | 'premium' | 'waitlist_lifetime';

export type SessionStatus = 'draft' | 'live' | 'completed' | 'aborted';

export type TurnRole = 'user' | 'interviewer' | 'peer1' | 'peer2' | 'hud';

export interface InterviewConfig {
  jobPostingText?: string;
  cheatSheetText?: string;
  persona: PersonaId;
  language: Locale;
  peerIntensity: PeerIntensity;
  durationMinutes: 15 | 30 | 45;
}

export interface Profile {
  id: string;
  displayName: string | null;
  locale: Locale;
  onboardingDone: boolean;
  plan: PlanId;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  status: SessionStatus;
  config: InterviewConfig;
  startedAt: string | null;
  endedAt: string | null;
  report: SessionReport | null;
  createdAt: string;
}

export interface SessionTurn {
  id: string;
  sessionId: string;
  role: TurnRole;
  content: string;
  audioUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SessionReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  generatedAt: string;
  /** Client HUD metrics merged at end-of-session (speech pace, silence, gaze). */
  deliveryInsights?: DeliveryInsights;
}

/** Normalized delivery metrics for reports (from client HUD). */
export interface DeliveryInsights {
  baselineSyllableRate: number | null;
  avgSyllableRate: number | null;
  fastSpeechAlerts: number;
  slowSpeechAlerts: number;
  silenceEpisodeCount: number;
  totalSilenceSec: number;
  longestSilenceSec: number;
  gazeAwayAlerts: number;
  noFaceAlerts: number;
  trackedSec: number;
}

/** Raw payload from client HUD hooks on session end. */
export interface HudSessionMetricsPayload {
  speech?: {
    baselineSyllableRate?: number | null;
    avgSyllableRate?: number | null;
    fastSpeechAlerts?: number;
    slowSpeechAlerts?: number;
    silenceEpisodes?: Array<{ durationMs: number; atMs: number }>;
    totalSilenceMs?: number;
    longestSilenceMs?: number;
    trackedMs?: number;
  };
  gaze?: {
    gazeAwayAlerts?: number;
    noFaceAlerts?: number;
  };
  collectedAt?: string;
}

export interface ApiHealthResponse {
  status: 'ok';
  service: 'maju-api';
  openaiConfigured?: boolean;
  supabaseConfigured?: boolean;
}

export interface ApiMeResponse {
  profile: Profile;
}

export interface CreateSessionRequest {
  config: InterviewConfig;
}

export interface ApiSessionResponse {
  session: InterviewSession;
}

export interface ApiSessionsResponse {
  sessions: InterviewSession[];
}

export interface ApiSessionReportResponse {
  session: InterviewSession;
  report: SessionReport;
  turns: SessionTurn[];
}

export interface PocTurnResponse {
  userTranscript: string;
  interviewerText: string;
  audioBase64: string;
  audioMimeType: string;
}
