"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, ChevronDown } from "lucide-react";
import { AssessmentComparison } from "@/types/models";

interface AssessmentRadarBarChartProps {
  comparisons: AssessmentComparison[];
}

export function AssessmentRadarBarChart({
  comparisons,
}: AssessmentRadarBarChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  const activeComparison =
    comparisons[selectedIndex] || comparisons[0];
  const { pre, post, delta, topic_title } = activeComparison;

  // Dimension keys
  const dimensions = [
    {
      name: "Conceptual Understanding",
      preScore: pre ? pre.conceptual_score : 0,
      postScore: post ? post.conceptual_score : 0,
      delta: delta ? delta.conceptual_delta : 0,
    },
    {
      name: "Pattern Recognition",
      preScore: pre ? pre.pattern_recognition_score : 0,
      postScore: post ? post.pattern_recognition_score : 0,
      delta: delta ? delta.pattern_recognition_delta : 0,
    },
    {
      name: "Complexity Analysis",
      preScore: pre ? pre.complexity_accuracy_score : 0,
      postScore: post ? post.complexity_accuracy_score : 0,
      delta: delta ? delta.complexity_accuracy_delta : 0,
    },
  ];

  // Radar geometry (3 axes spaced 120 degrees apart)
  const size = 300;
  const center = size / 2;
  const radius = 100;

  // Angles: -90 deg (top), 30 deg (bottom right), 150 deg (bottom left)
  const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

  const getCoordinates = (angle: number, value: number, max = 10) => {
    const r = (value / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Pre polygon points
  const prePoints = angles
    .map((angle, i) => {
      const { x, y } = getCoordinates(angle, dimensions[i].preScore);
      return `${x},${y}`;
    })
    .join(" ");

  // Post polygon points
  const postPoints = angles
    .map((angle, i) => {
      const { x, y } = getCoordinates(angle, dimensions[i].postScore);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
      {/* Header and Topic Selector */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              Pre vs. Post Assessment Breakdown
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Compare conceptual grasp, pattern discovery, and complexity accuracy
          </p>
        </div>

        {/* Topic dropdown selector if multiple comparisons */}
        {comparisons.length > 1 && (
          <div className="relative">
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="appearance-none rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 pr-10 text-xs font-semibold text-slate-200 transition focus:border-indigo-500 focus:outline-none"
            >
              {comparisons.map((c, idx) => (
                <option key={c.topic_id} value={idx}>
                  {c.topic_title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* Main Visualizer Container: Radar Chart + Comparison Bars */}
      <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* SVG Radar Chart */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
          <div className="text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dimension Radar ({topic_title})
            </span>
          </div>

          <svg
            width={size}
            height={size}
            className="overflow-visible"
            aria-label="Assessment Radar Chart"
          >
            {/* Concentric grid rings */}
            {[2.5, 5, 7.5, 10].map((ringLevel) => {
              const ringPoints = angles
                .map((a) => {
                  const { x, y } = getCoordinates(a, ringLevel);
                  return `${x},${y}`;
                })
                .join(" ");
              return (
                <polygon
                  key={ringLevel}
                  points={ringPoints}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray={ringLevel === 10 ? "none" : "2,2"}
                />
              );
            })}

            {/* Axis spokes */}
            {angles.map((a, idx) => {
              const end = getCoordinates(a, 10);
              return (
                <line
                  key={idx}
                  x1={center}
                  y1={center}
                  x2={end.x}
                  y2={end.y}
                  stroke="#334155"
                  strokeWidth="1"
                />
              );
            })}

            {/* Pre Assessment Polygon */}
            {pre && (
              <polygon
                points={prePoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#818cf8"
                strokeWidth="2"
              />
            )}

            {/* Post Assessment Polygon */}
            {post && (
              <polygon
                points={postPoints}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#34d399"
                strokeWidth="2"
              />
            )}

            {/* Axis labels & vertex dots */}
            {dimensions.map((dim, idx) => {
              const angle = angles[idx];
              const preCoord = getCoordinates(angle, dim.preScore);
              const postCoord = getCoordinates(angle, dim.postScore);
              const labelCoord = getCoordinates(angle, 12.8);

              return (
                <g key={dim.name}>
                  {pre && (
                    <circle
                      cx={preCoord.x}
                      cy={preCoord.y}
                      r="4"
                      fill="#818cf8"
                    />
                  )}
                  {post && (
                    <circle
                      cx={postCoord.x}
                      cy={postCoord.y}
                      r="4"
                      fill="#34d399"
                    />
                  )}
                  <text
                    x={labelCoord.x}
                    y={labelCoord.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-400 text-[10px] font-semibold tracking-wide"
                  >
                    {dim.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Radar Legend */}
          <div className="mt-4 flex items-center gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-indigo-500 shadow-sm" />
              <span className="text-slate-300">Pre-Assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-slate-300">Post-Assessment</span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Bars */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-semibold text-slate-200">
              Dimension Scores & Delta (0-10 Scale)
            </h4>
            {delta && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                  delta.total_delta >= 0
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {delta.total_delta >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {delta.total_delta >= 0 ? "+" : ""}
                {delta.total_delta} pts (
                {delta.average_delta >= 0
                  ? `+${delta.average_delta}`
                  : delta.average_delta}{" "}
                avg)
              </span>
            )}
          </div>

          <div className="space-y-4">
            {dimensions.map((dim) => {
              const hasPre = pre !== null;
              const hasPost = post !== null;
              const prePct = hasPre ? (dim.preScore / 10) * 100 : 0;
              const postPct = hasPost ? (dim.postScore / 10) * 100 : 0;
              const deltaVal = dim.delta;

              return (
                <div
                  key={dim.name}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{dim.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400">
                        Pre: {hasPre ? dim.preScore : "—"}
                      </span>
                      {hasPost && (
                        <>
                          <span className="text-slate-600">/</span>
                          <span className="text-emerald-400">
                            Post: {dim.postScore}
                          </span>
                          {delta !== null && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                deltaVal >= 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {deltaVal >= 0 ? `+${deltaVal}` : deltaVal}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Track */}
                  <div className="mt-2 space-y-1.5">
                    {/* Pre Bar */}
                    {hasPre ? (
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-[10px] font-medium text-slate-400">
                          Pre
                        </span>
                        <div className="h-2 flex-1 rounded-full bg-slate-800">
                          <div
                            style={{ width: `${prePct}%` }}
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          />
                        </div>
                        <span className="w-6 text-right text-[10px] font-medium text-slate-400">
                          {dim.preScore}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Pre-assessment pending completion
                      </div>
                    )}

                    {/* Post Bar */}
                    {hasPost ? (
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-[10px] font-medium text-slate-400">
                          Post
                        </span>
                        <div className="h-2 flex-1 rounded-full bg-slate-800">
                          <div
                            style={{ width: `${postPct}%` }}
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          />
                        </div>
                        <span className="w-6 text-right text-[10px] font-medium text-slate-400">
                          {dim.postScore}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Post-assessment pending completion
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
