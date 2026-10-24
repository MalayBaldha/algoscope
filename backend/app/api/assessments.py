"""FastAPI router for pre- and post-topic assessments and score comparisons."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.assessment import Assessment
from app.models.streak import Streak
from app.models.topic import Topic
from app.schemas.assessment import (
    AssessmentComparison,
    AssessmentCreate,
    AssessmentRead,
    AssessmentScoreDelta,
    AssessmentSummaryResponse,
)

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


def build_comparison(
    topic: Topic,
    pre: Assessment | None,
    post: Assessment | None,
) -> AssessmentComparison:
    """Build an AssessmentComparison model for a given topic."""
    pre_read = (
        AssessmentRead(
            id=pre.id,
            topic_id=pre.topic_id,
            assessment_type=pre.assessment_type,
            conceptual_score=pre.conceptual_score,
            pattern_recognition_score=pre.pattern_recognition_score,
            complexity_accuracy_score=pre.complexity_accuracy_score,
            questions_and_answers=pre.questions_and_answers,
            created_at=pre.created_at,
            topic_title=topic.title,
            topic_slug=topic.slug,
        )
        if pre
        else None
    )

    post_read = (
        AssessmentRead(
            id=post.id,
            topic_id=post.topic_id,
            assessment_type=post.assessment_type,
            conceptual_score=post.conceptual_score,
            pattern_recognition_score=post.pattern_recognition_score,
            complexity_accuracy_score=post.complexity_accuracy_score,
            questions_and_answers=post.questions_and_answers,
            created_at=post.created_at,
            topic_title=topic.title,
            topic_slug=topic.slug,
        )
        if post
        else None
    )

    delta: AssessmentScoreDelta | None = None
    if pre and post:
        c_delta = post.conceptual_score - pre.conceptual_score
        p_delta = post.pattern_recognition_score - pre.pattern_recognition_score
        x_delta = post.complexity_accuracy_score - pre.complexity_accuracy_score
        tot_delta = c_delta + p_delta + x_delta
        avg_delta = round(tot_delta / 3.0, 2)
        delta = AssessmentScoreDelta(
            conceptual_delta=c_delta,
            pattern_recognition_delta=p_delta,
            complexity_accuracy_delta=x_delta,
            total_delta=tot_delta,
            average_delta=avg_delta,
        )

    return AssessmentComparison(
        topic_id=topic.id,
        topic_slug=topic.slug,
        topic_title=topic.title,
        pre=pre_read,
        post=post_read,
        delta=delta,
    )


@router.get("", response_model=AssessmentSummaryResponse)
def get_assessments_summary(db: Session = Depends(get_db)) -> AssessmentSummaryResponse:
    """Retrieve all assessment comparisons across topics and aggregate score deltas."""
    topics = db.scalars(select(Topic).order_by(Topic.difficulty_order.asc())).all()
    all_assessments = db.scalars(
        select(Assessment).order_by(Assessment.created_at.asc())
    ).all()

    # Group assessments by topic_id and type, preserving order so the last is latest
    pre_by_topic: dict[int, Assessment] = {}
    post_by_topic: dict[int, Assessment] = {}

    for a in all_assessments:
        if a.assessment_type == "pre":
            pre_by_topic[a.topic_id] = a
        elif a.assessment_type == "post":
            post_by_topic[a.topic_id] = a

    comparisons: list[AssessmentComparison] = []
    for topic in topics:
        pre = pre_by_topic.get(topic.id)
        post = post_by_topic.get(topic.id)
        if pre is not None or post is not None:
            comparisons.append(build_comparison(topic, pre, post))

    pre_scores_list = [
        (
            c.pre.conceptual_score
            + c.pre.pattern_recognition_score
            + c.pre.complexity_accuracy_score
        )
        / 3.0
        for c in comparisons
        if c.pre is not None
    ]
    post_scores_list = [
        (
            c.post.conceptual_score
            + c.post.pattern_recognition_score
            + c.post.complexity_accuracy_score
        )
        / 3.0
        for c in comparisons
        if c.post is not None
    ]

    avg_pre = (
        round(sum(pre_scores_list) / len(pre_scores_list), 2)
        if pre_scores_list
        else 0.0
    )
    avg_post = (
        round(sum(post_scores_list) / len(post_scores_list), 2)
        if post_scores_list
        else 0.0
    )

    deltas = [c.delta.average_delta for c in comparisons if c.delta is not None]
    avg_delta = round(sum(deltas) / len(deltas), 2) if deltas else 0.0

    return AssessmentSummaryResponse(
        comparisons=comparisons,
        total_assessments=len(all_assessments),
        average_pre_score=avg_pre,
        average_post_score=avg_post,
        average_delta=avg_delta,
    )


@router.post("", response_model=AssessmentRead, status_code=status.HTTP_201_CREATED)
def record_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
) -> AssessmentRead:
    """Record a pre- or post-topic grill assessment and update user practice streaks."""
    topic = db.scalar(select(Topic).where(Topic.id == payload.topic_id))
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with ID {payload.topic_id} not found",
        )

    if payload.assessment_type not in ("pre", "post"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="assessment_type must be either 'pre' or 'post'",
        )

    assessment = Assessment(
        topic_id=payload.topic_id,
        assessment_type=payload.assessment_type,
        conceptual_score=payload.conceptual_score,
        pattern_recognition_score=payload.pattern_recognition_score,
        complexity_accuracy_score=payload.complexity_accuracy_score,
        questions_and_answers=payload.questions_and_answers,
    )
    db.add(assessment)

    # Record practice activity into daily streak
    today = date.today()
    streak = db.scalar(select(Streak).where(Streak.activity_date == today))
    if streak:
        streak.minutes_spent += 5
    else:
        streak = Streak(activity_date=today, problems_completed=0, minutes_spent=5)
        db.add(streak)

    db.commit()
    db.refresh(assessment)

    return AssessmentRead(
        id=assessment.id,
        topic_id=assessment.topic_id,
        assessment_type=assessment.assessment_type,
        conceptual_score=assessment.conceptual_score,
        pattern_recognition_score=assessment.pattern_recognition_score,
        complexity_accuracy_score=assessment.complexity_accuracy_score,
        questions_and_answers=assessment.questions_and_answers,
        created_at=assessment.created_at,
        topic_title=topic.title,
        topic_slug=topic.slug,
    )


@router.get("/{topic_id_or_slug}", response_model=AssessmentComparison)
def get_topic_assessment(
    topic_id_or_slug: str,
    db: Session = Depends(get_db),
) -> AssessmentComparison:
    """Retrieve pre vs. post assessment comparison for a specific topic."""
    if topic_id_or_slug.isdigit():
        topic = db.scalar(select(Topic).where(Topic.id == int(topic_id_or_slug)))
    else:
        topic = db.scalar(select(Topic).where(Topic.slug == topic_id_or_slug))

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{topic_id_or_slug}' not found",
        )

    assessments = db.scalars(
        select(Assessment)
        .where(Assessment.topic_id == topic.id)
        .order_by(Assessment.created_at.asc())
    ).all()

    pre: Assessment | None = None
    post: Assessment | None = None

    for a in assessments:
        if a.assessment_type == "pre":
            pre = a
        elif a.assessment_type == "post":
            post = a

    return build_comparison(topic, pre, post)
