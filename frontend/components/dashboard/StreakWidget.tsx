"use client";

import React from "react";
import { Flame, Calendar, Clock, Trophy, Award } from "lucide-react";
import { StreakInfo } from "@/types/models";

interface StreakWidgetProps {
  streak: StreakInfo;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
  const isActive = streak.current_streak > 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-md">
      {/* Background glow when streak is active */}
      {isActive && (
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner ${
              isActive
                ? "bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-orange-500/20 ring-4 ring-orange-500/20"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            <Flame
              className={`h-7 w-7 ${isActive ? "animate-pulse" : "opacity-60"}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {streak.current_streak}{" "}
                <span className="text-base font-normal text-slate-400">
                  {streak.current_streak === 1 ? "Day Streak" : "Days Streak"}
                </span>
              </h2>
              {isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-400 border border-orange-500/20">
                  Active 🔥
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {isActive
                ? "Consistency is compounding! Practice every day to keep your streak alive."
                : "No active streak today. Solve a problem or complete an assessment to ignite your flame!"}
            </p>
          </div>
        </div>

        {/* Consistency metrics grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Best Streak</span>
            </div>
            <div className="mt-1 text-lg font-bold text-slate-100">
              {streak.longest_streak}{" "}
              <span className="text-xs font-normal text-slate-400">days</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Active Days</span>
            </div>
            <div className="mt-1 text-lg font-bold text-slate-100">
              {streak.total_active_days}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              <span>Problems</span>
            </div>
            <div className="mt-1 text-lg font-bold text-slate-100">
              {streak.total_problems_completed}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Practice Time</span>
            </div>
            <div className="mt-1 text-lg font-bold text-slate-100">
              {streak.total_minutes_spent}{" "}
              <span className="text-xs font-normal text-slate-400">min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
