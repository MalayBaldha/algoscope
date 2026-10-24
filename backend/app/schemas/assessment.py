"""Pydantic schemas for Assessment entities and score comparisons."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AssessmentBase(BaseModel):
    """Base schema for topic assessment metrics."""

    topic_id: int
    assessment_type: str = Field(
        default="pre",
        description="'pre' or 'post' assessment evaluation",
    )
    conceptual_score: int = Field(
        default=0,
        ge=0,
        le=10,
        description="Conceptual understanding score (0-10)",
    )
    pattern_recognition_score: int = Field(
        default=0,
        ge=0,
        le=10,
        description="Pattern recognition score (0-10)",
    )
    complexity_accuracy_score: int = Field(
        default=0,
        ge=0,
        le=10,
        description="Complexity analysis accuracy score (0-10)",
    )
    questions_and_answers: dict[str, Any] = Field(
        default_factory=dict,
        description="Recorded QA prompt responses and notes",
    )


class AssessmentCreate(AssessmentBase):
    """Payload schema for logging a new assessment record."""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases_and_scores(cls, data: Any) -> Any:
        """Support convenient aliases: type -> assessment_type, scores array."""
        if isinstance(data, dict):
            # Normalize 'type' to 'assessment_type'
            if "type" in data and "assessment_type" not in data:
                data["assessment_type"] = data["type"]

            # Support scores array [conceptual, pattern, complexity]
            if "scores" in data and isinstance(data["scores"], list | tuple):
                scores = data["scores"]
                if len(scores) >= 1 and "conceptual_score" not in data:
                    data["conceptual_score"] = scores[0]
                if len(scores) >= 2 and "pattern_recognition_score" not in data:
                    data["pattern_recognition_score"] = scores[1]
                if len(scores) >= 3 and "complexity_accuracy_score" not in data:
                    data["complexity_accuracy_score"] = scores[2]

        return data


class AssessmentRead(AssessmentBase):
    """Schema representing an existing assessment record."""

    id: int
    created_at: datetime
    topic_title: str | None = None
    topic_slug: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AssessmentScoreDelta(BaseModel):
    """Score improvements across the 3 core dimensions and total delta."""

    conceptual_delta: int = Field(
        description="Difference in conceptual understanding (post - pre)"
    )
    pattern_recognition_delta: int = Field(
        description="Difference in pattern recognition (post - pre)"
    )
    complexity_accuracy_delta: int = Field(
        description="Difference in complexity accuracy (post - pre)"
    )
    total_delta: int = Field(description="Total points delta across all 3 dimensions")
    average_delta: float = Field(
        description="Average delta per dimension rounded to 2 decimals"
    )


class AssessmentComparison(BaseModel):
    """Before vs after assessment comparison for a specific topic."""

    topic_id: int
    topic_slug: str
    topic_title: str
    pre: AssessmentRead | None = None
    post: AssessmentRead | None = None
    delta: AssessmentScoreDelta | None = None


class AssessmentSummaryResponse(BaseModel):
    """Summary response for the dashboard assessment overview."""

    comparisons: list[AssessmentComparison] = Field(default_factory=list)
    total_assessments: int = 0
    average_pre_score: float = 0.0
    average_post_score: float = 0.0
    average_delta: float = 0.0
