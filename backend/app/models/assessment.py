"""SQLAlchemy model for pre- and post-topic grill assessments."""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.topic import Topic


def get_utc_now() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.now(UTC)


class Assessment(Base):
    """Assessment evaluation entity for conceptual and pattern metrics."""

    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id"), nullable=False, index=True
    )
    assessment_type: Mapped[str] = mapped_column(String(20), nullable=False)
    conceptual_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pattern_recognition_score: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    complexity_accuracy_score: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    questions_and_answers: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=get_utc_now,
        nullable=False,
    )

    topic: Mapped["Topic"] = relationship(
        "Topic",
        back_populates="assessments",
    )
