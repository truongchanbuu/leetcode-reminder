import { PATTERNS, PROBLEMS, problemById } from "./curriculum";
import type { AppState, Attempt, PatternId } from "./types";

export type ChallengeCategory =
  | "pathfinding"
  | "recall"
  | "precision"
  | "discipline"
  | "conquest";

export type ChallengeTierId =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master";

export interface ChallengeTier {
  id: ChallengeTierId;
  name: string;
  points: number;
}

export interface ChallengeDefinition {
  id: string;
  name: string;
  category: ChallengeCategory;
  description: string;
  unit: string;
  token: string;
  thresholds: readonly [number, number, number, number, number, number, number];
  masterTitle: string;
}

export interface ChallengeProgress {
  definition: ChallengeDefinition;
  value: number;
  tierIndex: number;
  tier?: ChallengeTier;
  nextTier?: ChallengeTier;
  nextThreshold?: number;
  progressPercent: number;
  points: number;
}

export interface ChallengeUnlock {
  challengeId: string;
  name: string;
  category: ChallengeCategory;
  token: string;
  tier: ChallengeTier;
  value: number;
  masterTitle?: string;
}

export interface ChallengeSummary {
  score: number;
  maxScore: number;
  rankedChallenges: number;
  masteredChallenges: number;
  progress: ChallengeProgress[];
}

export const CHALLENGE_TIERS: readonly ChallengeTier[] = [
  { id: "iron", name: "Iron", points: 5 },
  { id: "bronze", name: "Bronze", points: 10 },
  { id: "silver", name: "Silver", points: 15 },
  { id: "gold", name: "Gold", points: 20 },
  { id: "platinum", name: "Platinum", points: 30 },
  { id: "diamond", name: "Diamond", points: 40 },
  { id: "master", name: "Master", points: 60 }
] as const;

export const CHALLENGE_CATEGORIES: Record<
  ChallengeCategory,
  { name: string; description: string }
> = {
  pathfinding: {
    name: "Pathfinding",
    description: "Explore the roadmap and broaden pattern recognition."
  },
  recall: {
    name: "Recall",
    description: "Retain solutions across increasingly long intervals."
  },
  precision: {
    name: "Precision",
    description: "Solve independently, cleanly, and honestly."
  },
  discipline: {
    name: "Discipline",
    description: "Return for due reviews and sustain the routine."
  },
  conquest: {
    name: "Conquest",
    description: "Master complete patterns and difficult problems."
  }
};

export const CHALLENGES: readonly ChallengeDefinition[] = [
  {
    id: "problem-solver",
    name: "Problem Solver",
    category: "pathfinding",
    description: "Solve unique problems from NeetCode 150.",
    unit: "problems",
    token: "PS",
    thresholds: [1, 10, 25, 50, 75, 100, 150],
    masterTitle: "Roadmap Finisher"
  },
  {
    id: "pattern-scout",
    name: "Pattern Scout",
    category: "pathfinding",
    description: "Solve at least one problem in different patterns.",
    unit: "patterns",
    token: "PX",
    thresholds: [1, 3, 6, 9, 12, 15, 18],
    masterTitle: "Pattern Cartographer"
  },
  {
    id: "memory-forge",
    name: "Memory Forge",
    category: "recall",
    description: "Reach the first-mastery milestone on problems.",
    unit: "mastered",
    token: "MF",
    thresholds: [1, 5, 15, 30, 60, 100, 150],
    masterTitle: "Memory Smith"
  },
  {
    id: "recall-ace",
    name: "Recall Ace",
    category: "recall",
    description: "Rate a due review Easy without using help.",
    unit: "easy recalls",
    token: "RA",
    thresholds: [1, 5, 15, 30, 60, 120, 250],
    masterTitle: "Total Recall"
  },
  {
    id: "independent-mind",
    name: "Independent Mind",
    category: "precision",
    description: "Complete Good or Easy solves without help.",
    unit: "independent",
    token: "IM",
    thresholds: [1, 10, 25, 50, 100, 250, 500],
    masterTitle: "Independent Thinker"
  },
  {
    id: "clean-execution",
    name: "Clean Execution",
    category: "precision",
    description: "Solve independently with one accepted submission and no errors.",
    unit: "clean solves",
    token: "CE",
    thresholds: [1, 5, 10, 25, 50, 100, 200],
    masterTitle: "One Shot"
  },
  {
    id: "comeback",
    name: "Comeback",
    category: "precision",
    description: "Recover independently after an Again or abandoned attempt.",
    unit: "recoveries",
    token: "CB",
    thresholds: [1, 3, 5, 10, 20, 40, 75],
    masterTitle: "Unbreakable"
  },
  {
    id: "review-vanguard",
    name: "Review Vanguard",
    category: "discipline",
    description: "Complete reviews when they are actually due.",
    unit: "due reviews",
    token: "RV",
    thresholds: [1, 10, 25, 50, 100, 250, 500],
    masterTitle: "Review Vanguard"
  },
  {
    id: "steady-flame",
    name: "Steady Flame",
    category: "discipline",
    description: "Maintain consecutive local days with an accepted solve.",
    unit: "day streak",
    token: "SF",
    thresholds: [2, 3, 7, 14, 30, 60, 100],
    masterTitle: "Unfading Flame"
  },
  {
    id: "hard-conqueror",
    name: "Hard Conqueror",
    category: "conquest",
    description: "Reach first mastery on Hard problems.",
    unit: "Hard mastered",
    token: "HC",
    thresholds: [1, 3, 5, 8, 12, 17, 21],
    masterTitle: "Hard Mode"
  },
  {
    id: "pattern-conqueror",
    name: "Pattern Conqueror",
    category: "conquest",
    description: "First-master every problem inside complete patterns.",
    unit: "patterns",
    token: "PC",
    thresholds: [1, 2, 4, 6, 9, 13, 18],
    masterTitle: "Pattern Sovereign"
  }
] as const;

function acceptedAttempts(state: AppState): Attempt[] {
  return state.attempts.filter((attempt) => attempt.result === "accepted");
}

function isIndependent(attempt: Attempt): boolean {
  return (
    attempt.helpUsage === "none" &&
    (attempt.rating === "good" || attempt.rating === "easy")
  );
}

function maxAcceptedDayStreak(state: AppState): number {
  const dayNumbers = [
    ...new Set(
      acceptedAttempts(state).map((attempt) => {
        const date = new Date(attempt.finishedAt);
        return Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ) / 86_400_000;
      })
    )
  ].sort((a, b) => a - b);

  let best = 0;
  let current = 0;
  let previous: number | undefined;
  for (const day of dayNumbers) {
    current = previous !== undefined && day === previous + 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = day;
  }
  return best;
}

function comebackCount(state: AppState): number {
  const recoveryPending = new Set<number>();
  let recoveries = 0;
  const chronological = [...state.attempts].sort(
    (a, b) =>
      new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime()
  );

  for (const attempt of chronological) {
    if (attempt.result === "abandoned" || attempt.rating === "again") {
      recoveryPending.add(attempt.problemId);
      continue;
    }
    if (recoveryPending.has(attempt.problemId) && isIndependent(attempt)) {
      recoveries += 1;
      recoveryPending.delete(attempt.problemId);
    }
  }
  return recoveries;
}

function fullyMasteredPatternCount(state: AppState): number {
  return PATTERNS.filter((pattern) => {
    const problems = PROBLEMS.filter(
      (problem) => problem.primaryPattern === pattern.id
    );
    return problems.every((problem) =>
      Boolean(state.progress[String(problem.id)]?.masteredAt)
    );
  }).length;
}

function challengeValues(state: AppState): Record<string, number> {
  const accepted = acceptedAttempts(state);
  const solvedIds = new Set(accepted.map((attempt) => attempt.problemId));
  const seenPatterns = new Set<PatternId>(
    accepted.map((attempt) => attempt.patternId)
  );
  const masteredIds = Object.values(state.progress)
    .filter((progress) => Boolean(progress.masteredAt))
    .map((progress) => progress.problemId);
  const hardMastered = masteredIds.filter(
    (problemId) => problemById.get(problemId)?.difficulty === "hard"
  ).length;

  return {
    "problem-solver": solvedIds.size,
    "pattern-scout": seenPatterns.size,
    "memory-forge": masteredIds.length,
    "recall-ace": accepted.filter(
      (attempt) =>
        attempt.mode === "review" &&
        (attempt.xpEarned ?? 0) > 0 &&
        attempt.rating === "easy" &&
        attempt.helpUsage === "none"
    ).length,
    "independent-mind": accepted.filter(isIndependent).length,
    "clean-execution": accepted.filter(
      (attempt) =>
        isIndependent(attempt) &&
        attempt.submissionCount === 1 &&
        attempt.wrongAnswerCount === 0 &&
        attempt.runtimeErrorCount === 0 &&
        attempt.timeLimitExceededCount === 0 &&
        (attempt.compileErrorCount ?? 0) === 0
    ).length,
    comeback: comebackCount(state),
    "review-vanguard": accepted.filter(
      (attempt) =>
        attempt.mode === "review" && (attempt.xpEarned ?? 0) > 0
    ).length,
    "steady-flame": maxAcceptedDayStreak(state),
    "hard-conqueror": hardMastered,
    "pattern-conqueror": fullyMasteredPatternCount(state)
  };
}

function progressFor(
  definition: ChallengeDefinition,
  value: number
): ChallengeProgress {
  let tierIndex = -1;
  for (let index = 0; index < definition.thresholds.length; index += 1) {
    if (value >= definition.thresholds[index]!) tierIndex = index;
  }

  const tier = tierIndex >= 0 ? CHALLENGE_TIERS[tierIndex] : undefined;
  const nextTier = CHALLENGE_TIERS[tierIndex + 1];
  const nextThreshold = definition.thresholds[tierIndex + 1];
  const previousThreshold =
    tierIndex >= 0 ? definition.thresholds[tierIndex]! : 0;
  const progressPercent =
    nextThreshold === undefined
      ? 100
      : Math.min(
          100,
          Math.round(
            ((value - previousThreshold) /
              (nextThreshold - previousThreshold)) *
              100
          )
        );

  return {
    definition,
    value,
    tierIndex,
    tier,
    nextTier,
    nextThreshold,
    progressPercent,
    points: tier?.points ?? 0
  };
}

export function getChallengeSummary(state: AppState): ChallengeSummary {
  const values = challengeValues(state);
  const progress = CHALLENGES.map((definition) =>
    progressFor(definition, values[definition.id] ?? 0)
  );
  return {
    score: progress.reduce((total, item) => total + item.points, 0),
    maxScore: CHALLENGES.length * CHALLENGE_TIERS.at(-1)!.points,
    rankedChallenges: progress.filter((item) => item.tier).length,
    masteredChallenges: progress.filter(
      (item) => item.tier?.id === "master"
    ).length,
    progress
  };
}

export function getChallengeUnlocks(
  before: AppState,
  after: AppState
): ChallengeUnlock[] {
  const beforeById = new Map(
    getChallengeSummary(before).progress.map((item) => [
      item.definition.id,
      item
    ])
  );

  return getChallengeSummary(after).progress.flatMap((item) => {
    const previousTierIndex =
      beforeById.get(item.definition.id)?.tierIndex ?? -1;
    if (!item.tier || item.tierIndex <= previousTierIndex) return [];
    return [
      {
        challengeId: item.definition.id,
        name: item.definition.name,
        category: item.definition.category,
        token: item.definition.token,
        tier: item.tier,
        value: item.value,
        masterTitle:
          item.tier.id === "master"
            ? item.definition.masterTitle
            : undefined
      }
    ];
  });
}
