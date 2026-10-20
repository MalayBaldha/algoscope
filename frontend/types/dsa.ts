/**
 * Shared DSA Frame and Execution Schema contracts.
 * Parity with backend app/schemas/frame.py.
 */

export type HighlightColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning";

export interface FrameHighlight {
  indices: (number | string)[];
  color: HighlightColor;
  label?: string;
}

export interface Frame<TState = Record<string, unknown>> {
  step: number;
  phase: string;
  state: TState;
  pointers: Record<string, number | string | null>;
  highlights: FrameHighlight[];
  explanation: string;
}

export interface AlgorithmExecutionResponse<TState = Record<string, unknown>> {
  success: boolean;
  total_steps: number;
  frames: Frame<TState>[];
  metrics: {
    comparisons?: number;
    swaps?: number;
    time_complexity?: string;
    space_complexity?: string;
    [key: string]: unknown;
  };
  error?: string | null;
}

export type PlaybackStatus = "idle" | "playing" | "paused" | "completed";

export type PlaybackSpeed = 0.5 | 1 | 2;

export interface PlaybackState {
  status: PlaybackStatus;
  currentIndex: number;
  speedMs: number;
  isPlaying: boolean;
}
