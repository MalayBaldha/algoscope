"""Pydantic schemas for Topic entities."""

from pydantic import BaseModel, ConfigDict, Field


class TopicRead(BaseModel):
    """Schema representing a DSA topic with current progress status."""

    id: int
    slug: str
    title: str
    description: str
    difficulty_order: int
    icon: str = ""
    key_patterns: list[str] = Field(default_factory=list)
    status: str = "not_started"

    model_config = ConfigDict(from_attributes=True)


TopicResponse = TopicRead


class TopicListResponse(BaseModel):
    """Schema representing a paginated or complete list of topics."""

    topics: list[TopicRead]
    total: int

    model_config = ConfigDict(from_attributes=True)
