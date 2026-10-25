/**
 * API client methods for fetching progress, streak, and assessment metrics.
 */

import {
  AssessmentComparison,
  AssessmentCreatePayload,
  AssessmentRecord,
  AssessmentScoreDelta,
  AssessmentSummaryResponse,
  ProgressSummaryResponse,
  ProgressUpdatePayload,
  Topic,
} from "@/types/models";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Pure calculation function for score deltas between pre and post assessments.
 */
export function calculateScoreDelta(
  pre: AssessmentRecord | null,
  post: AssessmentRecord | null
): AssessmentScoreDelta | null {
  if (!pre || !post) {
    return null;
  }

  const conceptual_delta = post.conceptual_score - pre.conceptual_score;
  const pattern_recognition_delta =
    post.pattern_recognition_score - pre.pattern_recognition_score;
  const complexity_accuracy_delta =
    post.complexity_accuracy_score - pre.complexity_accuracy_score;
  const total_delta =
    conceptual_delta + pattern_recognition_delta + complexity_accuracy_delta;
  const average_delta = Number((total_delta / 3).toFixed(2));

  return {
    conceptual_delta,
    pattern_recognition_delta,
    complexity_accuracy_delta,
    total_delta,
    average_delta,
  };
}

/**
 * Safely computes average score across numbers without division by zero.
 */
export function calculateAverageScore(scores: number[]): number {
  if (!scores || scores.length === 0) {
    return 0;
  }
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / scores.length).toFixed(2));
}

/**
 * Fetch curriculum progress overview and streak information.
 */
export async function getProgressSummary(): Promise<ProgressSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/progress`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch progress: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Update user progress on a topic or problem.
 */
export async function updateProgress(
  payload: ProgressUpdatePayload
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update progress: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch all assessment comparisons and aggregate deltas.
 */
export async function getAssessmentsSummary(): Promise<AssessmentSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/assessments`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch assessments: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

/**
 * Fetch assessment comparison for a specific topic slug or id.
 */
export async function getTopicAssessment(
  topicIdOrSlug: string | number
): Promise<AssessmentComparison> {
  const res = await fetch(`${API_BASE_URL}/api/assessments/${topicIdOrSlug}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch topic assessment: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

/**
 * Submit pre or post assessment results.
 */
export async function recordAssessment(
  payload: AssessmentCreatePayload
): Promise<AssessmentRecord> {
  const res = await fetch(`${API_BASE_URL}/api/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to record assessment: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

/**
 * Fetch all topics with progress.
 */
export async function getTopics(): Promise<Topic[]> {
  const res = await fetch(`${API_BASE_URL}/api/topics`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch topics: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch a single topic by slug.
 */
export async function getTopicBySlug(slug: string): Promise<Topic> {
  const res = await fetch(`${API_BASE_URL}/api/topics/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Topic with slug '${slug}' not found`);
    }
    throw new Error(
      `Failed to fetch topic '${slug}': ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}
