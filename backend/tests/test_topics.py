"""Tests for SQLite database models, topic seed scaffolding, and topics API."""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.db.seed_topics import seed_topics
from app.main import app, lifespan
from app.models.assessment import Assessment  # noqa: F401
from app.models.problem import Problem  # noqa: F401
from app.models.progress import Progress
from app.models.streak import Streak  # noqa: F401
from app.models.topic import Topic

# Use in-memory SQLite database for isolated test execution
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
    """Create all tables before each test and drop them after."""
    app.state.engine = test_engine
    app.state.session_factory = TestingSessionLocal

    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    try:
        yield db
    finally:
        db.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=test_engine)
        if hasattr(app.state, "engine"):
            del app.state.engine
        if hasattr(app.state, "session_factory"):
            del app.state.session_factory


@pytest.fixture
def test_client() -> Generator[TestClient, None, None]:
    """Provide a TestClient instance."""
    with TestClient(app) as client:
        yield client


def test_tables_created() -> None:
    """Verify that all required tables exist in the SQLite database."""
    inspector = inspect(test_engine)
    table_names = set(inspector.get_table_names())
    expected_tables = {"topics", "problems", "progress", "assessments", "streaks"}
    assert expected_tables.issubset(table_names), f"Missing tables: {expected_tables - table_names}"


def test_seed_topics_idempotency(setup_test_db: Session) -> None:
    """Verify that seeding is idempotent and always produces exactly 14 topics."""
    db = setup_test_db

    # First seed run
    topics_first_run = seed_topics(db)
    assert len(topics_first_run) == 14

    count_first = len(db.scalars(select(Topic)).all())
    assert count_first == 14

    # Second seed run (must not raise duplicate key errors or duplicate records)
    topics_second_run = seed_topics(db)
    assert len(topics_second_run) == 14

    count_second = len(db.scalars(select(Topic)).all())
    assert count_second == 14

    # Verify orders 1 to 14
    sorted_topics = db.scalars(select(Topic).order_by(Topic.difficulty_order.asc())).all()
    for index, topic in enumerate(sorted_topics, start=1):
        assert topic.difficulty_order == index
        assert len(topic.key_patterns) > 0


def test_get_topics_endpoint(setup_test_db: Session, test_client: TestClient) -> None:
    """Verify GET /api/topics returns all 14 topics ordered with 'not_started' status."""
    db = setup_test_db
    seed_topics(db)

    response = test_client.get("/api/topics")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 14

    # Check ascending difficulty order and initial progress status
    for i, topic in enumerate(data, start=1):
        assert topic["difficulty_order"] == i
        assert topic["status"] == "not_started"
        assert len(topic["key_patterns"]) > 0
        assert topic["title"] != ""
        assert topic["slug"] != ""


def test_get_topic_by_slug(setup_test_db: Session, test_client: TestClient) -> None:
    """Verify GET /api/topics/{slug} returns topic details or 404."""
    db = setup_test_db
    seed_topics(db)

    # Valid slug
    response = test_client.get("/api/topics/arrays-and-strings")
    assert response.status_code == 200
    topic = response.json()
    assert topic["slug"] == "arrays-and-strings"
    assert topic["title"] == "Arrays & Strings"
    assert topic["difficulty_order"] == 1
    assert topic["status"] == "not_started"

    # Non-existent slug
    response_404 = test_client.get("/api/topics/non-existent-topic")
    assert response_404.status_code == 404
    assert "not found" in response_404.json()["detail"].lower()


def test_topic_status_with_progress(setup_test_db: Session, test_client: TestClient) -> None:
    """Verify that status updates according to associated progress records."""
    db = setup_test_db
    seed_topics(db)

    graphs = db.scalars(select(Topic).where(Topic.slug == "graphs")).first()
    assert graphs is not None

    # Add an in_progress record for graphs
    progress = Progress(
        topic_id=graphs.id,
        problem_id=None,
        status="in_progress",
        attempts=3,
    )
    db.add(progress)
    db.commit()

    # Verify single topic endpoint reflects status
    response_single = test_client.get("/api/topics/graphs")
    assert response_single.status_code == 200
    assert response_single.json()["status"] == "in_progress"

    # Verify GET /api/topics list endpoint reflects updated status
    response_list = test_client.get("/api/topics")
    assert response_list.status_code == 200
    topics_list = response_list.json()
    graphs_in_list = next(t for t in topics_list if t["slug"] == "graphs")
    assert graphs_in_list["status"] == "in_progress"


def test_db_session_lifecycle(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify that get_db yields a live session and closes it on completion."""
    monkeypatch.setattr("app.core.database.SessionLocal", TestingSessionLocal)
    gen = get_db()
    session = next(gen)
    assert isinstance(session, Session)
    assert session.is_active

    with pytest.raises(StopIteration):
        next(gen)


@pytest.mark.asyncio
async def test_app_lifespan() -> None:
    """Verify that app lifespan initializes schema and seeds topics on startup."""
    isolated_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    isolated_session_factory = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=isolated_engine,
    )

    app.state.engine = isolated_engine
    app.state.session_factory = isolated_session_factory

    try:
        async with lifespan(app):
            # Verify tables exist
            inspector = inspect(isolated_engine)
            table_names = set(inspector.get_table_names())
            assert "topics" in table_names

            # Verify topics were seeded
            with isolated_session_factory() as session:
                topics = session.scalars(select(Topic)).all()
                assert len(topics) == 14
    finally:
        if hasattr(app.state, "engine"):
            del app.state.engine
        if hasattr(app.state, "session_factory"):
            del app.state.session_factory
        Base.metadata.drop_all(bind=isolated_engine)
