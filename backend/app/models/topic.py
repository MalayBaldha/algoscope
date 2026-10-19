"""SQLAlchemy model for DSA curriculum topics."""

from typing import TYPE_CHECKING

from sqlalchemy import JSON, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.assessment import Assessment
    from app.models.problem import Problem
    from app.models.progress import Progress


class Topic(Base):
    """DSA curriculum topic model."""

    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty_order: Mapped[int] = mapped_column(
        Integer, unique=True, nullable=False, index=True
    )
    icon: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    key_patterns: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    problems: Mapped[list["Problem"]] = relationship(
        "Problem",
        back_populates="topic",
        cascade="all, delete-orphan",
    )
    progress_records: Mapped[list["Progress"]] = relationship(
        "Progress",
        back_populates="topic",
        cascade="all, delete-orphan",
    )
    assessments: Mapped[list["Assessment"]] = relationship(
        "Assessment",
        back_populates="topic",
        cascade="all, delete-orphan",
    )
