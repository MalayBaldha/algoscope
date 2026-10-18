"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { KeyRound, Sparkles, ShieldCheck, GitBranch } from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [username, setUsername] = useState("Learner");

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("dev-credentials", {
      username: username || "Learner",
      callbackUrl,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6 py-12">
      <div className="flex flex-col space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Sign In to AlgoScope
        </h1>
        <p className="text-sm text-slate-400">
          Personal instance authentication & learning telemetry protection
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          Authentication failed: {error}. Please verify provider settings.
        </div>
      )}

      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        {/* GitHub OAuth Provider Button */}
        <div>
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-sm transition hover:bg-slate-700 hover:text-white"
          >
            <GitBranch className="h-4 w-4" />
            <span>Continue with GitHub</span>
          </button>
          <p className="mt-1.5 text-center text-[11px] text-slate-500">
            Guided exercise in{" "}
            <code className="text-indigo-400">lib/auth.ts</code>
          </p>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-medium">
              or local dev sign-in
            </span>
          </div>
        </div>

        {/* Local Dev Credentials Form */}
        <form onSubmit={handleDevLogin} className="space-y-3">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-slate-300"
            >
              Learner Identifier
            </label>
            <div className="mt-1 flex rounded-lg shadow-sm">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Malay"
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
          >
            <KeyRound className="h-4 w-4" />
            <span>Sign In Locally</span>
          </button>
        </form>

        <div className="mt-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Learning Note:</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            This screen is wired directly to NextAuth.js. When you configure
            real OAuth keys in{" "}
            <code className="text-slate-300">.env.local</code>, the GitHub
            provider activates automatically with full callback processing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex h-64 max-w-md items-center justify-center text-sm text-slate-500">
          Loading authentication gateway...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
