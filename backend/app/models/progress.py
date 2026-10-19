"""SQLAlchemy model for tracking learner problem and topic progress."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.problem import Problem
    from app.models.topic import Topic


class Progress(Base):
    """Progress entity tracking user performance on topics and problems."""

    __tablename__ = "progress"
    __table_args__ = (
        UniqueConstraint("topic_id", "problem_id", name="uq_progress_topic_problem"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id"), nullable=False, index=True
    )
    problem_id: Mapped[int | None] = mapped_column(
        ForeignKey("problems.id"),
        nullable=True,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(50), default="not_started", nullable=False
    )
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hints_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    topic: Mapped["Topic"] = relationship(
        "Topic",
        back_populates="progress_records",
    )
    problem: Mapped["Problem | None"] = relationship(
        "Problem",
        back_populates="progress_records",
    )
