import type {
  PatternDefinition,
  PatternId,
  ProblemDefinition
} from "./types";
import { NEETCODE150_SEEDS } from "./neetcode150";

export const PATTERNS: PatternDefinition[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    description: "Fast lookup, counting, grouping, and set membership.",
    order: 1
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    description: "Coordinate indices to reduce repeated scanning.",
    order: 2
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    description: "Maintain a valid contiguous range while optimizing it.",
    order: 3
  },
  {
    id: "stack",
    name: "Stack",
    description: "Track nested structure and unresolved previous elements.",
    order: 4
  },
  {
    id: "binary-search",
    name: "Binary Search",
    description: "Exploit sorted or monotonic search spaces.",
    order: 5
  },
  {
    id: "linked-list",
    name: "Linked List",
    description: "Rewire nodes with pointer invariants.",
    order: 6
  },
  {
    id: "trees",
    name: "Trees",
    description: "Recursive structure, traversal, and subtree properties.",
    order: 7
  },
  {
    id: "heap-priority-queue",
    name: "Heap / Priority Queue",
    description: "Repeatedly access the current minimum, maximum, or top K.",
    order: 8
  },
  {
    id: "backtracking",
    name: "Backtracking",
    description: "Explore choices and undo state when a branch ends.",
    order: 9
  },
  {
    id: "tries",
    name: "Tries",
    description: "Index strings by prefixes.",
    order: 10
  },
  {
    id: "graphs",
    name: "Graphs",
    description: "Traverse connectivity, components, and dependencies.",
    order: 11
  },
  {
    id: "advanced-graphs",
    name: "Advanced Graphs",
    description: "Weighted paths and spanning structures.",
    order: 12
  },
  {
    id: "1d-dp",
    name: "1-D Dynamic Programming",
    description: "Reuse solutions to smaller one-dimensional states.",
    order: 13
  },
  {
    id: "2d-dp",
    name: "2-D Dynamic Programming",
    description: "Model transitions across grids or paired sequences.",
    order: 14
  },
  {
    id: "greedy",
    name: "Greedy",
    description: "Make locally safe choices backed by an invariant.",
    order: 15
  },
  {
    id: "intervals",
    name: "Intervals",
    description: "Sort and reason about overlap boundaries.",
    order: 16
  },
  {
    id: "math-geometry",
    name: "Math & Geometry",
    description: "Transform indices and encode geometric relationships.",
    order: 17
  },
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    description: "Use binary representation and bitwise identities.",
    order: 18
  }
];

type Seed = [
  id: number,
  slug: string,
  title: string,
  difficulty: ProblemDefinition["difficulty"]
];

const seeds: Record<PatternId, Seed[]> = {
  "arrays-hashing": [
    [217, "contains-duplicate", "Contains Duplicate", "easy"],
    [242, "valid-anagram", "Valid Anagram", "easy"],
    [1, "two-sum", "Two Sum", "easy"],
    [49, "group-anagrams", "Group Anagrams", "medium"],
    [347, "top-k-frequent-elements", "Top K Frequent Elements", "medium"],
    [
      238,
      "product-of-array-except-self",
      "Product of Array Except Self",
      "medium"
    ],
    [36, "valid-sudoku", "Valid Sudoku", "medium"],
    [
      128,
      "longest-consecutive-sequence",
      "Longest Consecutive Sequence",
      "medium"
    ]
  ],
  "two-pointers": [
    [125, "valid-palindrome", "Valid Palindrome", "easy"],
    [
      167,
      "two-sum-ii-input-array-is-sorted",
      "Two Sum II - Input Array Is Sorted",
      "medium"
    ],
    [15, "3sum", "3Sum", "medium"],
    [
      11,
      "container-with-most-water",
      "Container With Most Water",
      "medium"
    ],
    [42, "trapping-rain-water", "Trapping Rain Water", "hard"]
  ],
  "sliding-window": [
    [
      121,
      "best-time-to-buy-and-sell-stock",
      "Best Time to Buy and Sell Stock",
      "easy"
    ],
    [
      3,
      "longest-substring-without-repeating-characters",
      "Longest Substring Without Repeating Characters",
      "medium"
    ],
    [
      424,
      "longest-repeating-character-replacement",
      "Longest Repeating Character Replacement",
      "medium"
    ],
    [567, "permutation-in-string", "Permutation in String", "medium"],
    [76, "minimum-window-substring", "Minimum Window Substring", "hard"]
  ],
  stack: [
    [20, "valid-parentheses", "Valid Parentheses", "easy"],
    [155, "min-stack", "Min Stack", "medium"],
    [
      150,
      "evaluate-reverse-polish-notation",
      "Evaluate Reverse Polish Notation",
      "medium"
    ],
    [739, "daily-temperatures", "Daily Temperatures", "medium"],
    [
      84,
      "largest-rectangle-in-histogram",
      "Largest Rectangle in Histogram",
      "hard"
    ]
  ],
  "binary-search": [
    [704, "binary-search", "Binary Search", "easy"],
    [74, "search-a-2d-matrix", "Search a 2D Matrix", "medium"],
    [875, "koko-eating-bananas", "Koko Eating Bananas", "medium"],
    [
      153,
      "find-minimum-in-rotated-sorted-array",
      "Find Minimum in Rotated Sorted Array",
      "medium"
    ],
    [
      33,
      "search-in-rotated-sorted-array",
      "Search in Rotated Sorted Array",
      "medium"
    ],
    [
      981,
      "time-based-key-value-store",
      "Time Based Key-Value Store",
      "medium"
    ]
  ],
  "linked-list": [
    [206, "reverse-linked-list", "Reverse Linked List", "easy"],
    [21, "merge-two-sorted-lists", "Merge Two Sorted Lists", "easy"],
    [141, "linked-list-cycle", "Linked List Cycle", "easy"],
    [143, "reorder-list", "Reorder List", "medium"],
    [
      19,
      "remove-nth-node-from-end-of-list",
      "Remove Nth Node From End of List",
      "medium"
    ],
    [
      138,
      "copy-list-with-random-pointer",
      "Copy List with Random Pointer",
      "medium"
    ],
    [2, "add-two-numbers", "Add Two Numbers", "medium"]
  ],
  trees: [
    [226, "invert-binary-tree", "Invert Binary Tree", "easy"],
    [
      104,
      "maximum-depth-of-binary-tree",
      "Maximum Depth of Binary Tree",
      "easy"
    ],
    [
      543,
      "diameter-of-binary-tree",
      "Diameter of Binary Tree",
      "easy"
    ],
    [110, "balanced-binary-tree", "Balanced Binary Tree", "easy"],
    [100, "same-tree", "Same Tree", "easy"],
    [572, "subtree-of-another-tree", "Subtree of Another Tree", "easy"],
    [
      235,
      "lowest-common-ancestor-of-a-binary-search-tree",
      "Lowest Common Ancestor of a Binary Search Tree",
      "medium"
    ],
    [
      102,
      "binary-tree-level-order-traversal",
      "Binary Tree Level Order Traversal",
      "medium"
    ],
    [
      98,
      "validate-binary-search-tree",
      "Validate Binary Search Tree",
      "medium"
    ]
  ],
  "heap-priority-queue": [
    [
      215,
      "kth-largest-element-in-an-array",
      "Kth Largest Element in an Array",
      "medium"
    ],
    [621, "task-scheduler", "Task Scheduler", "medium"],
    [
      295,
      "find-median-from-data-stream",
      "Find Median from Data Stream",
      "hard"
    ]
  ],
  backtracking: [
    [78, "subsets", "Subsets", "medium"],
    [39, "combination-sum", "Combination Sum", "medium"],
    [46, "permutations", "Permutations", "medium"],
    [79, "word-search", "Word Search", "medium"]
  ],
  tries: [
    [
      208,
      "implement-trie-prefix-tree",
      "Implement Trie (Prefix Tree)",
      "medium"
    ],
    [
      211,
      "design-add-and-search-words-data-structure",
      "Design Add and Search Words Data Structure",
      "medium"
    ]
  ],
  graphs: [
    [200, "number-of-islands", "Number of Islands", "medium"],
    [133, "clone-graph", "Clone Graph", "medium"],
    [695, "max-area-of-island", "Max Area of Island", "medium"],
    [
      417,
      "pacific-atlantic-water-flow",
      "Pacific Atlantic Water Flow",
      "medium"
    ],
    [994, "rotting-oranges", "Rotting Oranges", "medium"],
    [207, "course-schedule", "Course Schedule", "medium"]
  ],
  "advanced-graphs": [
    [743, "network-delay-time", "Network Delay Time", "medium"],
    [
      1584,
      "min-cost-to-connect-all-points",
      "Min Cost to Connect All Points",
      "medium"
    ]
  ],
  "1d-dp": [
    [70, "climbing-stairs", "Climbing Stairs", "easy"],
    [198, "house-robber", "House Robber", "medium"],
    [322, "coin-change", "Coin Change", "medium"],
    [
      300,
      "longest-increasing-subsequence",
      "Longest Increasing Subsequence",
      "medium"
    ],
    [139, "word-break", "Word Break", "medium"]
  ],
  "2d-dp": [
    [62, "unique-paths", "Unique Paths", "medium"],
    [
      1143,
      "longest-common-subsequence",
      "Longest Common Subsequence",
      "medium"
    ]
  ],
  greedy: [
    [53, "maximum-subarray", "Maximum Subarray", "medium"],
    [55, "jump-game", "Jump Game", "medium"]
  ],
  intervals: [
    [56, "merge-intervals", "Merge Intervals", "medium"],
    [57, "insert-interval", "Insert Interval", "medium"]
  ],
  "math-geometry": [[48, "rotate-image", "Rotate Image", "medium"]],
  "bit-manipulation": [[338, "counting-bits", "Counting Bits", "easy"]]
};

export const PROBLEMS: ProblemDefinition[] = PATTERNS.flatMap((pattern) =>
  NEETCODE150_SEEDS[pattern.id].map(([id, slug, title, difficulty], index) => ({
    id,
    slug,
    title,
    difficulty,
    primaryPattern: pattern.id,
    order: index + 1
  }))
);

export const problemById = new Map(
  PROBLEMS.map((problem) => [problem.id, problem])
);

export const problemBySlug = new Map(
  PROBLEMS.map((problem) => [problem.slug, problem])
);

export const patternById = new Map(
  PATTERNS.map((pattern) => [pattern.id, pattern])
);

const publicNeetCodeAlternatives = new Map<string, string>([
  ["encode-and-decode-strings", "string-encode-and-decode"],
  ["walls-and-gates", "islands-and-treasure"],
  ["graph-valid-tree", "valid-tree"],
  [
    "number-of-connected-components-in-an-undirected-graph",
    "count-connected-components"
  ],
  ["alien-dictionary", "foreign-dictionary"],
  ["meeting-rooms", "meeting-schedule"],
  ["meeting-rooms-ii", "meeting-schedule-ii"]
]);

export const neetcodeSlugToLeetcodeSlug = new Map(
  [...publicNeetCodeAlternatives].map(([leetcodeSlug, neetcodeSlug]) => [
    neetcodeSlug,
    leetcodeSlug
  ])
);

export function problemUrl(problem: ProblemDefinition): string {
  const neetcodeSlug = publicNeetCodeAlternatives.get(problem.slug);
  if (neetcodeSlug) {
    return `https://neetcode.io/problems/${neetcodeSlug}?list=neetcode150`;
  }
  return `https://leetcode.com/problems/${problem.slug}/`;
}
