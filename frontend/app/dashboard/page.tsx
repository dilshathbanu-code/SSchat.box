"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { 
  GraduationCap, 
  MessageSquare, 
  BookOpen, 
  Award, 
  Flame, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Settings, 
  BookmarkCheck, 
  Trash2,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const { t, uiLang } = useApp();

  const [user, setUser] = useState<{
    name: string;
    email: string;
    board: string;
    class_grade: string;
    preferred_language: string;
  }>({
    name: "Student",
    email: "student@sschatbox.edu",
    board: "tn_state_board",
    class_grade: "Class 10",
    preferred_language: "ta"
  });

  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("sschatbox_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const notes = localStorage.getItem("sschatbox_saved_notes");
    if (notes) {
      try {
        setSavedNotes(JSON.parse(notes));
      } catch (e) {
        console.error(e);
      }
    }

    // Load student's recent isolated chat history
    api.getChatHistory().then((history) => {
      if (history && Array.isArray(history)) {
        setRecentChats(history.slice(0, 4));
      }
    }).catch(() => {});
  }, []);

  const handleDeleteNote = (noteId: string) => {
    const updated = savedNotes.filter((n) => n.id !== noteId);
    setSavedNotes(updated);
    localStorage.setItem("sschatbox_saved_notes", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <head>
        <title>Student Dashboard — SSchat.box</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Welcome Header */}
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {t("welcomeGreeting").split("!")[0]}, {user.name}!
                </h1>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full font-semibold">
                  {user.class_grade}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {t("dashboardSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t("navChat")}</span>
            </Link>
            <Link
              href="/settings"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={t("navSettings")}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Learning Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Streak Card */}
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                5 {t("streakDays")}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t("streakCardTitle")}
              </p>
            </div>
          </div>

          {/* Questions Asked Card */}
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {recentChats.length > 0 ? recentChats.length : 12}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t("questionsCardTitle")}
              </p>
            </div>
          </div>

          {/* Mastered Chapters Card */}
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                3
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t("masteryCardTitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Saved Study Notes Section */}
        <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <BookmarkCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t("savedNotesTitle")}
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {savedNotes.length} Notes Saved
            </span>
          </div>

          {savedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {note.class_grade} • {note.subject}
                      </span>
                      <span className="text-[10px] text-slate-400">{note.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                      {note.text}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <Link
                      href="/chat"
                      className="text-teal-600 dark:text-teal-400 font-semibold hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Study in Chat</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title={t("deleteNote")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <BookmarkCheck className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
              <p className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                {t("noNotesYet")}
              </p>
            </div>
          )}
        </div>

        {/* Recent Isolated Inquiries */}
        {recentChats.length > 0 && (
          <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Recent Textbook Inquiries
                </h2>
              </div>
              <Link href="/chat" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                Open AI Chat
              </Link>
            </div>
            <div className="space-y-3">
              {recentChats.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {c.query}
                    </p>
                    <span className="text-[10px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full font-medium">
                      {c.board} • {c.class_grade} • {c.subject}
                    </span>
                  </div>
                  <Link href="/chat" className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline shrink-0 flex items-center space-x-1">
                    <span>Review</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
