"""Unit and integration test suite for Sliding Window Maximum algorithm.

Covers algorithmic correctness, edge cases, deterministic Frame generation,
and FastAPI endpoint integration for Story 2.2.
"""

from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.dsa.arrays.sliding_window import (
    execute_sliding_window,
    generate_sliding_window_frames,
    sliding_window_maximum,
)
from app.main import app
from app.schemas.frame import AlgorithmExecutionResponse, Frame

client = TestClient(app)


# ==============================================================================
# Unit Tests: Algorithmic Logic & Edge Cases
# ==============================================================================


def test_sliding_window_standard_execution() -> None:
    """Standard sliding window execution matching LeetCode 239 example."""
    nums = [1, 3, -1, -3, 5, 3, 6, 7]
    k = 3
    expected = [3, 3, 5, 5, 6, 7]
    assert sliding_window_maximum(nums, k) == expected


def test_sliding_window_empty_array() -> None:
    """Empty input array returns empty result list."""
    assert sliding_window_maximum([], 3) == []


def test_sliding_window_size_one() -> None:
    """Window size 1 slides across each individual element."""
    nums = [4, 2, 7]
    k = 1
    assert sliding_window_maximum(nums, k) == [4, 2, 7]


def test_sliding_window_size_exceeds_length() -> None:
    """Window size k > len(nums) produces a single maximum of available elements."""
    nums = [1, 2]
    k = 5
    assert sliding_window_maximum(nums, k) == [2]


def test_sliding_window_all_negative_numbers() -> None:
    """Preserves sign integrity when evaluating all-negative arrays."""
    nums = [-7, -2, -4, -9]
    k = 2
    assert sliding_window_maximum(nums, k) == [-2, -2, -4]


def test_sliding_window_duplicates() -> None:
    """Properly handles arrays with duplicate maximum values."""
    assert sliding_window_maximum([3, 3, 3], 2) == [3, 3]
    assert sliding_window_maximum([2, 2, 2, 2], 2) == [2, 2, 2]
    assert sliding_window_maximum([1, 3, 1, 2, 0, 5], 3) == [3, 3, 2, 5]


def test_sliding_window_single_element() -> None:
    """Evaluates single-element array correctly for k=1 and k > 1."""
    assert sliding_window_maximum([42], 1) == [42]
    assert sliding_window_maximum([42], 5) == [42]


def test_sliding_window_invalid_k_raises() -> None:
    """Invalid window sizes (k <= 0) raise ValueError."""
    with pytest.raises(ValueError, match="Window size k must be greater than 0"):
        sliding_window_maximum([1, 2, 3], 0)

    with pytest.raises(ValueError, match="Window size k must be greater than 0"):
        sliding_window_maximum([1, 2, 3], -2)


def test_sliding_window_does_not_mutate_input() -> None:
    """Ensures input list is not modified in-place."""
    original = [5, 2, 8, 1, 9]
    input_copy = list(original)
    _ = sliding_window_maximum(input_copy, 3)
    assert input_copy == original


# ==============================================================================
# Unit Tests: Frame Generation & Schema Contracts
# ==============================================================================


def test_generate_sliding_window_frames_structure() -> None:
    """Yielded frames strictly follow Pydantic Frame schema with valid phases and exact bounds."""
    nums = [1, 3, -1, -3, 5, 3, 6, 7]
    k = 3
    metrics: dict[str, Any] = {}
    frames = list(generate_sliding_window_frames(nums, k, metrics_collector=metrics))

    assert len(frames) == 10
    assert metrics["total_steps"] == len(frames)
    assert metrics["time_complexity"] == "O(N)"
    assert metrics["space_complexity"] == "O(K)"
    assert metrics["comparisons"] > 0
    assert metrics["max_values"] == [3, 3, 5, 5, 6, 7]

    expected_phases = [
        "initialize",
        "expand_window",
        "expand_window",
        "record_max",
        "slide_window",
        "slide_window",
        "slide_window",
        "slide_window",
        "slide_window",
        "complete",
    ]
    assert [f.phase for f in frames] == expected_phases

    # Verify 0-indexed sequence counter, pointers, window slice, and highlights
    for idx, frame in enumerate(frames):
        assert frame.step == idx
        assert isinstance(frame, Frame)
        assert isinstance(frame.explanation, str)
        assert len(frame.explanation) > 0
        assert "nums" in frame.state
        assert "window" in frame.state
        assert "deque_indices" in frame.state
        assert "max_values" in frame.state

        left = frame.pointers["left"]
        right = frame.pointers["right"]

        if frame.phase == "initialize":
            assert left == 0
            assert right == 0
            assert frame.state["window"] == []
        else:
            assert isinstance(left, int)
            assert isinstance(right, int)
            assert frame.state["window"] == nums[left : right + 1]

        # Validate highlights
        for hl in frame.highlights:
            assert hl.color in ("primary", "secondary", "success", "danger", "warning")
            assert isinstance(hl.indices, list)


def test_generate_sliding_window_frames_empty_array() -> None:
    """Empty array yields single terminal complete frame."""
    metrics: dict[str, Any] = {}
    frames = list(generate_sliding_window_frames([], 3, metrics_collector=metrics))

    assert len(frames) == 1
    frame = frames[0]
    assert frame.step == 0
    assert frame.phase == "complete"
    assert frame.state["nums"] == []
    assert frame.state["max_values"] == []
    assert frame.pointers["left"] is None
    assert frame.pointers["right"] is None
    assert metrics["total_steps"] == 1
    assert metrics["max_values"] == []


def test_generate_sliding_window_frames_invalid_k() -> None:
    """generate_sliding_window_frames raises ValueError on k <= 0."""
    with pytest.raises(ValueError, match="Window size k must be greater than 0"):
        list(generate_sliding_window_frames([1, 2], 0))


def test_execute_sliding_window_wrapper() -> None:
    """execute_sliding_window returns valid AlgorithmExecutionResponse."""
    nums = [4, 2, 7]
    response = execute_sliding_window(nums, 1)

    assert isinstance(response, AlgorithmExecutionResponse)
    assert response.success is True
    assert response.total_steps == len(response.frames)
    assert response.metrics["max_values"] == [4, 2, 7]
    assert response.error is None


# ==============================================================================
# Integration Tests: FastAPI DSA Endpoint
# ==============================================================================


def test_endpoint_standard_execution() -> None:
    """POST /api/dsa/arrays/sliding-window/execute returns 200 with frames."""
    payload = {"nums": [1, 3, -1, -3, 5, 3, 6, 7], "k": 3}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_steps"] == len(data["frames"])
    assert data["metrics"]["time_complexity"] == "O(N)"
    assert data["metrics"]["max_values"] == [3, 3, 5, 5, 6, 7]
    assert len(data["frames"]) == data["total_steps"]
    assert data["frames"][0]["phase"] == "initialize"
    assert data["frames"][-1]["phase"] == "complete"


def test_endpoint_empty_array() -> None:
    """POST /api/dsa/arrays/sliding-window/execute handles empty array."""
    payload = {"nums": [], "k": 3}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_steps"] == 1
    assert data["metrics"]["max_values"] == []
    assert len(data["frames"]) == 1
    assert data["frames"][0]["phase"] == "complete"


def test_endpoint_window_size_one() -> None:
    """POST /api/dsa/arrays/sliding-window/execute handles k=1."""
    payload = {"nums": [4, 2, 7], "k": 1}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["metrics"]["max_values"] == [4, 2, 7]


def test_endpoint_window_exceeds_length() -> None:
    """POST /api/dsa/arrays/sliding-window/execute handles k > len(nums)."""
    payload = {"nums": [1, 2], "k": 5}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["metrics"]["max_values"] == [2]


def test_endpoint_negative_numbers() -> None:
    """POST /api/dsa/arrays/sliding-window/execute handles negative numbers."""
    payload = {"nums": [-7, -2, -4, -9], "k": 2}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["metrics"]["max_values"] == [-2, -2, -4]


def test_endpoint_invalid_k_zero() -> None:
    """POST /api/dsa/arrays/sliding-window/execute rejects k=0 with 422."""
    payload = {"nums": [1, 2, 3], "k": 0}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 422


def test_endpoint_invalid_k_negative() -> None:
    """POST /api/dsa/arrays/sliding-window/execute rejects negative k with 422."""
    payload = {"nums": [1, 2, 3], "k": -1}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 422


def test_endpoint_missing_k() -> None:
    """POST /api/dsa/arrays/sliding-window/execute rejects missing k with 422."""
    payload = {"nums": [1, 2, 3]}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 422


def test_execute_sliding_window_error_handling() -> None:
    """execute_sliding_window catches exceptions and returns failure response."""
    response = execute_sliding_window([1, 2, 3], 0)

    assert response.success is False
    assert response.total_steps == 0
    assert response.frames == []
    assert response.metrics == {}
    assert response.error == "Window size k must be greater than 0"


def test_endpoint_payload_max_length_validation() -> None:
    """POST /api/dsa/arrays/sliding-window/execute rejects nums exceeding max_length=1000."""
    payload = {"nums": [1] * 1001, "k": 3}
    response = client.post("/api/dsa/arrays/sliding-window/execute", json=payload)

    assert response.status_code == 422
