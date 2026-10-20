---
title: 'Story 1.4: Frame Schema Contracts & Playback Engine State Machine (useAlgorithmPlayback)'
type: 'feature'
created: '10-20-2026'
status: 'done'
baseline_commit: '63ac219284714533a3f76fd37c4728af1df3f2bc'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/architecture.md'
  - '{project-root}/docs/prd.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AlgoScope currently lacks the foundational frame data contracts and timeline state machine, preventing algorithmic execution payloads from being parsed consistently across the stack and leaving the frontend with no timeline scrubbing or animation engine for algorithmic visualizations.

**Approach:** Implement the dual-stack `Frame` and `AlgorithmExecutionResponse` schema contracts in Python (Pydantic) and TypeScript, build the deterministic `useAlgorithmPlayback` state machine hook with full playback controls (play, pause, step forward, step backward, scrub, speed selection, auto-completion, and keyboard navigation), and create an interactive `PlaybackControls` UI component accompanied by an interactive mock demo page at `/demo`.

## Boundaries & Constraints

**Always:**
- Keep backend `Frame`, `FrameHighlight`, and `AlgorithmExecutionResponse` in exact structural parity with frontend `types/dsa.ts`.
- Ensure `useAlgorithmPlayback` is purely deterministic: bounds `currentIndex` strictly between `0` and `total - 1`, pauses automatically when reaching the final frame, and clears all timers on unmount.
- Support speeds 0.5x (1000ms), 1x (500ms), and 2x (250ms).
- Register global keyboard shortcuts (Space for Play/Pause, ArrowLeft for Step Backward, ArrowRight for Step Forward) when the player is active, avoiding conflicts when focus is on text inputs.
- Keep strict TypeScript typing (`tsc --noEmit`) and Ruff/pytest passes with 0 errors.

**Never:**
- Do not mutate frame data objects during playback transitions; all states must be derived or pure index changes.
- Do not introduce external animation library requirements for timeline state management; standard React state and interval/animation frames suffice for the engine.
- Do not allow scrubbing or stepping out of `[0, total - 1]` bounds.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Empty frame sequence | `frames = []` passed to hook | `status: 'idle'`, `currentIndex: 0`, controls disabled, no timer fired | Safe fallback: no division by zero or out-of-bounds access |
| Auto-pause at end | Playing at frame `total - 2` advancing to `total - 1` | Automatically switches `status: 'completed'`, `isPlaying: false`, timer stopped | Timer cleared; clicking Play from completed resets to 0 and plays |
| Boundary clamping | `stepBackward()` at index 0 or `stepForward()` at `total - 1` | Index remains clamped at 0 or `total - 1`; no-op | Clamped by `Math.max(0, ...)` / `Math.min(total - 1, ...)` |
| Scrub while playing | User drags scrubber to index 3 while `status: 'playing'` | Jumps immediately to index 3, timer resets tick for new index | Smooth timeline transition without frame flicker |
| Speed change mid-playback | User switches from 1x to 2x while playing | Active timer interval updates immediately to 250ms without skipping frames | Active interval cleared and restarted with new tick speed |
| Keyboard shortcuts | Space, ArrowLeft, ArrowRight pressed | Play/pause toggled, step backward/forward executed | Ignores event if target is `HTMLInputElement` or `HTMLTextAreaElement` |

</frozen-after-approval>

## Code Map

- `backend/app/schemas/frame.py` -- Pydantic models for `FrameHighlight`, `Frame`, and `AlgorithmExecutionResponse` (Architecture 2.1).
- `backend/app/schemas/__init__.py` -- Export frame models alongside topic schemas.
- `backend/tests/test_frame_schema.py` -- Pytest validation tests for frame models.
- `frontend/types/dsa.ts` -- TypeScript types and interfaces for `HighlightColor`, `FrameHighlight`, `Frame`, `AlgorithmExecutionResponse`, and `PlaybackState` (Architecture 2.2 & 3).
- `frontend/hooks/useAlgorithmPlayback.ts` -- Custom React hook managing the playback state machine (`status`, `currentIndex`, `speedMs`, `isPlaying`, `play`, `pause`, `stepForward`, `stepBackward`, `scrubTo`, `setSpeed`, `reset`).
- `frontend/components/playback/PlaybackControls.tsx` -- UI toolbar providing Play/Pause, Step Back/Forward, Speed Selector, Range Scrubber, Step counter, and Frame explanation banner.
- `frontend/components/playback/index.ts` -- Export playback UI components.
- `frontend/app/demo/page.tsx` -- Interactive demo page rendering a 10-frame mock algorithmic sequence for live testing and visual inspection.
- `frontend/tests/useAlgorithmPlayback.test.ts` -- Node native test suite verifying hook state machine transitions, boundary clamping, and speed adjustments.

## Tasks & Acceptance

**Execution:**

- [x] `backend/app/schemas/frame.py` -- Define Frame, FrameHighlight, and AlgorithmExecutionResponse Pydantic models -- Backend contract
- [x] `backend/app/schemas/__init__.py` -- Export frame schemas -- Schema registry
- [x] `backend/tests/test_frame_schema.py` -- Implement pytest test suite for frame schema validation -- Backend verification
- [x] `frontend/types/dsa.ts` -- Define TypeScript contracts matching shared protocol -- Frontend contract
- [x] `frontend/hooks/useAlgorithmPlayback.ts` -- Implement playback engine state machine hook -- Core timeline controller
- [x] `frontend/components/playback/PlaybackControls.tsx` -- Implement playback UI controls component -- Visual playback suite
- [x] `frontend/components/playback/index.ts` -- Export playback components -- Clean imports
- [x] `frontend/app/demo/page.tsx` -- Create interactive mock playback demo page -- Visual integration
- [x] `frontend/tests/useAlgorithmPlayback.test.ts` -- Implement unit tests for playback state machine and edge cases -- Frontend verification

**Acceptance Criteria:**

- Given a mock sequence of 10 `Frame` objects matching `types/dsa.ts`, when mounted with `useAlgorithmPlayback`, clicking `Play` starts an automatic timer advancing `currentIndex` at the selected speed (0.5x, 1x, 2x).
- Given playback running, clicking `Pause` freezes the timeline; clicking `Step Forward` and `Step Backward` moves by 1 frame bounded within `[0, total - 1]`.
- Given the timeline scrubber slider, dragging jumps instantly to the target step index.
- Given keyboard interaction, Space triggers play/pause, ArrowLeft steps backward, and ArrowRight steps forward.
- Given `backend/`, `uv run pytest tests/test_frame_schema.py` and `uv run ruff check app tests` pass with 0 errors.
- Given `frontend/`, `npm run typecheck` and `npm run build` pass with 0 errors.

## Implementation Notes

- Created backend `FrameHighlight`, `Frame`, and `AlgorithmExecutionResponse` models in `backend/app/schemas/frame.py` with full Pydantic v2 support and registered them in `backend/app/schemas/__init__.py`.
- Implemented comprehensive backend schema validation test suite in `backend/tests/test_frame_schema.py` (6/6 tests passing).
- Created shared TypeScript contracts and interfaces in `frontend/types/dsa.ts` ensuring exact schema parity with Python Pydantic models.
- Implemented deterministic `useAlgorithmPlayback` hook and pure `playbackReducer` in `frontend/hooks/useAlgorithmPlayback.ts`, supporting playback states, boundary clamping, speed scaling, timer resets, and guarded keyboard shortcuts.
- Created `PlaybackControls` UI toolbar component in `frontend/components/playback/PlaybackControls.tsx` with phase badges, explanations, range scrubber, and play/step buttons.
- Created interactive mock algorithm playback demo at `frontend/app/demo/page.tsx` rendering a 10-frame Two Pointers visualization.
- Implemented unit test suite for the playback state machine in `frontend/tests/useAlgorithmPlayback.test.ts` (16/16 tests passing).
- Verified with backend pytest (14/14 tests passing), Ruff (0 lint errors), Mypy (0 type errors), frontend `tsc --noEmit`, and Next.js production `next build`.

## Spec Change Log

## Review Triage Log

| Finding | Severity | Evidence | Disposition |
|---------|----------|----------|-------------|
| Mojibake arrows and dashes in UI | low | Arrow and em-dash symbols encoded as CP437 corrupted characters in demo and controls | patch |
| Overlapping pointer badge in demo | low | `isLeft && isRight` condition lacked `!isRight` guard on left pointer badge | patch |
| Demo step 8 mock sum mismatch | low | Step 8 state reports `sum: 14` when pointers 4 and 8 sum to 12 | patch |
| Keyboard modifiers intercepted | low | `useAlgorithmPlayback` lacked `event.altKey \|\| event.ctrlKey \|\| event.metaKey` guards | patch |
| `FrameHighlight.color` lacks Literal constraint | low | Backend Pydantic schema used unconstrained `str` instead of `Literal` palette | patch |
| `AlgorithmExecutionResponse.error` null disparity | low | Frontend typed `error?: string` while backend serializes `error: null` | patch |
| Missing TICK and SYNC_TOTAL unit tests | low | `frontend/tests/` lacked tests for intermediate ticks and `SYNC_TOTAL` resizing | patch |
| Frontend test script omitted from package.json | low | Root `npm test` only ran backend pytest; frontend test script was unconfigured | patch |
| Accessible ARIA slider attributes | low | Range input omitted `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` | patch |

## Design Notes

- The hook exports `currentFrame = frames[currentIndex] || null` for convenient consumption by visual canvas adapters.
- Speeds supported: 0.5x (1000ms), 1x (500ms), 2x (250ms).
- Keyboard event listeners are attached to `window` with cleanup in `useEffect`, guarded to ignore keystrokes when editing inputs.

## Verification

**Commands:**

- `cd backend && uv run pytest tests/test_frame_schema.py` -- expected: all frame schema validation tests pass with code 0.
- `cd backend && uv run ruff check app tests` -- expected: Ruff reports no linting errors.
- `cd backend && uv run mypy app` -- expected: Mypy reports no type check errors.
- `cd frontend && npm run typecheck` -- expected: `tsc --noEmit` exits with code 0.
- `cd frontend && npx --yes tsx --test tests/useAlgorithmPlayback.test.ts` -- expected: all hook unit tests pass.
- `cd frontend && npm run build` -- expected: Next.js build succeeds with 0 errors.
