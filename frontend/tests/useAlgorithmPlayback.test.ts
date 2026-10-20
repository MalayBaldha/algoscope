import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  playbackReducer,
  SPEED_MAP,
  REVERSE_SPEED_MAP,
  type PlaybackMachineState,
} from "../hooks/useAlgorithmPlayback";

describe("useAlgorithmPlayback - State Machine Engine", () => {
  const createInitialState = (
    overrides?: Partial<PlaybackMachineState>
  ): PlaybackMachineState => ({
    status: "idle",
    currentIndex: 0,
    speedMs: 500,
    tickKey: 0,
    ...overrides,
  });

  describe("Empty Frame Sequence", () => {
    it("handles play with total = 0 safely", () => {
      const state = createInitialState();
      const next = playbackReducer(state, { type: "PLAY", total: 0 });
      assert.equal(next.status, "idle");
      assert.equal(next.currentIndex, 0);
    });

    it("handles stepForward and stepBackward with total = 0 without error", () => {
      const state = createInitialState();
      const fwd = playbackReducer(state, { type: "STEP_FORWARD", total: 0 });
      assert.equal(fwd.currentIndex, 0);

      const bwd = playbackReducer(state, { type: "STEP_BACKWARD", total: 0 });
      assert.equal(bwd.currentIndex, 0);
    });

    it("handles scrubTo with total = 0 safely", () => {
      const state = createInitialState();
      const next = playbackReducer(state, {
        type: "SCRUB_TO",
        index: 5,
        total: 0,
      });
      assert.equal(next.currentIndex, 0);
    });
  });

  describe("Playback and Auto-pause at End", () => {
    it("transitions from idle to playing on PLAY", () => {
      const state = createInitialState();
      const next = playbackReducer(state, { type: "PLAY", total: 10 });
      assert.equal(next.status, "playing");
      assert.equal(next.currentIndex, 0);
    });

    it("increments currentIndex by 1 during normal TICK playback", () => {
      const total = 5;
      const state = createInitialState({
        status: "playing",
        currentIndex: 1,
      });

      const next = playbackReducer(state, { type: "TICK", total });
      assert.equal(next.status, "playing");
      assert.equal(next.currentIndex, 2);
    });

    it("automatically completes and stops when ticking into the final frame", () => {
      const total = 5;
      const state = createInitialState({
        status: "playing",
        currentIndex: 3, // frame total - 2
      });

      const next = playbackReducer(state, { type: "TICK", total });
      assert.equal(next.status, "completed");
      assert.equal(next.currentIndex, 4); // final frame
    });

    it("restarts from index 0 when PLAY is called from completed status", () => {
      const total = 5;
      const state = createInitialState({
        status: "completed",
        currentIndex: 4,
      });

      const next = playbackReducer(state, { type: "PLAY", total });
      assert.equal(next.status, "playing");
      assert.equal(next.currentIndex, 0);
    });
  });

  describe("Boundary Clamping", () => {
    it("clamps stepBackward at index 0 (no-op boundary)", () => {
      const total = 10;
      const state = createInitialState({ currentIndex: 0, status: "paused" });
      const next = playbackReducer(state, { type: "STEP_BACKWARD", total });
      assert.equal(next.currentIndex, 0);
    });

    it("clamps stepForward at total - 1 (no-op boundary)", () => {
      const total = 10;
      const state = createInitialState({ currentIndex: 9, status: "completed" });
      const next = playbackReducer(state, { type: "STEP_FORWARD", total });
      assert.equal(next.currentIndex, 9);
      assert.equal(next.status, "completed");
    });

    it("steps forward and backward within valid range", () => {
      const total = 5;
      let state = createInitialState({ currentIndex: 1, status: "idle" });

      state = playbackReducer(state, { type: "STEP_FORWARD", total });
      assert.equal(state.currentIndex, 2);
      assert.equal(state.status, "paused");

      state = playbackReducer(state, { type: "STEP_BACKWARD", total });
      assert.equal(state.currentIndex, 1);
      assert.equal(state.status, "paused");
    });
  });

  describe("Scrubbing Behavior", () => {
    it("scrubs immediately to target index and preserves playing status when playing", () => {
      const total = 10;
      const state = createInitialState({
        status: "playing",
        currentIndex: 1,
        tickKey: 2,
      });

      const next = playbackReducer(state, {
        type: "SCRUB_TO",
        index: 5,
        total,
      });
      assert.equal(next.currentIndex, 5);
      assert.equal(next.status, "playing");
      assert.equal(next.tickKey, 3); // tickKey incremented to reset timer
    });

    it("scrubs to paused status when scrubbed while idle or paused", () => {
      const total = 10;
      const state = createInitialState({
        status: "idle",
        currentIndex: 0,
      });

      const next = playbackReducer(state, {
        type: "SCRUB_TO",
        index: 4,
        total,
      });
      assert.equal(next.currentIndex, 4);
      assert.equal(next.status, "paused");
    });

    it("clamps scrubTo within [0, total - 1]", () => {
      const total = 10;
      const state = createInitialState();

      const clampedLow = playbackReducer(state, {
        type: "SCRUB_TO",
        index: -5,
        total,
      });
      assert.equal(clampedLow.currentIndex, 0);

      const clampedHigh = playbackReducer(state, {
        type: "SCRUB_TO",
        index: 100,
        total,
      });
      assert.equal(clampedHigh.currentIndex, 9);
      assert.equal(clampedHigh.status, "completed");
    });
  });

  describe("Speed and Reset Adjustments", () => {
    it("verifies speed mapping contracts (0.5x, 1x, 2x)", () => {
      assert.equal(SPEED_MAP[0.5], 1000);
      assert.equal(SPEED_MAP[1], 500);
      assert.equal(SPEED_MAP[2], 250);

      assert.equal(REVERSE_SPEED_MAP[1000], 0.5);
      assert.equal(REVERSE_SPEED_MAP[500], 1);
      assert.equal(REVERSE_SPEED_MAP[250], 2);
    });

    it("updates speedMs and increments tickKey immediately on SET_SPEED", () => {
      const state = createInitialState({ speedMs: 500, tickKey: 1 });
      const next = playbackReducer(state, { type: "SET_SPEED", speedMs: 250 });
      assert.equal(next.speedMs, 250);
      assert.equal(next.tickKey, 2);
    });

    it("pauses active playback on PAUSE action", () => {
      const state = createInitialState({ status: "playing", currentIndex: 2 });
      const next = playbackReducer(state, { type: "PAUSE" });
      assert.equal(next.status, "paused");
      assert.equal(next.currentIndex, 2);
    });

    it("resets to index 0 and status idle on RESET action", () => {
      const state = createInitialState({
        status: "playing",
        currentIndex: 7,
        tickKey: 5,
      });
      const next = playbackReducer(state, { type: "RESET", total: 10 });
      assert.equal(next.status, "idle");
      assert.equal(next.currentIndex, 0);
      assert.equal(next.tickKey, 6);
    });
  });

  describe("SYNC_TOTAL Resizing", () => {
    it("resets to idle and index 0 when total drops to 0", () => {
      const state = createInitialState({
        status: "playing",
        currentIndex: 3,
      });
      const next = playbackReducer(state, { type: "SYNC_TOTAL", total: 0 });
      assert.equal(next.status, "idle");
      assert.equal(next.currentIndex, 0);
    });

    it("clamps currentIndex and sets completed when total shrinks below currentIndex", () => {
      const state = createInitialState({
        status: "paused",
        currentIndex: 5,
      });
      const next = playbackReducer(state, { type: "SYNC_TOTAL", total: 4 });
      assert.equal(next.status, "completed");
      assert.equal(next.currentIndex, 3);
    });

    it("preserves state when total accommodates currentIndex", () => {
      const state = createInitialState({
        status: "playing",
        currentIndex: 2,
      });
      const next = playbackReducer(state, { type: "SYNC_TOTAL", total: 10 });
      assert.equal(next.status, "playing");
      assert.equal(next.currentIndex, 2);
    });
  });
});
