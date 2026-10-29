"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PointerBadgeProps } from "@/types/canvas";

export const PointerBadge: React.FC<PointerBadgeProps> = ({
  label,
  name,
  index,
  color = "primary",
  variant,
  className,
}) => {
  const effectiveVariant = variant || color;

  const colorStyles: Record<string, { badge: string; arrow: string }> = {
    primary: {
      badge: "border-indigo-500/60 bg-indigo-950/90 text-indigo-200 shadow-indigo-500/20",
      arrow: "text-indigo-400",
    },
    secondary: {
      badge: "border-purple-500/60 bg-purple-950/90 text-purple-200 shadow-purple-500/20",
      arrow: "text-purple-400",
    },
    success: {
      badge: "border-emerald-500/60 bg-emerald-950/90 text-emerald-200 shadow-emerald-500/20",
      arrow: "text-emerald-400",
    },
    warning: {
      badge: "border-amber-500/60 bg-amber-950/90 text-amber-200 shadow-amber-500/20",
      arrow: "text-amber-400",
    },
    danger: {
      badge: "border-rose-500/60 bg-rose-950/90 text-rose-200 shadow-rose-500/20",
      arrow: "text-rose-400",
    },
    default: {
      badge: "border-zinc-700 bg-zinc-900/90 text-zinc-300 shadow-zinc-800/20",
      arrow: "text-zinc-500",
    },
  };

  const currentStyle = colorStyles[effectiveVariant] || colorStyles.primary;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      data-testid={`pointer-badge-${label.toLowerCase()}`}
      className={cn(
        "flex flex-col items-center justify-start pointer-events-none select-none",
        className
      )}
    >
      <ChevronUp className={cn("h-4 w-4 -mb-1 animate-pulse", currentStyle.arrow)} />
      <div
        className={cn(
          "flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-mono font-semibold tracking-wider shadow-md backdrop-blur-sm",
          currentStyle.badge
        )}
      >
        <span>{label}</span>
        {name && <span className="opacity-75 text-[10px]">({name})</span>}
        {index !== null && index !== undefined && (
          <span className="opacity-90 text-[10px]">={index}</span>
        )}
      </div>
    </motion.div>
  );
};
