"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Frame, PlaybackSpeed, PlaybackStatus } from "@/types/dsa";

export const SPEED_MAP: Record<PlaybackSpeed, number> = {
  0.5: 1000,
  1: 500,
  2: 250,
};

export const REVERSE_SPEED_MAP: Record<number, PlaybackSpeed> = {
  1000: 0.5,
  500: 1,
  250: 2,
};

export interface PlaybackMachineState {
  status: PlaybackStatus;
  currentIndex: number;
  speedMs: number;
  tickKey: number;
}

export type PlaybackAction =
  | { type: "PLAY"; total: number }
  | { type: "PAUSE" }
  | { type: "STEP_FORWARD"; total: number }
  | { type: "STEP_BACKWARD"; total: number }
  | { type: "SCRUB_TO"; index: number; total: number }
  | { type: "SET_SPEED"; speedMs: number }
  | { type: "RESET"; total: number }
  | { type: "TICK"; total: number }
  | { type: "SYNC_TOTAL"; total: number };

export function playbackReducer(
  state: PlaybackMachineState,
  action: PlaybackAction
): PlaybackMachineState {
  switch (action.type) {
    case "PLAY": {
      if (action.total <= 0) {
        return { ...state, status: "idle", currentIndex: 0 };
      }
      if (action.total === 1) {
        return { ...state, status: "completed", currentIndex: 0 };
      }
      if (state.status === "completed" || state.currentIndex >= action.total - 1) {
        return {
          ...state,
          status: "playing",
          currentIndex: 0,
          tickKey: state.tickKey + 1,
        };
      }
      return {
        ...state,
        status: "playing",
        tickKey: state.tickKey + 1,
      };
    }

    case "PAUSE": {
      if (state.status !== "playing") {
        return state;
      }
      return {
        ...state,
        status: "paused",
      };
    }

    case "STEP_FORWARD": {
      if (action.total <= 0) {
        return state;
      }
      if (state.currentIndex >= action.total - 1) {
        return {
          ...state,
          status: "completed",
          currentIndex: action.total - 1,
        };
      }
      const nextIndex = Math.min(state.currentIndex + 1, action.total - 1);
      return {
        ...state,
        status: nextIndex >= action.total - 1 ? "completed" : "paused",
        currentIndex: nextIndex,
      };
    }

    case "STEP_BACKWARD": {
      if (action.total <= 0) {
        return state;
      }
      const prevIndex = Math.max(state.currentIndex - 1, 0);
      return {
        ...state,
        status: "paused",
        currentIndex: prevIndex,
      };
    }

    case "SCRUB_TO": {
      if (action.total <= 0) {
        return { ...state, currentIndex: 0 };
      }
      const targetIndex = Math.max(0, Math.min(action.index, action.total - 1));
      const nextStatus: PlaybackStatus =
        targetIndex >= action.total - 1
          ? "completed"
          : state.status === "playing"
          ? "playing"
          : "paused";

      return {
        ...state,
        status: nextStatus,
        currentIndex: targetIndex,
        tickKey: state.tickKey + 1,
      };
    }

    case "SET_SPEED": {
      return {
        ...state,
        speedMs: action.speedMs,
        tickKey: state.tickKey + 1,
      };
    }

    case "RESET": {
      return {
        ...state,
        status: "idle",
        currentIndex: 0,
        tickKey: state.tickKey + 1,
      };
    }

    case "TICK": {
      if (state.status !== "playing" || action.total <= 0) {
        return state;
      }
      const next = state.currentIndex + 1;
      if (next >= action.total - 1) {
        return {
          ...state,
          status: "completed",
          currentIndex: action.total - 1,
        };
      }
      return {
        ...state,
        currentIndex: next,
      };
    }

    case "SYNC_TOTAL": {
      if (action.total <= 0) {
        return {
          ...state,
          status: "idle",
          currentIndex: 0,
        };
      }
      if (state.currentIndex >= action.total) {
        return {
          ...state,
          currentIndex: action.total - 1,
          status: "completed",
        };
      }
      return state;
    }

    default:
      return state;
  }
}

export interface UseAlgorithmPlaybackOptions {
  initialSpeed?: PlaybackSpeed | number;
  autoPlay?: boolean;
  enableKeyboardShortcuts?: boolean;
}

export function useAlgorithmPlayback<TState = Record<string, unknown>>(
  frames: Frame<TState>[] = [],
  options: UseAlgorithmPlaybackOptions = {}
) {
  const {
    initialSpeed = 1,
    autoPlay = false,
    enableKeyboardShortcuts = true,
  } = options;

  const initialSpeedMs =
    typeof initialSpeed === "number" && initialSpeed in SPEED_MAP
      ? SPEED_MAP[initialSpeed as PlaybackSpeed]
      : typeof initialSpeed === "number" && initialSpeed > 2
      ? initialSpeed
      : 500;

  const totalSteps = frames.length;

  const [state, dispatch] = useReducer(playbackReducer, {
    status: autoPlay && totalSteps > 1 ? "playing" : "idle",
    currentIndex: 0,
    speedMs: initialSpeedMs,
    tickKey: 0,
  });

  const totalStepsRef = useRef(totalSteps);
  totalStepsRef.current = totalSteps;

  const stateRef = useRef(state);
  stateRef.current = state;

  // Sync state if total steps changes
  useEffect(() => {
    dispatch({ type: "SYNC_TOTAL", total: totalSteps });
  }, [totalSteps]);

  // Interval timer for playback
  useEffect(() => {
    if (state.status !== "playing" || totalSteps <= 1) {
      return;
    }

    const timer = setInterval(() => {
      dispatch({ type: "TICK", total: totalStepsRef.current });
    }, state.speedMs);

    return () => {
      clearInterval(timer);
    };
  }, [state.status, state.speedMs, state.tickKey, totalSteps]);

  const play = useCallback(() => {
    dispatch({ type: "PLAY", total: totalStepsRef.current });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: "PAUSE" });
  }, []);

  const togglePlay = useCallback(() => {
    if (stateRef.current.status === "playing") {
      dispatch({ type: "PAUSE" });
    } else {
      dispatch({ type: "PLAY", total: totalStepsRef.current });
    }
  }, []);

  const stepForward = useCallback(() => {
    dispatch({ type: "STEP_FORWARD", total: totalStepsRef.current });
  }, []);

  const stepBackward = useCallback(() => {
    dispatch({ type: "STEP_BACKWARD", total: totalStepsRef.current });
  }, []);

  const scrubTo = useCallback((index: number) => {
    dispatch({ type: "SCRUB_TO", index, total: totalStepsRef.current });
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed | number) => {
    const targetMs =
      typeof speed === "number" && speed in SPEED_MAP
        ? SPEED_MAP[speed as PlaybackSpeed]
        : speed;
    dispatch({ type: "SET_SPEED", speedMs: targetMs });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET", total: totalStepsRef.current });
  }, []);

  // Keyboard shortcut navigation
  useEffect(() => {
    if (!enableKeyboardShortcuts || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        stepBackward();
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        stepForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enableKeyboardShortcuts, togglePlay, stepBackward, stepForward]);

  const currentFrame = frames[state.currentIndex] ?? null;
  const speed = (REVERSE_SPEED_MAP[state.speedMs] ?? 1) as PlaybackSpeed;
  const isPlaying = state.status === "playing";

  return {
    status: state.status,
    currentIndex: state.currentIndex,
    speedMs: state.speedMs,
    speed,
    isPlaying,
    currentFrame,
    totalSteps,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    scrubTo,
    setSpeed,
    reset,
  };
}
