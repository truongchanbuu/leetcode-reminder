import { problemById, problemBySlug } from "./curriculum";
import {
  attemptsOnDate,
  helpAllowsIndependentCount,
  inferAttemptMode,
  isDue,
  scheduleReview
} from "./state";
import { calculateAttemptXp } from "./ranks";
import type {
  ActiveAttempt,
  AppState,
  Attempt,
  HelpUsage,
  ProblemContextResponse,
  Rating,
  SubmissionStatus
} from "./types";

function attemptId(problemId: number, now: Date): string {
  return `${problemId}-${now.getTime()}-${crypto.randomUUID()}`;
}

function initialActiveAttempt(problemId: number, now: Date): ActiveAttempt {
  return {
    problemId,
    startedAt: now.toISOString(),
    activeSeconds: 0,
    lastHeartbeatAt: now.toISOString(),
    submissionCount: 0,
    wrongAnswerCount: 0,
    runtimeErrorCount: 0,
    timeLimitExceededCount: 0,
    compileErrorCount: 0
  };
}

export function getProblemContext(
  state: AppState,
  slug: string,
  now = new Date()
): ProblemContextResponse {
  const problem = problemBySlug.get(slug);
  if (!problem) return { known: false };

  const key = String(problem.id);
  const active =
    state.activeAttempts[key] ?? initialActiveAttempt(problem.id, now);
  state.activeAttempts[key] = active;

  return {
    known: true,
    problem,
    progress: state.progress[key],
    activeAttempt: active,
    note: state.notes[key]
  };
}

export function recordHeartbeat(
  state: AppState,
  slug: string,
  activeSeconds: number,
  now = new Date()
): void {
  const problem = problemBySlug.get(slug);
  if (!problem) return;
  const key = String(problem.id);
  const active =
    state.activeAttempts[key] ?? initialActiveAttempt(problem.id, now);
  active.activeSeconds = Math.max(active.activeSeconds, activeSeconds);
  active.lastHeartbeatAt = now.toISOString();
  state.activeAttempts[key] = active;
}

export function recordSubmission(
  state: AppState,
  slug: string,
  status: SubmissionStatus,
  activeSeconds: number,
  now = new Date()
): void {
  const problem = problemBySlug.get(slug);
  if (!problem) return;
  const key = String(problem.id);
  const active =
    state.activeAttempts[key] ?? initialActiveAttempt(problem.id, now);
  active.activeSeconds = Math.max(active.activeSeconds, activeSeconds);
  active.submissionCount += 1;
  if (status === "wrong-answer") active.wrongAnswerCount += 1;
  if (status === "runtime-error") active.runtimeErrorCount += 1;
  if (status === "time-limit-exceeded") active.timeLimitExceededCount += 1;
  if (status === "compile-error") {
    active.compileErrorCount = (active.compileErrorCount ?? 0) + 1;
  }
  active.lastHeartbeatAt = now.toISOString();
  state.activeAttempts[key] = active;
}

export function completeAttempt(
  state: AppState,
  slug: string,
  rating: Rating,
  helpUsage: HelpUsage,
  activeSeconds: number,
  now = new Date()
): Attempt | undefined {
  const problem = problemBySlug.get(slug);
  if (!problem) return undefined;
  const key = String(problem.id);
  const active =
    state.activeAttempts[key] ?? initialActiveAttempt(problem.id, now);
  const previousProgress = state.progress[key];
  const mode = inferAttemptMode(previousProgress, state.settings.queueMode);
  const alreadyScoredToday = attemptsOnDate(state.attempts, now).some(
    (attempt) => attempt.problemId === problem.id && (attempt.xpEarned ?? 0) > 0
  );
  const xpEligible =
    !alreadyScoredToday &&
    (!previousProgress || isDue(previousProgress.dueAt, now));
  const scheduled = scheduleReview(previousProgress, rating, now);
  scheduled.problemId = problem.id;
  if (!helpAllowsIndependentCount(helpUsage)) {
    scheduled.independentAcceptedCount =
      previousProgress?.independentAcceptedCount ?? 0;
    scheduled.status = "reviewing";
    scheduled.masteredAt = previousProgress?.masteredAt;
  }
  state.progress[key] = scheduled;

  const attempt: Attempt = {
    id: attemptId(problem.id, now),
    problemId: problem.id,
    patternId: problem.primaryPattern,
    startedAt: active.startedAt,
    finishedAt: now.toISOString(),
    activeSeconds: Math.max(active.activeSeconds, activeSeconds),
    mode,
    result: "accepted",
    submissionCount: Math.max(1, active.submissionCount),
    wrongAnswerCount: active.wrongAnswerCount,
    runtimeErrorCount: active.runtimeErrorCount,
    timeLimitExceededCount: active.timeLimitExceededCount,
    compileErrorCount: active.compileErrorCount ?? 0,
    rating,
    helpUsage,
    nextReviewAt: scheduled.dueAt,
    xpEarned: calculateAttemptXp(
      problem,
      mode,
      rating,
      helpUsage,
      xpEligible
    )
  };

  state.attempts.unshift(attempt);
  delete state.activeAttempts[key];
  return attempt;
}

export function abandonAttempt(
  state: AppState,
  slug: string,
  helpUsage: HelpUsage,
  activeSeconds: number,
  now = new Date()
): Attempt | undefined {
  const problem = problemBySlug.get(slug);
  if (!problem) return undefined;
  const key = String(problem.id);
  const active =
    state.activeAttempts[key] ?? initialActiveAttempt(problem.id, now);
  const previousProgress = state.progress[key];

  const attempt: Attempt = {
    id: attemptId(problem.id, now),
    problemId: problem.id,
    patternId: problem.primaryPattern,
    startedAt: active.startedAt,
    finishedAt: now.toISOString(),
    activeSeconds: Math.max(active.activeSeconds, activeSeconds),
    mode: inferAttemptMode(previousProgress, state.settings.queueMode),
    result: "abandoned",
    submissionCount: active.submissionCount,
    wrongAnswerCount: active.wrongAnswerCount,
    runtimeErrorCount: active.runtimeErrorCount,
    timeLimitExceededCount: active.timeLimitExceededCount,
    compileErrorCount: active.compileErrorCount ?? 0,
    helpUsage
  };

  state.attempts.unshift(attempt);
  delete state.activeAttempts[key];
  return attempt;
}

export function resetActiveAttempt(state: AppState, problemId: number): void {
  if (problemById.has(problemId)) {
    delete state.activeAttempts[String(problemId)];
  }
}
