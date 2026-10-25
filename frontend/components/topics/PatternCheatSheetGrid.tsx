"use client";

import React, { useState } from "react";
import {
  FileCode,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getPatternsForTopic,
  PatternCheatSheetCard,
} from "@/data/patternCards";

interface PatternCheatSheetGridProps {
  topicSlug?: string;
  topicTitle?: string;
}

export const PatternCheatSheetGrid: React.FC<PatternCheatSheetGridProps> = ({
  topicSlug = "arrays-and-strings",
  topicTitle = "Arrays & Strings",
}) => {
  const patterns: PatternCheatSheetCard[] = getPatternsForTopic(topicSlug);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCodeId, setExpandedCodeId] = useState<Record<string, boolean>>({
    "sliding-window": true,
    "two-pointers": true,
  });

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const toggleCode = (id: string) => {
    setExpandedCodeId((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
          <FileCode className="h-3.5 w-3.5" />
          <span>High-Density Reference</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Pattern Cheat Sheets: {topicTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Review core invariants, trigger criteria, complexity guarantees, and
          common pitfalls before jumping into code implementations.
        </p>
      </div>

      {patterns.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Pattern Cheat Sheets In Preparation
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cheat sheets for &quot;{topicTitle}&quot; are currently being curated and will be available soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {patterns.map((pattern: PatternCheatSheetCard) => {
            const isCodeExpanded = expandedCodeId[pattern.id] ?? false;
            return (
              <div
                key={pattern.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition hover:border-slate-700/80 hover:bg-slate-900/80"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                        {pattern.category}
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {pattern.name}
                      </h3>
                    </div>
                    {/* Complexities */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-400">
                        <Clock className="h-3 w-3" />
                        <span>{pattern.timeComplexity}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                        <HardDrive className="h-3 w-3" />
                        <span>{pattern.spaceComplexity}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {pattern.description}
                  </p>

                  {/* Visual Cue */}
                  <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-indigo-300">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mr-2">
                      Visual Cue:
                    </span>
                    <code>{pattern.visualCue}</code>
                  </div>

                  {/* Key Invariant */}
                  <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs">
                    <span className="font-semibold text-indigo-300">
                      Key Invariant:{" "}
                    </span>
                    <span className="text-slate-300">{pattern.keyInvariant}</span>
                  </div>

                  {/* When To Use */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      When to apply this pattern:
                    </h4>
                    <ul className="space-y-1">
                      {pattern.whenToUse.map((point, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Pitfalls */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Watch out for pitfalls:</span>
                    </h4>
                    <ul className="space-y-1">
                      {pattern.commonPitfalls.map((pitfall, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-400 pl-5 relative before:absolute before:left-1.5 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400/60"
                        >
                          {pitfall}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Code Template Accordion */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCode(pattern.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <span>Python Skeleton Template</span>
                      {isCodeExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleCopy(pattern.id, pattern.codeTemplate)
                      }
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      title="Copy code template"
                    >
                      {copiedId === pattern.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isCodeExpanded && (
                    <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200">
                      <code>{pattern.codeTemplate}</code>
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
