"""SQLAlchemy model for tracking learner daily practice streaks."""

from datetime import date

from sqlalchemy import Date, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Streak(Base):
    """Streak entity tracking daily practice consistency and metrics."""

    __tablename__ = "streaks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    activity_date: Mapped[date] = mapped_column(
        Date, unique=True, index=True, nullable=False
    )
    problems_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    minutes_spent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
