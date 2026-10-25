/**
 * Pattern Cheat Sheet definitions and educational metadata for Topic 1: Arrays & Strings.
 * Covers Sliding Window, Two Pointers, Prefix Sums, and Kadane's Algorithm.
 */

export interface PatternCheatSheetCard {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  whenToUse: string[];
  keyInvariant: string;
  timeComplexity: string;
  spaceComplexity: string;
  commonPitfalls: string[];
  codeTemplate: string;
  visualCue: string;
}

export const ARRAYS_AND_STRINGS_PATTERNS: PatternCheatSheetCard[] = [
  {
    id: "sliding-window",
    name: "Sliding Window",
    category: "Contiguous Subarrays / Substrings",
    tagline: "Monotonic expansion and contraction over contiguous spans",
    description:
      "Maintains a valid subsegment bounded by [left, right] pointers. The right pointer advances to expand the window, while the left pointer advances to shrink the window whenever an invariant or constraint is broken.",
    whenToUse: [
      "Finding longest or shortest contiguous subarray satisfying a condition (sum, distinct items, budget)",
      "Fixed-size window queries (e.g. maximum average of all k-length subsegments)",
      "String anagram searches or substring frequency matching",
      "Problems where elements are positive or constraints exhibit monotonicity",
    ],
    keyInvariant:
      "Right expands greedily to include new elements; left contracts to restore validity. Pointers never retreat backward.",
    timeComplexity: "O(N) Amortized",
    spaceComplexity: "O(1) or O(K) Alphabet",
    commonPitfalls: [
      "Forgetting to update running state when shrinking left in the inner while loop.",
      "Off-by-one window length calculations (correct span is right - left + 1).",
      "Applying sliding window when negative numbers break running sum monotonicity.",
    ],
    codeTemplate: `def sliding_window(nums: list[int], target: int) -> int:
    left = 0
    curr_sum = 0
    best_len = float('inf')
    
    for right in range(len(nums)):
        curr_sum += nums[right]
        while curr_sum >= target:
            best_len = min(best_len, right - left + 1)
            curr_sum -= nums[left]
            left += 1
            
    return best_len if best_len != float('inf') else 0`,
    visualCue: "[ L — — — — R ]  --> expands R, shrinks L",
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    category: "Sorted Arrays / Inward Convergence",
    tagline: "Opposite-end convergence or fast/slow cursor traversal",
    description:
      "Processes array elements by moving two pointers based on sorted comparisons or partition criteria. Classic applications include inward convergence (Two Sum II, Container With Most Water) or fast/slow runners (Cycle detection, Duplicates).",
    whenToUse: [
      "Input array is already sorted or can be sorted without violating problem constraints",
      "Searching for pairs, triplets, or complement values with a target sum",
      "In-place array partitioning or element removal (e.g. Dutch National Flag, Remove Duplicates)",
      "Palindrome verification and character matching",
    ],
    keyInvariant:
      "Sorted ordering allows eliminating entire search sub-spaces in O(1) based on comparison with the target.",
    timeComplexity: "O(N) or O(N log N) if sorting",
    spaceComplexity: "O(1) Auxiliary",
    commonPitfalls: [
      "Applying inward pointers on unsorted inputs expecting monotonicity.",
      "Incorrect loop termination condition (left < right vs left <= right).",
      "Infinite loops if neither pointer advances during branch evaluation.",
    ],
    codeTemplate: `def two_sum_sorted(nums: list[int], target: int) -> list[int]:
    left, right = 0, len(nums) - 1
    
    while left < right:
        current = nums[left] + nums[right]
        if current == target:
            return [left, right]
        elif current < target:
            left += 1
        else:
            right -= 1
            
    return []`,
    visualCue: "L ->                  <- R  (Inward Convergence)",
  },
  {
    id: "prefix-sums",
    name: "Prefix Sums",
    category: "Range Queries & Hash Table Lookups",
    tagline: "Precomputing cumulative prefixes for O(1) range queries",
    description:
      "Constructs an auxiliary prefix array where prefix[i] stores the sum of elements from index 0 to i-1. Converts any range sum query sum(i..j) into prefix[j+1] - prefix[i] in constant time.",
    whenToUse: [
      "Multiple static range sum queries on an immutable array",
      "Counting contiguous subarrays whose sum equals K (paired with a Hash Map)",
      "Subarrays with equal number of 0s and 1s (transforming 0 to -1)",
      "2D matrix subgrid sum queries (2D prefix sum table)",
    ],
    keyInvariant:
      "Sum of subarray nums[i..j] = prefix[j + 1] - prefix[i]. Hash map tracks frequency of seen prefix sums.",
    timeComplexity: "O(N) Precomputation, O(1) Query",
    spaceComplexity: "O(N) or O(K) Map",
    commonPitfalls: [
      "Forgetting the base initialization prefix_counts[0] = 1 for subarrays starting at index 0.",
      "Off-by-one indices between original array and 1-indexed prefix table.",
      "Updating array elements without rebuilding or using a Fenwick/Segment tree.",
    ],
    codeTemplate: `def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    prefix_counts = {0: 1}
    curr_sum = 0
    total_matches = 0
    
    for x in nums:
        curr_sum += x
        target_prefix = curr_sum - k
        if target_prefix in prefix_counts:
            total_matches += prefix_counts[target_prefix]
        prefix_counts[curr_sum] = prefix_counts.get(curr_sum, 0) + 1
        
    return total_matches`,
    visualCue: "P[j] - P[i] = Sum(i..j) in O(1)",
  },
  {
    id: "kadanes-algorithm",
    name: "Kadane's Algorithm",
    category: "Maximum Subarray & Local DP",
    tagline: "Local vs. global optimum decision at every array position",
    description:
      "Computes the maximum subarray sum in a single linear pass by deciding at each element whether to extend the existing contiguous subarray or restart fresh with the current element.",
    whenToUse: [
      "Maximum or minimum contiguous subarray sum problems",
      "Maximum product subarray (tracking both current max and min)",
      "Circular subarray maximum sum (total_sum - min_subarray_sum)",
      "Best time to buy and sell stock (1 transaction)",
    ],
    keyInvariant:
      "current_max = max(num, current_max + num). A negative prefix is never beneficial to continue.",
    timeComplexity: "O(N) Single Pass",
    spaceComplexity: "O(1) Auxiliary",
    commonPitfalls: [
      "Initializing global max to 0 instead of -infinity or nums[0] (breaks arrays with all negative numbers).",
      "Mixing up subarray sum (contiguous) with subsequence sum (non-contiguous).",
      "Failing to handle empty array edge cases.",
    ],
    codeTemplate: `def max_subarray_sum(nums: list[int]) -> int:
    if not nums:
        return 0
    current_max = global_max = nums[0]
    
    for num in nums[1:]:
        current_max = max(num, current_max + num)
        global_max = max(global_max, current_max)
        
    return global_max`,
    visualCue: "curr_max = max(x, curr_max + x)",
  },
];

/**
 * Topic registry mapping each topic slug to its pattern cheat sheet cards.
 */
export const PATTERNS_BY_TOPIC: Record<string, PatternCheatSheetCard[]> = {
  "arrays-and-strings": ARRAYS_AND_STRINGS_PATTERNS,
};

/**
 * Safely retrieves the pattern cheat sheet cards for a specific topic slug.
 */
export function getPatternsForTopic(
  topicSlug?: string | null
): PatternCheatSheetCard[] {
  if (!topicSlug) return [];
  return PATTERNS_BY_TOPIC[topicSlug] || [];
}

