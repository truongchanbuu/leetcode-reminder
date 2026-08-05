import { describe, expect, it } from "vitest";
import { scheduleReview } from "../src/state";
import type { CardInput } from "ts-fsrs";
import type { ProblemProgress } from "../src/types";

describe("FSRS scheduling", () => {
  const now = new Date("2026-07-23T12:00:00.000Z");

  it("schedules all first ratings in the future", () => {
    for (const rating of ["again", "hard", "good", "easy"] as const) {
      const progress = scheduleReview(undefined, rating, now);
      expect(new Date(progress.dueAt!).getTime()).toBeGreaterThan(now.getTime());
      expect(progress.reviewHistory).toHaveLength(1);
    }
  });

  it("schedules easy no sooner than again", () => {
    const again = scheduleReview(undefined, "again", now);
    const easy = scheduleReview(undefined, "easy", now);
    expect(new Date(easy.dueAt!).getTime()).toBeGreaterThanOrEqual(
      new Date(again.dueAt!).getTime()
    );
  });

  it("survives a JSON storage round trip", () => {
    const first = scheduleReview(undefined, "good", now);
    const stored = JSON.parse(JSON.stringify(first)) as ProblemProgress;
    const reviewedAt = new Date("2026-07-30T12:00:00.000Z");

    const second = scheduleReview(stored, "good", reviewedAt);

    expect(new Date(second.dueAt!).getTime()).toBeGreaterThan(
      reviewedAt.getTime()
    );
    expect(typeof second.card?.due).toBe("string");
    expect(
      second.card?.last_review === null ||
        typeof second.card?.last_review === "string"
    ).toBe(true);
  });

  it("repairs Date objects corrupted by browser storage", () => {
    const first = scheduleReview(undefined, "good", now);
    const corrupted: ProblemProgress = {
      ...first,
      card: {
        ...first.card!,
        due: {},
        last_review: {}
      } as unknown as CardInput
    };
    const reviewedAt = new Date("2026-07-30T12:00:00.000Z");

    expect(() => scheduleReview(corrupted, "good", reviewedAt)).not.toThrow();
    const repaired = scheduleReview(corrupted, "good", reviewedAt);
    expect(typeof repaired.card?.due).toBe("string");
    expect(new Date(repaired.dueAt!).getTime()).toBeGreaterThan(
      reviewedAt.getTime()
    );
  });
});
