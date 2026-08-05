import { describe, expect, it } from "vitest";
import { PATTERNS, PROBLEMS } from "../src/curriculum";

describe("NeetCode 150 curriculum", () => {
  it("contains 18 patterns and exactly 150 problems", () => {
    expect(PATTERNS).toHaveLength(18);
    expect(PROBLEMS).toHaveLength(150);
  });

  it("uses unique LeetCode ids and slugs", () => {
    expect(new Set(PROBLEMS.map((problem) => problem.id)).size).toBe(150);
    expect(new Set(PROBLEMS.map((problem) => problem.slug)).size).toBe(150);
  });

  it("matches the official category totals", () => {
    expect(
      Object.fromEntries(
        PATTERNS.map((pattern) => [
          pattern.id,
          PROBLEMS.filter(
            (problem) => problem.primaryPattern === pattern.id
          ).length
        ])
      )
    ).toEqual({
      "arrays-hashing": 9,
      "two-pointers": 5,
      "sliding-window": 6,
      stack: 6,
      "binary-search": 7,
      "linked-list": 11,
      trees: 15,
      "heap-priority-queue": 7,
      backtracking: 10,
      tries: 3,
      graphs: 13,
      "advanced-graphs": 6,
      "1d-dp": 12,
      "2d-dp": 11,
      greedy: 8,
      intervals: 6,
      "math-geometry": 8,
      "bit-manipulation": 7
    });
  });
});
