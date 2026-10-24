"""FastAPI router for learner curriculum progress and active practice streaks."""

from collections import defaultdict
from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.topics import determine_topic_status
from app.core.database import get_db
from app.models.problem import Problem
from app.models.progress import Progress
from app.models.streak import Streak
from app.models.topic import Topic
from app.schemas.progress import (
    ProgressRead,
    ProgressSummaryResponse,
    ProgressUpdate,
    StreakInfo,
    TopicProgressSummary,
)

router = APIRouter(prefix="/api/progress", tags=["progress"])


def compute_streak_metrics(
    streak_records: list[Streak],
    reference_date: date | None = None,
) -> StreakInfo:
    """Compute active current streak, longest historical streak, and summary metrics."""
    if not streak_records:
        return StreakInfo()

    if reference_date is None:
        reference_date = date.today()

    dates = sorted({s.activity_date for s in streak_records if s.activity_date is not None})
    if not dates:
        return StreakInfo()

    date_set = set(dates)
    total_active_days = len(dates)
    total_problems = sum(s.problems_completed for s in streak_records)
    total_minutes = sum(s.minutes_spent for s in streak_records)
    last_activity = dates[-1]

    # Current streak calculation:
    # A streak remains active if the user engaged today or yesterday.
    current_streak = 0
    if reference_date in date_set:
        check_date = reference_date
        while check_date in date_set:
            current_streak += 1
            check_date -= timedelta(days=1)
    elif (reference_date - timedelta(days=1)) in date_set:
        check_date = reference_date - timedelta(days=1)
        while check_date in date_set:
            current_streak += 1
            check_date -= timedelta(days=1)

    # Longest consecutive days streak calculation
    longest_streak = 0
    cur_run = 0
    prev_date: date | None = None
    for d in dates:
        if prev_date is None or d == prev_date + timedelta(days=1):
            cur_run += 1
        else:
            cur_run = 1
        if cur_run > longest_streak:
            longest_streak = cur_run
        prev_date = d

    longest_streak = max(longest_streak, current_streak)

    return StreakInfo(
        current_streak=current_streak,
        longest_streak=longest_streak,
        last_activity_date=last_activity,
        total_active_days=total_active_days,
        total_problems_completed=total_problems,
        total_minutes_spent=total_minutes,
    )


@router.get("", response_model=ProgressSummaryResponse)
def get_progress_summary(db: Session = Depends(get_db)) -> ProgressSummaryResponse:
    """Retrieve full curriculum progress breakdown, topic statuses, and streak metrics."""
    topics = db.scalars(select(Topic).order_by(Topic.difficulty_order.asc())).all()
    progress_records = db.scalars(select(Progress)).all()
    problems = db.scalars(select(Problem)).all()
    streak_records = db.scalars(select(Streak).order_by(Streak.activity_date.asc())).all()

    # Index progress and problems by topic
    progress_by_topic: dict[int, list[Progress]] = defaultdict(list)
    for prog in progress_records:
        progress_by_topic[prog.topic_id].append(prog)

    problems_by_topic: dict[int, list[Problem]] = defaultdict(list)
    for prob in problems:
        problems_by_topic[prob.topic_id].append(prob)

    not_started_count = 0
    in_progress_count = 0
    completed_count = 0
    mastered_count = 0

    topic_summaries: list[TopicProgressSummary] = []
    for topic in topics:
        topic_progs = progress_by_topic.get(topic.id, [])
        topic_probs = problems_by_topic.get(topic.id, [])

        current_status = determine_topic_status(topic_progs)
        if current_status == "mastered":
            mastered_count += 1
        elif current_status == "completed":
            completed_count += 1
        elif current_status == "in_progress":
            in_progress_count += 1
        else:
            not_started_count += 1

        completed_probs = sum(
            1
            for p in topic_progs
            if p.problem_id is not None and p.status in ("completed", "mastered")
        )
        total_time = sum(p.time_spent_seconds for p in topic_progs)

        topic_summaries.append(
            TopicProgressSummary(
                topic_id=topic.id,
                slug=topic.slug,
                title=topic.title,
                difficulty_order=topic.difficulty_order,
                status=current_status,
                total_problems=len(topic_probs),
                completed_problems=completed_probs,
                time_spent_seconds=total_time,
            )
        )

    total_topics = len(topics)
    completed_sum = completed_count + mastered_count
    completion_percentage = (
        round((completed_sum / total_topics) * 100.0, 1) if total_topics > 0 else 0.0
    )

    streak_info = compute_streak_metrics(list(streak_records))

    return ProgressSummaryResponse(
        total_topics=total_topics,
        not_started=not_started_count,
        in_progress=in_progress_count,
        completed=completed_count,
        mastered=mastered_count,
        completion_percentage=completion_percentage,
        streak=streak_info,
        current_streak=streak_info.current_streak,
        topics=topic_summaries,
    )


@router.post("", response_model=ProgressRead, status_code=status.HTTP_200_OK)
def update_progress(
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
) -> ProgressRead:
    """Record or update learner progress on a topic or problem."""
    topic = db.scalar(select(Topic).where(Topic.id == payload.topic_id))
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic with ID {payload.topic_id} not found",
        )

    if payload.problem_id is not None:
        problem = db.scalar(select(Problem).where(Problem.id == payload.problem_id))
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID {payload.problem_id} not found",
            )
        if problem.topic_id != payload.topic_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Problem {payload.problem_id} does not belong to Topic {payload.topic_id}",
            )

    prog = db.scalar(
        select(Progress).where(
            Progress.topic_id == payload.topic_id,
            Progress.problem_id == payload.problem_id,
        )
    )

    is_newly_completed = False
    if prog:
        new_status = payload.status if payload.status is not None else prog.status
        # Prevent accidental demotion of completed or mastered status
        # if status was not explicitly provided in the payload
        if prog.status in ("completed", "mastered") and payload.status is None:
            new_status = prog.status

        if new_status in ("completed", "mastered") and prog.status not in (
            "completed",
            "mastered",
        ):
            is_newly_completed = True

        prog.status = new_status
        prog.attempts += payload.attempts
        prog.hints_used += payload.hints_used
        prog.time_spent_seconds += payload.time_spent_seconds
        if new_status in ("completed", "mastered") and prog.completed_at is None:
            prog.completed_at = datetime.now(UTC)
    else:
        new_status = payload.status if payload.status is not None else "in_progress"
        if new_status in ("completed", "mastered"):
            is_newly_completed = True
        prog = Progress(
            topic_id=payload.topic_id,
            problem_id=payload.problem_id,
            status=new_status,
            attempts=payload.attempts,
            hints_used=payload.hints_used,
            time_spent_seconds=payload.time_spent_seconds,
            completed_at=(
                datetime.now(UTC)
                if new_status in ("completed", "mastered")
                else None
            ),
        )
        db.add(prog)

    # Record or update streak entry for today
    today = date.today()
    streak = db.scalar(select(Streak).where(Streak.activity_date == today))
    problems_inc = 1 if is_newly_completed else 0
    minutes_inc = (
        max(1, payload.time_spent_seconds // 60)
        if payload.time_spent_seconds > 0
        else 0
    )

    if streak:
        streak.problems_completed += problems_inc
        streak.minutes_spent += minutes_inc
    else:
        streak = Streak(
            activity_date=today,
            problems_completed=problems_inc,
            minutes_spent=minutes_inc,
        )
        db.add(streak)

    db.commit()
    db.refresh(prog)
    return ProgressRead.model_validate(prog)
