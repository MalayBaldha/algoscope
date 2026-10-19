"""FastAPI router for DSA curriculum topics."""

from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.progress import Progress
from app.models.topic import Topic
from app.schemas.topic import TopicRead

router = APIRouter(prefix="/api/topics", tags=["topics"])


def determine_topic_status(progress_records: list[Progress]) -> str:
    """Determine the topic-level status based on related progress records."""
    if not progress_records:
        return "not_started"

    # Check for direct topic-level progress record (where problem_id is None)
    for prog in progress_records:
        if prog.problem_id is None and prog.status:
            return prog.status

    statuses = [p.status for p in progress_records]
    if all(s in ("completed", "mastered") for s in statuses):
        return "completed"
    if any(s in ("in_progress", "completed", "mastered") for s in statuses):
        return "in_progress"

    return "not_started"


@router.get("", response_model=list[TopicRead])
def get_topics(db: Session = Depends(get_db)) -> list[TopicRead]:
    """Retrieve all DSA curriculum topics sorted by difficulty order."""
    topics = db.scalars(select(Topic).order_by(Topic.difficulty_order.asc())).all()

    # Load all progress records in a single query
    progress_records = db.scalars(select(Progress)).all()
    progress_by_topic: dict[int, list[Progress]] = defaultdict(list)
    for prog in progress_records:
        progress_by_topic[prog.topic_id].append(prog)

    result: list[TopicRead] = []
    for topic in topics:
        current_status = determine_topic_status(progress_by_topic.get(topic.id, []))
        result.append(
            TopicRead(
                id=topic.id,
                slug=topic.slug,
                title=topic.title,
                description=topic.description,
                difficulty_order=topic.difficulty_order,
                icon=topic.icon,
                key_patterns=topic.key_patterns,
                status=current_status,
            )
        )

    return result


@router.get("/{slug}", response_model=TopicRead)
def get_topic_by_slug(slug: str, db: Session = Depends(get_db)) -> TopicRead:
    """Retrieve a single DSA curriculum topic by its slug."""
    topic = db.scalars(select(Topic).where(Topic.slug == slug)).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with slug '{slug}' not found",
        )

    progress_records = db.scalars(
        select(Progress).where(Progress.topic_id == topic.id)
    ).all()
    current_status = determine_topic_status(list(progress_records))

    return TopicRead(
        id=topic.id,
        slug=topic.slug,
        title=topic.title,
        description=topic.description,
        difficulty_order=topic.difficulty_order,
        icon=topic.icon,
        key_patterns=topic.key_patterns,
        status=current_status,
    )
