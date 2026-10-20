"""Tests for Frame, FrameHighlight, and AlgorithmExecutionResponse schemas."""

import pytest
from pydantic import ValidationError

from app.schemas.frame import AlgorithmExecutionResponse, Frame, FrameHighlight


def test_frame_highlight_defaults() -> None:
    """FrameHighlight should have sensible defaults."""
    highlight = FrameHighlight()
    assert highlight.indices == []
    assert highlight.color == "primary"
    assert highlight.label is None


def test_frame_highlight_custom_values() -> None:
    """FrameHighlight should accept custom values with int or str indices."""
    int_highlight = FrameHighlight(indices=[0, 2], color="danger", label="comparing")
    assert int_highlight.indices == [0, 2]
    assert int_highlight.color == "danger"
    assert int_highlight.label == "comparing"

    str_highlight = FrameHighlight(indices=["node-A", "node-B"], color="success")
    assert str_highlight.indices == ["node-A", "node-B"]
    assert str_highlight.color == "success"


def test_frame_highlight_invalid_color() -> None:
    """FrameHighlight should reject colors outside the allowed palette."""
    with pytest.raises(ValidationError):
        FrameHighlight(color="invalid-color")  # type: ignore[arg-type]


def test_frame_valid_creation() -> None:
    """Frame should validate successfully when required fields are supplied."""
    frame = Frame(
        step=0,
        phase="initialize",
        state={"array": [1, 2, 3]},
        pointers={"left": 0, "right": 2},
        highlights=[FrameHighlight(indices=[0], color="primary", label="left pointer")],
        explanation="Initialize two pointers at opposite ends",
    )
    assert frame.step == 0
    assert frame.phase == "initialize"
    assert frame.state == {"array": [1, 2, 3]}
    assert frame.pointers["left"] == 0
    assert len(frame.highlights) == 1
    assert frame.explanation == "Initialize two pointers at opposite ends"


def test_frame_missing_required_fields() -> None:
    """Frame should raise ValidationError if required fields are missing."""
    with pytest.raises(ValidationError):
        Frame(step=0)  # type: ignore[call-arg]


def test_algorithm_execution_response_valid() -> None:
    """AlgorithmExecutionResponse should serialize and deserialize correctly."""
    frame1 = Frame(
        step=0,
        phase="initialize",
        state={"array": [3, 1]},
        explanation="Initial array",
    )
    frame2 = Frame(
        step=1,
        phase="swap",
        state={"array": [1, 3]},
        pointers={"curr": 1},
        highlights=[FrameHighlight(indices=[0, 1], color="warning")],
        explanation="Swapped elements at index 0 and 1",
    )
    response = AlgorithmExecutionResponse(
        success=True,
        total_steps=2,
        frames=[frame1, frame2],
        metrics={"comparisons": 1, "swaps": 1, "time_complexity": "O(N^2)"},
    )
    assert response.success is True
    assert response.total_steps == 2
    assert len(response.frames) == 2
    assert response.metrics["swaps"] == 1
    assert response.error is None

    dumped = response.model_dump()
    assert dumped["total_steps"] == 2
    assert len(dumped["frames"]) == 2


def test_algorithm_execution_response_error() -> None:
    """AlgorithmExecutionResponse should support error payloads."""
    response = AlgorithmExecutionResponse(
        success=False,
        total_steps=0,
        frames=[],
        error="Execution timeout: loop exceeded 10,000 steps",
    )
    assert response.success is False
    assert response.total_steps == 0
    assert len(response.frames) == 0
    assert response.error == "Execution timeout: loop exceeded 10,000 steps"
