"use client";

import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Inbox, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrayBarNode } from "./ArrayBarNode";
import { PointerBadge } from "./PointerBadge";
import { SlidingWindowBox } from "./SlidingWindowBox";
import {
  getHighlightForIndex,
  type LinearCanvasProps,
  type SlidingWindowState,
} from "@/types/canvas";

export const LinearCanvas: React.FC<LinearCanvasProps<SlidingWindowState>> = ({
  frame,
  items: explicitItems,
  leftPointer: explicitLeft,
  rightPointer: explicitRight,
  highlights: explicitHighlights,
  title,
  emptyMessage = "No array elements to display. Execute an algorithm to visualize steps.",
  itemWidth = 64,
  gap = 12,
  className,
  onItemClick,
}) => {
  // 1. Resolve array items from props or frame state
  const items: (number | string)[] = useMemo(() => {
    if (explicitItems && explicitItems.length > 0) {
      return explicitItems;
    }
    if (frame?.state) {
      if (Array.isArray(frame.state.nums)) {
        return frame.state.nums;
      }
      if (Array.isArray(frame.state.array)) {
        return frame.state.array;
      }
    }
    return [];
  }, [explicitItems, frame]);

  // 2. Resolve pointer indices
  const leftIndex: number | null = useMemo(() => {
    if (explicitLeft !== undefined) return explicitLeft;
    if (typeof frame?.pointers?.left === "number") return frame.pointers.left;
    return null;
  }, [explicitLeft, frame?.pointers]);

  const rightIndex: number | null = useMemo(() => {
    if (explicitRight !== undefined) return explicitRight;
    if (typeof frame?.pointers?.right === "number") return frame.pointers.right;
    return null;
  }, [explicitRight, frame?.pointers]);

  // 3. Resolve highlights
  const highlights = useMemo(() => {
    return explicitHighlights ?? frame?.highlights ?? [];
  }, [explicitHighlights, frame?.highlights]);

  // 4. Determine current window maximum index if present in state or highlights
  const windowMaxIndex: number | null = useMemo(() => {
    // Check if highlight explicitly tags a window_max
    const maxHighlight = highlights.find(
      (h) => h.color === "success" || h.label === "window_max"
    );
    if (maxHighlight && maxHighlight.indices.length > 0) {
      const idx = maxHighlight.indices[0];
      return typeof idx === "number" ? idx : null;
    }
    // Check if deque_indices[0] exists in state
    if (
      frame?.state?.deque_indices &&
      Array.isArray(frame.state.deque_indices) &&
      frame.state.deque_indices.length > 0
    ) {
      return frame.state.deque_indices[0];
    }
    return null;
  }, [highlights, frame?.state?.deque_indices]);

  /* =========================================================================
   * Arbitrary Multi-Pointer Resolution
   * -------------------------------------------------------------------------
   * Resolves canonical `left` and `right` sliding window pointers alongside
   * any arbitrary multi-pointer structures in `frame.pointers` (e.g. `mid`,
   * `slow`, `fast`, `pivot`, `cur`, `i`, `j`) with contextual color coding.
   * ========================================================================= */
  const pointerMapByIndex = useMemo(() => {
    type PointerColor = "primary" | "secondary" | "warning" | "success" | "danger" | "default";

    const POINTER_METRICS: Record<string, { label: string; color: PointerColor }> = {
      left: { label: "L", color: "primary" },
      right: { label: "R", color: "secondary" },
      mid: { label: "M", color: "warning" },
      middle: { label: "M", color: "warning" },
      slow: { label: "S", color: "success" },
      fast: { label: "F", color: "danger" },
      pivot: { label: "P", color: "warning" },
      cur: { label: "C", color: "primary" },
      curr: { label: "C", color: "primary" },
      current: { label: "C", color: "primary" },
      next: { label: "N", color: "secondary" },
      target: { label: "T", color: "success" },
      i: { label: "i", color: "primary" },
      j: { label: "j", color: "secondary" },
      k: { label: "k", color: "warning" },
    };

    const map = new Map<
      number,
      Array<{ label: string; name: string; color: PointerColor }>
    >();

    const addPointer = (
      idx: number | null | undefined,
      label: string,
      name: string,
      color: PointerColor
    ) => {
      if (idx === null || idx === undefined || idx < 0 || idx >= items.length) return;
      const list = map.get(idx) ?? [];
      list.push({ label, name, color });
      map.set(idx, list);
    };

    // Primary & secondary canonical pointers:
    addPointer(leftIndex, "L", "left", "primary");
    addPointer(rightIndex, "R", "right", "secondary");

    // Scan for any additional arbitrary pointers defined in the frame
    if (frame?.pointers) {
      for (const [key, val] of Object.entries(frame.pointers)) {
        if (key !== "left" && key !== "right" && typeof val === "number") {
          const lower = key.toLowerCase();
          const meta = POINTER_METRICS[lower] ?? {
            label: key.slice(0, 1).toUpperCase(),
            color: "warning",
          };
          addPointer(val, meta.label, key, meta.color);
        }
      }
    }

    return map;
  }, [leftIndex, rightIndex, items.length, frame?.pointers]);

  /* =========================================================================
   * Empty Array Canvas Fallback View
   * ========================================================================= */
  if (items.length === 0) {
    return (
      <div
        data-testid="linear-canvas-empty"
        className={cn(
          "flex min-h-[380px] h-[380px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center backdrop-blur-sm",
          className
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 mb-3 shadow-inner">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">
          Empty Array Canvas
        </h4>
        <p className="mt-1 max-w-sm text-xs text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      data-testid="linear-canvas-container"
      className={cn(
        "flex min-h-[380px] h-[380px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md",
        className
      )}
    >
      {/* Canvas Header / Metadata bar */}
      <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {title ?? "Linear Array Canvas"}
          </span>
          <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-mono text-slate-400">
            N = {items.length}
          </span>
        </div>

        {frame?.phase && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-500">Phase:</span>
            <span className="font-mono font-medium text-slate-200 uppercase">
              {frame.phase}
            </span>
          </div>
        )}
      </div>

      {/* Horizontal Viewport with Scroll Fallback (Locked vertical dimension) */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-x-auto py-2 custom-scrollbar">
        <div className="mx-auto flex w-fit flex-col items-center justify-center px-4">
          {/* Track Layer (Cards + Bounding Box) */}
          <div className="relative flex items-center" style={{ gap: `${gap}px` }}>
            {/* Animated Sliding Window Bounding Box */}
            <SlidingWindowBox
              leftIndex={leftIndex}
              rightIndex={rightIndex}
              itemWidth={itemWidth}
              gap={gap}
            />

            {/* Array Elements Track */}
            {items.map((val, idx) => {
              let hl = null;
              try {
                hl = getHighlightForIndex(idx, highlights);
              } catch {
                hl = null;
              }
              const isMax = idx === windowMaxIndex;
              const isMember =
                leftIndex !== null &&
                rightIndex !== null &&
                idx >= leftIndex &&
                idx <= rightIndex;

              return (
                <ArrayBarNode
                  key={`node-${idx}`}
                  index={idx}
                  value={val}
                  highlightColor={hl?.color}
                  highlightLabel={hl?.label}
                  isWindowMax={isMax}
                  isWindowMember={isMember}
                  onClick={onItemClick}
                />
              );
            })}
          </div>

          {/* Pointer Track (Directly below nodes, constant height to prevent jitter) */}
          <div
            className="mt-3 flex h-[76px] min-h-[76px] w-full items-start"
            style={{ gap: `${gap}px` }}
          >
            {items.map((_, idx) => {
              const activePointers = pointerMapByIndex.get(idx);
              return (
                <div
                  key={`pointer-col-${idx}`}
                  style={{ width: `${itemWidth}px` }}
                  className="flex h-full flex-col items-center justify-start gap-1"
                >
                  <AnimatePresence>
                    {activePointers &&
                      activePointers.map((ptr) => (
                        <PointerBadge
                          key={`badge-${ptr.label}-${idx}`}
                          label={ptr.label}
                          name={ptr.name}
                          index={idx}
                          color={ptr.color}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Step Explanation Banner (Constant height to prevent layout shifts) */}
      <div className="flex h-[52px] min-h-[52px] items-center rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 line-clamp-2">
          {frame?.step !== undefined ? (
            <>
              <span className="font-semibold text-indigo-400 shrink-0">
                Step {frame.step}:
              </span>
              <span className="font-normal text-slate-300">
                {frame.explanation || "No step description available."}
              </span>
            </>
          ) : (
            <span className="italic text-slate-500">
              Ready to step through algorithm execution.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
