"""Sliding Window Maximum algorithm implementation and frame generator.

Topic: Topic 1 - Arrays & Strings
Pattern: Monotonic Deque Sliding Window
Time Complexity: O(N)
Space Complexity: O(K) where K is the window size
"""

from collections import deque
from collections.abc import Iterator
from typing import Any

from app.schemas.frame import (
    AlgorithmExecutionResponse,
    Frame,
    FrameHighlight,
)


def sliding_window_maximum(nums: list[int], k: int) -> list[int]:
    """Compute the maximum element in each sliding window of size k across nums.

    Args:
        nums: Input list of integers.
        k: Window size (must be >= 1).

    Returns:
        List of maximum integers for each valid window position.

    Raises:
        ValueError: If k <= 0.
    """
    if k <= 0:
        raise ValueError("Window size k must be greater than 0")

    if not nums:
        return []

    max_values: list[int] = []
    queue: deque[int] = deque()  # monotonic deque storing indices
    k_effective = min(k, len(nums))

    for right, val in enumerate(nums):
        left = max(0, right - k_effective + 1)

        # Evict indices that fall outside the active window
        if queue and queue[0] < left:
            queue.popleft()

        # Maintain decreasing monotonic order
        while queue and nums[queue[-1]] < val:
            queue.pop()

        queue.append(right)

        # Record maximum when the window is fully formed
        if right >= k_effective - 1:
            max_values.append(nums[queue[0]])

    return max_values


def generate_sliding_window_frames(
    nums: list[int],
    k: int,
    metrics_collector: dict[str, Any] | None = None,
) -> Iterator[Frame]:
    """Yield step-by-step Frame execution snapshots for Sliding Window Maximum.

    Args:
        nums: Input list of integers to evaluate.
        k: Window size (must be >= 1).
        metrics_collector: Optional dict to capture execution metrics.

    Yields:
        Deterministic Frame objects representing algorithm progression.

    Raises:
        ValueError: If k <= 0.
    """
    if k <= 0:
        raise ValueError("Window size k must be greater than 0")

    # Guard against in-place mutations
    input_array = list(nums)
    n = len(input_array)

    # Edge Case: Empty Array
    if n == 0:
        if metrics_collector is not None:
            metrics_collector.update(
                {
                    "comparisons": 0,
                    "time_complexity": "O(N)",
                    "space_complexity": "O(K)",
                    "total_steps": 1,
                    "max_values": [],
                }
            )
        yield Frame(
            step=0,
            phase="complete",
            state={
                "nums": [],
                "window": [],
                "deque_indices": [],
                "max_values": [],
            },
            pointers={"left": None, "right": None},
            highlights=[],
            explanation="Empty array provided. No window frames to generate.",
        )
        return

    queue: deque[int] = deque()
    max_vals: list[int] = []
    step = 0
    k_effective = min(k, n)
    comparisons = 0

    # Step 0: Initialization
    yield Frame(
        step=step,
        phase="initialize",
        state={
            "nums": list(input_array),
            "window": [],
            "deque_indices": [],
            "max_values": [],
        },
        pointers={"left": 0, "right": 0},
        highlights=[],
        explanation=f"Initialized sliding window of size k={k} for array of length {n}.",
    )

    for right, val in enumerate(input_array):
        left = max(0, right - k_effective + 1)

        # Evict indices outside current window
        if queue and queue[0] < left:
            queue.popleft()

        # Maintain decreasing monotonic order
        while queue and input_array[queue[-1]] < val:
            comparisons += 1
            queue.pop()

        queue.append(right)

        if right < k_effective - 1:
            phase = "expand_window"
            explanation = (
                f"Expanding window to index {right} (value {val}). "
                f"Candidate maximum is {input_array[queue[0]]}."
            )
        elif right == k_effective - 1:
            max_val = input_array[queue[0]]
            max_vals.append(max_val)
            phase = "record_max"
            explanation = (
                f"Formed initial window [{left}:{right}]. "
                f"Window maximum is {max_val} at index {queue[0]}."
            )
        else:
            max_val = input_array[queue[0]]
            max_vals.append(max_val)
            phase = "slide_window"
            explanation = (
                f"Slid window to [{left}:{right}]. "
                f"Window maximum is {max_val} at index {queue[0]}."
            )

        step += 1
        yield Frame(
            step=step,
            phase=phase,
            state={
                "nums": list(input_array),
                "window": input_array[left : right + 1],
                "deque_indices": list(queue),
                "max_values": list(max_vals),
            },
            pointers={"left": left, "right": right},
            highlights=[
                FrameHighlight(
                    indices=list(range(left, right + 1)),
                    color="primary",
                    label="window",
                ),
                FrameHighlight(
                    indices=[queue[0]],
                    color="success",
                    label="window_max",
                ),
            ],
            explanation=explanation,
        )

    step += 1
    yield Frame(
        step=step,
        phase="complete",
        state={
            "nums": list(input_array),
            "window": input_array[left : right + 1],
            "deque_indices": list(queue),
            "max_values": list(max_vals),
        },
        pointers={"left": left, "right": right},
        highlights=[],
        explanation=f"Sliding window completed. Resulting maximums: {max_vals}.",
    )

    if metrics_collector is not None:
        metrics_collector.update(
            {
                "comparisons": comparisons,
                "time_complexity": "O(N)",
                "space_complexity": "O(K)",
                "total_steps": step + 1,
                "max_values": max_vals,
            }
        )


def execute_sliding_window(nums: list[int], k: int) -> AlgorithmExecutionResponse:
    """Execute sliding window maximum and return complete AlgorithmExecutionResponse.

    Args:
        nums: Input integer list.
        k: Window size.

    Returns:
        Populated AlgorithmExecutionResponse payload conforming to schema contract.
    """
    try:
        metrics: dict[str, Any] = {}
        frames = list(generate_sliding_window_frames(nums, k, metrics_collector=metrics))

        return AlgorithmExecutionResponse(
            success=True,
            total_steps=len(frames),
            frames=frames,
            metrics=metrics,
            error=None,
        )
    except Exception as e:
        return AlgorithmExecutionResponse(
            success=False,
            total_steps=0,
            frames=[],
            metrics={},
            error=str(e),
        )
