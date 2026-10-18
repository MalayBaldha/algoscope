---
title: "Story 1.2: Owner-Implemented OAuth Authentication & Session Management"
type: "feature"
created: "10-17-2026"
status: "done"
baseline_commit: "NO_COMMITS"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/prd.md"
  - "{project-root}/docs/architecture.md"
  - "{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AlgoScope currently has an open public shell with no authentication or session isolation, allowing unrestricted access to future user metrics and personal progress tracking. Furthermore, learning how OAuth and NextAuth.js work in practice is a core user goal.

**Approach:** Scaffold NextAuth.js v4 integration in `frontend/`, providing the routing handler (`app/api/auth/[...nextauth]/route.ts`), authentication options contract (`lib/auth.ts`), session provider component (`components/providers/SessionProvider.tsx`), login UI (`app/auth/signin/page.tsx`), and route protection middleware (`middleware.ts`). Following PRD Section 6.2, provide clear, guided `// TODO: [OWNER LEARNING EXERCISE]` blocks for the owner to configure provider credentials and customize session callbacks, while leaving a fallback dev credentials mock mode so the application remains immediately testable and runnable out of the box.

## Boundaries & Constraints

**Always:**

- Keep NextAuth configuration modular (`frontend/lib/auth.ts`) so handlers and server components can reuse it.
- Include a development fallback mode (e.g., GitHub provider + local credentials/dev provider) so the app builds and runs without requiring active internet credentials.
- Mark all owner learning sections with distinct, actionable `// TODO: [OWNER LEARNING EXERCISE]` tags and explanatory comments.
- Protect `/dashboard` and `/topics/:path*` via Next.js middleware, redirecting unauthenticated visitors to `/auth/signin`.
- Ensure strict TypeScript typing (`tsc --noEmit`) and ESLint pass with 0 errors.

**Never:**

- Do not commit hardcoded OAuth client secrets or sensitive tokens to version control.
- Do not overwrite or bypass the owner's active learning exercise blocks.
- Do not couple the NextAuth database adapter yet (sessions use JWT by default; SQLite DB models arrive in Story 1.3).

## I/O & Edge-Case Matrix

| Scenario                  | Input / State                           | Expected Output / Behavior                                     | Error Handling                                    |
| ------------------------- | --------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| Unauthenticated access    | Request to `/dashboard` without session | Redirected to `/auth/signin?callbackUrl=%2Fdashboard`          | HTTP 307 Redirect                                 |
| Sign-in page view         | Visit `/auth/signin`                    | Renders styled authentication page with OAuth provider buttons | Graceful error banner if `?error=` param present  |
| Successful authentication | Valid sign-in callback                  | Session cookie established; user redirected to `callbackUrl`   | Displays descriptive error on invalid credentials |
| API route session check   | `GET /api/auth/session`                 | Returns current user session JSON or `{}`                      | Always HTTP 200                                   |

</frozen-after-approval>

## Code Map

- `frontend/package.json` -- Install `next-auth` dependency.
- `frontend/.env.example` -- Provide template for `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_ID`, and `GITHUB_SECRET`.
- `frontend/lib/auth.ts` -- NextAuth options definition with GitHub provider, dev provider, and callback hooks featuring `// TODO: [OWNER LEARNING EXERCISE]` stubs.
- `frontend/app/api/auth/[...nextauth]/route.ts` -- Next.js App Router route handler exporting `GET` and `POST`.
- `frontend/components/providers/SessionProvider.tsx` -- Client component wrapping NextAuth `SessionProvider`.
- `frontend/app/layout.tsx` -- Wrap children in `SessionProvider` and display dynamic user avatar / Sign In / Sign Out button in the header.
- `frontend/app/auth/signin/page.tsx` -- Custom styled sign-in screen matching AlgoScope dark UI theme.
- `frontend/middleware.ts` -- Next.js middleware enforcing session token on protected routes (`/dashboard/:path*`, `/topics/:path*`).

## Tasks & Acceptance

**Execution:**

- [x] `frontend/package.json` -- Install `next-auth` package -- Adds authentication runtime
- [x] `frontend/.env.example` -- Create environment variables template -- Documents required auth keys
- [x] `frontend/lib/auth.ts` -- Implement authOptions with GitHub provider + Dev Mock provider with guided TODO learning blocks -- Establishes owner exercise
- [x] `frontend/app/api/auth/[...nextauth]/route.ts` -- Create App Router NextAuth route handler -- Bridges NextAuth to HTTP endpoints
- [x] `frontend/components/providers/SessionProvider.tsx` -- Create client session provider wrapper -- Enables client-side `useSession()`
- [x] `frontend/app/layout.tsx` -- Update root layout with SessionProvider and Header user status controls -- Exposes auth state to navigation
- [x] `frontend/app/auth/signin/page.tsx` -- Create dark-mode sign-in page with provider action cards -- Gives learner dedicated sign-in UI
- [x] `frontend/middleware.ts` -- Implement route protection middleware for `/dashboard` and `/topics` -- Secures personal instance

**Acceptance Criteria:**

- Given a visitor without an active session, when navigating to `/dashboard`, then Next.js middleware redirects to `/auth/signin`.
- Given the sign-in page at `/auth/signin`, when loaded, then provider buttons are displayed with custom branding and error handling.
- Given the codebase, when inspecting `frontend/lib/auth.ts`, then clear `// TODO: [OWNER LEARNING EXERCISE]` annotations explain how to configure real GitHub/Google OAuth keys and callbacks.
- Given the entire frontend, when `npm run build` and `npm run typecheck` are executed, then 0 lint or TypeScript errors occur.

## Implementation Notes

- Installed `next-auth@4.24.8` in `frontend/`.
- Created `frontend/lib/auth.ts` with guided `// TODO: [OWNER LEARNING EXERCISE]` sections for OAuth provider configuration, JWT enrichment, and session callbacks.
- Configured local development fallback provider (`dev-credentials`) allowing immediate testing without live cloud API keys.
- Implemented App Router handler (`/api/auth/[...nextauth]/route.ts`) and client `SessionProvider`.
- Built custom dark-themed sign-in UI at `/auth/signin` with error state handling and learner guidance notes.
- Added Next.js `middleware.ts` enforcing authentication on `/dashboard/:path*` and `/topics/:path*`.
- Integrated `AuthNav` component in the header displaying current learner status and sign-in/sign-out actions.
- Verified with strict TypeScript `tsc --noEmit`, ESLint `next lint`, and production `next build` (all passing with 0 errors).

## Spec Change Log

## Review Triage Log

| Finding | Severity | Evidence                                                                             | Disposition |
| ------- | -------- | ------------------------------------------------------------------------------------ | ----------- |
| None    | N/A      | Clean implementation adhering to NextAuth App Router standards with full type-safety | pass        |

## Verification

**Commands:**

- `cd frontend && npm run typecheck` -- expected: `tsc --noEmit` exits with code 0.
- `cd frontend && npm run lint` -- expected: `next lint` reports no warnings or errors.
- `cd frontend && npm run build` -- expected: Next.js build compiles static & dynamic pages successfully.
