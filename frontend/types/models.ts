/**
 * Data contracts and model types for topics, curriculum progress, streaks, and assessments.
 */

export type TopicStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "mastered";

export interface Topic {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty_order: number;
  icon: string;
  key_patterns: string[];
  status: TopicStatus;
}

export interface TopicProgressSummary {
  topic_id: number;
  slug: string;
  title: string;
  difficulty_order: number;
  status: TopicStatus;
  total_problems: number;
  completed_problems: number;
  time_spent_seconds: number;
}

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_active_days: number;
  total_problems_completed: number;
  total_minutes_spent: number;
}

export interface ProgressSummaryResponse {
  total_topics: number;
  not_started: number;
  in_progress: number;
  completed: number;
  mastered: number;
  completion_percentage: number;
  streak: StreakInfo;
  current_streak: number;
  topics: TopicProgressSummary[];
}

export interface ProgressUpdatePayload {
  topic_id: number;
  problem_id?: number | null;
  status?: TopicStatus;
  attempts?: number;
  hints_used?: number;
  time_spent_seconds?: number;
}

export interface AssessmentRecord {
  id: number;
  topic_id: number;
  assessment_type: "pre" | "post";
  conceptual_score: number;
  pattern_recognition_score: number;
  complexity_accuracy_score: number;
  questions_and_answers: Record<string, unknown>;
  created_at: string;
  topic_title?: string | null;
  topic_slug?: string | null;
}

export interface AssessmentScoreDelta {
  conceptual_delta: number;
  pattern_recognition_delta: number;
  complexity_accuracy_delta: number;
  total_delta: number;
  average_delta: number;
}

export interface AssessmentComparison {
  topic_id: number;
  topic_slug: string;
  topic_title: string;
  pre: AssessmentRecord | null;
  post: AssessmentRecord | null;
  delta: AssessmentScoreDelta | null;
}

export interface AssessmentSummaryResponse {
  comparisons: AssessmentComparison[];
  total_assessments: number;
  average_pre_score: number;
  average_post_score: number;
  average_delta: number;
}

export interface AssessmentCreatePayload {
  topic_id: number;
  assessment_type?: "pre" | "post";
  type?: "pre" | "post";
  conceptual_score?: number;
  pattern_recognition_score?: number;
  complexity_accuracy_score?: number;
  scores?: [number, number, number];
  questions_and_answers?: Record<string, unknown>;
}
