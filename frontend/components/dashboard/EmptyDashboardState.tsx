"use client";

import React from "react";
import Link from "next/link";
import { Compass, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function EmptyDashboardState() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-4 ring-indigo-500/10">
        <Compass className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
        No Assessments Completed Yet
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400 leading-relaxed">
        AlgoScope tracks your conceptual understanding, pattern discovery, and
        complexity analysis accuracy before and after each topic. Complete your
        first grill assessment to unlock your radar charts and score deltas.
      </p>

      {/* 3 Step Milestone preview */}
      <div className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3 text-left">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>1. Pre-Assessment</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Evaluate initial intuition across 3 core dimensions.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>2. Dual-Stack Code</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Implement Python algorithm yields and TypeScript visualizers.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>3. Measure Growth</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Inspect your before/after score delta on this dashboard.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/topics/arrays-and-strings"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
        >
          <span>Start Topic 1: Arrays & Strings</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
