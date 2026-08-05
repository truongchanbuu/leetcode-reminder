import { describe, expect, it } from "vitest";
import { buildDailyQueue, createInitialState } from "../src/state";
import type { AppState, ProblemProgress } from "../src/types";

function dueProgress(problemId: number, dueAt: string): ProblemProgress {
  return {
    problemId,
    dueAt,
    firstSeenAt: "2026-01-01T00:00:00.000Z",
    lastAttemptAt: "2026-01-01T00:00:00.000Z",
    reviewHistory: [],
    independentAcceptedCount: 1,
    status: "reviewing"
  };
}

describe("daily queue", () => {
  const now = new Date("2026-07-23T12:00:00.000Z");

  it("starts with one new problem from the first pattern", () => {
    const state = createInitialState();
    const queue = buildDailyQueue(state, now);
    expect(queue).toHaveLength(1);
    expect(queue[0]?.problem.slug).toBe("contains-duplicate");
    expect(queue[0]?.mode).toBe("new");
  });

  it("prioritizes oldest due reviews before a new problem", () => {
    const state: AppState = createInitialState();
    state.progress["242"] = dueProgress(
      242,
      "2026-07-20T00:00:00.000Z"
    );
    state.progress["217"] = dueProgress(
      217,
      "2026-07-21T00:00:00.000Z"
    );

    const queue = buildDailyQueue(state, now);
    expect(queue.slice(0, 2).map((item) => item.problem.id)).toEqual([
      242, 217
    ]);
    expect(queue.at(-1)?.mode).toBe("new");
  });

  it("pauses new problems when the daily review cap is full", () => {
    const state = createInitialState();
    state.settings.maxReviewsPerDay = 2;
    state.progress["242"] = dueProgress(
      242,
      "2026-07-20T00:00:00.000Z"
    );
    state.progress["217"] = dueProgress(
      217,
      "2026-07-21T00:00:00.000Z"
    );

    const queue = buildDailyQueue(state, now);
    expect(queue).toHaveLength(2);
    expect(queue.every((item) => item.mode === "review")).toBe(true);
  });
});
