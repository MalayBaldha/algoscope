import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateWindowBounds,
  getHighlightForIndex,
} from "../types/canvas";
import { executeSlidingWindow } from "../lib/apiClient";
import type { FrameHighlight } from "../types/dsa";

describe("LinearCanvas Adapter & Sliding Window Bounds", () => {
  describe("calculateWindowBounds - Layout Engine", () => {
    it("accurately computes leftOffset, width, and span for active window [1..3]", () => {
      const itemWidth = 64;
      const gap = 12;
      const bounds = calculateWindowBounds(1, 3, itemWidth, gap);

      // leftOffset = 1 * (64 + 12) = 76
      assert.equal(bounds.leftOffset, 76);
      // span = 3 - 1 + 1 = 3
      assert.equal(bounds.span, 3);
      // width = 3 * 64 + 2 * 12 = 192 + 24 = 216
      assert.equal(bounds.width, 216);
      assert.equal(bounds.visible, true);
    });

    it("handles single-element window (k=1) at index 2 correctly", () => {
      const itemWidth = 64;
      const gap = 12;
      const bounds = calculateWindowBounds(2, 2, itemWidth, gap);

      // leftOffset = 2 * (64 + 12) = 152
      assert.equal(bounds.leftOffset, 152);
      assert.equal(bounds.span, 1);
      // width = 1 * 64 + 0 * 12 = 64
      assert.equal(bounds.width, 64);
      assert.equal(bounds.visible, true);
    });

    it("returns visible=false when left or right pointer is null or undefined", () => {
      const b1 = calculateWindowBounds(null, 3);
      assert.equal(b1.visible, false);
      assert.equal(b1.width, 0);

      const b2 = calculateWindowBounds(0, null);
      assert.equal(b2.visible, false);

      const b3 = calculateWindowBounds(undefined, undefined);
      assert.equal(b3.visible, false);
    });

    it("returns visible=false when left > right (inverted pointers)", () => {
      const bounds = calculateWindowBounds(4, 2);
      assert.equal(bounds.visible, false);
      assert.equal(bounds.width, 0);
    });

    it("returns visible=false when pointers contain negative values", () => {
      const bounds = calculateWindowBounds(-1, 2);
      assert.equal(bounds.visible, false);
    });
  });

  describe("getHighlightForIndex - Visual Priority Hierarchy", () => {
    it("returns null if highlights array is empty", () => {
      const hl = getHighlightForIndex(2, []);
      assert.equal(hl, null);
    });

    it("returns matching highlight for element in window", () => {
      const highlights: FrameHighlight[] = [
        { indices: [1, 2, 3], color: "primary", label: "window" },
      ];
      const hl = getHighlightForIndex(2, highlights);
      assert.notEqual(hl, null);
      assert.equal(hl?.color, "primary");
      assert.equal(hl?.label, "window");
    });

    it("prioritizes success (window maximum) over primary (window bounds) when overlapping", () => {
      const highlights: FrameHighlight[] = [
        { indices: [0, 1, 2], color: "primary", label: "window" },
        { indices: [1], color: "success", label: "window_max" },
      ];

      // Index 1 has both primary and success highlights
      const hl = getHighlightForIndex(1, highlights);
      assert.notEqual(hl, null);
      assert.equal(hl?.color, "success");
      assert.equal(hl?.label, "window_max");

      // Index 0 has only primary highlight
      const hl0 = getHighlightForIndex(0, highlights);
      assert.equal(hl0?.color, "primary");
    });
  });

  describe("executeSlidingWindow - Backend Integration & Error Handling", () => {
    it("executes successfully against backend and returns deterministic Frame sequence", async () => {
      const res = await executeSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3);
      assert.equal(res.success, true);
      assert.ok(res.frames.length > 0);
      assert.equal(res.frames[0].phase, "initialize");
      const last = res.frames[res.frames.length - 1];
      assert.equal(last.phase, "complete");
      assert.deepEqual(last.state.max_values, [3, 3, 5, 5, 6, 7]);
    });

    it("throws an Error when window size k <= 0 causes backend validation error", async () => {
      await assert.rejects(
        async () => {
          await executeSlidingWindow([1, 2, 3], 0);
        },
        (err: Error) => {
          assert.match(err.message, /Backend algorithm execution failed/);
          return true;
        }
      );
    });
  });
});
