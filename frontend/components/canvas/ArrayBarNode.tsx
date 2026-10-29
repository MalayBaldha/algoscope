"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ArrayBarNodeProps } from "@/types/canvas";
import type { HighlightColor } from "@/types/dsa";

const HIGHLIGHT_STYLES: Record<
  HighlightColor,
  {
    container: string;
    valueText: string;
    indexBadge: string;
    labelBadge: string;
  }
> = {
  primary: {
    container:
      "border-indigo-500/80 bg-indigo-950/40 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/40",
    valueText: "text-indigo-200 font-extrabold",
    indexBadge: "text-indigo-400 bg-indigo-900/50 border-indigo-700/50",
    labelBadge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  success: {
    container:
      "border-emerald-500/90 bg-emerald-950/50 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/60",
    valueText: "text-emerald-300 font-extrabold scale-110",
    indexBadge: "text-emerald-400 bg-emerald-900/60 border-emerald-600/50",
    labelBadge: "bg-emerald-500/25 text-emerald-300 border-emerald-400/50 font-bold",
  },
  warning: {
    container:
      "border-amber-500/80 bg-amber-950/40 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40",
    valueText: "text-amber-200 font-extrabold",
    indexBadge: "text-amber-400 bg-amber-900/50 border-amber-700/50",
    labelBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  danger: {
    container:
      "border-rose-500/80 bg-rose-950/40 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/40",
    valueText: "text-rose-200 font-extrabold",
    indexBadge: "text-rose-400 bg-rose-900/50 border-rose-700/50",
    labelBadge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  secondary: {
    container:
      "border-purple-500/80 bg-purple-950/40 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/40",
    valueText: "text-purple-200 font-extrabold",
    indexBadge: "text-purple-400 bg-purple-900/50 border-purple-700/50",
    labelBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
};

const DEFAULT_STYLES = {
  container:
    "border-zinc-800 bg-zinc-900/80 text-zinc-200 shadow-md hover:border-zinc-700",
  valueText: "text-zinc-100 font-bold",
  indexBadge: "text-zinc-500 bg-zinc-800/80 border-zinc-700/40",
  labelBadge: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export const ArrayBarNode: React.FC<ArrayBarNodeProps> = ({
  index,
  value,
  highlightColor,
  highlightLabel,
  isWindowMax,
  className,
  onClick,
}) => {
  const effectiveColor = isWindowMax ? "success" : highlightColor;
  const styles = effectiveColor ? HIGHLIGHT_STYLES[effectiveColor] : DEFAULT_STYLES;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      whileHover={onClick ? { y: -4, transition: { duration: 0.15 } } : undefined}
      onClick={() => onClick?.(index)}
      data-testid={`array-node-${index}`}
      className={cn(
        "relative flex w-16 h-24 flex-col items-center justify-between rounded-xl border p-2 backdrop-blur-sm transition-all select-none",
        styles.container,
        onClick && "cursor-pointer hover:shadow-lg",
        className
      )}
    >
      {/* Top Index Badge */}
      <div
        className={cn(
          "flex items-center justify-center rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-medium tracking-wider",
          styles.indexBadge
        )}
      >
        i:{index}
      </div>

      {/* Main Element Value */}
      <div
        className={cn(
          "flex flex-1 items-center justify-center text-xl tracking-tight transition-transform duration-200",
          styles.valueText
        )}
      >
        {value}
      </div>

      {/* Bottom Sub-label Badge if provided */}
      {highlightLabel && (
        <div
          className={cn(
            "max-w-full truncate rounded border px-1 py-0.5 text-[9px] uppercase tracking-wider font-semibold",
            styles.labelBadge
          )}
          title={highlightLabel}
        >
          {highlightLabel}
        </div>
      )}
    </motion.div>
  );
};
