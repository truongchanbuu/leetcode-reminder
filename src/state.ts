import {
  createEmptyCard,
  fsrs,
  Rating as FsrsRating,
  type Card,
  type CardInput,
  type DateInput,
  type Grade
} from "ts-fsrs";
import { PATTERNS, PROBLEMS, problemById } from "./curriculum";
import type {
  AppState,
  Attempt,
  AttemptMode,
  HelpUsage,
  ProblemNote,
  ProblemProgress,
  QueueItem,
  Rating,
  Settings
} from "./types";

export const STORAGE_KEY = "patternqueue.state.v1";
export const NOTE_MAX_LENGTH = 5_000;

export const DEFAULT_SETTINGS: Settings = {
  newProblemsPerDay: 1,
  maxReviewsPerDay: 3,
  queueMode: "pattern",
  dailyReminderEnabled: false,
  dailyReminderHour: 19
};

export function createInitialState(): AppState {
  return {
    schemaVersion: 2,
    settings: { ...DEFAULT_SETTINGS },
    progress: {},
    attempts: [],
    activeAttempts: {},
    notes: {}
  };
}

type StoredState = Partial<Omit<AppState, "schemaVersion">> & {
  schemaVersion?: 1 | 2;
};

function dateInputToIso(value: unknown): string | undefined {
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    !(value instanceof Date)
  ) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function normalizeCard(
  rawCard: unknown,
  fallbackDue: DateInput,
  fallbackLastReview?: DateInput
): CardInput | undefined {
  if (!rawCard || typeof rawCard !== "object") return undefined;
  const raw = rawCard as Partial<CardInput>;
  const due = dateInputToIso(raw.due) ?? dateInputToIso(fallbackDue);
  if (!due) return undefined;
  const fallback = createEmptyCard(due);
  const lastReview =
    dateInputToIso(raw.last_review) ??
    dateInputToIso(fallbackLastReview);
  const state =
    typeof raw.state === "number" || typeof raw.state === "string"
      ? raw.state
      : fallback.state;

  return {
    due,
    stability: finiteNumber(raw.stability, fallback.stability),
    difficulty: finiteNumber(raw.difficulty, fallback.difficulty),
    elapsed_days: finiteNumber(raw.elapsed_days, fallback.elapsed_days),
    scheduled_days: finiteNumber(
      raw.scheduled_days,
      fallback.scheduled_days
    ),
    learning_steps: finiteNumber(
      raw.learning_steps,
      fallback.learning_steps
    ),
    reps: finiteNumber(raw.reps, fallback.reps),
    lapses: finiteNumber(raw.lapses, fallback.lapses),
    state,
    last_review: lastReview ?? null
  };
}

function normalizeProgress(
  progress: Record<string, ProblemProgress>
): Record<string, ProblemProgress> {
  return Object.fromEntries(
    Object.entries(progress).map(([key, item]) => {
      if (!item.card) return [key, item];
      const card = normalizeCard(
        item.card,
        item.dueAt ?? item.lastAttemptAt ?? item.firstSeenAt ?? 0,
        item.lastAttemptAt ?? item.firstSeenAt
      );
      return [key, { ...item, card }];
    })
  );
}

function storageSafeCard(card: Card): CardInput {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString() ?? null
  };
}

export function migrateState(raw: unknown): AppState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const stored = raw as StoredState;
  if (stored.schemaVersion !== 1 && stored.schemaVersion !== 2) {
    return undefined;
  }
  return {
    ...createInitialState(),
    ...stored,
    schemaVersion: 2,
    settings: { ...DEFAULT_SETTINGS, ...stored.settings },
    progress: normalizeProgress(stored.progress ?? {}),
    attempts: Array.isArray(stored.attempts) ? stored.attempts : [],
    activeAttempts: stored.activeAttempts ?? {},
    notes: stored.notes ?? {}
  };
}

export async function loadState(): Promise<AppState> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return migrateState(stored[STORAGE_KEY]) ?? createInitialState();
}

export async function saveState(state: AppState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

export function saveProblemNote(
  state: AppState,
  problemId: number,
  text: string,
  now = new Date()
): ProblemNote | undefined {
  if (!problemById.has(problemId)) return undefined;
  const normalized = text.replaceAll("\r\n", "\n").slice(0, NOTE_MAX_LENGTH);
  const key = String(problemId);
  if (normalized.trim().length === 0) {
    delete state.notes[key];
    return undefined;
  }

  const note: ProblemNote = {
    problemId,
    text: normalized,
    updatedAt: now.toISOString()
  };
  state.notes[key] = note;
  return note;
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDue(dueAt: string | undefined, now = new Date()): boolean {
  return Boolean(dueAt && new Date(dueAt).getTime() <= now.getTime());
}

export function attemptsOnDate(
  attempts: Attempt[],
  date = new Date()
): Attempt[] {
  const key = localDateKey(date);
  return attempts.filter(
    (attempt) => localDateKey(new Date(attempt.finishedAt)) === key
  );
}

function getCompletedProblemIds(state: AppState): Set<number> {
  return new Set(
    state.attempts
      .filter((attempt) => attempt.result === "accepted")
      .map((attempt) => attempt.problemId)
  );
}

function getTodaysNewProblemIds(state: AppState, now: Date): Set<number> {
  return new Set(
    attemptsOnDate(state.attempts, now)
      .filter((attempt) => attempt.mode === "new")
      .map((attempt) => attempt.problemId)
  );
}

function selectPatternOrderedNewProblems(
  state: AppState,
  count: number
): QueueItem[] {
  const completed = getCompletedProblemIds(state);
  return PATTERNS.flatMap((pattern) =>
    PROBLEMS.filter(
      (problem) =>
        problem.primaryPattern === pattern.id && !completed.has(problem.id)
    )
      .sort((a, b) => a.order - b.order)
      .map((problem) => ({ problem, mode: "new" as const }))
  ).slice(0, count);
}

function selectMixedNewProblems(
  state: AppState,
  count: number
): QueueItem[] {
  const completed = getCompletedProblemIds(state);
  const remaining = PROBLEMS.filter((problem) => !completed.has(problem.id));
  const attemptsByPattern = new Map<string, number>();

  for (const attempt of state.attempts) {
    attemptsByPattern.set(
      attempt.patternId,
      (attemptsByPattern.get(attempt.patternId) ?? 0) + 1
    );
  }

  return remaining
    .sort((a, b) => {
      const aCount = attemptsByPattern.get(a.primaryPattern) ?? 0;
      const bCount = attemptsByPattern.get(b.primaryPattern) ?? 0;
      return aCount - bCount || a.order - b.order || a.id - b.id;
    })
    .slice(0, count)
    .map((problem) => ({ problem, mode: "mixed" as const }));
}

export function buildDailyQueue(
  state: AppState,
  now = new Date()
): QueueItem[] {
  const reviewedToday = new Set(
    attemptsOnDate(state.attempts, now)
      .filter((attempt) => attempt.mode === "review")
      .map((attempt) => attempt.problemId)
  );

  const dueReviews = Object.values(state.progress)
    .filter(
      (progress) =>
        isDue(progress.dueAt, now) &&
        !reviewedToday.has(progress.problemId) &&
        problemById.has(progress.problemId)
    )
    .sort((a, b) => {
      const aDue = new Date(a.dueAt ?? 0).getTime();
      const bDue = new Date(b.dueAt ?? 0).getTime();
      return aDue - bDue;
    })
    .slice(0, state.settings.maxReviewsPerDay)
    .map((progress) => ({
      problem: problemById.get(progress.problemId)!,
      mode: "review" as const,
      dueAt: progress.dueAt
    }));

  const newDoneToday = getTodaysNewProblemIds(state, now).size;
  const newSlots = Math.max(
    0,
    state.settings.newProblemsPerDay - newDoneToday
  );
  const shouldAddNew = dueReviews.length < state.settings.maxReviewsPerDay;
  const newItems =
    shouldAddNew && newSlots > 0
      ? state.settings.queueMode === "pattern"
        ? selectPatternOrderedNewProblems(state, newSlots)
        : selectMixedNewProblems(state, newSlots)
      : [];

  return [...dueReviews, ...newItems];
}

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 180,
  enable_fuzz: true,
  enable_short_term: false
});

const fsrsRatings: Record<Rating, Grade> = {
  again: FsrsRating.Again,
  hard: FsrsRating.Hard,
  good: FsrsRating.Good,
  easy: FsrsRating.Easy
};

export function scheduleReview(
  existing: ProblemProgress | undefined,
  rating: Rating,
  reviewedAt = new Date()
): ProblemProgress {
  const inputCard: CardInput | Card = existing?.card
    ? normalizeCard(
        existing.card,
        existing.dueAt ?? reviewedAt,
        existing.lastAttemptAt
      ) ?? createEmptyCard(reviewedAt)
    : createEmptyCard(reviewedAt);
  const result = scheduler.next(inputCard, reviewedAt, fsrsRatings[rating]);
  const independentAcceptedCount =
    (existing?.independentAcceptedCount ?? 0) +
    (rating === "good" || rating === "easy" ? 1 : 0);
  const mastered =
    independentAcceptedCount >= 2 &&
    (rating === "good" || rating === "easy") &&
    result.card.scheduled_days >= 14;

  return {
    problemId: existing?.problemId ?? -1,
    firstSeenAt: existing?.firstSeenAt ?? reviewedAt.toISOString(),
    lastAttemptAt: reviewedAt.toISOString(),
    dueAt: result.card.due.toISOString(),
    card: storageSafeCard(result.card),
    reviewHistory: [
      ...(existing?.reviewHistory ?? []),
      {
        reviewedAt: reviewedAt.toISOString(),
        rating,
        dueAt: result.card.due.toISOString()
      }
    ],
    independentAcceptedCount,
    status: mastered ? "mastered" : "reviewing",
    masteredAt:
      existing?.masteredAt ?? (mastered ? reviewedAt.toISOString() : undefined)
  };
}

export function inferAttemptMode(
  progress: ProblemProgress | undefined,
  queueMode: Settings["queueMode"]
): AttemptMode {
  if (progress) return "review";
  return queueMode === "mixed" ? "mixed" : "new";
}

export function helpAllowsIndependentCount(helpUsage: HelpUsage): boolean {
  return helpUsage === "none";
}
