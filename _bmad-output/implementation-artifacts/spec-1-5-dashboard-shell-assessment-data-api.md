---
title: 'Story 1.5: Dashboard Shell & Assessment Data API'
type: 'feature'
created: '2026-10-21'
status: 'done'
baseline_commit: '9f11cbf0cf293b658379f2e534b5791e0ddbbc2f'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/architecture.md'
  - '{project-root}/docs/prd.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AlgoScope currently lacks progress analytics endpoints and a learner dashboard, preventing users from inspecting their overall curriculum mastery, active daily practice streaks, and pre- vs. post-assessment score deltas.

**Approach:** Implement FastAPI endpoints for `/api/progress` and `/api/assessments` backed by existing SQLite models (`Topic`, `Progress`, `Assessment`, `Streak`), and build a responsive Next.js `/dashboard` shell featuring topic mastery breakdowns, active streak metrics, SVG-based before/after assessment radar and comparison bar charts, and a zero-data empty state with a call-to-action to Topic 1.

## Boundaries & Constraints

**Always:**
- Keep backend Pydantic schemas in strict alignment with frontend TypeScript contracts in `frontend/types/models.ts`.
- Compute topic progress dynamically from `progress` records or direct topic statuses, defaulting unstarted topics to `"not_started"`.
- Support pre/post assessment comparisons across the 3 core dimensions: Conceptual Understanding (0-10), Pattern Recognition (0-10), and Complexity Analysis (0-10).
- Render clean, zero-dependency SVG radar and bar visualization components without introducing heavy charting dependencies.
- Render a welcoming empty state when zero assessments or progress exist, providing a direct link to explore Topic 1 (`/topics/arrays-and-strings`).
- Ensure strict type safety (`tsc --noEmit`), linting (`eslint`, `ruff`), and backend `pytest` pass with 0 errors.

**Never:**
- Do not introduce breaking schema changes to existing `Assessment`, `Progress`, `Topic`, or `Streak` SQLAlchemy models.
- Do not make external network requests for analytics computation; all calculations run offline-first against local SQLite.
- Do not allow division by zero or NaN values in average scores or percentage completion when no progress or assessment records exist.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Empty database (fresh install) | GET `/api/progress` and GET `/api/assessments` | `not_started: 14`, `streak: 0`, empty assessments list, safe averages (0.0) | Returns 200 OK with default zero values, no 500 errors |
| Single pre-assessment logged | POST `/api/assessments` with type='pre', scores=[7, 6, 8] | Record stored in SQLite, GET `/api/assessments` returns comparison with `pre` populated, `post: null`, delta: null | Validates score range 0-10 with Pydantic Field validation |
| Pre and Post assessment comparison | Both pre and post exist for topic | GET `/api/assessments` returns comparison object with `pre`, `post`, and computed deltas | Accurately calculates `post - pre` delta |
| Active streak tracking | Streak records for consecutive dates | `current_streak` calculated as consecutive days up to today/yesterday | Non-consecutive dates correctly reset current streak counter |
| Dashboard UI empty state | No assessments completed | Dashboard renders summary cards, streak banner, and empty state CTA "Start Topic 1: Arrays & Strings" | Graceful fallback rendering without UI crashes |

</frozen-after-approval>

## Code Map

- `backend/app/schemas/assessment.py` -- Pydantic models for `AssessmentCreate`, `AssessmentRead`, `AssessmentComparison`, and `AssessmentSummaryResponse`.
- `backend/app/schemas/progress.py` -- Pydantic models for `TopicProgressSummary`, `StreakInfo`, and `ProgressSummaryResponse`.
- `backend/app/schemas/__init__.py` -- Re-export assessment and progress schemas.
- `backend/app/api/assessments.py` -- FastAPI router for `GET /api/assessments`, `POST /api/assessments`, and `GET /api/assessments/{topic_id}`.
- `backend/app/api/progress.py` -- FastAPI router for `GET /api/progress` and `POST /api/progress`.
- `backend/app/main.py` -- Register `assessments_router` and `progress_router`.
- `backend/tests/test_progress_assessment_api.py` -- Pytest test suite for progress, assessment comparisons, and streak calculation.
- `frontend/types/models.ts` -- TypeScript contracts for Progress, Assessment, Streak, and Comparison payloads.
- `frontend/lib/apiClient.ts` -- API client helper functions for querying progress and assessment data.
- `frontend/components/dashboard/StreakWidget.tsx` -- Active daily streak banner and consistency counter.
- `frontend/components/dashboard/TopicMasteryCard.tsx` -- Curriculum progress breakdown (Not Started, In Progress, Mastered).
- `frontend/components/dashboard/AssessmentRadarBarChart.tsx` -- SVG radar and comparison bar visualizers for pre vs. post scores.
- `frontend/components/dashboard/EmptyDashboardState.tsx` -- Empty state component with CTA button directing user to Topic 1.
- `frontend/components/dashboard/index.ts` -- Dashboard component exports.
- `frontend/app/dashboard/page.tsx` -- Full Next.js dashboard shell composing analytics widgets and handling empty/loading states.
- `frontend/tests/dashboard.test.ts` -- TypeScript test suite validating dashboard data transformations and edge cases.

## Tasks & Acceptance

**Execution:**

- [x] `backend/app/schemas/assessment.py` -- Define assessment Pydantic models with 0-10 score constraints -- Assessment data contract
- [x] `backend/app/schemas/progress.py` -- Define progress and streak summary Pydantic models -- Progress data contract
- [x] `backend/app/schemas/__init__.py` -- Export new schemas -- Clean schema imports
- [x] `backend/app/api/progress.py` -- Implement GET /api/progress and progress update endpoints -- Progress analytics API
- [x] `backend/app/api/assessments.py` -- Implement GET /api/assessments with pre/post comparisons and POST endpoint -- Assessment API
- [x] `backend/app/main.py` -- Mount progress and assessment routers into FastAPI application -- Route registration
- [x] `backend/tests/test_progress_assessment_api.py` -- Implement pytest tests for progress, assessments, and streak logic -- Backend verification
- [x] `frontend/types/models.ts` -- Create shared TypeScript interfaces matching backend responses -- Frontend data types
- [x] `frontend/lib/apiClient.ts` -- Implement frontend fetch client functions for progress and assessments -- API integration layer
- [x] `frontend/components/dashboard/StreakWidget.tsx` -- Create streak display widget with fire/calendar indicators -- Streak visualizer
- [x] `frontend/components/dashboard/TopicMasteryCard.tsx` -- Create curriculum progress breakdown with status counts -- Progress visualizer
- [x] `frontend/components/dashboard/AssessmentRadarBarChart.tsx` -- Create SVG radar chart and before/after comparison bar chart -- Assessment analytics visualizer
- [x] `frontend/components/dashboard/EmptyDashboardState.tsx` -- Create graceful empty state with CTA to Topic 1 -- Zero-data UX
- [x] `frontend/components/dashboard/index.ts` -- Export dashboard components -- Clean imports
- [x] `frontend/app/dashboard/page.tsx` -- Assemble complete dashboard shell layout -- Dashboard UI view
- [x] `frontend/tests/dashboard.test.ts` -- Implement unit tests for dashboard score delta calculations -- Frontend verification

**Acceptance Criteria:**

- Given the user visits `/dashboard`, when `GET /api/progress` and `GET /api/assessments` are queried, then topic mastery breakdown, active daily streak, and before/after assessment radar/bar charts are rendered.
- Given a fresh installation with zero assessment records, when the dashboard loads, then empty states are gracefully rendered with a call-to-action button linking to Topic 1 (`/topics/arrays-and-strings`).
- Given `backend/`, `uv run --project backend pytest backend/tests/test_progress_assessment_api.py` and `uv run --project backend ruff check backend` pass with 0 errors.
- Given `frontend/`, `npm --prefix frontend test` and `npm --prefix frontend run build` pass with 0 errors.

## Implementation Notes

- Implemented Pydantic models for assessment in `backend/app/schemas/assessment.py` and progress in `backend/app/schemas/progress.py` with 0-10 score validation and flexible normalizers.
- Implemented `/api/progress` in `backend/app/api/progress.py` calculating dynamic curriculum topic statuses, completion percentage, and active daily streak backwards from today/yesterday.
- Implemented `/api/assessments` in `backend/app/api/assessments.py` pairing latest pre/post assessments per topic to compute score deltas across Conceptual Understanding, Pattern Recognition, and Complexity Analysis with safe defaults.
- Mounted routers in `backend/app/main.py`.
- Implemented 9 backend integration and unit tests in `backend/tests/test_progress_assessment_api.py` (24/24 backend tests passing).
- Defined shared TypeScript models in `frontend/types/models.ts` and fetch client in `frontend/lib/apiClient.ts`.
- Created dashboard widgets in `frontend/components/dashboard/`: `StreakWidget`, `TopicMasteryCard`, `AssessmentRadarBarChart`, and `EmptyDashboardState`.
- Created full Next.js App Router dashboard shell in `frontend/app/dashboard/page.tsx`.
- Implemented frontend unit tests in `frontend/tests/dashboard.test.ts` (26/26 tests passing).
- Verified production build `next build`, ESLint, Ruff, and TypeScript `tsc --noEmit` pass with 0 errors.

## Spec Change Log

## Review Triage Log

| Finding | Severity | Evidence | Disposition |
|---------|----------|----------|-------------|
| AssessmentRadarBarChart negative delta badge syntax `+-N pts` | medium | Delta badge template string unconditionally prepended `+` to `total_delta`. Fixed by checking `>= 0 ? '+' : ''` and styling with rose badge. | patch (resolved) |
| AssessmentRadarBarChart false 0 score for uncompleted pre-assessment | medium | Missing pre-assessment rendered bar as `Pre: 0` with false green badge. Fixed by displaying `Pre: —` and suppressing delta badge when pre is null. | patch (resolved) |
| Assessment summary averages distorted by retakes | medium | `average_pre_score` and `average_post_score` iterated over all historical rows instead of latest comparisons. Fixed by deriving averages from latest comparisons list. | patch (resolved) |
| Progress update mismatched topic and problem ID | medium | `update_progress` did not verify `problem.topic_id == payload.topic_id`. Fixed by adding explicit check returning 400 Bad Request on mismatch. | patch (resolved) |
| Progress update default status demoting completed records | medium | Updating time spent without status downgraded existing completed status to in_progress. Fixed by defaulting status to None and preventing accidental status regression. | patch (resolved) |
| UI error state swallowed by inline .catch() in Promise.all | medium | `Promise.all` never rejected so outer catch was dead code and error banner never rendered. Fixed with unified try/catch block setting error state. | patch (resolved) |
| Character encoding mojibake on unicode arrows/symbols | low | Raw arrow and symbol characters in JSX could cause mojibake depending on file encoding. Sanitized to ASCII equivalents and standard icons. | patch (resolved) |
| Verification gap: Streak practice recording on assessment submission | medium | Missing assertion verifying that logging assessment updates daily streak minutes. Fixed by adding test in `test_progress_assessment_api.py`. | patch (resolved) |
| Verification gap: Topic mastery "mastered" status handling | medium | Missing test exercising "mastered" progress updates and aggregations. Fixed by adding test in `test_progress_assessment_api.py`. | patch (resolved) |
| Verification gap: Assessment latest-record supersession | medium | Missing test for multiple retakes of the same assessment type on a topic. Fixed by adding test in `test_progress_assessment_api.py`. | patch (resolved) |
| Verification gap: 404 on invalid topics/slugs | medium | Missing test for 404 error branches on unknown topic ID / slug queries. Fixed by adding test in `test_progress_assessment_api.py`. | patch (resolved) |

## Verification

**Commands:**
- `uv run --project backend pytest backend` -- expected: All backend tests pass
- `uv run --project backend ruff check backend` -- expected: 0 lint errors
- `npm --prefix frontend test` -- expected: All frontend unit tests pass
- `npm --prefix frontend run build` -- expected: Next.js compiles with /dashboard route successfully
