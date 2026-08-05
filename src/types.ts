import type { CardInput } from "ts-fsrs";

export type PatternId =
  | "arrays-hashing"
  | "two-pointers"
  | "sliding-window"
  | "stack"
  | "binary-search"
  | "linked-list"
  | "trees"
  | "heap-priority-queue"
  | "backtracking"
  | "tries"
  | "graphs"
  | "advanced-graphs"
  | "1d-dp"
  | "2d-dp"
  | "greedy"
  | "intervals"
  | "math-geometry"
  | "bit-manipulation";

export type Difficulty = "easy" | "medium" | "hard";
export type Rating = "again" | "hard" | "good" | "easy";
export type AttemptMode = "new" | "review" | "mixed";
export type AttemptResult = "accepted" | "abandoned";
export type HelpUsage = "none" | "hint" | "solution";

export interface PatternDefinition {
  id: PatternId;
  name: string;
  description: string;
  order: number;
}

export interface ProblemDefinition {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  primaryPattern: PatternId;
  order: number;
}

export interface ReviewEvent {
  reviewedAt: string;
  rating: Rating;
  dueAt: string;
}

export interface ProblemProgress {
  problemId: number;
  firstSeenAt?: string;
  lastAttemptAt?: string;
  dueAt?: string;
  card?: CardInput;
  reviewHistory: ReviewEvent[];
  independentAcceptedCount: number;
  status: "learning" | "reviewing" | "mastered";
  masteredAt?: string;
}

export interface Attempt {
  id: string;
  problemId: number;
  patternId: PatternId;
  startedAt: string;
  finishedAt: string;
  activeSeconds: number;
  mode: AttemptMode;
  result: AttemptResult;
  submissionCount: number;
  wrongAnswerCount: number;
  runtimeErrorCount: number;
  timeLimitExceededCount: number;
  compileErrorCount?: number;
  rating?: Rating;
  helpUsage: HelpUsage;
  nextReviewAt?: string;
  xpEarned?: number;
}

export interface ActiveAttempt {
  problemId: number;
  startedAt: string;
  activeSeconds: number;
  lastHeartbeatAt: string;
  submissionCount: number;
  wrongAnswerCount: number;
  runtimeErrorCount: number;
  timeLimitExceededCount: number;
  compileErrorCount?: number;
}

export interface ProblemNote {
  problemId: number;
  text: string;
  updatedAt: string;
}

export interface Settings {
  newProblemsPerDay: 0 | 1 | 2 | 3;
  maxReviewsPerDay: number;
  queueMode: "pattern" | "mixed";
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
}

export interface AppState {
  schemaVersion: 2;
  settings: Settings;
  progress: Record<string, ProblemProgress>;
  attempts: Attempt[];
  activeAttempts: Record<string, ActiveAttempt>;
  notes: Record<string, ProblemNote>;
}

export interface QueueItem {
  problem: ProblemDefinition;
  mode: AttemptMode;
  dueAt?: string;
}

export type SubmissionStatus =
  | "accepted"
  | "wrong-answer"
  | "runtime-error"
  | "time-limit-exceeded"
  | "compile-error";

export type RuntimeMessage =
  | {
      type: "ATTEMPT_HEARTBEAT";
      slug: string;
      activeSeconds: number;
    }
  | {
      type: "SUBMISSION_RECORDED";
      slug: string;
      status: SubmissionStatus;
      activeSeconds: number;
    }
  | {
      type: "COMPLETE_ATTEMPT";
      slug: string;
      rating: Rating;
      helpUsage: HelpUsage;
      activeSeconds: number;
    }
  | {
      type: "ABANDON_ATTEMPT";
      slug: string;
      helpUsage: HelpUsage;
      activeSeconds: number;
    }
  | {
      type: "GET_PROBLEM_CONTEXT";
      slug: string;
    }
  | {
      type: "SAVE_PROBLEM_NOTE";
      slug: string;
      text: string;
    };

export interface ProblemContextResponse {
  known: boolean;
  problem?: ProblemDefinition;
  progress?: ProblemProgress;
  activeAttempt?: ActiveAttempt;
  note?: ProblemNote;
}
