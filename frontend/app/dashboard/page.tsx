"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  StreakWidget,
  TopicMasteryCard,
  AssessmentRadarBarChart,
  EmptyDashboardState,
} from "@/components/dashboard";
import {
  getProgressSummary,
  getAssessmentsSummary,
} from "@/lib/apiClient";
import {
  ProgressSummaryResponse,
  AssessmentSummaryResponse,
} from "@/types/models";

const DEFAULT_PROGRESS: ProgressSummaryResponse = {
  total_topics: 14,
  not_started: 14,
  in_progress: 0,
  completed: 0,
  mastered: 0,
  completion_percentage: 0.0,
  current_streak: 0,
  streak: {
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    total_active_days: 0,
    total_problems_completed: 0,
    total_minutes_spent: 0,
  },
  topics: [],
};

const DEFAULT_ASSESSMENTS: AssessmentSummaryResponse = {
  comparisons: [],
  total_assessments: 0,
  average_pre_score: 0.0,
  average_post_score: 0.0,
  average_delta: 0.0,
};

export default function DashboardPage() {
  const [progress, setProgress] =
    useState<ProgressSummaryResponse>(DEFAULT_PROGRESS);
  const [assessments, setAssessments] =
    useState<AssessmentSummaryResponse>(DEFAULT_ASSESSMENTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [progData, assessData] = await Promise.all([
        getProgressSummary(),
        getAssessmentsSummary(),
      ]);
      setProgress(progData);
      setAssessments(assessData);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load dashboard metrics";
      setError(msg);
      setProgress(DEFAULT_PROGRESS);
      setAssessments(DEFAULT_ASSESSMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Refresh */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Learner Performance Analytics</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Personal Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your curriculum mastery, practice streaks, and assessment growth
            metrics.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Error notification banner if API is unreachable */}
      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-300">
          Backend metrics could not be loaded ({error}). Displaying local default state.
        </div>
      )}

      {/* Top Level Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Completion Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {progress.completion_percentage}%
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {progress.completed + progress.mastered} of {progress.total_topics}{" "}
            topics finished
          </p>
        </div>

        {/* Active Practice Streak */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Streak
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {progress.streak.current_streak}{" "}
            <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Best streak: {progress.streak.longest_streak} days
          </p>
        </div>

        {/* In Progress Topics */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Topics
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {progress.in_progress}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {progress.not_started} not yet started
          </p>
        </div>

        {/* Assessment Score Delta */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg Assessment Delta
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {assessments.average_delta > 0
              ? `+${assessments.average_delta}`
              : assessments.average_delta}{" "}
            <span className="text-sm font-normal text-slate-400">pts</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Pre: {assessments.average_pre_score} -&gt; Post:{" "}
            {assessments.average_post_score}
          </p>
        </div>
      </div>

      {/* Streak Banner Widget */}
      <StreakWidget streak={progress.streak} />

      {/* Assessment Visualizer: Radar & Bar Charts OR Empty State */}
      {assessments.comparisons.length > 0 ? (
        <AssessmentRadarBarChart comparisons={assessments.comparisons} />
      ) : (
        <EmptyDashboardState />
      )}

      {/* Topic Mastery Grid */}
      <TopicMasteryCard progress={progress} />
    </div>
  );
}
