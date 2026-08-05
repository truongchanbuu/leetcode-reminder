import type {
  AppState,
  AttemptMode,
  Difficulty,
  HelpUsage,
  ProblemDefinition,
  Rating
} from "./types";

export interface RankDefinition {
  id:
    | "iron"
    | "bronze"
    | "silver"
    | "gold"
    | "platinum"
    | "emerald"
    | "diamond"
    | "master"
    | "grandmaster"
    | "challenger";
  name: string;
  minXp: number;
  minSolved: number;
  minMastered: number;
}

export interface RankProgress {
  xp: number;
  solved: number;
  mastered: number;
  current: RankDefinition;
  next?: RankDefinition;
  xpPercentToNext: number;
}

export const RANKS: readonly RankDefinition[] = [
  { id: "iron", name: "Iron", minXp: 0, minSolved: 0, minMastered: 0 },
  { id: "bronze", name: "Bronze", minXp: 500, minSolved: 10, minMastered: 0 },
  { id: "silver", name: "Silver", minXp: 1_200, minSolved: 25, minMastered: 0 },
  { id: "gold", name: "Gold", minXp: 2_200, minSolved: 50, minMastered: 0 },
  { id: "platinum", name: "Platinum", minXp: 3_500, minSolved: 75, minMastered: 0 },
  { id: "emerald", name: "Emerald", minXp: 5_000, minSolved: 100, minMastered: 0 },
  { id: "diamond", name: "Diamond", minXp: 7_000, minSolved: 150, minMastered: 0 },
  { id: "master", name: "Master", minXp: 10_000, minSolved: 150, minMastered: 50 },
  {
    id: "grandmaster",
    name: "Grandmaster",
    minXp: 12_500,
    minSolved: 150,
    minMastered: 100
  },
  {
    id: "challenger",
    name: "Challenger",
    minXp: 15_000,
    minSolved: 150,
    minMastered: 150
  }
] as const;

const difficultyXp: Record<Difficulty, number> = {
  easy: 20,
  medium: 35,
  hard: 50
};

const ratingMultiplier: Record<Rating, number> = {
  again: 0.15,
  hard: 0.6,
  good: 1,
  easy: 1.1
};

const helpMultiplier: Record<HelpUsage, number> = {
  none: 1,
  hint: 0.6,
  solution: 0.2
};

export function calculateAttemptXp(
  problem: ProblemDefinition,
  mode: AttemptMode,
  rating: Rating,
  helpUsage: HelpUsage,
  eligible: boolean
): number {
  if (!eligible) return 0;
  const reviewMultiplier = mode === "review" ? 1.2 : 1;
  return Math.max(
    1,
    Math.round(
      difficultyXp[problem.difficulty] *
        ratingMultiplier[rating] *
        helpMultiplier[helpUsage] *
        reviewMultiplier
    )
  );
}

export function getRankProgress(state: AppState): RankProgress {
  const xp = state.attempts.reduce(
    (total, attempt) => total + (attempt.xpEarned ?? 0),
    0
  );
  const solved = new Set(
    state.attempts
      .filter((attempt) => attempt.result === "accepted")
      .map((attempt) => attempt.problemId)
  ).size;
  const mastered = Object.values(state.progress).filter(
    (progress) => Boolean(progress.masteredAt)
  ).length;

  const current =
    [...RANKS]
      .reverse()
      .find(
        (rank) =>
          xp >= rank.minXp &&
          solved >= rank.minSolved &&
          mastered >= rank.minMastered
      ) ?? RANKS[0]!;
  const currentIndex = RANKS.findIndex((rank) => rank.id === current.id);
  const next = RANKS[currentIndex + 1];
  const xpPercentToNext = next
    ? Math.min(
        100,
        Math.round(
          ((xp - current.minXp) / (next.minXp - current.minXp)) * 100
        )
      )
    : 100;

  return { xp, solved, mastered, current, next, xpPercentToNext };
}
