import type { Difficulty, PatternId } from "./types";

type Seed = readonly [
  id: number,
  slug: string,
  title: string,
  difficulty: Difficulty
];

/**
 * The public NeetCode 150 curriculum, grouped and ordered as shown by NeetCode.
 * PatternQueue stores only public problem metadata and links to LeetCode.
 */
export const NEETCODE150_SEEDS: Record<PatternId, readonly Seed[]> = {
  "arrays-hashing": [
    [217, "contains-duplicate", "Contains Duplicate", "easy"],
    [242, "valid-anagram", "Valid Anagram", "easy"],
    [1, "two-sum", "Two Sum", "easy"],
    [49, "group-anagrams", "Group Anagrams", "medium"],
    [347, "top-k-frequent-elements", "Top K Frequent Elements", "medium"],
    [271, "encode-and-decode-strings", "Encode and Decode Strings", "medium"],
    [238, "product-of-array-except-self", "Product of Array Except Self", "medium"],
    [36, "valid-sudoku", "Valid Sudoku", "medium"],
    [128, "longest-consecutive-sequence", "Longest Consecutive Sequence", "medium"]
  ],
  "two-pointers": [
    [125, "valid-palindrome", "Valid Palindrome", "easy"],
    [167, "two-sum-ii-input-array-is-sorted", "Two Sum II Input Array Is Sorted", "medium"],
    [15, "3sum", "3Sum", "medium"],
    [11, "container-with-most-water", "Container With Most Water", "medium"],
    [42, "trapping-rain-water", "Trapping Rain Water", "hard"]
  ],
  "sliding-window": [
    [121, "best-time-to-buy-and-sell-stock", "Best Time to Buy And Sell Stock", "easy"],
    [3, "longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "medium"],
    [424, "longest-repeating-character-replacement", "Longest Repeating Character Replacement", "medium"],
    [567, "permutation-in-string", "Permutation In String", "medium"],
    [76, "minimum-window-substring", "Minimum Window Substring", "hard"],
    [239, "sliding-window-maximum", "Sliding Window Maximum", "hard"]
  ],
  stack: [
    [20, "valid-parentheses", "Valid Parentheses", "easy"],
    [155, "min-stack", "Min Stack", "medium"],
    [150, "evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation", "medium"],
    [739, "daily-temperatures", "Daily Temperatures", "medium"],
    [853, "car-fleet", "Car Fleet", "medium"],
    [84, "largest-rectangle-in-histogram", "Largest Rectangle In Histogram", "hard"]
  ],
  "binary-search": [
    [704, "binary-search", "Binary Search", "easy"],
    [74, "search-a-2d-matrix", "Search a 2D Matrix", "medium"],
    [875, "koko-eating-bananas", "Koko Eating Bananas", "medium"],
    [153, "find-minimum-in-rotated-sorted-array", "Find Minimum In Rotated Sorted Array", "medium"],
    [33, "search-in-rotated-sorted-array", "Search In Rotated Sorted Array", "medium"],
    [981, "time-based-key-value-store", "Time Based Key Value Store", "medium"],
    [4, "median-of-two-sorted-arrays", "Median of Two Sorted Arrays", "hard"]
  ],
  "linked-list": [
    [206, "reverse-linked-list", "Reverse Linked List", "easy"],
    [21, "merge-two-sorted-lists", "Merge Two Sorted Lists", "easy"],
    [141, "linked-list-cycle", "Linked List Cycle", "easy"],
    [143, "reorder-list", "Reorder List", "medium"],
    [19, "remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "medium"],
    [138, "copy-list-with-random-pointer", "Copy List With Random Pointer", "medium"],
    [2, "add-two-numbers", "Add Two Numbers", "medium"],
    [287, "find-the-duplicate-number", "Find The Duplicate Number", "medium"],
    [146, "lru-cache", "LRU Cache", "medium"],
    [23, "merge-k-sorted-lists", "Merge K Sorted Lists", "hard"],
    [25, "reverse-nodes-in-k-group", "Reverse Nodes In K Group", "hard"]
  ],
  trees: [
    [226, "invert-binary-tree", "Invert Binary Tree", "easy"],
    [104, "maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "easy"],
    [543, "diameter-of-binary-tree", "Diameter of Binary Tree", "easy"],
    [110, "balanced-binary-tree", "Balanced Binary Tree", "easy"],
    [100, "same-tree", "Same Tree", "easy"],
    [572, "subtree-of-another-tree", "Subtree of Another Tree", "easy"],
    [235, "lowest-common-ancestor-of-a-binary-search-tree", "Lowest Common Ancestor of a Binary Search Tree", "medium"],
    [102, "binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "medium"],
    [199, "binary-tree-right-side-view", "Binary Tree Right Side View", "medium"],
    [1448, "count-good-nodes-in-binary-tree", "Count Good Nodes In Binary Tree", "medium"],
    [98, "validate-binary-search-tree", "Validate Binary Search Tree", "medium"],
    [230, "kth-smallest-element-in-a-bst", "Kth Smallest Element In a Bst", "medium"],
    [105, "construct-binary-tree-from-preorder-and-inorder-traversal", "Construct Binary Tree From Preorder And Inorder Traversal", "medium"],
    [124, "binary-tree-maximum-path-sum", "Binary Tree Maximum Path Sum", "hard"],
    [297, "serialize-and-deserialize-binary-tree", "Serialize And Deserialize Binary Tree", "hard"]
  ],
  "heap-priority-queue": [
    [703, "kth-largest-element-in-a-stream", "Kth Largest Element In a Stream", "easy"],
    [1046, "last-stone-weight", "Last Stone Weight", "easy"],
    [973, "k-closest-points-to-origin", "K Closest Points to Origin", "medium"],
    [215, "kth-largest-element-in-an-array", "Kth Largest Element In An Array", "medium"],
    [621, "task-scheduler", "Task Scheduler", "medium"],
    [355, "design-twitter", "Design Twitter", "medium"],
    [295, "find-median-from-data-stream", "Find Median From Data Stream", "hard"]
  ],
  backtracking: [
    [78, "subsets", "Subsets", "medium"],
    [39, "combination-sum", "Combination Sum", "medium"],
    [40, "combination-sum-ii", "Combination Sum II", "medium"],
    [46, "permutations", "Permutations", "medium"],
    [90, "subsets-ii", "Subsets II", "medium"],
    [22, "generate-parentheses", "Generate Parentheses", "medium"],
    [79, "word-search", "Word Search", "medium"],
    [131, "palindrome-partitioning", "Palindrome Partitioning", "medium"],
    [17, "letter-combinations-of-a-phone-number", "Letter Combinations of a Phone Number", "medium"],
    [51, "n-queens", "N Queens", "hard"]
  ],
  tries: [
    [208, "implement-trie-prefix-tree", "Implement Trie Prefix Tree", "medium"],
    [211, "design-add-and-search-words-data-structure", "Design Add And Search Words Data Structure", "medium"],
    [212, "word-search-ii", "Word Search II", "hard"]
  ],
  graphs: [
    [200, "number-of-islands", "Number of Islands", "medium"],
    [695, "max-area-of-island", "Max Area of Island", "medium"],
    [133, "clone-graph", "Clone Graph", "medium"],
    [286, "walls-and-gates", "Walls And Gates", "medium"],
    [994, "rotting-oranges", "Rotting Oranges", "medium"],
    [417, "pacific-atlantic-water-flow", "Pacific Atlantic Water Flow", "medium"],
    [130, "surrounded-regions", "Surrounded Regions", "medium"],
    [207, "course-schedule", "Course Schedule", "medium"],
    [210, "course-schedule-ii", "Course Schedule II", "medium"],
    [261, "graph-valid-tree", "Graph Valid Tree", "medium"],
    [323, "number-of-connected-components-in-an-undirected-graph", "Number of Connected Components In An Undirected Graph", "medium"],
    [684, "redundant-connection", "Redundant Connection", "medium"],
    [127, "word-ladder", "Word Ladder", "hard"]
  ],
  "advanced-graphs": [
    [743, "network-delay-time", "Network Delay Time", "medium"],
    [332, "reconstruct-itinerary", "Reconstruct Itinerary", "hard"],
    [1584, "min-cost-to-connect-all-points", "Min Cost to Connect All Points", "medium"],
    [778, "swim-in-rising-water", "Swim In Rising Water", "hard"],
    [269, "alien-dictionary", "Alien Dictionary", "hard"],
    [787, "cheapest-flights-within-k-stops", "Cheapest Flights Within K Stops", "medium"]
  ],
  "1d-dp": [
    [70, "climbing-stairs", "Climbing Stairs", "easy"],
    [746, "min-cost-climbing-stairs", "Min Cost Climbing Stairs", "easy"],
    [198, "house-robber", "House Robber", "medium"],
    [213, "house-robber-ii", "House Robber II", "medium"],
    [5, "longest-palindromic-substring", "Longest Palindromic Substring", "medium"],
    [647, "palindromic-substrings", "Palindromic Substrings", "medium"],
    [91, "decode-ways", "Decode Ways", "medium"],
    [322, "coin-change", "Coin Change", "medium"],
    [152, "maximum-product-subarray", "Maximum Product Subarray", "medium"],
    [139, "word-break", "Word Break", "medium"],
    [300, "longest-increasing-subsequence", "Longest Increasing Subsequence", "medium"],
    [416, "partition-equal-subset-sum", "Partition Equal Subset Sum", "medium"]
  ],
  "2d-dp": [
    [62, "unique-paths", "Unique Paths", "medium"],
    [1143, "longest-common-subsequence", "Longest Common Subsequence", "medium"],
    [309, "best-time-to-buy-and-sell-stock-with-cooldown", "Best Time to Buy And Sell Stock With Cooldown", "medium"],
    [518, "coin-change-ii", "Coin Change II", "medium"],
    [494, "target-sum", "Target Sum", "medium"],
    [97, "interleaving-string", "Interleaving String", "medium"],
    [329, "longest-increasing-path-in-a-matrix", "Longest Increasing Path In a Matrix", "hard"],
    [115, "distinct-subsequences", "Distinct Subsequences", "hard"],
    [72, "edit-distance", "Edit Distance", "medium"],
    [312, "burst-balloons", "Burst Balloons", "hard"],
    [10, "regular-expression-matching", "Regular Expression Matching", "hard"]
  ],
  greedy: [
    [53, "maximum-subarray", "Maximum Subarray", "medium"],
    [55, "jump-game", "Jump Game", "medium"],
    [45, "jump-game-ii", "Jump Game II", "medium"],
    [134, "gas-station", "Gas Station", "medium"],
    [846, "hand-of-straights", "Hand of Straights", "medium"],
    [1899, "merge-triplets-to-form-target-triplet", "Merge Triplets to Form Target Triplet", "medium"],
    [763, "partition-labels", "Partition Labels", "medium"],
    [678, "valid-parenthesis-string", "Valid Parenthesis String", "medium"]
  ],
  intervals: [
    [57, "insert-interval", "Insert Interval", "medium"],
    [56, "merge-intervals", "Merge Intervals", "medium"],
    [435, "non-overlapping-intervals", "Non Overlapping Intervals", "medium"],
    [252, "meeting-rooms", "Meeting Rooms", "easy"],
    [253, "meeting-rooms-ii", "Meeting Rooms II", "medium"],
    [1851, "minimum-interval-to-include-each-query", "Minimum Interval to Include Each Query", "hard"]
  ],
  "math-geometry": [
    [48, "rotate-image", "Rotate Image", "medium"],
    [54, "spiral-matrix", "Spiral Matrix", "medium"],
    [73, "set-matrix-zeroes", "Set Matrix Zeroes", "medium"],
    [202, "happy-number", "Happy Number", "easy"],
    [66, "plus-one", "Plus One", "easy"],
    [50, "powx-n", "Pow(x, n)", "medium"],
    [43, "multiply-strings", "Multiply Strings", "medium"],
    [2013, "detect-squares", "Detect Squares", "medium"]
  ],
  "bit-manipulation": [
    [136, "single-number", "Single Number", "easy"],
    [191, "number-of-1-bits", "Number of 1 Bits", "easy"],
    [338, "counting-bits", "Counting Bits", "easy"],
    [190, "reverse-bits", "Reverse Bits", "easy"],
    [268, "missing-number", "Missing Number", "easy"],
    [371, "sum-of-two-integers", "Sum of Two Integers", "medium"],
    [7, "reverse-integer", "Reverse Integer", "medium"]
  ]
};
