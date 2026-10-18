import { Layers, Terminal, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 text-center">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Pattern Recognition Engine</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Materialize DSA Into{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Living Code
          </span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          AlgoScope connects algorithmic theory with full-stack engineering.
          Solve patterns in Python, generate deterministic frame traces, and
          power custom TypeScript visualizers and mini-apps.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3 text-left">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">
            14 DSA Topics
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            From Arrays & Strings to Dynamic Programming and Bit Manipulation,
            each with its own visualizer.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Terminal className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">
            Dual-Stack Learning
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Owner implements Python algorithms and pytest suites alongside
            TypeScript frame adapters and state hooks.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">14 Mini-Apps</h3>
          <p className="mt-2 text-sm text-slate-400">
            Every topic powers a real-world app: Rate-limiters, LRU caches,
            schedulers, and transit routers.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href="/topics/arrays-and-strings"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
        >
          Explore Topic 1: Arrays & Strings
        </a>
        <a
          href="/dashboard"
          className="rounded-lg border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          View Dashboard
        </a>
      </div>
    </div>
  );
}
