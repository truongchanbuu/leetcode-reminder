import { describe, expect, it } from "vitest";
import {
  getChallengeSummary,
  getChallengeUnlocks
} from "../src/challenges";
import { PROBLEMS } from "../src/curriculum";
import { createInitialState } from "../src/state";
import type { AppState, Attempt } from "../src/types";

function acceptedAttempt(
  overrides: Partial<Attempt> = {}
): Attempt {
  const problem = PROBLEMS.find(
    (item) => item.id === (overrides.problemId ?? PROBLEMS[0]!.id)
  )!;
  return {
    id: overrides.id ?? crypto.randomUUID(),
    problemId: problem.id,
    patternId: problem.primaryPattern,
    startedAt: "2026-07-27T00:00:00.000Z",
    finishedAt: "2026-07-27T00:30:00.000Z",
    activeSeconds: 1_800,
    mode: "new",
    result: "accepted",
    submissionCount: 1,
    wrongAnswerCount: 0,
    runtimeErrorCount: 0,
    timeLimitExceededCount: 0,
    rating: "good",
    helpUsage: "none",
    xpEarned: 20,
    ...overrides
  };
}

function progressById(state: AppState, challengeId: string) {
  return getChallengeSummary(state).progress.find(
    (item) => item.definition.id === challengeId
  )!;
}

describe("Challenges", () => {
  it("starts with no Challenge score or unlocked tiers", () => {
    const summary = getChallengeSummary(createInitialState());

    expect(summary.score).toBe(0);
    expect(summary.rankedChallenges).toBe(0);
    expect(summary.masteredChallenges).toBe(0);
    expect(summary.progress).toHaveLength(11);
  });

  it("unlocks exploration and precision milestones after a clean first solve", () => {
    const before = createInitialState();
    const after = createInitialState();
    after.attempts.push(acceptedAttempt({ id: "first-clean-solve" }));

    const unlocks = getChallengeUnlocks(before, after);

    expect(unlocks.map((unlock) => unlock.challengeId)).toEqual([
      "problem-solver",
      "pattern-scout",
      "independent-mind",
      "clean-execution"
    ]);
    expect(unlocks.every((unlock) => unlock.tier.id === "iron")).toBe(true);
    expect(getChallengeSummary(after).score).toBe(20);
  });

  it("counts only eligible due reviews for review achievements", () => {
    const state = createInitialState();
    state.attempts = [
      acceptedAttempt({
        id: "eligible-review",
        mode: "review",
        rating: "easy",
        xpEarned: 24
      }),
      acceptedAttempt({
        id: "early-review",
        mode: "review",
        rating: "easy",
        xpEarned: 0
      })
    ];

    expect(progressById(state, "review-vanguard").value).toBe(1);
    expect(progressById(state, "recall-ace").value).toBe(1);
  });

  it("tracks the best accepted-day streak", () => {
    const state = createInitialState();
    state.attempts = [
      acceptedAttempt({
        id: "day-1",
        finishedAt: "2026-07-25T08:00:00.000Z"
      }),
      acceptedAttempt({
        id: "day-2",
        finishedAt: "2026-07-26T08:00:00.000Z"
      }),
      acceptedAttempt({
        id: "day-3",
        finishedAt: "2026-07-27T08:00:00.000Z"
      })
    ];

    expect(progressById(state, "steady-flame").value).toBe(3);
    expect(progressById(state, "steady-flame").tier?.id).toBe("bronze");
  });

  it("unlocks mastery milestones from permanent masteredAt records", () => {
    const before = createInitialState();
    const after = createInitialState();
    const hardProblem = PROBLEMS.find(
      (problem) => problem.difficulty === "hard"
    )!;
    after.progress[String(hardProblem.id)] = {
      problemId: hardProblem.id,
      reviewHistory: [],
      independentAcceptedCount: 2,
      status: "reviewing",
      masteredAt: "2026-07-27T00:00:00.000Z"
    };

    const unlocks = getChallengeUnlocks(before, after);

    expect(unlocks.map((unlock) => unlock.challengeId)).toEqual([
      "memory-forge",
      "hard-conqueror"
    ]);
  });

  it("does not emit an unlock when no tier was crossed", () => {
    const before = createInitialState();
    before.attempts.push(acceptedAttempt({ id: "existing" }));
    const after = structuredClone(before);

    expect(getChallengeUnlocks(before, after)).toEqual([]);
  });
});
