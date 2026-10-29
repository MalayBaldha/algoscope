"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  AlertTriangle,
  Cpu,
  Layers,
  TrendingUp,
  Hash,
} from "lucide-react";
import { TopicHeader } from "@/components/topics";
import { LinearCanvas } from "@/components/canvas";
import { PlaybackControls } from "@/components/playback";
import { useAlgorithmPlayback } from "@/hooks/useAlgorithmPlayback";
import {
  getTopicBySlug,
  getTopicAssessment,
  executeSlidingWindow,
} from "@/lib/apiClient";
import { TOPICS_CATALOG } from "@/data/topicsCatalog";
import type { Topic, AssessmentRecord, AssessmentComparison } from "@/types/models";
import type { Frame } from "@/types/dsa";
import type { SlidingWindowState } from "@/types/canvas";

const PRESET_SCENARIOS = [
  {
    name: "LeetCode 239 Standard",
    array: [1, 3, -1, -3, 5, 3, 6, 7],
    k: 3,
  },
  {
    name: "Monotonic Decreasing",
    array: [9, 8, 7, 6, 5, 4, 3],
    k: 3,
  },
  {
    name: "Single Element Window (k=1)",
    array: [10, 20, 30, 40],
    k: 1,
  },
  {
    name: "Oscillating Values",
    array: [4, 2, 12, 3, 8, 9],
    k: 2,
  },
  {
    name: "Empty Array Edge Case",
    array: [],
    k: 1,
  },
];

export default function TopicAlgorithmDemoPage() {
  const params = useParams();
  const topicSlug =
    typeof params?.topicSlug === "string" ? params.topicSlug : "arrays-and-strings";

  // Topic and Assessment State
  const [topic, setTopic] = useState<Topic | null>(null);
  const [preAssessment, setPreAssessment] = useState<AssessmentRecord | null>(null);

  // Form input state
  const [arrayInput, setArrayInput] = useState<string>("1, 3, -1, -3, 5, 3, 6, 7");
  const [windowK, setWindowK] = useState<number>(3);
  const [kInput, setKInput] = useState<string>("3");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse input array
  const parsedArray = useMemo(() => {
    if (!arrayInput.trim()) return [];
    return arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((s) => Number(s))
      .filter((n) => !isNaN(n));
  }, [arrayInput]);

  const [frames, setFrames] = useState<Frame<SlidingWindowState>[]>([]);

  // Playback Hook
  const playback = useAlgorithmPlayback<SlidingWindowState>(frames, {
    initialSpeed: 1,
    autoPlay: false,
    enableKeyboardShortcuts: true,
  });

  // Load topic & assessment metadata
  useEffect(() => {
    let isMounted = true;

    async function loadMeta() {
      let t: Topic | null = null;
      try {
        t = await getTopicBySlug(topicSlug);
      } catch {
        t = TOPICS_CATALOG[topicSlug] ?? TOPICS_CATALOG["arrays-and-strings"];
      }

      if (isMounted) {
        setTopic(t);
      }

      try {
        const assessmentComp: AssessmentComparison = await getTopicAssessment(topicSlug);
        if (isMounted && assessmentComp?.pre) {
          setPreAssessment(assessmentComp.pre);
        }
      } catch {
        // Non-blocking
      }
    }

    loadMeta();
    return () => {
      isMounted = false;
    };
  }, [topicSlug]);

  // Execute algorithm handler via backend API
  const handleExecute = useCallback(
    async (numsToRun?: number[], kToRun?: number) => {
      setIsRunning(true);
      setErrorMessage(null);

      const targetNums = numsToRun ?? parsedArray;
      const parsedK = parseInt(kInput, 10);
      const targetK = Math.max(1, kToRun ?? (isNaN(parsedK) ? windowK : parsedK));

      try {
        const result = await executeSlidingWindow(targetNums, targetK);
        setFrames(result.frames);
        playback.reset();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Execution failed";
        setErrorMessage(msg);
      } finally {
        setIsRunning(false);
      }
    },
    [parsedArray, kInput, windowK, playback]
  );

  // Initial execution attempt on mount
  useEffect(() => {
    handleExecute([1, 3, -1, -3, 5, 3, 6, 7], 3);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setArrayInput(preset.array.join(", "));
    setWindowK(preset.k);
    setKInput(String(preset.k));
    handleExecute(preset.array, preset.k);
  };

  const currentFrame = playback.currentFrame;
  const currentDeque = currentFrame?.state?.deque_indices ?? [];
  const currentWindowSlice = currentFrame?.state?.window ?? [];
  const currentMaxValues = currentFrame?.state?.max_values ?? [];

  return (
    <div className="space-y-8 pb-16">
      {/* Topic Header Navigation */}
      {topic && (
        <TopicHeader
          topic={topic}
          preAssessment={preAssessment}
          activeTab="demo"
        />
      )}

      <div className="space-y-6">
        {/* Page Title & Context */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              Sliding Window Maximum Visualizer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Linear Archetype execution adapter: inspect window expansion, contraction,
              and monotonic deque ordering in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <Cpu className="h-3.5 w-3.5" />
              Live FastAPI Backend
            </span>
          </div>
        </div>

        {/* Backend Execution Error Banner with Retry */}
        {errorMessage && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleExecute()}
              className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-xs font-semibold hover:bg-rose-500/30 transition text-rose-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Controls Bar & Preset Selectors */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              Input Configuration
            </span>

            {/* Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Presets:</span>
              {PRESET_SCENARIOS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:border-indigo-500 hover:text-indigo-300 transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Array Elements (comma-separated integers)
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                placeholder="e.g. 1, 3, -1, -3, 5, 3, 6, 7"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Window Size (k)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 3"
                value={kInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setKInput(val);
                  if (val !== "") {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      setWindowK(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  const parsed = parseInt(kInput, 10);
                  const maxAllowed = parsedArray.length > 0 ? parsedArray.length : 100;
                  if (isNaN(parsed) || parsed < 1) {
                    setKInput("1");
                    setWindowK(1);
                  } else if (parsed > maxAllowed) {
                    setKInput(String(maxAllowed));
                    setWindowK(maxAllowed);
                  } else {
                    setKInput(String(parsed));
                    setWindowK(parsed);
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                onClick={() => handleExecute()}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 px-4 text-sm font-semibold text-white shadow-lg transition"
              >
                {isRunning ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-white" />
                )}
                <span>{isRunning ? "Running..." : "Execute"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Visualization Area: Linear Canvas Adapter */}
        <section aria-label="Algorithm Linear Canvas Visualizer">
          <LinearCanvas
            frame={currentFrame}
            items={parsedArray}
            title={`Sliding Window Maximum (k=${windowK})`}
            emptyMessage={
              errorMessage
                ? "Backend is unreachable. Please ensure the FastAPI server is running on http://localhost:8000."
                : "No numbers provided. Enter integers above or select a preset to visualize sliding window frames."
            }
          />
        </section>

        {/* Playback Controls Component */}
        <section aria-label="Timeline Playback Controls">
          <PlaybackControls playback={playback} />
        </section>

        {/* Algorithm State Inspector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Window Slice */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Current Window Elements
            </div>
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-sm">
              {currentWindowSlice.length > 0 ? (
                currentWindowSlice.map((val, i) => (
                  <span
                    key={`win-val-${i}`}
                    className="rounded-md border border-indigo-500/40 bg-indigo-950/60 px-2 py-0.5 text-indigo-200"
                  >
                    {val}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs italic">
                  Window not yet formed
                </span>
              )}
            </div>
          </div>

          {/* Monotonic Deque Index Inspector */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Hash className="h-3.5 w-3.5 text-amber-400" />
              Monotonic Deque (Indices)
            </div>
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-sm">
              {currentDeque.length > 0 ? (
                currentDeque.map((idx, i) => (
                  <span
                    key={`deque-idx-${idx}`}
                    className={`rounded-md border px-2 py-0.5 ${
                      i === 0
                        ? "border-emerald-500/60 bg-emerald-950/60 text-emerald-300 font-bold"
                        : "border-slate-700 bg-slate-800 text-slate-300"
                    }`}
                    title={i === 0 ? "Front of Deque (Current Window Max)" : "Candidate"}
                  >
                    i:{idx} (val:{parsedArray[idx] ?? "?"})
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs italic">Deque is empty</span>
              )}
            </div>
          </div>

          {/* Resulting Maximums Array */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Recorded Maximums
            </div>
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-sm">
              {currentMaxValues.length > 0 ? (
                currentMaxValues.map((val, i) => (
                  <span
                    key={`max-val-${i}`}
                    className="rounded-md border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-emerald-300 font-semibold"
                  >
                    {val}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs italic">None recorded yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Learning Exercise Callout Card */}
        <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/30 to-purple-950/20 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-200">
                Owner Learning Exercise — Custom Frame Reducer & Inspector
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Notice how the <code>LinearCanvas</code> and <code>useAlgorithmPlayback</code>{" "}
                hook translate backend <code>Frame</code> yields into reactive timeline UI.
                Try exploring <code>frontend/components/canvas/LinearCanvas.tsx</code> to
                implement custom multi-pointer tracking (e.g. <code>mid</code>, <code>fast</code>,{" "}
                <code>slow</code>) or dynamic window aggregate metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
