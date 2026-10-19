---
title: 'Story 1.3: SQLite Database Models & Topic Seed Scaffolding'
type: 'feature'
created: '10-18-2026'
status: 'done'
baseline_commit: '65a1aae79ed69beb7a72c0f512578eb3635a37b9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/architecture.md'
  - '{project-root}/docs/prd.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** AlgoScope's backend currently only exposes a health check endpoint and lacks database persistence and domain entities, making it impossible to store topics, problems, learner progress, assessments, and practice streaks across sessions offline.

**Approach:** Implement zero-configuration SQLite persistence using SQLAlchemy 2.0 with declarative models (`Topic`, `Problem`, `Progress`, `Assessment`, `Streak`), database engine session factory, an idempotent seed script populating all 14 DSA curriculum topics defined in PRD Section 8.1, and expose `GET /api/topics` returning the topics with initial `"not_started"` progress status.

## Boundaries & Constraints

**Always:**
- Use SQLAlchemy 2.0 declarative style (`Mapped[...]`, `mapped_column(...)`, `DeclarativeBase`).
- Store SQLite database locally at `backend/algoscope.db` (gitignored, configured via `backend/app/core/config.py`).
- Implement idempotent database seeding so running startup or seed multiple times never duplicates topics or violates unique constraints.
- Provide full type annotations and ensure `ruff` linting and `mypy` typechecks pass cleanly.
- Keep `GET /api/topics` response compliant with Pydantic schemas, sorting topics by `difficulty_order` ascending.

**Never:**
- Do not check `algoscope.db` into git (enforced via `.gitignore`).
- Do not introduce asynchronous DB drivers or external PostgreSQL/MySQL dependencies (SQLite meets local offline zero-configuration architecture requirement AD-1).
- Do not hardcode raw SQL queries; use SQLAlchemy 2.0 select statements and session management.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Database initialization | Cold backend startup with no `algoscope.db` file | SQLite file and tables (`topics`, `problems`, `progress`, `assessments`, `streaks`) created automatically | File permission / connection errors caught and logged |
| Idempotent topic seed | Running seed script on fresh or already-seeded DB | Exactly 14 topic records exist with correct slugs, order (1-14), descriptions, patterns | No duplicate key exceptions (`IntegrityError`); existing rows preserved or updated safely |
| Fetch topics list | `GET /api/topics` | Returns JSON array of 14 topics sorted by `difficulty_order`, each with initial status `"not_started"` | HTTP 200 with JSON payload |
| Database session lifecycle | API request handling | Session cleanly yielded via FastAPI `Depends(get_db)` and closed upon completion | Auto-rollback on unhandled exception and session cleanup |

</frozen-after-approval>

## Code Map

- `backend/app/core/config.py` -- App settings via `pydantic-settings` (`Settings` class with `DATABASE_URL: str = "sqlite:///./algoscope.db"`).
- `backend/app/core/database.py` -- SQLAlchemy engine, `sessionmaker`, `Base(DeclarativeBase)`, and FastAPI `get_db` dependency.
- `backend/app/models/__init__.py` -- Package exports for models (`Topic`, `Problem`, `Progress`, `Assessment`, `Streak`, `Base`).
- `backend/app/models/topic.py` -- SQLAlchemy model for `Topic` (`id`, `slug`, `title`, `description`, `difficulty_order`, `icon`, `key_patterns`, relationships).
- `backend/app/models/problem.py` -- SQLAlchemy model for `Problem` (`id`, `topic_id`, `slug`, `title`, `difficulty`, `pattern_tags`, `real_world_context`, `hints`, `starter_template`).
- `backend/app/models/progress.py` -- SQLAlchemy model for `Progress` (`id`, `topic_id`, `problem_id`, `status`, `attempts`, `hints_used`, `time_spent_seconds`, `completed_at`).
- `backend/app/models/assessment.py` -- SQLAlchemy model for `Assessment` (`id`, `topic_id`, `assessment_type`, `conceptual_score`, `pattern_recognition_score`, `complexity_accuracy_score`, `questions_and_answers`, `created_at`).
- `backend/app/models/streak.py` -- SQLAlchemy model for `Streak` (`id`, `activity_date`, `problems_completed`, `minutes_spent`).
- `backend/app/schemas/__init__.py` -- Pydantic schema exports.
- `backend/app/schemas/topic.py` -- Pydantic schemas `TopicRead`, `TopicListResponse`.
- `backend/app/db/seed_topics.py` -- Idempotent seed function populating 14 DSA topics from PRD Section 8.1.
- `backend/app/api/topics.py` -- FastAPI router for `/api/topics`.
- `backend/app/main.py` -- Include topics router, configure lifespan/startup initialization and seeding.
- `backend/tests/test_topics.py` -- Pytest test suite testing table creation, seed idempotency, and `GET /api/topics`.

## Tasks & Acceptance

**Execution:**

- [x] `backend/app/core/config.py` -- Implement application configuration with Pydantic Settings -- Manages DB URL and environment defaults
- [x] `backend/app/core/database.py` -- Create SQLAlchemy engine, session maker, DeclarativeBase, and get_db dependency -- Provides database connection foundation
- [x] `backend/app/models/topic.py` -- Define Topic SQLAlchemy model -- Persists DSA curriculum topics
- [x] `backend/app/models/problem.py` -- Define Problem SQLAlchemy model -- Persists topic exercises
- [x] `backend/app/models/progress.py` -- Define Progress SQLAlchemy model -- Tracks completion and attempts
- [x] `backend/app/models/assessment.py` -- Define Assessment SQLAlchemy model -- Tracks pre/post grill evaluation metrics
- [x] `backend/app/models/streak.py` -- Define Streak SQLAlchemy model -- Tracks consecutive practice days
- [x] `backend/app/models/__init__.py` -- Export all models and Base -- Consolidates model registry
- [x] `backend/app/schemas/topic.py` -- Define TopicRead and TopicResponse schemas -- Standardizes API serialisation
- [x] `backend/app/db/seed_topics.py` -- Implement idempotent seed logic for all 14 topics -- Populates DSA roadmap
- [x] `backend/app/api/topics.py` -- Implement GET /api/topics router endpoint -- Serves topics with progress status
- [x] `backend/app/main.py` -- Register router and startup DB initialization -- Integrates persistence into FastAPI app
- [x] `backend/tests/test_topics.py` -- Implement Pytest integration tests for topics API and seed idempotency -- Ensures verification

**Acceptance Criteria:**

- Given a fresh backend launch, when DB initialization runs, then tables for `topics`, `problems`, `progress`, `assessments`, and `streaks` exist in SQLite.
- Given the seeding logic, when executed multiple times, then exactly 14 topics exist without duplicate key violations.
- Given `GET /api/topics`, when called, then all 14 topics are returned ordered by `difficulty_order` with `"not_started"` status.
- Given the test suite, when `uv run pytest` is executed in `backend/`, then all database and API tests pass.
- Given `uv run ruff check .` and `uv run mypy app`, when executed in `backend/`, then 0 lint or type errors occur.

## Implementation Notes

- Configured `Settings` with `DATABASE_URL` default in `backend/app/core/config.py`.
- Configured SQLAlchemy 2.0 `engine`, `SessionLocal`, `Base(DeclarativeBase)`, and `get_db` session generator in `backend/app/core/database.py`.
- Created declarative SQLAlchemy models in `backend/app/models/` for `Topic`, `Problem`, `Progress`, `Assessment`, and `Streak` adhering to the architecture schema.
- Added Pydantic schemas `TopicRead`, `TopicResponse`, and `TopicListResponse` in `backend/app/schemas/topic.py`.
- Created idempotent topic seeder `seed_topics` in `backend/app/db/seed_topics.py` pre-loaded with all 14 curriculum topics, descriptions, difficulty orders, and key patterns from PRD Section 8.1.
- Implemented `/api/topics` endpoints in `backend/app/api/topics.py` serving sorted topics with progress status calculation.
- Integrated schema initialization and seeding into FastAPI app lifespan in `backend/app/main.py`.
- Verified with Pytest (7 tests passing), Ruff (0 lint errors), and Mypy (0 type errors across 17 source files).

## Spec Change Log

## Review Triage Log

| Finding | Severity | Evidence | Disposition |
|---------|----------|----------|-------------|
| SQLite foreign keys unconfigured | medium | `sqlite3` disables foreign keys by default unless `PRAGMA foreign_keys=ON;` listener is registered | patch |
| Duplicate progress records possible | medium | `Progress` lacks `UniqueConstraint('topic_id', 'problem_id')`, allowing duplicated entries | patch |
| Lifespan startup modifies prod DB in tests | medium | `lifespan` bound directly to static engine; test runs without override create `algoscope.db` file | patch |
| Unverified progress in `GET /api/topics` list | low | `test_topic_status_with_progress` checks single slug but does not assert status in `/api/topics` list | patch |
| Lifespan startup unverified in test suite | low | Tests create tables manually via fixtures and never verify `lifespan(app)` startup behavior | patch |
| `Topic.difficulty_order` missing uniqueness | low | PRD mandates sequential 1-14 order; `unique=True` on `difficulty_order` prevents collisions | patch |
| `Progress.completed_at` timezone mismatch | low | `Assessment.created_at` uses `DateTime(timezone=True)`; `Progress` should align | patch |
| `seed_topics` missing try/rollback | low | Unexpected errors during seed commit should rollback to leave session in clean state | patch |
| Missing `GET /api/topics/{slug}/problems` | false | Problems endpoints are explicitly scoped to Topic 1 & 11 in Epic 2 and 3, not Story 1.3 | reject |
| Synchronous lifespan initialization | false | Startup database initialization before accepting traffic is standard FastAPI practice | reject |
| Sprint status in progress | false | Normal workflow state during review phase; will transition to review in step-05 | reject |

## Design Notes

- Models utilize SQLAlchemy 2.0 `Mapped` and `mapped_column` type annotations.
- `key_patterns` and `pattern_tags` are stored as JSON columns using SQLAlchemy's `JSON` type for native compatibility across SQLite and Postgres.
- `GET /api/topics` joins or queries `Progress` records (if any) or defaults status to `"not_started"` when no progress record exists for a topic.

## Verification

**Commands:**

- `cd backend && uv run pytest` -- expected: all unit and integration tests pass with code 0.
- `cd backend && uv run ruff check app tests` -- expected: Ruff reports no linting errors.
- `cd backend && uv run mypy app` -- expected: Mypy reports no type check errors.
- `cd backend && uv run python -c "from app.core.database import engine, Base; from app.db.seed_topics import seed_topics; from app.core.database import SessionLocal; Base.metadata.create_all(bind=engine); db=SessionLocal(); seed_topics(db); db.close()"` -- expected: executes cleanly with 0 errors.
