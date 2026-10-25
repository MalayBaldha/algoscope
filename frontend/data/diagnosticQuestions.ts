/**
 * Diagnostic Grill Questions for Topic 1: Arrays & Strings.
 * Questions evaluate baseline proficiency across the 3 core PRD dimensions:
 * 1. Conceptual Understanding (0-10)
 * 2. Pattern Recognition (0-10)
 * 3. Complexity Analysis (0-10)
 */

import { AssessmentRecord } from "@/types/models";

export type AssessmentDimension =
  | "conceptual"
  | "pattern_recognition"
  | "complexity_analysis";

export interface DiagnosticOption {
  id: string;
  text: string;
  explanation?: string;
}

export interface DiagnosticQuestion {
  id: string;
  topicSlug: string;
  dimension: AssessmentDimension;
  dimensionLabel: string;
  prompt: string;
  codeSnippet?: string;
  options: DiagnosticOption[];
  correctOptionId: string;
  explanation: string;
}

export interface QuestionResultDetail {
  questionId: string;
  dimension: AssessmentDimension;
  dimensionLabel: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
}

export interface DiagnosticGrillResult {
  conceptual_score: number;
  pattern_recognition_score: number;
  complexity_accuracy_score: number;
  total_score: number;
  average_score: number;
  is_perfect: boolean;
  dimensionScores: {
    conceptual: number;
    pattern_recognition: number;
    complexity_analysis: number;
  };
  details: Record<string, QuestionResultDetail>;
}

export const ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "as-q1-conceptual",
    topicSlug: "arrays-and-strings",
    dimension: "conceptual",
    dimensionLabel: "Conceptual Understanding",
    prompt:
      "What is the foundational invariant governing a dynamic (variable-size) Sliding Window on contiguous subarray elements?",
    options: [
      {
        id: "opt-a",
        text: "Both left and right pointers must advance simultaneously at identical velocity to preserve a constant span.",
      },
      {
        id: "opt-b",
        text: "The right pointer expands the window to capture elements, while the left pointer advances monotonically only when the window's invariant condition is violated.",
      },
      {
        id: "opt-c",
        text: "The left pointer starts at index 0 and the right at index n-1, converging inward until they cross at the median element.",
      },
      {
        id: "opt-d",
        text: "The window resets back to index 0 whenever an invalid element is encountered to recompute state from scratch.",
      },
    ],
    correctOptionId: "opt-b",
    explanation:
      "A variable-size sliding window operates via monotonic expansion and contraction: the right pointer advances to discover new elements, while the left pointer shrinks the window whenever the window condition breaks. Neither pointer ever moves backward, guaranteeing linear amortized complexity.",
  },
  {
    id: "as-q2-pattern",
    topicSlug: "arrays-and-strings",
    dimension: "pattern_recognition",
    dimensionLabel: "Pattern Recognition",
    prompt:
      "Scenario: You are given an array of strictly positive integers and a target sum S. You must find the minimal length of a contiguous subarray whose sum is greater than or equal to S. Which algorithmic pattern is optimal?",
    options: [
      {
        id: "opt-a",
        text: "Monotonic Stack to search for the next greater element in linear time.",
      },
      {
        id: "opt-b",
        text: "Inward Two Pointers starting at 0 and n-1, shrinking inward based on array comparisons.",
      },
      {
        id: "opt-c",
        text: "Dynamic Sliding Window: expand right to accumulate running sum, then shrink left while running sum >= S to record minimum valid lengths.",
      },
      {
        id: "opt-d",
        text: "Prefix Sums with Hash Map to record cumulative sum frequencies for exact matching.",
      },
    ],
    correctOptionId: "opt-c",
    explanation:
      "Because all elements are positive, array sums are strictly monotonic with respect to window boundaries. A dynamic sliding window achieves O(N) time and O(1) space by expanding right to build sum >= S and contracting left as much as possible to minimize window size.",
  },
  {
    id: "as-q3-complexity",
    topicSlug: "arrays-and-strings",
    dimension: "complexity_analysis",
    dimensionLabel: "Complexity Analysis",
    prompt:
      "Consider the classic variable-size sliding window algorithm (e.g. Longest Substring Without Repeating Characters) on an input of size N with an alphabet of size K. What is the tightest upper bound on Time and Auxiliary Space complexity?",
    codeSnippet: `def longest_substring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
    options: [
      {
        id: "opt-a",
        text: "Time: O(N^2), Auxiliary Space: O(1) due to inner pointer jumps across iterations.",
      },
      {
        id: "opt-b",
        text: "Time: O(N), Auxiliary Space: O(min(N, K)) because each index is visited at most once per pointer and hash map entries are bounded by the alphabet.",
      },
      {
        id: "opt-c",
        text: "Time: O(N log N), Auxiliary Space: O(N) due to hash table lookups requiring binary search trees.",
      },
      {
        id: "opt-d",
        text: "Time: O(N), Auxiliary Space: O(N^2) because each window substring snapshot is retained in memory.",
      },
    ],
    correctOptionId: "opt-b",
    explanation:
      "Both pointers traverse the input monotonically from 0 to N-1 without retreating, yielding an amortized 2N operations = O(N) time. The hash map stores at most min(N, K) entries corresponding to distinct characters in the current window.",
  },
];

/**
 * Pure scoring algorithm for diagnostic grill answers.
 * Evaluates submitted responses against questions and maps results to 0-10 PRD dimensions.
 */
export function calculateGrillScores(
  answers: Record<string, string> = {},
  questions: DiagnosticQuestion[] = ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS
): DiagnosticGrillResult {
  const safeAnswers = answers && typeof answers === "object" ? answers : {};
  let conceptualPoints = 0;
  let patternPoints = 0;
  let complexityPoints = 0;

  const details: Record<string, QuestionResultDetail> = {};

  for (const q of questions) {
    const selected = safeAnswers[q.id] || "";
    const isCorrect = selected === q.correctOptionId;

    if (isCorrect) {
      if (q.dimension === "conceptual") {
        conceptualPoints += 10;
      } else if (q.dimension === "pattern_recognition") {
        patternPoints += 10;
      } else if (q.dimension === "complexity_analysis") {
        complexityPoints += 10;
      }
    }

    details[q.id] = {
      questionId: q.id,
      dimension: q.dimension,
      dimensionLabel: q.dimensionLabel,
      selectedOptionId: selected,
      correctOptionId: q.correctOptionId,
      isCorrect,
      explanation: q.explanation,
    };
  }

  const totalScore = conceptualPoints + patternPoints + complexityPoints;
  const averageScore = Number((totalScore / 3).toFixed(1));
  const isPerfect =
    conceptualPoints === 10 &&
    patternPoints === 10 &&
    complexityPoints === 10;

  return {
    conceptual_score: conceptualPoints,
    pattern_recognition_score: patternPoints,
    complexity_accuracy_score: complexityPoints,
    total_score: totalScore,
    average_score: averageScore,
    is_perfect: isPerfect,
    dimensionScores: {
      conceptual: conceptualPoints,
      pattern_recognition: patternPoints,
      complexity_analysis: complexityPoints,
    },
    details,
  };
}


/**
 * Safely extracts or calculates DiagnosticGrillResult from an existing AssessmentRecord.
 * Falls back to recorded conceptual_score, pattern_recognition_score, and complexity_accuracy_score
 * if questions_and_answers or answers map is missing or incomplete.
 */
export function extractGrillResultFromAssessment(
  assessment: AssessmentRecord | null | undefined,
  questions: DiagnosticQuestion[] = ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS
): DiagnosticGrillResult | null {
  if (!assessment) return null;

  const rawQA = assessment.questions_and_answers;
  const recordedAnswers: Record<string, string> =
    rawQA &&
    typeof rawQA === "object" &&
    "answers" in rawQA &&
    rawQA.answers &&
    typeof rawQA.answers === "object"
      ? (rawQA.answers as Record<string, string>)
      : {};

  // If recorded answers exist, compute via calculateGrillScores
  const hasAnswers = Object.keys(recordedAnswers).length > 0;
  if (hasAnswers) {
    return calculateGrillScores(recordedAnswers, questions);
  }

  // Fallback directly to recorded scores on the assessment entity
  const conceptual = assessment.conceptual_score ?? 0;
  const pattern = assessment.pattern_recognition_score ?? 0;
  const complexity = assessment.complexity_accuracy_score ?? 0;
  const total = conceptual + pattern + complexity;
  const average = Number((total / 3).toFixed(1));
  const isPerfect = conceptual >= 10 && pattern >= 10 && complexity >= 10;

  const details: Record<string, QuestionResultDetail> = {};
  for (const q of questions) {
    let score = 0;
    if (q.dimension === "conceptual") score = conceptual;
    else if (q.dimension === "pattern_recognition") score = pattern;
    else if (q.dimension === "complexity_analysis") score = complexity;

    const isCorrect = score >= 10;
    details[q.id] = {
      questionId: q.id,
      dimension: q.dimension,
      dimensionLabel: q.dimensionLabel,
      selectedOptionId: isCorrect ? q.correctOptionId : "",
      correctOptionId: q.correctOptionId,
      isCorrect,
      explanation: q.explanation,
    };
  }

  return {
    conceptual_score: conceptual,
    pattern_recognition_score: pattern,
    complexity_accuracy_score: complexity,
    total_score: total,
    average_score: average,
    is_perfect: isPerfect,
    dimensionScores: {
      conceptual,
      pattern_recognition: pattern,
      complexity_analysis: complexity,
    },
    details,
  };
}

/**
 * Topic registry mapping each topic slug to its diagnostic grill questions.
 */
export const DIAGNOSTIC_QUESTIONS_BY_TOPIC: Record<string, DiagnosticQuestion[]> = {
  "arrays-and-strings": ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS,
};

/**
 * Safely retrieves the diagnostic question suite for a specific topic slug.
 */
export function getDiagnosticQuestionsForTopic(
  topicSlug?: string | null
): DiagnosticQuestion[] {
  if (!topicSlug) return [];
  return DIAGNOSTIC_QUESTIONS_BY_TOPIC[topicSlug] || [];
}


