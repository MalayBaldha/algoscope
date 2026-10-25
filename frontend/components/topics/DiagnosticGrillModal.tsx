"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Award,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Topic, AssessmentRecord } from "@/types/models";
import {
  getDiagnosticQuestionsForTopic,
  calculateGrillScores,
  extractGrillResultFromAssessment,
  DiagnosticGrillResult,
  DiagnosticQuestion,
} from "@/data/diagnosticQuestions";
import { recordAssessment, updateProgress } from "@/lib/apiClient";

interface DiagnosticGrillModalProps {
  topic: Topic;
  existingAssessment?: AssessmentRecord | null;
  isOpen?: boolean;
  isModal?: boolean;
  onClose?: () => void;
  onCompleted?: (assessment: AssessmentRecord) => void;
}

export const DiagnosticGrillModal: React.FC<DiagnosticGrillModalProps> = ({
  topic,
  existingAssessment,
  isOpen = true,
  isModal = false,
  onClose,
  onCompleted,
}) => {
  const questions: DiagnosticQuestion[] = getDiagnosticQuestionsForTopic(
    topic.slug
  );

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    // If existing assessment answers exist, pre-populate
    if (
      existingAssessment?.questions_and_answers &&
      typeof existingAssessment.questions_and_answers === "object"
    ) {
      const recorded = existingAssessment.questions_and_answers as Record<
        string,
        unknown
      >;
      if (recorded.answers && typeof recorded.answers === "object") {
        return recorded.answers as Record<string, string>;
      }
    }
    return {};
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordedAssessment, setRecordedAssessment] =
    useState<AssessmentRecord | null>(existingAssessment || null);
  const [completedResult, setCompletedResult] =
    useState<DiagnosticGrillResult | null>(() => {
      return extractGrillResultFromAssessment(existingAssessment, questions);
    });

  if (!isOpen) return null;

  if (questions.length === 0) {
    return (
      <div
        className={
          isModal
            ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            : "w-full"
        }
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-center shadow-2xl relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Diagnostic Grill In Preparation
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Diagnostic grill questions for &quot;{topic.title}&quot; are currently
            being authored and will be available soon.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const totalQuestions = questions.length;
  const isLastQuestion = currentStep === totalQuestions - 1;
  const hasAnsweredCurrent = Boolean(selectedAnswers[currentQ.id]);
  const allAnswered = questions.every((q) => Boolean(selectedAnswers[q.id]));

  const handleSelectOption = (optionId: string) => {
    if (completedResult && existingAssessment && !errorMessage) {
      // In view-only mode unless retaking
      return;
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      setErrorMessage("Please answer all diagnostic questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const grillResult = calculateGrillScores(selectedAnswers, questions);

      // Save pre-assessment to backend SQLite
      const assessmentRecord = await recordAssessment({
        topic_id: topic.id,
        assessment_type: "pre",
        conceptual_score: grillResult.conceptual_score,
        pattern_recognition_score: grillResult.pattern_recognition_score,
        complexity_accuracy_score: grillResult.complexity_accuracy_score,
        questions_and_answers: {
          answers: selectedAnswers,
          details: grillResult.details,
          submitted_at: new Date().toISOString(),
        },
      });

      // Update topic progress to in_progress only if not completed or mastered
      if (topic.status !== "completed" && topic.status !== "mastered") {
        try {
          await updateProgress({
            topic_id: topic.id,
            status: "in_progress",
          });
        } catch (e) {
          // Non-blocking if progress update fails
          console.warn("Failed to update topic status to in_progress", e);
        }
      }

      setRecordedAssessment(assessmentRecord);
      setCompletedResult(grillResult);
      // NOTE: Do not call onCompleted here; let the user review their score breakdown
      // and explanations first. onCompleted will be called when clicking "Continue to Overview".
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Network error occurred while submitting assessment. Please retry.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueToOverview = () => {
    if (recordedAssessment && onCompleted) {
      onCompleted(recordedAssessment);
    } else if (existingAssessment && onCompleted) {
      onCompleted(existingAssessment);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentStep(0);
    setRecordedAssessment(null);
    setCompletedResult(null);
    setErrorMessage(null);
  };

  const modalContainerClasses = isModal
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto"
    : "w-full max-w-3xl mx-auto my-6";

  const cardClasses =
    "w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl relative";

  return (
    <div className={modalContainerClasses}>
      <div className={cardClasses}>
        {/* Modal close button */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* COMPLETED RESULT VIEW */}
        {completedResult ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Diagnostic Grill Completed</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Baseline Proficiency Established
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Scores recorded to local SQLite database. Review your dimensional
                breakdown below.
              </p>
            </div>

            {/* Dimensional Score Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Conceptual Understanding
                </span>
                <div className="mt-2 text-3xl font-extrabold text-white">
                  {completedResult.conceptual_score}{" "}
                  <span className="text-sm font-normal text-slate-500">/ 10</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {completedResult.conceptual_score >= 10
                    ? "Optimal Invariant Model"
                    : "Review Window Bounds"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Pattern Recognition
                </span>
                <div className="mt-2 text-3xl font-extrabold text-white">
                  {completedResult.pattern_recognition_score}{" "}
                  <span className="text-sm font-normal text-slate-500">/ 10</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {completedResult.pattern_recognition_score >= 10
                    ? "Pattern Identified"
                    : "Sliding Window Tradeoff"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Complexity Analysis
                </span>
                <div className="mt-2 text-3xl font-extrabold text-white">
                  {completedResult.complexity_accuracy_score}{" "}
                  <span className="text-sm font-normal text-slate-500">/ 10</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {completedResult.complexity_accuracy_score >= 10
                    ? "Amortized Analysis Accurate"
                    : "Review Pointer Stepping"}
                </div>
              </div>
            </div>

            {/* Answer Explanations Review */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Question Review & Architectural Explanations
              </h3>
              {questions.map((q, idx) => {
                const detail = completedResult.details[q.id];
                const isCorrect = detail?.isCorrect ?? false;
                const selectedOpt = q.options.find(
                  (o) => o.id === detail?.selectedOptionId
                );
                const correctOpt = q.options.find(
                  (o) => o.id === q.correctOptionId
                );

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 ${
                      isCorrect
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-amber-500/20 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-slate-200">
                          Question {idx + 1}: {q.dimensionLabel}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isCorrect ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {isCorrect ? "+10 pts" : "0 pts"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-300">{q.prompt}</p>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="text-slate-400">
                        <span className="font-semibold text-slate-300">
                          Your choice:{" "}
                        </span>
                        {selectedOpt?.text || "None selected"}
                      </div>
                      {!isCorrect && (
                        <div className="text-emerald-400">
                          <span className="font-semibold">Correct Answer: </span>
                          {correctOpt?.text}
                        </div>
                      )}
                      <div className="mt-2 rounded-lg bg-slate-950/40 p-2.5 text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">
                          Explanation:{" "}
                        </span>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retake Diagnostic</span>
              </button>
              <button
                type="button"
                onClick={handleContinueToOverview}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Continue to Overview</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE GRILL STEPPER VIEW */
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Topic 1 Baseline Diagnostic</span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Question {currentStep + 1} of {totalQuestions}
                </span>
              </div>

              <h2 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                Diagnostic Grill: {topic.title}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Answer these 3 questions to establish baseline metrics for
                Conceptual Understanding, Pattern Recognition, and Complexity
                Analysis.
              </p>
            </div>

            {/* Stepper progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>
                  Evaluating:{" "}
                  <strong className="text-indigo-300">
                    {currentQ.dimensionLabel}
                  </strong>
                </span>
                <span>
                  {Math.round(((currentStep + 1) / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Question prompt */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
              <p className="text-sm font-medium text-slate-100 leading-relaxed">
                {currentQ.prompt}
              </p>

              {currentQ.codeSnippet && (
                <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-indigo-300">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}
            </div>

            {/* Question options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 text-white shadow-sm shadow-indigo-500/10"
                        : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-slate-600"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-xs leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation & Submit CTA */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0 || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!hasAnsweredCurrent || submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Recording to SQLite...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Submit Diagnostic</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasAnsweredCurrent || submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
