"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CitationCard from "@/components/CitationCard";
import { api, ChatResponse } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Send,
  School,
  BookCheck,
  Copy,
  Check
} from "lucide-react";

export default function LandingPage() {
  const { t, uiLang } = useApp();

  const [selectedBoard, setSelectedBoard] = useState("tn_state_board");
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [selectedLang, setSelectedLang] = useState("ta");
  const [query, setQuery] = useState("நியூட்டனின் முதல் இயக்க விதியைக் கூறுக.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    {
      label: "Newton's First Law (Tamil)",
      q: "நியூட்டனின் முதல் இயக்க விதியைக் கூறுக.",
      board: "tn_state_board",
      classGrade: "Class 10",
      subject: "Science",
      lang: "ta"
    },
    {
      label: "Photosynthesis (English)",
      q: "Write the overall chemical equation for photosynthesis and explain xylem.",
      board: "tn_state_board",
      classGrade: "Class 10",
      subject: "Science",
      lang: "en"
    },
    {
      label: "Chemical Equations (Hindi)",
      q: "रासायनिक समीकरण को संतुलित करना क्यों आवश्यक है?",
      board: "ncert",
      classGrade: "Class 10",
      subject: "Science",
      lang: "hi"
    },
    {
      label: "LKG Phonics & Alphabets",
      q: "தமிழ் உயிர் எழுத்துக்கள் யாவை?",
      board: "early_learning",
      classGrade: "LKG",
      subject: "Foundational Literacy & Phonics",
      lang: "ta"
    }
  ];

  const handleTestQuery = async (
    customQ?: string,
    cBoard?: string,
    cClass?: string,
    cSub?: string,
    cLang?: string
  ) => {
    const targetQ = customQ || query;
    if (!targetQ.trim()) return;

    setLoading(true);
    try {
      const resp = await api.askQuestion({
        query: targetQ,
        board: cBoard || selectedBoard,
        class_grade: cClass || selectedClass,
        subject: cSub || selectedSubject,
        language: cLang || selectedLang
      });
      setResult(resp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = () => {
    if (result?.answer) {
      navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B192C] via-[#0F1E36] to-[#070F1E] text-white pt-16 pb-24 border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-teal-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-medium mb-6">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{t("heroBadge")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {t("heroHeading1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              {t("heroHeading2")}
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t("heroDesc")}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-[#0B192C] shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              <span>{t("heroCtaChat")}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/textbooks"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2 text-teal-400" />
              <span>{t("heroCtaLibrary")}</span>
            </Link>
          </div>

          {/* Interactive Verification Sandbox */}
          <div className="mt-14 max-w-3xl mx-auto bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-5 text-left backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-slate-400 ml-2">SSchat.box Verification Sandbox</span>
              </div>
              <span className="text-xs text-teal-400 font-medium">Textbook-Grounded RAG</span>
            </div>

            {/* Quick Sample Selector */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 self-center">Try Sample:</span>
              {sampleQuestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(s.q);
                    setSelectedBoard(s.board);
                    setSelectedClass(s.classGrade);
                    setSelectedSubject(s.subject);
                    setSelectedLang(s.lang);
                    handleTestQuery(s.q, s.board, s.classGrade, s.subject, s.lang);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a school question in Tamil, English, or Hindi..."
                className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTestQuery();
                }}
              />
              <button
                onClick={() => handleTestQuery()}
                disabled={loading}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0B192C] font-semibold rounded-xl text-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="animate-pulse">Searching...</span>
                ) : (
                  <>
                    <span>Verify</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Response Area */}
            {result && (
              <div className="mt-4 pt-4 border-t border-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-teal-400">SSchat.box Answer</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        result.has_sufficient_evidence
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {result.verification_status}
                    </span>
                  </div>
                  <button
                    onClick={copyAnswer}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div
                  className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                    result.has_sufficient_evidence
                      ? "bg-slate-950/60 border border-slate-800 text-slate-200"
                      : "bg-amber-950/30 border border-amber-800/40 text-amber-200"
                  }`}
                >
                  <p className="whitespace-pre-line">{result.answer}</p>
                </div>

                {result.citations && result.citations.length > 0 && (
                  <CitationCard citation={result.citations[0]} />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-16 bg-white dark:bg-[#070F1E] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400 mb-2">
              {t("featuresTag")}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("featuresHeading")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {t("feature1Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("feature1Desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {t("feature2Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("feature2Desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <BookCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {t("feature3Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("feature3Desc")}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <School className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {t("feature4Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("feature4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Architecture Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400 mb-2">
              Curriculum Integrity
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Distinct Curriculum Repositories
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Tamil Nadu State Board, NCERT, and CBSE are kept distinct and never mixed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Samacheer Kalvi */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4">
                <School className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tamil Nadu State Board</h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-2">Samacheer Kalvi (Class 1–12)</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Syllabus from Tamil Nadu Textbook and Educational Services Corporation. Includes pure Tamil medium and English medium textbook texts.
              </p>
              <a
                href="https://textbookcorp.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center"
              >
                <span>textbookcorp.in</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </a>
            </div>

            {/* NCERT & CBSE */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-4">
                <BookCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">NCERT & CBSE Academic</h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mb-2">National Standardized Curricula</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Official NCERT textbooks (Science, Mathematics, Social Studies) in English and Hindi (Vigyan / Ganit).
              </p>
              <a
                href="https://ncert.nic.in/textbook.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center"
              >
                <span>ncert.nic.in</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </a>
            </div>

            {/* Early Learning LKG & UKG */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B192C] hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Kindergarten (LKG & UKG)</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-2">Foundational Early Stage</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Specialized early learning resources: Phonics, counting 1–10, Tamil Uyir Ezhuthukkal (உயிர் எழுத்துக்கள்), and Hindi Swar Varnamala.
              </p>
              <Link
                href="/chat"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center"
              >
                <span>Explore early learning</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-14 bg-gradient-to-r from-teal-700 to-cyan-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t("ctaSectionTitle")}</h2>
          <p className="text-sm text-teal-100 max-w-xl mx-auto mb-6">{t("ctaSectionDesc")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/chat"
              className="px-6 py-3 rounded-xl bg-white text-[#0B192C] font-bold text-sm shadow-md hover:bg-slate-100 transition-colors"
            >
              {t("ctaSectionButton")}
            </Link>
            <Link
              href="/quiz"
              className="px-6 py-3 rounded-xl bg-teal-900/50 hover:bg-teal-900/80 text-white border border-teal-300/30 font-semibold text-sm transition-colors"
            >
              {t("navQuiz")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
