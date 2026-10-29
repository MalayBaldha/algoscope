"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculateWindowBounds } from "@/types/canvas";
import type { SlidingWindowBoxProps } from "@/types/canvas";

/**
 * Animated Framer Motion bounding box that smoothly glides and expands/contracts
 * across array elements representing the current active sliding window.
 */
export const SlidingWindowBox: React.FC<SlidingWindowBoxProps> = ({
  leftIndex,
  rightIndex,
  itemWidth = 64,
  gap = 12,
  label,
  className,
}) => {
  // 1. Calculate window bounding coordinates using calculateWindowBounds layout engine
  let bounds;
  try {
    bounds = calculateWindowBounds(leftIndex, rightIndex, itemWidth, gap);
  } catch {
    bounds = { leftOffset: 0, width: 0, visible: false, span: 0 };
  }

  return (
    <AnimatePresence>
      {bounds.visible && (
        <motion.div
          key="sliding-window-box"
          layoutId="sliding-window-box"
          initial={{ opacity: 0, scale: 0.95, x: bounds.leftOffset, width: bounds.width }}
          animate={{ opacity: 1, scale: 1, x: bounds.leftOffset, width: bounds.width }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
          data-testid="sliding-window-bounding-box"
          className={cn(
            "absolute -top-3 -bottom-3 z-10 rounded-2xl border-2 border-indigo-500/80 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/30 pointer-events-none",
            className
          )}
        >
          {/* Top-edge pill badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-indigo-400/50 bg-indigo-950/90 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-200 shadow-md backdrop-blur-sm">
            {label ?? `Window [${leftIndex}..${rightIndex}] (size: ${bounds.span})`}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
