"""Pydantic schemas for learner progress, streaks, and curriculum summaries."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TopicProgressSummary(BaseModel):
    """Progress snapshot for an individual topic."""

    topic_id: int
    slug: str
    title: str
    difficulty_order: int
    status: str = Field(
        default="not_started",
        description="'not_started' | 'in_progress' | 'completed' | 'mastered'",
    )
    total_problems: int = 0
    completed_problems: int = 0
    time_spent_seconds: int = 0

    model_config = ConfigDict(from_attributes=True)


class StreakInfo(BaseModel):
    """Daily practice streak metrics and overall activity consistency."""

    current_streak: int = Field(
        default=0,
        description="Consecutive daily active practice days ending today or yesterday",
    )
    longest_streak: int = Field(
        default=0,
        description="All-time longest streak in consecutive calendar days",
    )
    last_activity_date: date | None = Field(
        default=None,
        description="Most recent recorded practice date",
    )
    total_active_days: int = Field(
        default=0,
        description="Total distinct days with recorded practice",
    )
    total_problems_completed: int = Field(
        default=0,
        description="Cumulative count of completed problems",
    )
    total_minutes_spent: int = Field(
        default=0,
        description="Cumulative minutes logged in exercises",
    )


class ProgressSummaryResponse(BaseModel):
    """Aggregate curriculum progress response for the dashboard shell."""

    total_topics: int = 0
    not_started: int = 0
    in_progress: int = 0
    completed: int = 0
    mastered: int = 0
    completion_percentage: float = 0.0
    streak: StreakInfo = Field(default_factory=StreakInfo)
    current_streak: int = Field(
        default=0,
        description="Top-level alias for streak.current_streak",
    )
    topics: list[TopicProgressSummary] = Field(default_factory=list)


class ProgressUpdate(BaseModel):
    """Payload schema for updating problem or topic progress."""

    topic_id: int
    problem_id: int | None = None
    status: str | None = Field(
        default=None,
        description="'not_started' | 'in_progress' | 'completed' | 'mastered'",
    )
    attempts: int = Field(default=0, ge=0)
    hints_used: int = Field(default=0, ge=0)
    time_spent_seconds: int = Field(default=0, ge=0)


class ProgressRead(BaseModel):
    """Schema representing an existing progress record."""

    id: int
    topic_id: int
    problem_id: int | None = None
    status: str
    attempts: int
    hints_used: int
    time_spent_seconds: int
    completed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
