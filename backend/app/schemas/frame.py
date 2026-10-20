"""Pydantic schema contracts for algorithmic execution frames."""

from typing import Any, Literal

from pydantic import BaseModel, Field


class FrameHighlight(BaseModel):
    """Visual focus element pointing to structure indices or node IDs."""

    indices: list[int | str] = Field(
        default_factory=list,
        description="Target array indices or node IDs",
    )
    color: Literal["primary", "secondary", "success", "danger", "warning"] = "primary"
    label: str | None = Field(
        default=None,
        description="Optional callout e.g. 'left pointer'",
    )


class Frame(BaseModel):
    """Deterministic snapshot of algorithm state at a single step."""

    step: int = Field(..., description="0-indexed sequence counter")
    phase: str = Field(
        ...,
        description="e.g. 'initialize', 'compare', 'swap', 'shrink_window', 'complete'",
    )
    state: dict[str, Any] = Field(
        ...,
        description="Snapshot of the data structure (array, tree, grid, etc.)",
    )
    pointers: dict[str, Any] = Field(
        default_factory=dict,
        description="Active pointer/cursor keys e.g. {'left': 0, 'right': 3}",
    )
    highlights: list[FrameHighlight] = Field(
        default_factory=list,
        description="Visual focus elements",
    )
    explanation: str = Field(
        ...,
        description="Human-readable log of what occurred at this step",
    )


class AlgorithmExecutionResponse(BaseModel):
    """Unified payload returned by algorithm execution endpoints."""

    success: bool
    total_steps: int
    frames: list[Frame]
    metrics: dict[str, Any] = Field(
        default_factory=dict,
        description=(
            "e.g. {'comparisons': 12, 'swaps': 4, "
            "'time_complexity': 'O(N)', 'space_complexity': 'O(1)'}"
        ),
    )
    error: str | None = None
