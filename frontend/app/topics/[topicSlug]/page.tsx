"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PlayCircle,
  Cpu,
  FileCode,
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
  RotateCcw,
} from "lucide-react";
import {
  TopicHeader,
  DiagnosticGrillModal,
  RealWorldInspiration,
  PatternCheatSheetGrid,
} from "@/components/topics";
import { getTopicBySlug, getTopicAssessment } from "@/lib/apiClient";
import {
  Topic,
  AssessmentRecord,
  AssessmentComparison,
} from "@/types/models";
import { TOPICS_CATALOG } from "@/data/topicsCatalog";

export default function TopicOverviewPage() {
  const params = useParams();
  const topicSlug = typeof params?.topicSlug === "string" ? params.topicSlug : "";

  const [topic, setTopic] = useState<Topic | null>(null);
  const [preAssessment, setPreAssessment] = useState<AssessmentRecord | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal review state for users who want to review or retake the grill
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const loadTopicData = useCallback(async () => {
    if (!topicSlug) return;
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      // Attempt to fetch topic and assessment concurrently
      let fetchedTopic: Topic | null = null;
      try {
        fetchedTopic = await getTopicBySlug(topicSlug);
      } catch (err: unknown) {
        // If the topic does not exist in backend or catalog, mark 404
        if (
          err instanceof Error &&
          (err.message.includes("not found") || err.message.includes("404"))
        ) {
          setNotFound(true);
          return;
        }

        // Fallback from centralized catalog (e.g. offline dev / SSR fallback)
        const catalogFallback = TOPICS_CATALOG[topicSlug];
        if (catalogFallback) {
          fetchedTopic = catalogFallback;
        } else {
          setNotFound(true);
          return;
        }
      }

      setTopic(fetchedTopic);

      // Fetch pre-assessment records if available
      try {
        const assessmentComparison: AssessmentComparison =
          await getTopicAssessment(topicSlug);
        if (assessmentComparison?.pre) {
          setPreAssessment(assessmentComparison.pre);
        } else {
          setPreAssessment(null);
        }
      } catch {
        // Safe default if assessment API returns empty or topic has no assessments yet
        setPreAssessment(null);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load topic details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [topicSlug]);

  useEffect(() => {
    loadTopicData();
  }, [loadTopicData]);

  // Callback when user submits diagnostic grill successfully
  const handleDiagnosticCompleted = (newAssessment: AssessmentRecord) => {
    setPreAssessment(newAssessment);
    setTopic((prev) => {
      if (!prev) return null;
      if (prev.status === "completed" || prev.status === "mastered") {
        return prev;
      }
      return { ...prev, status: "in_progress" };
    });
    setIsReviewModalOpen(false);
  };

  // 404 Topic Not Found State
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Topic Not Found
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          The requested topic slug <code>&apos;{topicSlug}&apos;</code> does not exist in
          the AlgoScope DSA curriculum.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
        >
          <span>Return to Topic Hub</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Loading Skeleton State
  if (loading && !topic) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-xs font-medium text-slate-400">
          Loading topic curriculum &amp; diagnostic status...
        </p>
      </div>
    );
  }

  // Error State with Retry CTA when topic fails to load
  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Unable to Load Topic
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          {error || "An unexpected error occurred while loading topic curriculum."}
        </p>
        <button
          onClick={loadTopicData}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const hasCompletedPreAssessment = Boolean(preAssessment);

  return (
    <div className="space-y-10 pb-20">
      {/* Top Topic Navigation Header */}
      <TopicHeader
        topic={topic}
        preAssessment={preAssessment}
        activeTab="overview"
        onOpenDiagnostic={() => setIsReviewModalOpen(true)}
      />

      {/* Network or Error Banner */}
      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-300">
          Curriculum metadata loaded with local defaults ({error}).
        </div>
      )}

      {/* FIRST-TIME VISITOR GATE: Show Diagnostic Grill Gate if Pre-Assessment Missing */}
      {!hasCompletedPreAssessment ? (
        <div className="space-y-8">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-900/80 p-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              <span>Diagnostic Assessment Gate</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Complete the Diagnostic Grill to Unlock Coding Views
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Before exploring the interactive visualizers and mini-apps, take 2
              minutes to answer 3 baseline questions. Your baseline score is
              recorded to measure your pattern growth!
            </p>
          </div>

          {/* Interactive Diagnostic Grill inline card */}
          <DiagnosticGrillModal
            topic={topic}
            existingAssessment={null}
            isModal={false}
            isOpen={true}
            onCompleted={handleDiagnosticCompleted}
          />
        </div>
      ) : (
        /* UNLOCKED FULL EDUCATIONAL HUB */
        <div className="space-y-10">
          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href={`/topics/${topic.slug}/demo`}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-indigo-500/50 hover:bg-slate-900/80"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                  Interactive Visualizer
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Step-by-step linear array canvas with Framer Motion pointer
                  cursors and window bounds.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400">
                <span>Launch Visualizer</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            <Link
              href={`/topics/${topic.slug}/project`}
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-purple-500/50 hover:bg-slate-900/80"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-purple-300 transition">
                  Traffic Anomaly Monitor
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Dedicated Mini-App: Real-time sliding window rate-limiter and
                  traffic surge detector.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400">
                <span>Open Mini-App</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            <Link
              href="#patterns"
              className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-emerald-500/50 hover:bg-slate-900/80"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition">
                  <FileCode className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-emerald-300 transition">
                  Pattern Cheat Sheet
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Detailed reference cards for Sliding Window, Two Pointers,
                  Prefix Sums, and Kadane&apos;s.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <span>View Full Cheat Sheet</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>

          {/* Section 1: Real-World Systems Inspiration (TCP Flow Control & Stream Processing) */}
          <RealWorldInspiration />

          {/* Section 2: Pattern Cheat Sheets Grid */}
          <div id="patterns">
            <PatternCheatSheetGrid
              topicSlug={topic.slug}
              topicTitle={topic.title}
            />
          </div>
        </div>
      )}

      {/* Review / Retake Modal Dialog if triggered by user */}
      {isReviewModalOpen && (
        <DiagnosticGrillModal
          topic={topic}
          existingAssessment={preAssessment}
          isModal={true}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onCompleted={handleDiagnosticCompleted}
        />
      )}
    </div>
  );
}
