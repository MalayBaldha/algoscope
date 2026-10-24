"""Pytest test suite for progress, streak metrics, and assessment APIs."""

from collections.abc import Generator
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.progress import compute_streak_metrics
from app.core.database import Base, get_db
from app.db.seed_topics import seed_topics
from app.main import app
from app.models.problem import Problem
from app.models.streak import Streak
from app.models.topic import Topic

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture(autouse=True)
def setup_test_db() -> Generator[Session, None, None]:
    """Create fresh database tables and seed topics before each test."""
    app.state.engine = test_engine
    app.state.session_factory = TestingSessionLocal

    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_topics(db)

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield db

    db.close()
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client() -> TestClient:
    """Return FastAPI TestClient."""
    return TestClient(app)


# ==========================================
# PROGRESS & STREAK API TESTS
# ==========================================


def test_progress_empty_state(client: TestClient) -> None:
    """Fresh install returns 14 not_started topics, streak 0, and safe 0.0 completion."""
    response = client.get("/api/progress")
    assert response.status_code == 200
    data = response.json()

    assert data["total_topics"] == 14
    assert data["not_started"] == 14
    assert data["in_progress"] == 0
    assert data["completed"] == 0
    assert data["mastered"] == 0
    assert data["completion_percentage"] == 0.0
    assert data["current_streak"] == 0
    assert data["streak"]["current_streak"] == 0
    assert data["streak"]["longest_streak"] == 0
    assert len(data["topics"]) == 14
    assert data["topics"][0]["status"] == "not_started"


def test_progress_update_and_summary_reflection(
    client: TestClient, setup_test_db: Session
) -> None:
    """POST /api/progress updates topic status and computes completion percentage."""
    db = setup_test_db
    topic = db.query(Topic).filter(Topic.slug == "arrays-and-strings").first()
    assert topic is not None

    # Step 1: Update progress to in_progress
    resp1 = client.post(
        "/api/progress",
        json={
            "topic_id": topic.id,
            "status": "in_progress",
            "time_spent_seconds": 300,
        },
    )
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "in_progress"

    summary1 = client.get("/api/progress").json()
    assert summary1["in_progress"] == 1
    assert summary1["not_started"] == 13
    assert summary1["completed"] == 0
    assert summary1["streak"]["current_streak"] == 1

    # Step 2: Complete the topic
    resp2 = client.post(
        "/api/progress",
        json={
            "topic_id": topic.id,
            "status": "completed",
            "time_spent_seconds": 600,
        },
    )
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "completed"

    summary2 = client.get("/api/progress").json()
    assert summary2["in_progress"] == 0
    assert summary2["completed"] == 1
    assert summary2["completion_percentage"] == round((1 / 14) * 100, 1)


def test_progress_invalid_topic_or_problem(client: TestClient) -> None:
    """Non-existent topic_id or problem_id returns 404."""
    resp = client.post(
        "/api/progress",
        json={"topic_id": 9999, "status": "in_progress"},
    )
    assert resp.status_code == 404


def test_streak_metric_computation() -> None:
    """Verify streak calculation with consecutive days, gaps, and longest runs."""
    today = date(2026, 10, 21)

    # Case 1: Empty streak records
    assert compute_streak_metrics([], reference_date=today).current_streak == 0

    # Case 2: Consecutive days including today (3 days: Oct 19, 20, 21)
    records = [
        Streak(activity_date=date(2026, 10, 19), problems_completed=1, minutes_spent=20),
        Streak(activity_date=date(2026, 10, 20), problems_completed=2, minutes_spent=30),
        Streak(activity_date=date(2026, 10, 21), problems_completed=1, minutes_spent=15),
    ]
    metrics = compute_streak_metrics(records, reference_date=today)
    assert metrics.current_streak == 3
    assert metrics.longest_streak == 3
    assert metrics.total_active_days == 3
    assert metrics.total_problems_completed == 4
    assert metrics.total_minutes_spent == 65

    # Case 3: Active streak through yesterday (today not practiced yet)
    records_yesterday = [
        Streak(activity_date=date(2026, 10, 19), problems_completed=1, minutes_spent=10),
        Streak(activity_date=date(2026, 10, 20), problems_completed=1, minutes_spent=10),
    ]
    metrics_y = compute_streak_metrics(records_yesterday, reference_date=today)
    assert metrics_y.current_streak == 2

    # Case 4: Broken streak (practiced 3 days ago, but not yesterday or today)
    records_broken = [
        Streak(activity_date=date(2026, 10, 15), problems_completed=1, minutes_spent=10),
        Streak(activity_date=date(2026, 10, 16), problems_completed=1, minutes_spent=10),
        Streak(activity_date=date(2026, 10, 17), problems_completed=1, minutes_spent=10),
        Streak(activity_date=date(2026, 10, 18), problems_completed=1, minutes_spent=10),
    ]
    metrics_broken = compute_streak_metrics(records_broken, reference_date=today)
    assert metrics_broken.current_streak == 0
    assert metrics_broken.longest_streak == 4


# ==========================================
# ASSESSMENT API TESTS
# ==========================================


def test_assessments_empty_state(client: TestClient) -> None:
    """Fresh install returns 200 with empty comparisons list and 0.0 averages."""
    response = client.get("/api/assessments")
    assert response.status_code == 200
    data = response.json()

    assert data["total_assessments"] == 0
    assert data["comparisons"] == []
    assert data["average_pre_score"] == 0.0
    assert data["average_post_score"] == 0.0
    assert data["average_delta"] == 0.0


def test_single_pre_assessment_logging(
    client: TestClient, setup_test_db: Session
) -> None:
    """Logging a single pre-assessment returns comparison with pre populated and delta=null."""
    db = setup_test_db
    topic = db.query(Topic).filter(Topic.slug == "arrays-and-strings").first()
    assert topic is not None

    post_resp = client.post(
        "/api/assessments",
        json={
            "topic_id": topic.id,
            "type": "pre",
            "scores": [7, 6, 8],
            "questions_and_answers": {"q1": "Sliding window reduces O(N^2) to O(N)"},
        },
    )
    assert post_resp.status_code == 201
    created = post_resp.json()
    assert created["conceptual_score"] == 7
    assert created["pattern_recognition_score"] == 6
    assert created["complexity_accuracy_score"] == 8
    assert created["assessment_type"] == "pre"

    # Verify summary shows comparison with post: null and delta: null
    summary = client.get("/api/assessments").json()
    assert summary["total_assessments"] == 1
    assert len(summary["comparisons"]) == 1

    comparison = summary["comparisons"][0]
    assert comparison["topic_id"] == topic.id
    assert comparison["pre"] is not None
    assert comparison["pre"]["conceptual_score"] == 7
    assert comparison["post"] is None
    assert comparison["delta"] is None
    assert summary["average_pre_score"] == round((7 + 6 + 8) / 3.0, 2)
    assert summary["average_delta"] == 0.0


def test_pre_and_post_assessment_comparison(
    client: TestClient, setup_test_db: Session
) -> None:
    """Logging both pre and post assessments calculates post - pre score deltas."""
    db = setup_test_db
    topic = db.query(Topic).filter(Topic.slug == "arrays-and-strings").first()
    assert topic is not None

    # Log pre assessment (scores 4, 5, 3)
    client.post(
        "/api/assessments",
        json={
            "topic_id": topic.id,
            "assessment_type": "pre",
            "conceptual_score": 4,
            "pattern_recognition_score": 5,
            "complexity_accuracy_score": 3,
        },
    )

    # Log post assessment (scores 9, 8, 9)
    client.post(
        "/api/assessments",
        json={
            "topic_id": topic.id,
            "assessment_type": "post",
            "conceptual_score": 9,
            "pattern_recognition_score": 8,
            "complexity_accuracy_score": 9,
        },
    )

    summary = client.get("/api/assessments").json()
    assert summary["total_assessments"] == 2
    assert len(summary["comparisons"]) == 1

    comp = summary["comparisons"][0]
    assert comp["pre"]["conceptual_score"] == 4
    assert comp["post"]["conceptual_score"] == 9
    assert comp["delta"] is not None
    assert comp["delta"]["conceptual_delta"] == 5
    assert comp["delta"]["pattern_recognition_delta"] == 3
    assert comp["delta"]["complexity_accuracy_delta"] == 6
    assert comp["delta"]["total_delta"] == 14
    assert comp["delta"]["average_delta"] == round(14 / 3.0, 2)


def test_assessment_by_topic_slug_and_id(
    client: TestClient, setup_test_db: Session
) -> None:
    """GET /api/assessments/{topic_id_or_slug} fetches comparison by either ID or slug."""
    db = setup_test_db
    topic = db.query(Topic).filter(Topic.slug == "graphs").first()
    assert topic is not None

    client.post(
        "/api/assessments",
        json={
            "topic_id": topic.id,
            "type": "pre",
            "scores": [5, 4, 6],
        },
    )

    by_id = client.get(f"/api/assessments/{topic.id}").json()
    assert by_id["topic_slug"] == "graphs"
    assert by_id["pre"]["conceptual_score"] == 5

    by_slug = client.get("/api/assessments/graphs").json()
    assert by_slug["topic_id"] == topic.id
    assert by_slug["pre"]["conceptual_score"] == 5


def test_assessment_score_validation(client: TestClient, setup_test_db: Session) -> None:
    """Scores outside 0-10 or invalid assessment_type are rejected with 422."""
    db = setup_test_db
    topic = db.query(Topic).first()
    assert topic is not None

    # Score > 10
    resp_high = client.post(
        "/api/assessments",
        json={"topic_id": topic.id, "type": "pre", "scores": [11, 5, 5]},
    )
    assert resp_high.status_code == 422

    # Score < 0
    resp_low = client.post(
        "/api/assessments",
        json={"topic_id": topic.id, "type": "pre", "scores": [-1, 5, 5]},
    )
    assert resp_low.status_code == 422

    # Invalid assessment type
    resp_type = client.post(
        "/api/assessments",
        json={"topic_id": topic.id, "type": "midterm", "scores": [5, 5, 5]},
    )
    assert resp_type.status_code == 422


def test_assessment_streak_updates(
    client: TestClient, setup_test_db: Session
) -> None:
    """Submitting assessments records practice minutes into daily streak."""
    db = setup_test_db
    topic = db.query(Topic).first()
    assert topic is not None

    # Step 1: Submit first assessment
    client.post(
        "/api/assessments",
        json={"topic_id": topic.id, "type": "pre", "scores": [7, 7, 7]},
    )
    prog1 = client.get("/api/progress").json()
    assert prog1["streak"]["current_streak"] == 1
    assert prog1["streak"]["total_minutes_spent"] == 5

    # Step 2: Submit second assessment
    client.post(
        "/api/assessments",
        json={"topic_id": topic.id, "type": "post", "scores": [9, 9, 9]},
    )
    prog2 = client.get("/api/progress").json()
    assert prog2["streak"]["current_streak"] == 1
    assert prog2["streak"]["total_minutes_spent"] == 10


def test_mastered_status_aggregation_and_non_demotion(
    client: TestClient, setup_test_db: Session
) -> None:
    """Mastered status is aggregated in summary and not demoted by metadata-only updates."""
    db = setup_test_db
    topic = db.query(Topic).first()
    assert topic is not None

    # Set topic to mastered
    resp = client.post(
        "/api/progress",
        json={"topic_id": topic.id, "status": "mastered", "time_spent_seconds": 120},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "mastered"

    summary = client.get("/api/progress").json()
    assert summary["mastered"] == 1
    assert summary["not_started"] == 13
    assert summary["completion_percentage"] == round((1 / 14) * 100, 1)

    # Perform a subsequent update without status (e.g. logging more practice time)
    resp2 = client.post(
        "/api/progress",
        json={"topic_id": topic.id, "time_spent_seconds": 60, "attempts": 1},
    )
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "mastered"

    # Status must still be mastered in summary
    summary2 = client.get("/api/progress").json()
    assert summary2["mastered"] == 1


def test_latest_assessment_supersession(
    client: TestClient, setup_test_db: Session
) -> None:
    """Retaking an assessment updates comparison and average without skew from older retakes."""
    db = setup_test_db
    topic = db.query(Topic).first()
    assert topic is not None

    # First attempt: low pre score (2, 2, 2)
    client.post(
        "/api/assessments",
        json={"topic_id": topic.id, "type": "pre", "scores": [2, 2, 2]},
    )

    # Second attempt (retake): higher pre score (8, 8, 8)
    client.post(
        "/api/assessments",
        json={"topic_id": topic.id, "type": "pre", "scores": [8, 8, 8]},
    )

    summary = client.get("/api/assessments").json()
    assert summary["total_assessments"] == 2
    assert len(summary["comparisons"]) == 1

    comparison = summary["comparisons"][0]
    assert comparison["pre"]["conceptual_score"] == 8
    # Average pre score should be based on latest comparison (8.0), not (2+8)/2 = 5.0
    assert summary["average_pre_score"] == 8.0


def test_404_on_invalid_topics_and_slugs_and_400_on_mismatch(
    client: TestClient, setup_test_db: Session
) -> None:
    """Invalid topic IDs or slugs return 404, and mismatched problem/topic IDs return 400."""
    db = setup_test_db
    topics = db.query(Topic).all()
    topic1, topic2 = topics[0], topics[1]

    # Create a problem attached to topic1
    prob = Problem(
        topic_id=topic1.id,
        slug="test-two-sum",
        title="Test Two Sum",
        difficulty="Easy",
        pattern_tags=["hash-table"],
    )
    db.add(prob)
    db.commit()
    db.refresh(prob)

    # 404 on invalid topic ID / slug for GET /api/assessments/{id_or_slug}
    assert client.get("/api/assessments/9999").status_code == 404
    assert client.get("/api/assessments/non-existent-topic-slug").status_code == 404

    # 404 on invalid topic for POST /api/assessments
    assert (
        client.post(
            "/api/assessments",
            json={"topic_id": 9999, "type": "pre", "scores": [5, 5, 5]},
        ).status_code
        == 404
    )

    # 400 Bad Request when problem_id belongs to topic1, but payload specifies topic2
    mismatch_resp = client.post(
        "/api/progress",
        json={"topic_id": topic2.id, "problem_id": prob.id, "status": "in_progress"},
    )
    assert mismatch_resp.status_code == 400

