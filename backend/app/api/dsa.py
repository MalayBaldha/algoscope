"""FastAPI router for DSA execution engines and algorithm frame generators."""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.dsa.arrays.sliding_window import execute_sliding_window
from app.schemas.frame import AlgorithmExecutionResponse

router = APIRouter(prefix="/api/dsa", tags=["dsa"])


class SlidingWindowExecuteRequest(BaseModel):
    """Request payload for executing the Sliding Window Maximum algorithm."""

    nums: list[int] = Field(
        default_factory=list,
        max_length=1000,
        description="Input integer array to evaluate",
    )
    k: int = Field(
        ...,
        gt=0,
        description="Sliding window size (must be >= 1)",
    )


@router.post(
    "/arrays/sliding-window/execute",
    response_model=AlgorithmExecutionResponse,
    summary="Execute Sliding Window Maximum",
    description=(
        "Executes sliding window maximum on the input array and returns "
        "step-by-step Frame snapshots for timeline playback visualization."
    ),
)
def execute_sliding_window_endpoint(
    payload: SlidingWindowExecuteRequest,
) -> AlgorithmExecutionResponse:
    """Execute sliding window maximum and return deterministic execution frames."""
    return execute_sliding_window(nums=payload.nums, k=payload.k)
