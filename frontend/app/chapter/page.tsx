"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { 
  BookOpen, 
  CheckCircle2, 
  ExternalLink, 
  Award, 
  GraduationCap, 
  ArrowLeft,
  ChevronRight,
  BookmarkCheck,
  Check,
  Sparkles,
  Info
} from "lucide-react";

export default function ChapterLearningPage() {
  const { t, uiLang } = useApp();
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("tn_sci_c10_ch1_full");
  const [chapterDetail, setChapterDetail] = useState<any | null>(null);
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function init() {
      const list = await api.getChapters();
      setChapters(list);
      if (list.length > 0) {
        loadDetail(list[0].id);
      }
    }
    init();

    // Load saved section progress from localStorage
    const savedProgress = localStorage.getItem("sschatbox_completed_sections");
    if (savedProgress) {
      try {
        setCompletedSections(JSON.parse(savedProgress));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const loadDetail = async (id: string) => {
    setSelectedChapterId(id);
    const detail = await api.getChapterDetail(id);
    setChapterDetail(detail);
  };

  const toggleSectionCompleted = (sectionId: string) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem("sschatbox_completed_sections", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2">
            <BookOpen className="w-4 h-4" />
            <span>{t("navChapter")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("chapterModeTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {t("chapterModeDesc")}
          </p>
        </div>

        {/* Layout Grid: Chapter Selector (Sidebar) + Section Detail (Main Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapter Selector Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {t("availableChapters")}
              </h2>
              <div className="space-y-2">
                {chapters.map((ch) => {
                  const isSelected = selectedChapterId === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => loadDetail(ch.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-semibold shadow-xs"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase">
                        {ch.board} • {ch.class_grade}
                      </div>
                      <div className="text-xs font-bold mt-0.5">
                        {ch.chapter_number ? `Ch. ${ch.chapter_number}: ` : ""}{ch.chapter_name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {ch.subject}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section Detail & Content */}
          <div className="lg:col-span-3 space-y-6">
            {chapterDetail ? (
              <div className="space-y-6">
                {/* Chapter Meta Card */}
                <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {chapterDetail.board_name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {chapterDetail.class_grade} • {chapterDetail.subject}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                        {chapterDetail.chapter_name}
                      </h2>
                      {chapterDetail.chapter_name_ta && (
                        <p className="text-sm text-teal-700 dark:text-teal-400 font-tamil font-medium mt-0.5">
                          {chapterDetail.chapter_name_ta}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/quiz"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      <span>{t("practiceChapterBtn")}</span>
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                    {uiLang === "ta" && chapterDetail.overview_ta
                      ? chapterDetail.overview_ta
                      : uiLang === "hi" && chapterDetail.overview_hi
                      ? chapterDetail.overview_hi
                      : chapterDetail.overview || "This chapter provides core foundational concepts adhering strictly to state board and NCERT educational guidelines."}
                  </p>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                  {chapterDetail.sections?.map((sec: any, idx: number) => {
                    const isDone = completedSections[sec.id];
                    return (
                      <div
                        key={sec.id || idx}
                        className={`bg-white dark:bg-[#0B192C] border rounded-2xl p-5 shadow-xs transition-all ${
                          isDone
                            ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {sec.title}
                            </h3>
                          </div>

                          <button
                            onClick={() => toggleSectionCompleted(sec.id)}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              isDone
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{t("sectionCompleteDone")}</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{t("sectionCompletedBtn")}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Section Content */}
                        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {uiLang === "ta" && sec.content_ta ? (
                            <p className="font-tamil whitespace-pre-line">{sec.content_ta}</p>
                          ) : uiLang === "hi" && sec.content_hi ? (
                            <p className="font-hindi whitespace-pre-line">{sec.content_hi}</p>
                          ) : (
                            <p className="whitespace-pre-line">{sec.content}</p>
                          )}

                          {/* Key Takeaway / Formula */}
                          {sec.formula && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs text-teal-700 dark:text-teal-300">
                              <span className="font-bold font-sans text-slate-500 mr-2">Key Formula:</span>
                              {sec.formula}
                            </div>
                          )}

                          {/* Authentic Page Reference */}
                          {sec.page_reference && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 pt-1">
                              <BookOpen className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>Textbook Page Reference: {sec.page_reference}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-teal-500 opacity-60" />
                <p className="text-sm">{t("selectChapterPrompt")}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
