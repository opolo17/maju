/** Supported UI / interview language */
export type Locale = 'ko' | 'en' | 'ja';

/** AI interviewer persona presets */
export type PersonaId = 'gentle' | 'pressure' | 'followup';

/** Virtual peer rivalry intensity */
export type PeerIntensity = 'low' | 'medium' | 'high';

/** How aggressively the interviewer probes prior answers (1=shallow, 3=deep) */
export type FollowUpDepth = 1 | 2 | 3;

/** Virtual peer answer style preset */
export type PeerStyle = 'model' | 'rival';

/** Pre-generated fictional candidate identity for peer TTS */
export interface PeerPersona {
  name: string;
  /** Short label shown in UI, e.g. "연세대 CS · 2년차 백엔드" */
  headline: string;
  /** Backstory summary — school, career arc, motivation for this role */
  background: string;
  /** Concrete projects, clubs, internships with role + outcome (for LLM to cite in answers) */
  experiences: string[];
  style: PeerStyle;
  /** Interview speaking tone */
  tone: string;
}

export interface PeerPersonas {
  peer1: PeerPersona;
  peer2: PeerPersona;
}

export type PlanId = 'free' | 'premium' | 'waitlist_lifetime';

export type SessionStatus = 'draft' | 'live' | 'completed' | 'aborted';

export type TurnRole = 'user' | 'interviewer' | 'peer1' | 'peer2' | 'hud';

export interface InterviewConfig {
  /** User-visible label on dashboard / lobby */
  title?: string;
  jobPostingText?: string;
  cheatSheetText?: string;
  persona: PersonaId;
  language: Locale;
  peerIntensity: PeerIntensity;
  durationMinutes: 15 | 30 | 45;
  /** Override persona default; omit for automatic */
  followUpDepth?: FollowUpDepth;
  /** Fictional peer candidates — generated server-side at session create */
  peerPersonas?: PeerPersonas;
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
  /** Phase 2 — 4-axis coaching rubric */
  rubric?: SessionReportRubric;
  /** Phase 2 — chronological interview events */
  timeline?: ReportTimelineEntry[];
  /** Phase 2 — per-question coaching */
  questionFeedback?: QuestionFeedback[];
}

export interface SessionReportRubric {
  structure: number;
  clarity: number;
  confidence: number;
  relevance: number;
}

export type ReportTimelineType = 'question' | 'answer' | 'peer' | 'hud';

export interface ReportTimelineEntry {
  atSec: number;
  type: ReportTimelineType;
  label: string;
}

export interface QuestionFeedback {
  question: string;
  answerSummary: string;
  score: number;
  tip: string;
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

export interface PeerTurnPayload {
  role: 'peer1' | 'peer2';
  text: string;
  audioBase64: string;
  audioMimeType: string;
  kind: 'model' | 'rival';
}

export interface LiveTurnResponse {
  userTranscript: string;
  interviewerText: string;
  audioBase64: string;
  audioMimeType: string;
  peers: PeerTurnPayload[];
}
