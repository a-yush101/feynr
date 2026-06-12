// Shared types for Feynr — strict, no `any`.

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ConversationMessage {
  id: string; // UUID or unique id
  role: MessageRole;
  content: string;
  createdAt: string; // ISO timestamp
  // Optional structured metadata for tooling or UI (keep values primitive)
  metadata?: Record<string, string | number | boolean>;
}

export type SessionStep = 'explain' | 'followup' | 'report' | 'quiz' | 'closed';

export interface SessionState {
  sessionId: string;
  userId?: string;
  topic?: string;
  step: SessionStep;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  messages: ConversationMessage[];
  // Optional numeric clarity estimate in range [0, 100]
  clarityScore?: number;
  // Optional tags or categories provided by user or model
  tags?: string[];
}

// Generic API envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Analyze (user submits explanation) ---
export interface AnalyzeOptions {
  includeFollowups?: boolean;
  maxFollowups?: number; // recommended default applied server-side
  language?: string; // e.g., 'en'
}

export interface AnalyzeRequest {
  sessionId?: string; // if omitted, server may create a new session
  userId?: string;
  topic?: string;
  explanation: string;
  options?: AnalyzeOptions;
}

export interface AnalyzeResult {
  session: SessionState;
  summary: string; // concise model summary of the explanation
  followupQuestions: FollowupQuestion[];
}

export interface AnalyzeResponse extends ApiResponse<AnalyzeResult> {}

// --- Followup (user answers Socratic questions) ---
export interface FollowupQuestion {
  id: string;
  text: string;
  // optional suggested hint or context
  hint?: string;
}

export interface FollowupAnswer {
  questionId: string;
  answer: string;
}

export interface FollowupRequest {
  sessionId: string;
  userId?: string;
  answers: FollowupAnswer[];
}

export interface FollowupResult {
  session: SessionState;
  nextQuestions: FollowupQuestion[];
  clarityEstimate?: number; // updated clarity estimate [0,100]
}

export interface FollowupResponse extends ApiResponse<FollowupResult> {}

// --- Report (clarity report generation) ---
export interface ReportOptions {
  includeRecommendations?: boolean;
  includeExamples?: boolean;
}

export interface ReportRequest {
  sessionId: string;
  userId?: string;
  options?: ReportOptions;
}

export interface ClarityMetric {
  name: string; // e.g., 'explanation_coherence'
  score: number; // 0-100
  detail?: string; // human readable explanation
}

export interface ReportResult {
  session: SessionState;
  overallClarity: number; // 0-100
  metrics: ClarityMetric[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  reportText: string; // full textual report
}

export interface ReportResponse extends ApiResponse<ReportResult> {}

// --- Quiz (generate practice questions) ---
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizRequest {
  sessionId: string;
  userId?: string;
  numQuestions?: number;
  difficulty?: QuizDifficulty;
  includeAnswers?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  // optional multiple-choice options. If omitted, question is open-ended.
  choices?: string[];
  // index into `choices` when `includeAnswers` is true
  correctChoiceIndex?: number;
  // optional short explanation for the correct answer
  explanation?: string;
}

export interface QuizResult {
  session: SessionState;
  questions: QuizQuestion[];
}

export interface QuizResponse extends ApiResponse<QuizResult> {}

// --- Utilities / exports ---
export type { AnalyzeOptions as AnalyzeOpts };
