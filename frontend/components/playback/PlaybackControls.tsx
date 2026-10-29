"use client";

import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
} from "lucide-react";
import type { PlaybackSpeed } from "@/types/dsa";
import type { useAlgorithmPlayback } from "@/hooks/useAlgorithmPlayback";
import { cn } from "@/lib/utils";

export interface PlaybackControlsProps {
  playback?: ReturnType<typeof useAlgorithmPlayback>;
  currentIndex?: number;
  totalSteps?: number;
  isPlaying?: boolean;
  speed?: PlaybackSpeed;
  explanation?: string;
  phase?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onScrub?: (index: number) => void;
  onSpeedChange?: (speed: PlaybackSpeed) => void;
  onReset?: () => void;
  className?: string;
}

const AVAILABLE_SPEEDS: PlaybackSpeed[] = [0.5, 1, 2];

export function PlaybackControls({
  playback,
  currentIndex: explicitIndex,
  totalSteps: explicitTotal,
  isPlaying: explicitIsPlaying,
  speed: explicitSpeed,
  explanation: explicitExplanation,
  phase: explicitPhase,
  onPlay: explicitOnPlay,
  onPause: explicitOnPause,
  onStepForward: explicitOnStepForward,
  onStepBackward: explicitOnStepBackward,
  onScrub: explicitOnScrub,
  onSpeedChange: explicitOnSpeedChange,
  onReset: explicitOnReset,
  className,
}: PlaybackControlsProps) {
  const currentIndex = explicitIndex ?? playback?.currentIndex ?? 0;
  const totalSteps = explicitTotal ?? playback?.totalSteps ?? 0;
  const isPlaying = explicitIsPlaying ?? playback?.isPlaying ?? false;
  const speed = explicitSpeed ?? playback?.speed ?? 1;
  const explanation =
    explicitExplanation ??
    playback?.currentFrame?.explanation ??
    "Ready to execute algorithm.";
  const phase = explicitPhase ?? playback?.currentFrame?.phase ?? "idle";

  const handlePlay = explicitOnPlay ?? playback?.play ?? (() => {});
  const handlePause = explicitOnPause ?? playback?.pause ?? (() => {});
  const handleStepForward =
    explicitOnStepForward ?? playback?.stepForward ?? (() => {});
  const handleStepBackward =
    explicitOnStepBackward ?? playback?.stepBackward ?? (() => {});
  const handleScrub = explicitOnScrub ?? playback?.scrubTo ?? (() => {});
  const handleSpeedChange =
    explicitOnSpeedChange ?? playback?.setSpeed ?? (() => {});
  const handleReset = explicitOnReset ?? playback?.reset ?? (() => {});

  const disabled = totalSteps <= 1;
  const isAtStart = currentIndex === 0;
  const isAtEnd = totalSteps > 0 && currentIndex >= totalSteps - 1;

  const getPhaseBadgeColor = (p: string) => {
    switch (p.toLowerCase()) {
      case "initialize":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "compare":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "swap":
      case "update":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "complete":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "shrink_window":
      case "danger":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-sm text-slate-100",
        className
      )}
    >
      {/* Frame explanation and phase banner */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider",
              getPhaseBadgeColor(phase)
            )}
          >
            {phase}
          </span>
          <p className="text-sm text-slate-300 truncate" title={explanation}>
            {explanation}
          </p>
        </div>
        <div className="shrink-0 font-mono text-xs text-slate-400">
          Step {totalSteps > 0 ? currentIndex + 1 : 0} / {totalSteps}
        </div>
      </div>

      {/* Range scrubber slider */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentIndex}
          disabled={disabled}
          onChange={(e) => handleScrub(Number(e.target.value))}
          aria-label="Timeline scrubber"
          aria-valuenow={currentIndex}
          aria-valuemin={0}
          aria-valuemax={Math.max(0, totalSteps - 1)}
          aria-valuetext={`Step ${totalSteps > 0 ? currentIndex + 1 : 0} of ${totalSteps}`}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-500 transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>

      {/* Main playback controls toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled || (isAtStart && !isPlaying)}
            aria-label="Reset to start"
            title="Reset"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Step Backward */}
          <button
            type="button"
            onClick={handleStepBackward}
            disabled={disabled || isAtStart}
            aria-label="Step backward"
            title="Step backward (←)"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={disabled}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            className={cn(
              "flex h-9 px-4 items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all shadow-sm",
              isPlaying
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            type="button"
            onClick={handleStepForward}
            disabled={disabled || isAtEnd}
            aria-label="Step forward"
            title="Step forward (→)"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Speed Selector and keyboard hints */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Gauge className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Speed:</span>
          </div>
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            {AVAILABLE_SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeedChange(s)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  speed === s
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
