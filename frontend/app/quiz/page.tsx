"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { ALL_BOARDS, ALL_CLASSES } from "@/lib/curriculum";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  HelpCircle
} from "lucide-react";

export default function QuizPage() {
  const { t, uiLang } = useApp();
  const [board, setBoard] = useState("tn_state_board");
  const [classGrade, setClassGrade] = useState("Class 10");
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadQuizzes();
  }, [board, classGrade, uiLang]);

  const loadQuizzes = async () => {
    setSubmitted(false);
    setUserAnswers({});
    const data = await api.getQuizzes({
      board,
      class_grade: classGrade,
      language: uiLang
    });
    setQuizzes(data);
  };

  const handleSelectOption = (quizId: string, optionIndex: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [quizId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < quizzes.length) {
      if (!confirm("You have unanswered questions. Do you want to submit anyway?")) {
        return;
      }
    }

    let calculatedScore = 0;
    quizzes.forEach((q) => {
      if (userAnswers[q.id] === q.correct_index) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2">
            <Award className="w-4 h-4" />
            <span>Curriculum Self-Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("quizTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {t("quizDesc")}
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Board Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 mr-2 font-medium">{t("boardLabel")}:</span>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer"
              >
                {ALL_BOARDS.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {uiLang === "ta" ? b.name_ta : uiLang === "hi" ? b.name_hi : b.short_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Complete Class Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 mr-2 font-medium">{t("classLabel")}:</span>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer"
              >
                {ALL_CLASSES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={loadQuizzes}
            className="inline-flex items-center space-x-1.5 text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("retakeQuizBtn")}</span>
          </button>
        </div>

        {/* Scorecard Banner */}
        {submitted && (
          <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                {score}/{quizzes.length}
              </div>
              <div>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                  {t("scoreBadge")}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {score === quizzes.length
                    ? "Outstanding! Full Textbook Mastery."
                    : score >= quizzes.length / 2
                    ? "Good Job! Review the explanations below."
                    : "Keep Practicing! Review the textbook sections."}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={loadQuizzes}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                {t("retakeQuizBtn")}
              </button>
              <Link
                href="/chat"
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Ask AI in Chat
              </Link>
            </div>
          </div>
        )}

        {/* Quiz Questions List */}
        <div className="space-y-5">
          {quizzes.map((q, qIndex) => {
            const selectedIdx = userAnswers[q.id];
            const isCorrect = submitted && selectedIdx === q.correct_index;
            const isWrong = submitted && selectedIdx !== undefined && selectedIdx !== q.correct_index;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                    {t("questionLabel")} {qIndex + 1} of {quizzes.length}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {q.chapter_name || q.subject}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">
                  {q.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2">
                  {q.options.map((opt: string, optIdx: number) => {
                    const isSelected = selectedIdx === optIdx;
                    let optionStyle =
                      "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300";

                    if (submitted) {
                      if (optIdx === q.correct_index) {
                        optionStyle =
                          "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold";
                      } else if (isSelected && optIdx !== q.correct_index) {
                        optionStyle =
                          "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-teal-500 bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-semibold shadow-xs";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={submitted}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {submitted && optIdx === q.correct_index && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                        )}
                        {submitted && isSelected && optIdx !== q.correct_index && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card upon submission */}
                {submitted && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 text-teal-700 dark:text-teal-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{t("explanationLabel")}:</span>
                    </div>
                    <p>{q.explanation}</p>
                    {q.page_reference && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                        Reference: {q.page_reference}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Quiz Button */}
        {!submitted && quizzes.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={handleSubmit}
              className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
            >
              {t("submitQuizBtn")}
            </button>
          </div>
        )}

        {quizzes.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <Award className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No Quiz Questions Available for this Selection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Please select Tamil Nadu State Board or NCERT Class 10 Science to practice verified chapter questions.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
