import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateScoreDelta,
  calculateAverageScore,
} from "../lib/apiClient";
import { AssessmentRecord } from "../types/models";

describe("Dashboard Analytics & Score Calculations", () => {
  const createAssessment = (
    overrides?: Partial<AssessmentRecord>
  ): AssessmentRecord => ({
    id: 1,
    topic_id: 1,
    assessment_type: "pre",
    conceptual_score: 4,
    pattern_recognition_score: 5,
    complexity_accuracy_score: 3,
    questions_and_answers: {},
    created_at: new Date().toISOString(),
    topic_title: "Arrays & Strings",
    topic_slug: "arrays-and-strings",
    ...overrides,
  });

  describe("calculateScoreDelta", () => {
    it("returns null if either pre or post assessment is missing", () => {
      const pre = createAssessment({ assessment_type: "pre" });
      assert.equal(calculateScoreDelta(pre, null), null);
      assert.equal(calculateScoreDelta(null, pre), null);
      assert.equal(calculateScoreDelta(null, null), null);
    });

    it("accurately computes dimension deltas, total delta, and average delta", () => {
      const pre = createAssessment({
        assessment_type: "pre",
        conceptual_score: 4,
        pattern_recognition_score: 5,
        complexity_accuracy_score: 3,
      });

      const post = createAssessment({
        assessment_type: "post",
        conceptual_score: 9,
        pattern_recognition_score: 8,
        complexity_accuracy_score: 9,
      });

      const delta = calculateScoreDelta(pre, post);
      assert.notEqual(delta, null);
      assert.equal(delta!.conceptual_delta, 5);
      assert.equal(delta!.pattern_recognition_delta, 3);
      assert.equal(delta!.complexity_accuracy_delta, 6);
      assert.equal(delta!.total_delta, 14);
      assert.equal(delta!.average_delta, 4.67);
    });

    it("handles zero delta when pre and post scores are identical", () => {
      const pre = createAssessment({
        conceptual_score: 7,
        pattern_recognition_score: 6,
        complexity_accuracy_score: 8,
      });
      const post = createAssessment({
        assessment_type: "post",
        conceptual_score: 7,
        pattern_recognition_score: 6,
        complexity_accuracy_score: 8,
      });

      const delta = calculateScoreDelta(pre, post);
      assert.notEqual(delta, null);
      assert.equal(delta!.conceptual_delta, 0);
      assert.equal(delta!.pattern_recognition_delta, 0);
      assert.equal(delta!.complexity_accuracy_delta, 0);
      assert.equal(delta!.total_delta, 0);
      assert.equal(delta!.average_delta, 0);
    });

    it("handles negative score deltas gracefully", () => {
      const pre = createAssessment({
        conceptual_score: 8,
        pattern_recognition_score: 8,
        complexity_accuracy_score: 8,
      });
      const post = createAssessment({
        assessment_type: "post",
        conceptual_score: 5,
        pattern_recognition_score: 6,
        complexity_accuracy_score: 7,
      });

      const delta = calculateScoreDelta(pre, post);
      assert.notEqual(delta, null);
      assert.equal(delta!.conceptual_delta, -3);
      assert.equal(delta!.pattern_recognition_delta, -2);
      assert.equal(delta!.complexity_accuracy_delta, -1);
      assert.equal(delta!.total_delta, -6);
      assert.equal(delta!.average_delta, -2.0);
    });
  });

  describe("calculateAverageScore", () => {
    it("returns safe 0 for empty score array without division by zero", () => {
      assert.equal(calculateAverageScore([]), 0);
    });

    it("calculates accurate mean rounded to 2 decimal places", () => {
      assert.equal(calculateAverageScore([7, 6, 8]), 7.0);
      assert.equal(calculateAverageScore([5.5, 6.5, 7]), 6.33);
      assert.equal(calculateAverageScore([10, 10, 10]), 10.0);
    });
  });
});
