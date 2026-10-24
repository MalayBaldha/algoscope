"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  CircleDashed,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ProgressSummaryResponse, TopicProgressSummary } from "@/types/models";

interface TopicMasteryCardProps {
  progress: ProgressSummaryResponse;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  mastered: {
    label: "Mastered",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  not_started: {
    label: "Not Started",
    bg: "bg-slate-800/40",
    text: "text-slate-400",
    border: "border-slate-700/40",
    icon: <CircleDashed className="h-3.5 w-3.5" />,
  },
};

export function TopicMasteryCard({ progress }: TopicMasteryCardProps) {
  const {
    total_topics,
    not_started,
    in_progress,
    completed,
    mastered,
    completion_percentage,
    topics,
  } = progress;

  // Segment widths for progress bar
  const masteredPct = total_topics > 0 ? (mastered / total_topics) * 100 : 0;
  const completedPct = total_topics > 0 ? (completed / total_topics) * 100 : 0;
  const inProgressPct =
    total_topics > 0 ? (in_progress / total_topics) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
      {/* Header and Progress Overview */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Curriculum Mastery</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {completion_percentage}% of {total_topics} core algorithmic topics completed
          </p>
        </div>

        {/* Status Count Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-300">
            {mastered} Mastered
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
            {completed} Completed
          </span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-300">
            {in_progress} In Progress
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-400">
            {not_started} Not Started
          </span>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="mt-6">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            style={{ width: `${masteredPct}%` }}
            className="bg-purple-500 transition-all duration-500"
            title={`Mastered: ${mastered}`}
          />
          <div
            style={{ width: `${completedPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Completed: ${completed}`}
          />
          <div
            style={{ width: `${inProgressPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`In Progress: ${in_progress}`}
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t: TopicProgressSummary) => {
          const cfg = statusConfig[t.status] || statusConfig.not_started;
          return (
            <Link
              key={t.topic_id}
              href={`/topics/${t.slug}`}
              className="group flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-4 transition hover:border-indigo-500/40 hover:bg-slate-900/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Topic #{t.difficulty_order}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                  {t.title}
                </h4>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs text-slate-400">
                <span>
                  {t.completed_problems} / {t.total_problems || "—"} problems
                </span>
                <span className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
