"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-24 animate-pulse rounded-md bg-slate-800" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-8 w-8 rounded-full border border-slate-700 bg-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <User className="h-4 w-4" />
            </div>
          )}
          <span className="text-xs font-medium text-slate-200">
            {session.user.name || session.user.email}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
    >
      <LogIn className="h-3.5 w-3.5" />
      <span>Sign In</span>
    </button>
  );
}
