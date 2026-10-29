"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  PlayCircle,
  Cpu,
  FileCode,
  ListTodo,
  CheckCircle2,
  Clock,
  Award,
  HelpCircle,
  Brackets,
  Hash,
  Binary,
  ArrowUpDown,
  Link2,
  ListOrdered,
  GitFork,
  Network,
  Zap,
  Share2,
  Type,
  Grid,
  Code2,
} from "lucide-react";
import { Topic, AssessmentRecord } from "@/types/models";

// Map topic icon slugs to dedicated Lucide icon components
const TOPIC_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  brackets: Brackets,
  hash: Hash,
  binary: Binary,
  "arrow-up-down": ArrowUpDown,
  link: Link2,
  layers: Layers,
  "list-ordered": ListOrdered,
  "git-fork": GitFork,
  network: Network,
  zap: Zap,
  "share-2": Share2,
  type: Type,
  grid: Grid,
  cpu: Cpu,
};

function renderTopicIcon(iconSlug?: string | null) {
  if (!iconSlug) {
    return <Code2 className="h-5 w-5 text-indigo-400" />;
  }
  const IconComponent = TOPIC_ICON_MAP[iconSlug.toLowerCase()] || Code2;
  return <IconComponent className="h-5 w-5 text-indigo-400" />;
}

interface TopicHeaderProps {
  topic: Topic;
  preAssessment?: AssessmentRecord | null;
  activeTab?: "overview" | "demo" | "project" | "patterns" | "problems";
  onOpenDiagnostic?: () => void;
}

export const TopicHeader: React.FC<TopicHeaderProps> = ({
  topic,
  preAssessment,
  activeTab = "overview",
  onOpenDiagnostic,
}) => {
  // Format difficulty stars based on difficulty order
  const difficultyStars = "⭐".repeat(Math.max(1, Math.min(5, topic.difficulty_order)));

  // Calculate baseline average if preAssessment exists
  const baselineAverage = preAssessment
    ? Number(
        (
          (preAssessment.conceptual_score +
            preAssessment.pattern_recognition_score +
            preAssessment.complexity_accuracy_score) /
          3
        ).toFixed(1)
      )
    : null;

  // Status badge styling
  const statusConfigMap = {
    not_started: {
      label: "Not Started",
      className: "border-slate-700 bg-slate-800 text-slate-300",
      icon: Clock,
    },
    in_progress: {
      label: "In Progress",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      icon: Sparkles,
    },
    completed: {
      label: "Completed",
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      icon: CheckCircle2,
    },
    mastered: {
      label: "Mastered",
      className: "border-purple-500/30 bg-purple-500/10 text-purple-400",
      icon: Award,
    },
  };

  const statusConfig =
    statusConfigMap[topic.status as keyof typeof statusConfigMap] ||
    statusConfigMap.not_started;

  const StatusIcon = statusConfig.icon;

  const navTabs = [
    {
      id: "overview",
      label: "Overview",
      href: `/topics/${topic.slug}`,
      icon: Layers,
    },
    {
      id: "demo",
      label: "Interactive Visualizer",
      href: `/topics/${topic.slug}/demo`,
      icon: PlayCircle,
    },
    {
      id: "project",
      label: "Dedicated Mini-App",
      href: `/topics/${topic.slug}/project`,
      icon: Cpu,
    },
    {
      id: "patterns",
      label: "Pattern Cheat Sheet",
      href: `/topics/${topic.slug}#patterns`,
      icon: FileCode,
    },
    {
      id: "problems",
      label: "Curated Problems",
      href: `/topics/${topic.slug}/problems`,
      icon: ListTodo,
    },
  ];

  return (
    <div className="space-y-6 border-b border-slate-800 pb-6">
      {/* Back CTA */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Topic Hub</span>
        </Link>

        {preAssessment && onOpenDiagnostic && (
          <button
            onClick={onOpenDiagnostic}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Review Diagnostic Grill</span>
          </button>
        )}
      </div>

      {/* Main Topic Info */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 shadow-sm">
              {renderTopicIcon(topic.icon)}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {topic.title}
            </h1>
            <span
              className="inline-flex items-center text-xs text-amber-400"
              title={`Difficulty: ${difficultyStars}`}
            >
              {difficultyStars}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.className}`}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.label}</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl">
            {topic.description}
          </p>
        </div>

        {/* Baseline Assessment Score Pill */}
        {baselineAverage !== null ? (
          <div className="flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-right">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                Baseline Diagnostic
              </div>
              <div className="text-xl font-bold text-white">
                {baselineAverage} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Concept: {preAssessment?.conceptual_score} | Pattern:{" "}
                {preAssessment?.pattern_recognition_score} | Complex:{" "}
                {preAssessment?.complexity_accuracy_score}
              </div>
            </div>
            <Award className="h-6 w-6 text-indigo-400 shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-300">
              <span className="font-semibold">Diagnostic Required:</span> Take the
              3-question grill to unlock coding modules.
            </div>
          </div>
        )}
      </div>

      {/* 5-View Subnavigation Tabs */}
      <nav className="flex space-x-1 overflow-x-auto border-t border-slate-800/80 pt-4 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
