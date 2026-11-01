"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ALL_BOARDS, ALL_CLASSES, HIGHER_SECONDARY_STREAMS } from "@/lib/curriculum";
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle2, 
  Trash2, 
  Languages, 
  GraduationCap, 
  Sun,
  Moon,
  Laptop,
  Check
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme, uiLang, setUiLang, aiLang, setAiLang, t } = useApp();

  const [board, setBoard] = useState("tn_state_board");
  const [classGrade, setClassGrade] = useState("Class 10");
  const [stream, setStream] = useState("science_bio");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("sschatbox_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.board) setBoard(u.board);
        if (u.class_grade) setClassGrade(u.class_grade);
        if (u.stream) setStream(u.stream);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const existing = localStorage.getItem("sschatbox_user");
    const u = existing ? JSON.parse(existing) : { name: "Student", email: "student@sschatbox.edu" };
    u.board = board;
    u.class_grade = classGrade;
    u.stream = stream;
    u.preferred_language = aiLang;

    localStorage.setItem("sschatbox_user", JSON.stringify(u));

    // Synchronize to backend if student is authenticated
    try {
      await api.updateProfile({
        board,
        class_grade: classGrade,
        preferred_language: aiLang
      });
    } catch (err) {
      console.warn("Could not sync profile to backend:", err);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your study search history and saved notes?")) {
      try {
        await api.clearChatHistory();
      } catch (err) {
        console.warn("Could not clear remote history:", err);
      }
      localStorage.removeItem("sschatbox_history");
      localStorage.removeItem("sschatbox_saved_notes");
      alert("Study history and saved notes cleared successfully.");
    }
  };

  const isHigherSecondary = classGrade === "Class 11" || classGrade === "Class 12";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <head>
        <title>Student Settings — SSchat.box</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2">
            <SettingsIcon className="w-4 h-4" />
            <span>{t("navSettings")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("settingsTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            {t("settingsDesc")}
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t("settingsSavedSuccess")}</span>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Theme Selection Section */}
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t("settingsThemeSection")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("settingsThemeDesc")}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                  theme === "light"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>{t("themeLight")}</span>
                {theme === "light" && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                  theme === "dark"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Moon className="w-5 h-5 text-teal-400" />
                <span>{t("themeDark")}</span>
                {theme === "dark" && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                  theme === "system"
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Laptop className="w-5 h-5 text-slate-400" />
                <span>{t("themeSystem")}</span>
                {theme === "system" && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
              </button>
            </div>
          </div>

          {/* 2. Language Selection (Separating UI and AI Answer) */}
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                Language Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The website interface language and AI chatbot answer language are configured independently.
              </p>
            </div>

            {/* A. Website Interface Language */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("settingsUiLangSection")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUiLang("en")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    uiLang === "en"
                      ? "border-teal-500 bg-teal-600 text-white shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setUiLang("ta")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold font-tamil transition-all cursor-pointer ${
                    uiLang === "ta"
                      ? "border-teal-500 bg-teal-600 text-white shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
                <button
                  type="button"
                  onClick={() => setUiLang("hi")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold font-hindi transition-all cursor-pointer ${
                    uiLang === "hi"
                      ? "border-teal-500 bg-teal-600 text-white shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>

            {/* B. AI Chatbot Answer Language */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("settingsAiLangSection")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAiLang("ta")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold font-tamil transition-all cursor-pointer ${
                    aiLang === "ta"
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
                <button
                  type="button"
                  onClick={() => setAiLang("en")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    aiLang === "en"
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setAiLang("hi")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold font-hindi transition-all cursor-pointer ${
                    aiLang === "hi"
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>
          </div>

          {/* 3. Curriculum and Class Preferences */}
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t("settingsCurriculumSection")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set your primary education board and class for fast access in the chat workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("boardLabel")}
                </label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  {ALL_BOARDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {uiLang === "ta" ? b.name_ta : uiLang === "hi" ? b.name_hi : b.short_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t("classLabel")}
                </label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  {ALL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {isHigherSecondary && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t("streamLabel")}
                  </label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    {HIGHER_SECONDARY_STREAMS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {uiLang === "ta" ? s.name_ta : uiLang === "hi" ? s.name_hi : s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t("saveSettingsBtn")}</span>
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              className="text-xs text-rose-500 hover:text-rose-600 hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t("clearHistoryBtn")}</span>
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
