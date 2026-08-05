import { describe, expect, it } from "vitest";
import {
  completeAttempt,
  getProblemContext,
  recordHeartbeat,
  recordSubmission
} from "../src/domain";
import { createInitialState } from "../src/state";

describe("attempt lifecycle", () => {
  const startedAt = new Date("2026-07-23T12:00:00.000Z");
  const completedAt = new Date("2026-07-23T12:25:00.000Z");

  it("records time, submissions, history, and a future review", () => {
    const state = createInitialState();
    const context = getProblemContext(state, "contains-duplicate", startedAt);
    expect(context.known).toBe(true);

    recordHeartbeat(state, "contains-duplicate", 1_400, completedAt);
    recordSubmission(
      state,
      "contains-duplicate",
      "compile-error",
      1_410,
      completedAt
    );
    recordSubmission(
      state,
      "contains-duplicate",
      "wrong-answer",
      1_420,
      completedAt
    );
    recordSubmission(
      state,
      "contains-duplicate",
      "accepted",
      1_500,
      completedAt
    );

    const attempt = completeAttempt(
      state,
      "contains-duplicate",
      "good",
      "none",
      1_500,
      completedAt
    );

    expect(attempt?.submissionCount).toBe(3);
    expect(attempt?.compileErrorCount).toBe(1);
    expect(attempt?.wrongAnswerCount).toBe(1);
    expect(attempt?.activeSeconds).toBe(1_500);
    expect(attempt?.mode).toBe("new");
    expect(attempt?.xpEarned).toBe(20);
    expect(state.attempts).toHaveLength(1);
    expect(state.progress["217"]?.independentAcceptedCount).toBe(1);
    expect(new Date(state.progress["217"]!.dueAt!).getTime()).toBeGreaterThan(
      completedAt.getTime()
    );
    expect(state.activeAttempts["217"]).toBeUndefined();
  });

  it("does not count a solution-assisted solve as independent", () => {
    const state = createInitialState();
    getProblemContext(state, "contains-duplicate", startedAt);
    completeAttempt(
      state,
      "contains-duplicate",
      "easy",
      "solution",
      600,
      completedAt
    );

    expect(state.progress["217"]?.independentAcceptedCount).toBe(0);
    expect(state.progress["217"]?.status).toBe("reviewing");
    expect(state.attempts[0]?.xpEarned).toBe(4);
  });
});
