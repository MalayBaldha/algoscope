---
title: "Story 1.1: Monorepo Scaffolding & Dual-Stack Environment Setup"
type: "feature"
created: "10-17-2026"
status: "done"
baseline_commit: "NO_COMMITS"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/architecture.md"
  - "{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repository currently has planning and BMad configuration directories but lacks the actual runnable full-stack application workspace (Next.js 14 frontend and FastAPI backend), preventing any algorithmic or visualization code from executing.

**Approach:** Scaffold the monorepo workspace with a root orchestrator `package.json`, root `.gitignore`, a modern Next.js 14 App Router frontend with TypeScript, Tailwind CSS, and shadcn/ui components, alongside a FastAPI backend in Python 3.12 managed by `uv` with linting (`ruff`) and test suites (`pytest`).

## Boundaries & Constraints

**Always:**

- Keep frontend (`frontend/`) and backend (`backend/`) decoupled with clear separation of concerns.
- Enforce strict TypeScript (`tsc --noEmit`) and strict Python formatting/linting via `ruff`.
- Include standard health check endpoints (`GET /api/health` on FastAPI).
- Ignore `node_modules`, `.next`, Python `.venv`, `__pycache__`, and `*.db` in `.gitignore`.

**Never:**

- Do not add complex database migrations or models in this story (deferred to Story 1.3).
- Do not implement OAuth authentication logic yet (deferred to Story 1.2).
- Do not mix frontend npm dependencies into the root directory.

## I/O & Edge-Case Matrix

| Scenario          | Input / State                         | Expected Output / Behavior                                  | Error Handling                                    |
| ----------------- | ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| Root script check | `npm run lint` or `npm run typecheck` | Executes linting across workspaces with 0 errors            | Returns non-zero exit code on syntax/type failure |
| Backend health    | `GET /api/health` on running FastAPI  | Returns HTTP 200 `{"status": "ok", "app": "AlgoScope API"}` | 500 error handled via standard exception handler  |
| Frontend build    | `npm run build` inside `frontend/`    | Next.js App Router static/SSR compilation succeeds          | Non-zero exit code if compilation fails           |

</frozen-after-approval>

## Code Map

- `package.json` -- Monorepo root orchestration scripts (`dev`, `build`, `lint`, `typecheck`).
- `.gitignore` -- Monorepo root ignore rules for Node, Python, Next.js, and SQLite.
- `frontend/package.json` -- Next.js 14, React 18/19, TypeScript, Tailwind CSS, Lucide icons, clsx, tailwind-merge.
- `frontend/tsconfig.json` -- Strict TypeScript compiler options with path alias `@/*`.
- `frontend/app/layout.tsx` -- Root layout with HTML shell, inter font, and metadata.
- `frontend/app/page.tsx` -- Initial landing page placeholder welcoming the learner to AlgoScope.
- `backend/pyproject.toml` -- Python project specification managing dependencies with `uv` (`fastapi`, `uvicorn`, `pydantic`, `pytest`, `ruff`, `sqlalchemy`).
- `backend/app/main.py` -- FastAPI application factory with CORS middleware and `/api/health` route.
- `backend/tests/test_health.py` -- Pytest test verifying the health check endpoint.

## Tasks & Acceptance

**Execution:**

- [x] `package.json` -- Create root workspace package.json with dev scripts -- Enables top-level project orchestration
- [x] `.gitignore` -- Update root .gitignore with Node, Python venv, Next build, and DB ignores -- Prevents committing artifacts
- [x] `frontend/package.json` & configs -- Scaffold Next.js 14 App Router, Tailwind CSS, and TypeScript configs -- Establishes frontend stack
- [x] `frontend/app/layout.tsx` & `frontend/app/page.tsx` -- Create basic responsive shell with AlgoScope header -- Verifies App Router rendering
- [x] `backend/pyproject.toml` -- Configure Python 3.12 project with FastAPI, Pydantic, Pytest, and Ruff -- Establishes backend package management via uv
- [x] `backend/app/main.py` -- Implement FastAPI app entry point with CORS and `/api/health` -- Provides backend verification endpoint
- [x] `backend/tests/test_health.py` -- Create pytest test for health endpoint -- Establishes backend test runner

**Acceptance Criteria:**

- Given a clean environment, when `npm run build` is executed in `frontend/`, then compilation completes with 0 TypeScript and ESLint errors.
- Given the FastAPI backend started with `uv run uvicorn app.main:app`, when `GET /api/health` is requested, then HTTP 200 `{"status": "ok", "app": "AlgoScope API"}` is returned.
- Given the backend directory, when `uv run pytest` is executed, then all tests pass with 100% green output.

## Implementation Notes

- Scaffolding initialized for both `frontend/` (Next.js 14.2.15, Tailwind CSS, TypeScript, `lucide-react`, `clsx`, `tailwind-merge`) and `backend/` (FastAPI 0.143, Pydantic 2.14, SQLAlchemy 2.1, Pytest 9.1, Ruff 0.17).
- Health check route `/api/health` tested via `pytest tests/test_health.py` (100% pass).
- Strict linting verified with `ruff check .` on backend and `npm run lint` + `npm run typecheck` (`tsc --noEmit`) on frontend.
- Production build confirmed via `next build` inside `frontend/`.

## Spec Change Log

## Review Triage Log

| Finding | Severity | Evidence                                                                   | Disposition |
| ------- | -------- | -------------------------------------------------------------------------- | ----------- |
| None    | N/A      | Clean greenfield monorepo setup passing all static analysis and unit tests | pass        |

## Verification

**Commands:**

- `cd frontend && npm run build` -- expected: Build passes cleanly with no type or lint errors.
- `cd backend && uv run pytest` -- expected: 1 passed.
- `cd backend && uv run ruff check .` -- expected: All checks passed.
