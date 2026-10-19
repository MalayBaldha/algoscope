"""SQLAlchemy model for DSA problem exercises."""

from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.progress import Progress
    from app.models.topic import Topic


class Problem(Base):
    """Problem entity for DSA exercises."""

    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id"), nullable=False, index=True
    )
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    pattern_tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    real_world_context: Mapped[str] = mapped_column(Text, default="", nullable=False)
    hints: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    starter_template: Mapped[str] = mapped_column(Text, default="", nullable=False)

    topic: Mapped["Topic"] = relationship(
        "Topic",
        back_populates="problems",
    )
    progress_records: Mapped[list["Progress"]] = relationship(
        "Progress",
        back_populates="problem",
        cascade="all, delete-orphan",
    )
