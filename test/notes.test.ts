import { describe, expect, it } from "vitest";
import {
  createInitialState,
  migrateState,
  NOTE_MAX_LENGTH,
  saveProblemNote
} from "../src/state";

describe("problem notes", () => {
  it("migrates schema 1 state without losing progress", () => {
    const migrated = migrateState({
      schemaVersion: 1,
      settings: {
        newProblemsPerDay: 1,
        maxReviewsPerDay: 3,
        queueMode: "pattern",
        dailyReminderEnabled: false,
        dailyReminderHour: 19
      },
      progress: {
        "217": {
          problemId: 217,
          reviewHistory: [],
          independentAcceptedCount: 1,
          status: "reviewing"
        }
      },
      attempts: [],
      activeAttempts: {}
    });

    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.progress["217"]?.independentAcceptedCount).toBe(1);
    expect(migrated?.notes).toEqual({});
  });

  it("saves one local note per known problem", () => {
    const state = createInitialState();
    const now = new Date("2026-07-28T08:00:00.000Z");

    const note = saveProblemNote(
      state,
      217,
      "Use a HashSet; mention the duplicate invariant.",
      now
    );

    expect(note?.updatedAt).toBe(now.toISOString());
    expect(state.notes["217"]?.text).toContain("HashSet");
  });

  it("clears blank notes and limits note length", () => {
    const state = createInitialState();
    saveProblemNote(state, 217, "x".repeat(NOTE_MAX_LENGTH + 50));
    expect(state.notes["217"]?.text).toHaveLength(NOTE_MAX_LENGTH);

    saveProblemNote(state, 217, "   ");
    expect(state.notes["217"]).toBeUndefined();
  });

  it("rejects notes for problems outside the curriculum", () => {
    const state = createInitialState();

    expect(saveProblemNote(state, 999_999, "Unknown")).toBeUndefined();
    expect(state.notes).toEqual({});
  });
});
