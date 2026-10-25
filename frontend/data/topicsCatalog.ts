import { Topic } from "@/types/models";

/**
 * Static catalog metadata for all 14 DSA curriculum topics.
 * Serves as an offline fallback and instant metadata registry.
 */
export const TOPICS_CATALOG: Record<string, Topic> = {
  "arrays-and-strings": {
    id: 1,
    slug: "arrays-and-strings",
    title: "Arrays & Strings",
    description:
      "Master fundamental contiguous memory techniques including sliding window, two pointers, prefix sums, and Kadane's algorithm.",
    difficulty_order: 1,
    icon: "brackets",
    key_patterns: [
      "Sliding Window",
      "Two Pointers",
      "Prefix Sums",
      "Kadane's Algorithm",
    ],
    status: "not_started",
  },
  "hashing-and-sets": {
    id: 2,
    slug: "hashing-and-sets",
    title: "Hashing & Sets",
    description:
      "Explore constant-time lookups, frequency maps, anagram detection, collision handling, and cache eviction patterns.",
    difficulty_order: 2,
    icon: "hash",
    key_patterns: [
      "Frequency Maps",
      "Anagram Detection",
      "Two-Sum Pattern",
      "Bucket Collisions",
    ],
    status: "not_started",
  },
  "binary-search": {
    id: 3,
    slug: "binary-search",
    title: "Binary Search",
    description:
      "Halve your search space efficiently with boundary condition hunting, rotated arrays, and search-on-answer patterns.",
    difficulty_order: 3,
    icon: "binary",
    key_patterns: [
      "Search on Answer",
      "Rotated Arrays",
      "Search Space Reduction",
      "Upper/Lower Bounds",
    ],
    status: "not_started",
  },
  "sorting-and-searching": {
    id: 4,
    slug: "sorting-and-searching",
    title: "Sorting & Searching",
    description:
      "Understand comparative divide-and-conquer, partition pivots, merge sort applications, and quickselect.",
    difficulty_order: 4,
    icon: "arrow-up-down",
    key_patterns: [
      "Merge Sort",
      "Quickselect",
      "Partition Pivots",
      "Custom Comparators",
    ],
    status: "not_started",
  },
  "linked-lists": {
    id: 5,
    slug: "linked-lists",
    title: "Linked Lists",
    description:
      "Manipulate node pointers, detect cycles with fast/slow pointers, and reverse linear chains in-place.",
    difficulty_order: 5,
    icon: "link",
    key_patterns: [
      "Fast & Slow Pointers",
      "In-Place Reversal",
      "Merge Patterns",
      "Cycle Detection",
    ],
    status: "not_started",
  },
  "stacks-and-queues": {
    id: 6,
    slug: "stacks-and-queues",
    title: "Stacks & Queues",
    description:
      "Manage LIFO and FIFO execution pipelines, monotonic boundaries, and bracket linting expressions.",
    difficulty_order: 6,
    icon: "layers",
    key_patterns: [
      "Monotonic Stack",
      "Next Greater Element",
      "BFS Queues",
      "Parentheses Validation",
    ],
    status: "not_started",
  },
  "heaps-and-priority-queues": {
    id: 7,
    slug: "heaps-and-priority-queues",
    title: "Heaps & Priority Queues",
    description:
      "Prioritize dynamic streaming data, extract extremes in logarithmic time, and balance two heaps.",
    difficulty_order: 7,
    icon: "list-ordered",
    key_patterns: [
      "Top-K Elements",
      "Merge K Sorted",
      "Median Finding",
      "Task Scheduling",
    ],
    status: "not_started",
  },
  "recursion-and-backtracking": {
    id: 8,
    slug: "recursion-and-backtracking",
    title: "Recursion & Backtracking",
    description:
      "Explore combinatorial state trees, branch pruning, constraint satisfaction, and exhaustive search spaces.",
    difficulty_order: 8,
    icon: "git-fork",
    key_patterns: [
      "Permutations",
      "Subsets",
      "N-Queens",
      "Pruning & Constraints",
    ],
    status: "not_started",
  },
  "trees-and-bsts": {
    id: 9,
    slug: "trees-and-bsts",
    title: "Trees & BSTs",
    description:
      "Navigate hierarchical structures with recursive DFS, level-order BFS, and lowest common ancestors.",
    difficulty_order: 9,
    icon: "network",
    key_patterns: [
      "DFS (Pre/In/Post)",
      "BFS Level Order",
      "Lowest Common Ancestor",
      "Tree Serialization",
    ],
    status: "not_started",
  },
  "greedy-algorithms": {
    id: 10,
    slug: "greedy-algorithms",
    title: "Greedy Algorithms",
    description:
      "Make locally optimal choices for global solutions in interval scheduling, Huffman coding, and activity selection.",
    difficulty_order: 10,
    icon: "zap",
    key_patterns: [
      "Interval Scheduling",
      "Huffman Coding",
      "Activity Selection",
      "Gas Station Pattern",
    ],
    status: "not_started",
  },
  graphs: {
    id: 11,
    slug: "graphs",
    title: "Graphs",
    description:
      "Model complex relationships and networks with traversal, topological sorting, shortest paths, and disjoint sets.",
    difficulty_order: 11,
    icon: "share-2",
    key_patterns: [
      "BFS / DFS",
      "Topological Sort",
      "Dijkstra's Algorithm",
      "Union-Find",
      "Cycle Detection",
    ],
    status: "not_started",
  },
  "tries-and-string-algorithms": {
    id: 12,
    slug: "tries-and-string-algorithms",
    title: "Tries & String Algorithms",
    description:
      "Accelerate prefix queries, predictive autocomplete suggestions, and substring pattern search algorithms.",
    difficulty_order: 12,
    icon: "type",
    key_patterns: [
      "Prefix Matching",
      "KMP Algorithm",
      "Rabin-Karp",
      "Autocomplete Lookup",
    ],
    status: "not_started",
  },
  "dynamic-programming": {
    id: 13,
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    description:
      "Decompose complex optimal substructure problems using 1D/2D memoization grids, knapsack variants, and state transitions.",
    difficulty_order: 13,
    icon: "grid",
    key_patterns: [
      "1D State Transitions",
      "2D Memoization",
      "0/1 Knapsack",
      "Longest Common Subsequence",
      "Interval DP",
    ],
    status: "not_started",
  },
  "bit-manipulation": {
    id: 14,
    slug: "bit-manipulation",
    title: "Bit Manipulation",
    description:
      "Leverage register-level bitwise operations, XOR cancellation properties, power of 2 tricks, and compact bitmasks.",
    difficulty_order: 14,
    icon: "cpu",
    key_patterns: [
      "Bitmasking",
      "XOR Cancellation",
      "Power of Two",
      "Bit Counting",
    ],
    status: "not_started",
  },
};
