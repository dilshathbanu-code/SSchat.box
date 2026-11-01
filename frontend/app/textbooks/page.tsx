"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { ALL_BOARDS, ALL_CLASSES } from "@/lib/curriculum";
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Filter, 
  FileText,
  X,
  GraduationCap
} from "lucide-react";

export default function TextbooksPage() {
  const { t, uiLang } = useApp();
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [selectedBoard, setSelectedBoard] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalPassage, setActiveModalPassage] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      const data = await api.getTextbooks();
      setTextbooks(data);
    }
    load();
  }, []);

  const filtered = textbooks.filter((item) => {
    const matchesBoard = selectedBoard === "all" || item.board === selectedBoard;
    const matchesClass = selectedClass === "all" || item.class_grade === selectedClass;
    const matchesSearch =
      searchQuery === "" ||
      item.chapter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.board_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBoard && matchesClass && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Verified Curriculum Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("libraryTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {t("libraryDesc")}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchLibraryPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
            {/* Board filter */}
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">{t("allBoards")}</option>
              {ALL_BOARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {uiLang === "ta" ? b.name_ta : uiLang === "hi" ? b.name_hi : b.short_name}
                </option>
              ))}
            </select>

            {/* Complete Class filter (LKG to Class 12) */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">{t("allClasses")}</option>
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {item.class_grade}
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {item.chapter_number ? `Chapter ${item.chapter_number}: ` : ""}
                    {item.chapter_name}
                  </h3>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                    {item.subject} • {item.board_name}
                  </p>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Pages:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.page_start}–{item.page_end}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Edition:</span>
                    <span className="text-slate-700 dark:text-slate-300">{item.academic_year}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveModalPassage(item)}
                  className="font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 inline-flex items-center space-x-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t("viewOriginalPassage")}</span>
                </button>

                {item.official_source_url && (
                  <a
                    href={item.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center space-x-1"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              {t("noBooksMatching")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Try selecting another education board, resetting the class filter, or searching for broader terms like "Science" or "Newton".
            </p>
          </div>
        )}
      </main>

      {/* Verified Passage Modal */}
      {activeModalPassage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {activeModalPassage.chapter_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeModalPassage.board_name} • {activeModalPassage.class_grade} • Pages {activeModalPassage.page_start}–{activeModalPassage.page_end}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalPassage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Original Government Textbook Archival Passage</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif whitespace-pre-line">
                {activeModalPassage.raw_text_passage || "This verified syllabus passage is archived directly from the state educational repository."}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalPassage(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
