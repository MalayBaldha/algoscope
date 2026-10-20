"use client";

import React from "react";
import type { Frame } from "@/types/dsa";
import { useAlgorithmPlayback } from "@/hooks/useAlgorithmPlayback";
import { PlaybackControls } from "@/components/playback";

interface TwoSumState {
  array: number[];
  target: number;
  sum?: number;
  solution?: [number, number];
}

const MOCK_FRAMES: Frame<TwoSumState>[] = [
  {
    step: 0,
    phase: "initialize",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 16 },
    pointers: { left: 0, right: 7 },
    highlights: [{ indices: [0, 7], color: "primary", label: "pointers" }],
    explanation:
      "Initialize left pointer at index 0 (val: 1) and right pointer at index 7 (val: 15).",
  },
  {
    step: 1,
    phase: "compare",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 16 },
    pointers: { left: 0, right: 7 },
    highlights: [{ indices: [0, 7], color: "warning", label: "sum=16 > 14" }],
    explanation:
      "Sum 1 + 15 = 16 is greater than target 14. Decrement right pointer to reduce sum.",
  },
  {
    step: 2,
    phase: "shrink_window",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 12 },
    pointers: { left: 0, right: 6 },
    highlights: [{ indices: [0, 6], color: "primary" }],
    explanation:
      "Moved right pointer to index 6 (val: 11). Current sum: 1 + 11 = 12.",
  },
  {
    step: 3,
    phase: "compare",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 12 },
    pointers: { left: 0, right: 6 },
    highlights: [{ indices: [0, 6], color: "warning", label: "sum=12 < 14" }],
    explanation:
      "Sum 12 is less than target 14. Increment left pointer to increase sum.",
  },
  {
    step: 4,
    phase: "update",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 13 },
    pointers: { left: 1, right: 6 },
    highlights: [{ indices: [1, 6], color: "primary" }],
    explanation:
      "Moved left pointer to index 1 (val: 2). Current sum: 2 + 11 = 13.",
  },
  {
    step: 5,
    phase: "compare",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 13 },
    pointers: { left: 1, right: 6 },
    highlights: [{ indices: [1, 6], color: "warning", label: "sum=13 < 14" }],
    explanation:
      "Sum 13 is still less than target 14. Increment left pointer again.",
  },
  {
    step: 6,
    phase: "update",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 15 },
    pointers: { left: 2, right: 6 },
    highlights: [{ indices: [2, 6], color: "primary" }],
    explanation:
      "Moved left pointer to index 2 (val: 4). Current sum: 4 + 11 = 15.",
  },
  {
    step: 7,
    phase: "compare",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 15 },
    pointers: { left: 2, right: 6 },
    highlights: [{ indices: [2, 6], color: "warning", label: "sum=15 > 14" }],
    explanation:
      "Sum 15 is greater than target 14. Decrement right pointer.",
  },
  {
    step: 8,
    phase: "shrink_window",
    state: { array: [1, 2, 4, 6, 8, 9, 11, 15], target: 14, sum: 12 },
    pointers: { left: 2, right: 4 },
    highlights: [{ indices: [2, 4], color: "secondary" }],
    explanation:
      "Moved right pointer to index 4 (val: 8). Sum is 4 + 8 = 12 < 14. Increment left pointer.",
  },
  {
    step: 9,
    phase: "complete",
    state: {
      array: [1, 2, 4, 6, 8, 9, 11, 15],
      target: 14,
      sum: 14,
      solution: [3, 4],
    },
    pointers: { left: 3, right: 4 },
    highlights: [
      {
        indices: [3, 4],
        color: "success",
        label: "Target pair: 6 + 8 = 14",
      },
    ],
    explanation:
      "Target sum 14 found with indices 3 and 4 (values 6 and 8). Search complete!",
  },
];

export default function DemoPage() {
  const playback = useAlgorithmPlayback(MOCK_FRAMES, { initialSpeed: 1 });
  const { currentFrame } = playback;

  const currentArray = currentFrame?.state.array ?? [
    1, 2, 4, 6, 8, 9, 11, 15,
  ];
  const leftPointer = currentFrame?.pointers.left ?? null;
  const rightPointer = currentFrame?.pointers.right ?? null;

  const isHighlighted = (idx: number) => {
    if (!currentFrame?.highlights) return null;
    for (const h of currentFrame.highlights) {
      if (h.indices.includes(idx)) {
        return h.color;
      }
    }
    return null;
  };

  const getHighlightClass = (color: string | null) => {
    switch (color) {
      case "primary":
        return "border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/50";
      case "success":
        return "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/50";
      case "warning":
        return "border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/50";
      case "danger":
        return "border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/50";
      case "secondary":
        return "border-purple-500 bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/50";
      default:
        return "border-zinc-800 bg-zinc-900/80 text-zinc-200";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2 border-b border-zinc-800 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            AlgoScope Playback Engine Demo
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Two Pointers (Sorted Target Sum)
          </h1>
          <p className="text-sm text-zinc-400">
            Demonstrates deterministic frame rendering, timeline scrubbing, speed
            adjustment, and keyboard navigation.
          </p>
        </header>

        {/* Visual Array Canvas */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-inner backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between text-xs text-zinc-400">
            <span>Target: 14</span>
            <span>
              Current Sum: {currentFrame?.state.sum ?? "—"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 py-6">
            {currentArray.map((value, idx) => {
              const highlightColor = isHighlighted(idx);
              const isLeft = leftPointer === idx;
              const isRight = rightPointer === idx;

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  {/* Top Pointer Badge */}
                  <div className="h-5 text-[11px] font-mono font-semibold">
                    {isLeft && !isRight && (
                      <span className="text-blue-400 animate-pulse">L&darr;</span>
                    )}
                    {isRight && !isLeft && (
                      <span className="text-amber-400 animate-pulse">R&darr;</span>
                    )}
                    {isLeft && isRight && (
                      <span className="text-emerald-400 animate-pulse">LR&darr;</span>
                    )}
                  </div>

                  {/* Array Cell */}
                  <div
                    className={`flex h-16 w-14 items-center justify-center rounded-xl border text-lg font-bold font-mono transition-all duration-300 ${getHighlightClass(
                      highlightColor
                    )}`}
                  >
                    {value}
                  </div>

                  {/* Index Label */}
                  <span className="text-[11px] font-mono text-zinc-500">
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Playback Controls Toolbar */}
        <PlaybackControls playback={playback} />
      </div>
    </div>
  );
}
