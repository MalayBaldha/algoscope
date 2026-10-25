import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS,
  calculateGrillScores,
  extractGrillResultFromAssessment,
  getDiagnosticQuestionsForTopic,
  DIAGNOSTIC_QUESTIONS_BY_TOPIC,
} from "../data/diagnosticQuestions";
import { AssessmentRecord } from "../types/models";

describe("Diagnostic Grill - Question Contracts & Scoring Engine", () => {
  describe("Question Contracts & PRD Dimension Coverage", () => {
    it("provides exactly 3 diagnostic questions for Topic 1", () => {
      assert.equal(ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS.length, 3);
    });

    it("covers the 3 distinct PRD evaluation dimensions", () => {
      const dimensions = ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS.map(
        (q) => q.dimension
      );
      assert.deepEqual(dimensions.sort(), [
        "complexity_analysis",
        "conceptual",
        "pattern_recognition",
      ]);
    });

    it("ensures each question has valid non-empty options and a matching correctOptionId", () => {
      for (const q of ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS) {
        assert.ok(q.id && q.id.length > 0, "Question must have an ID");
        assert.ok(q.prompt && q.prompt.length > 0, "Question must have a prompt");
        assert.ok(q.options && q.options.length >= 2, "Must have at least 2 options");
        assert.ok(q.explanation && q.explanation.length > 0, "Must have an explanation");

        const optionIds = q.options.map((o) => o.id);
        assert.ok(
          optionIds.includes(q.correctOptionId),
          `correctOptionId ${q.correctOptionId} must be in options [${optionIds.join(", ")}]`
        );
      }
    });

    it("retrieves questions via getDiagnosticQuestionsForTopic registry", () => {
      const topic1Questions = getDiagnosticQuestionsForTopic("arrays-and-strings");
      assert.equal(topic1Questions.length, 3);
      assert.equal(topic1Questions[0].topicSlug, "arrays-and-strings");

      const unknownTopicQuestions = getDiagnosticQuestionsForTopic("graphs-and-trees");
      assert.deepEqual(unknownTopicQuestions, []);

      const nullTopicQuestions = getDiagnosticQuestionsForTopic(null);
      assert.deepEqual(nullTopicQuestions, []);

      const undefinedTopicQuestions = getDiagnosticQuestionsForTopic(undefined);
      assert.deepEqual(undefinedTopicQuestions, []);

      const emptyTopicQuestions = getDiagnosticQuestionsForTopic("");
      assert.deepEqual(emptyTopicQuestions, []);
    });

    it("verifies topic mapping contracts in DIAGNOSTIC_QUESTIONS_BY_TOPIC registry", () => {
      assert.ok("arrays-and-strings" in DIAGNOSTIC_QUESTIONS_BY_TOPIC);
      assert.equal(
        DIAGNOSTIC_QUESTIONS_BY_TOPIC["arrays-and-strings"],
        ARRAYS_AND_STRINGS_DIAGNOSTIC_QUESTIONS
      );
      assert.equal(
        DIAGNOSTIC_QUESTIONS_BY_TOPIC["arrays-and-strings"].length,
        3
      );
    });
  });

  describe("calculateGrillScores - Safe Answer Handling & Scoring", () => {
    it("awards perfect 30 points (10 per dimension) when all answers are correct", () => {
      const allCorrectAnswers: Record<string, string> = {
        "as-q1-conceptual": "opt-b",
        "as-q2-pattern": "opt-c",
        "as-q3-complexity": "opt-b",
      };

      const result = calculateGrillScores(allCorrectAnswers);

      assert.equal(result.conceptual_score, 10);
      assert.equal(result.pattern_recognition_score, 10);
      assert.equal(result.complexity_accuracy_score, 10);
      assert.equal(result.total_score, 30);
      assert.equal(result.average_score, 10.0);
      assert.equal(result.is_perfect, true);

      assert.equal(result.details["as-q1-conceptual"].isCorrect, true);
      assert.equal(result.details["as-q2-pattern"].isCorrect, true);
      assert.equal(result.details["as-q3-complexity"].isCorrect, true);
    });

    it("returns 0 points across all dimensions when all answers are incorrect", () => {
      const allWrongAnswers: Record<string, string> = {
        "as-q1-conceptual": "opt-a",
        "as-q2-pattern": "opt-a",
        "as-q3-complexity": "opt-a",
      };

      const result = calculateGrillScores(allWrongAnswers);

      assert.equal(result.conceptual_score, 0);
      assert.equal(result.pattern_recognition_score, 0);
      assert.equal(result.complexity_accuracy_score, 0);
      assert.equal(result.total_score, 0);
      assert.equal(result.average_score, 0.0);
      assert.equal(result.is_perfect, false);
    });

    it("accurately scores mixed answers: 2 correct, 1 incorrect", () => {
      const mixedAnswers: Record<string, string> = {
        "as-q1-conceptual": "opt-b", // correct (+10)
        "as-q2-pattern": "opt-c", // correct (+10)
        "as-q3-complexity": "opt-d", // incorrect (0)
      };

      const result = calculateGrillScores(mixedAnswers);

      assert.equal(result.conceptual_score, 10);
      assert.equal(result.pattern_recognition_score, 10);
      assert.equal(result.complexity_accuracy_score, 0);
      assert.equal(result.total_score, 20);
      assert.equal(result.average_score, 6.7);
      assert.equal(result.is_perfect, false);

      assert.equal(result.details["as-q1-conceptual"].isCorrect, true);
      assert.equal(result.details["as-q2-pattern"].isCorrect, true);
      assert.equal(result.details["as-q3-complexity"].isCorrect, false);
      assert.ok(result.details["as-q3-complexity"].explanation.length > 0);
    });

    it("handles missing or empty answer objects safely", () => {
      const result = calculateGrillScores({});

      assert.equal(result.conceptual_score, 0);
      assert.equal(result.pattern_recognition_score, 0);
      assert.equal(result.complexity_accuracy_score, 0);
      assert.equal(result.total_score, 0);
      assert.equal(result.average_score, 0.0);
      assert.equal(result.is_perfect, false);
    });

    it("safely handles null, undefined, or unexpected answers input without crashing", () => {
      const resUndefined = calculateGrillScores(undefined);
      assert.equal(resUndefined.total_score, 0);

      const resNull = calculateGrillScores(null as unknown as Record<string, string>);
      assert.equal(resNull.total_score, 0);

      const resUnknownKeys = calculateGrillScores({
        "unknown-question-id": "opt-xyz",
      });
      assert.equal(resUnknownKeys.total_score, 0);
    });
  });

  describe("extractGrillResultFromAssessment - Score Extraction Fallbacks", () => {
    const baseAssessment: AssessmentRecord = {
      id: 1,
      topic_id: 1,
      assessment_type: "pre",
      conceptual_score: 8,
      pattern_recognition_score: 10,
      complexity_accuracy_score: 9,
      questions_and_answers: {},
      created_at: new Date().toISOString(),
      topic_title: "Arrays & Strings",
      topic_slug: "arrays-and-strings",
    };

    it("returns null when assessment is null or undefined", () => {
      assert.equal(extractGrillResultFromAssessment(null), null);
      assert.equal(extractGrillResultFromAssessment(undefined), null);
    });

    it("extracts from questions_and_answers.answers when recorded answers exist", () => {
      const assessmentWithAnswers: AssessmentRecord = {
        ...baseAssessment,
        questions_and_answers: {
          answers: {
            "as-q1-conceptual": "opt-b",
            "as-q2-pattern": "opt-c",
            "as-q3-complexity": "opt-b",
          },
        },
      };

      const result = extractGrillResultFromAssessment(assessmentWithAnswers);
      assert.notEqual(result, null);
      assert.equal(result!.conceptual_score, 10);
      assert.equal(result!.pattern_recognition_score, 10);
      assert.equal(result!.complexity_accuracy_score, 10);
      assert.equal(result!.total_score, 30);
      assert.equal(result!.is_perfect, true);
    });

    it("falls back to recorded score attributes when questions_and_answers is empty or missing answers", () => {
      const assessmentWithoutAnswers: AssessmentRecord = {
        ...baseAssessment,
        conceptual_score: 8,
        pattern_recognition_score: 10,
        complexity_accuracy_score: 9,
        questions_and_answers: {},
      };

      const result = extractGrillResultFromAssessment(assessmentWithoutAnswers);
      assert.notEqual(result, null);
      assert.equal(result!.conceptual_score, 8);
      assert.equal(result!.pattern_recognition_score, 10);
      assert.equal(result!.complexity_accuracy_score, 9);
      assert.equal(result!.total_score, 27);
      assert.equal(result!.average_score, 9.0);
      assert.equal(result!.is_perfect, false);
      assert.equal(
        result!.details["as-q2-pattern"].isCorrect,
        true,
        "score >= 10 maps to isCorrect"
      );
      assert.equal(
        result!.details["as-q1-conceptual"].isCorrect,
        false,
        "score < 10 maps to not full credit"
      );
    });

    it("falls back safely when questions_and_answers has non-object answers property", () => {
      const assessmentCorruptQA: AssessmentRecord = {
        ...baseAssessment,
        conceptual_score: 10,
        pattern_recognition_score: 10,
        complexity_accuracy_score: 10,
        questions_and_answers: { answers: "invalid_string" },
      };

      const result = extractGrillResultFromAssessment(assessmentCorruptQA);
      assert.notEqual(result, null);
      assert.equal(result!.conceptual_score, 10);
      assert.equal(result!.pattern_recognition_score, 10);
      assert.equal(result!.complexity_accuracy_score, 10);
      assert.equal(result!.total_score, 30);
      assert.equal(result!.is_perfect, true);
    });
  });
});
