import { describe, expect, it } from "vitest";
import { PROBLEMS } from "../src/curriculum";
import { calculateAttemptXp, getRankProgress } from "../src/ranks";
import { createInitialState } from "../src/state";
import type { Attempt } from "../src/types";

function acceptedAttempt(
  problemId: number,
  patternId: Attempt["patternId"],
  xpEarned: number
): Attempt {
  return {
    id: `attempt-${problemId}`,
    problemId,
    patternId,
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
    xpEarned
  };
}

describe("learning ranks", () => {
  it("awards more XP for independent scheduled recall", () => {
    const medium = PROBLEMS.find(
      (problem) => problem.difficulty === "medium"
    )!;

    expect(
      calculateAttemptXp(medium, "review", "good", "none", true)
    ).toBe(42);
    expect(
      calculateAttemptXp(medium, "review", "good", "solution", true)
    ).toBe(8);
    expect(
      calculateAttemptXp(medium, "review", "good", "none", false)
    ).toBe(0);
  });

  it("starts at Iron and requires 15,000 XP plus full mastery for Challenger", () => {
    const state = createInitialState();
    const rank = getRankProgress(state);

    expect(rank.current.name).toBe("Iron");
    expect(rank.next?.name).toBe("Bronze");
    expect(rank.xp).toBe(0);
  });

  it("promotes only when both XP and learning gates are satisfied", () => {
    const state = createInitialState();
    state.attempts = PROBLEMS.slice(0, 10).map((problem) =>
      acceptedAttempt(problem.id, problem.primaryPattern, 50)
    );

    expect(getRankProgress(state).current.name).toBe("Bronze");

    state.attempts = PROBLEMS.map((problem) =>
      acceptedAttempt(problem.id, problem.primaryPattern, 100)
    );
    for (const problem of PROBLEMS) {
      state.progress[String(problem.id)] = {
        problemId: problem.id,
        reviewHistory: [],
        independentAcceptedCount: 2,
        status: "mastered",
        masteredAt: "2026-07-27T00:00:00.000Z"
      };
    }

    expect(getRankProgress(state).current.name).toBe("Challenger");
  });
});
