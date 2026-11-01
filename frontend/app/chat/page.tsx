"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CitationCard from "@/components/CitationCard";
import { api, Citation } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  ALL_BOARDS,
  HIGHER_SECONDARY_STREAMS,
  getClassesForBoard,
  getApplicableSubjects,
  isSubjectVerified
} from "@/lib/curriculum";
import {
  Send,
  Sparkles,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  GraduationCap,
  MessageSquare,
  BookmarkCheck,
  Bookmark,
  Info,
  ShieldCheck
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  explanation?: string | null;
  example?: string | null;
  citations?: Citation[];
  hasSufficientEvidence?: boolean;
  language?: string;
  verificationStatus?: string;
  aiEngine?: string;
  timestamp: string;
}

export default function ChatPage() {
  const { t, uiLang, aiLang, setAiLang } = useApp();

  // Curriculum selectors
  const [board, setBoard] = useState("tn_state_board");
  const [classGrade, setClassGrade] = useState("Class 10");
  const [stream, setStream] = useState("science_bio");
  const [subject, setSubject] = useState("Science");

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available classes for current board
  const availableClasses = getClassesForBoard(board);
  const isHigherSecondary = classGrade === "Class 11" || classGrade === "Class 12";

  // Dynamic subjects based on board, class, and stream
  const applicableSubjects = getApplicableSubjects(board, classGrade, stream);
  const currentSubjectVerified = isSubjectVerified(board, classGrade, subject);

  // Synchronize class selection when board changes
  useEffect(() => {
    if (!availableClasses.includes(classGrade)) {
      setClassGrade(availableClasses[0] || "Class 10");
    }
  }, [board, availableClasses, classGrade]);

  // Synchronize subject selection when class or stream changes
  useEffect(() => {
    const validSubjectNames = applicableSubjects.map((s) => s.name);
    if (!validSubjectNames.includes(subject)) {
      setSubject(validSubjectNames[0] || "Science");
    }
  }, [classGrade, stream, applicableSubjects, subject]);

  // Load user preferences and initial welcome message
  useEffect(() => {
    const savedUser = localStorage.getItem("sschatbox_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.board) setBoard(u.board);
        if (u.class_grade) setClassGrade(u.class_grade);
      } catch (e) {
        console.error(e);
      }
    }

    // Load saved notes
    const saved = localStorage.getItem("sschatbox_saved_notes");
    if (saved) {
      try {
        const notes = JSON.parse(saved);
        const map: Record<string, boolean> = {};
        notes.forEach((n: any) => {
          map[n.id] = true;
        });
        setSavedNotes(map);
      } catch (e) {
        console.error(e);
      }
    }

    // Set welcome message dynamically based on UI language
    const defaultWelcome: Message = {
      id: "msg_welcome",
      sender: "ai",
      text: t("welcomeGreeting"),
      explanation: t("welcomeDesc"),
      example: t("welcomeSample"),
      hasSufficientEvidence: true,
      verificationStatus: "Verified Curriculum Assistant",
      aiEngine: "SSchat.box Verified Local RAG Engine",
      timestamp: "09:00 AM"
    };

    // Fetch user-isolated chat history from backend
    api.getChatHistory().then((history) => {
      if (history && history.length > 0) {
        const loadedMsgs: Message[] = [];
        // Note: history is returned most recent first, so reverse to show chronologically
        const chronological = [...history].reverse();
        chronological.forEach((h: any) => {
          if (h.query) {
            loadedMsgs.push({
              id: `user_${h.id}`,
              sender: "user",
              text: h.query,
              timestamp: h.timestamp ? new Date(h.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Earlier"
            });
          }
          if (h.answer) {
            loadedMsgs.push({
              id: `ai_${h.id}`,
              sender: "ai",
              text: h.answer,
              explanation: h.explanation,
              example: h.example,
              citations: h.citations || [],
              hasSufficientEvidence: h.has_sufficient_evidence,
              verificationStatus: h.verification_status,
              aiEngine: h.ai_engine || "SSchat.box Verified Local RAG Engine",
              timestamp: h.timestamp ? new Date(h.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Earlier"
            });
          }
        });
        setMessages(loadedMsgs);
      } else {
        setMessages([defaultWelcome]);
      }
    }).catch(() => {
      setMessages([defaultWelcome]);
    });
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (overrideQuery?: string) => {
    const q = overrideQuery || inputQuery;
    if (!q.trim() || loading) return;

    const userMsgId = `user_${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setLoading(true);

    try {
      const previousTurns = messages
        .map((m) => ({
          query: m.sender === "user" ? m.text : "",
          answer: m.sender === "ai" ? m.text : ""
        }))
        .filter((h) => h.query || h.answer);

      // AI Answer Language is explicitly sent as `aiLang` (independent from `uiLang`)
      const resp = await api.askQuestion({
        query: q.trim(),
        board,
        class_grade: classGrade,
        subject,
        language: aiLang,
        history: previousTurns
      });

      const aiMsgId = `ai_${Date.now()}`;
      const aiMessage: Message = {
        id: aiMsgId,
        sender: "ai",
        text: resp.answer,
        explanation: resp.explanation,
        example: resp.example,
        citations: resp.citations || [],
        hasSufficientEvidence: resp.has_sufficient_evidence,
        language: resp.language,
        verificationStatus: resp.verification_status,
        aiEngine: (resp as any).ai_engine || "SSchat.box Verified Local RAG Engine",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `ai_err_${Date.now()}`,
        sender: "ai",
        text:
          aiLang === "ta"
            ? "மன்னிக்கவும், சேவை இணைப்பில் பிழை ஏற்பட்டது. தயவுசெய்து உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்."
            : aiLang === "hi"
            ? "क्षमा करें, सेवा से कनेक्ट करने में त्रुटि हुई। कृपया अपना इंटरनेट कनेक्शन जांचें।"
            : "Sorry, an error occurred while connecting to the textbook verification service. Please try again.",
        hasSufficientEvidence: false,
        verificationStatus: "Connection Error",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNote = (msg: Message) => {
    const existing = localStorage.getItem("sschatbox_saved_notes");
    let notes: any[] = [];
    if (existing) {
      try {
        notes = JSON.parse(existing);
      } catch (e) {
        console.error(e);
      }
    }

    if (savedNotes[msg.id]) {
      // Remove note
      notes = notes.filter((n) => n.id !== msg.id);
      setSavedNotes((prev) => {
        const updated = { ...prev };
        delete updated[msg.id];
        return updated;
      });
    } else {
      // Add note
      notes.unshift({
        id: msg.id,
        text: msg.text,
        subject,
        class_grade: classGrade,
        board,
        date: new Date().toLocaleDateString()
      });
      setSavedNotes((prev) => ({ ...prev, [msg.id]: true }));
    }
    localStorage.setItem("sschatbox_saved_notes", JSON.stringify(notes));
  };

  const handleClear = async () => {
    if (confirm(uiLang === "ta" ? "உரையாடலை அழிக்க விரும்புகிறீர்களா?" : uiLang === "hi" ? "क्या आप चैट साफ़ करना चाहते हैं?" : "Clear this chat session?")) {
      try {
        await api.clearChatHistory();
      } catch (e) {
        console.warn("Could not clear remote history:", e);
      }
      setMessages([
        {
          id: `msg_welcome_${Date.now()}`,
          sender: "ai",
          text: t("welcomeGreeting"),
          explanation: t("welcomeDesc"),
          example: t("welcomeSample"),
          hasSufficientEvidence: true,
          verificationStatus: "Verified Curriculum Assistant",
          aiEngine: "SSchat.box Verified Local RAG Engine",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  // Sample prompt chips tailored to current stage and language
  const samplePrompts =
    board === "early_learning" || classGrade === "LKG" || classGrade === "UKG"
      ? [
          { text: "தமிழ் உயிர் எழுத்துக்கள் எத்தனை?", label: "உயிர் எழுத்துக்கள் (Tamil Alphabets)" },
          { text: "Count numbers from 1 to 10", label: "Early Numbers (1 to 10)" },
          { text: "What colors are in a rainbow?", label: "Rainbow Colors" }
        ]
      : [
          { text: "நியூட்டனின் முதல் இயக்க விதியை விளக்குக", label: "Newton's First Law (Science)" },
          { text: "Write the equation for photosynthesis", label: "Photosynthesis Formula (Biology)" },
          { text: "Define momentum and give its SI unit", label: "Momentum (Physics)" },
          { text: "What is inertia and what are its types?", label: "Inertia Types" }
        ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Top Filter & Curriculum Selection Bar */}
      <div className="bg-white dark:bg-[#070F1E] border-b border-slate-200 dark:border-slate-800 py-3 px-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Brand/Curriculum Title */}
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-900 dark:text-white hidden sm:inline">
              {t("chatTitle")}
            </span>
          </div>

          {/* Selectors Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Board Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-medium">{t("boardLabel")}:</span>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {ALL_BOARDS.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {uiLang === "ta" ? b.name_ta : uiLang === "hi" ? b.name_hi : b.short_name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Complete Class Selector (LKG, UKG, Class 1 to Class 12) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-medium">{t("classLabel")}:</span>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Stream Selector (Only for Class 11 & Class 12) */}
            {isHigherSecondary && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-medium">{t("streamLabel")}:</span>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="bg-transparent text-teal-700 dark:text-teal-300 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  {HIGHER_SECONDARY_STREAMS.map((st) => (
                    <option key={st.id} value={st.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {uiLang === "ta" ? st.name_ta : uiLang === "hi" ? st.name_hi : st.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 4. Subject Selector (Curriculum-driven) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-medium">{t("subjectLabel")}:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {applicableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {uiLang === "ta" ? sub.name_ta : uiLang === "hi" ? sub.name_hi : sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Separate AI Answer Language Selector */}
            <div className="flex items-center bg-teal-50 dark:bg-teal-950/60 rounded-xl px-2.5 py-1.5 border border-teal-200 dark:border-teal-700/60">
              <span className="text-teal-800 dark:text-teal-300 mr-1.5 font-medium">{t("aiAnswerLangLabel")}:</span>
              <select
                value={aiLang}
                onChange={(e) => setAiLang(e.target.value as any)}
                className="bg-transparent text-teal-700 dark:text-teal-300 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ta" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  தமிழ் (Tamil)
                </option>
                <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  English
                </option>
                <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  हिन्दी (Hindi)
                </option>
              </select>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={t("clearConversation")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Provisional Syllabus Warning Notice */}
      {!currentSubjectVerified && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{t("provisionalNotice")}</span>
          </div>
        </div>
      )}

      {/* Main Chat Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Sample Prompt Chips */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t("sampleQuestionsTag")}</span>
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-all shadow-xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 space-y-4 pb-24">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white rounded-br-xs"
                    : "bg-white dark:bg-[#0B192C] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs"
                }`}
              >
                {/* Header for AI answers */}
                {msg.sender === "ai" && (
                  <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">SSchat.box</span>
                      <span className="text-[10px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60 font-semibold">
                        {msg.aiEngine || "SSchat.box Verified Local RAG Engine"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 mt-1 sm:mt-0">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title={t("copyAnswer")}
                      >
                        {copiedId === msg.id ? (
                          <span className="inline-flex items-center text-[11px] text-teal-600 dark:text-teal-400 font-semibold space-x-1">
                            <Check className="w-3 h-3" />
                            <span>{t("copiedAnswer")}</span>
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveNote(msg)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          savedNotes[msg.id]
                            ? "text-teal-600 dark:text-teal-400 font-semibold"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title={savedNotes[msg.id] ? t("savedNote") : t("saveNote")}
                      >
                        {savedNotes[msg.id] ? (
                          <span className="inline-flex items-center text-[11px] space-x-1 text-teal-600 dark:text-teal-400 font-semibold">
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>{t("savedNote")}</span>
                          </span>
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Text */}
                <div
                  className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${
                    msg.language === "ta" ? "font-tamil" : msg.language === "hi" ? "font-hindi" : ""
                  }`}
                >
                  {msg.text}
                </div>

                {/* Explanation Block */}
                {msg.explanation && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {uiLang === "ta" ? "விளக்கம்:" : uiLang === "hi" ? "विस्तृत व्याख्या:" : "Detailed Explanation:"}
                    </p>
                    <p className="leading-relaxed">{msg.explanation}</p>
                  </div>
                )}

                {/* Example Block */}
                {msg.example && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {uiLang === "ta" ? "பாடப்புத்தக மாதிரி:" : uiLang === "hi" ? "पाठ्यपुस्तक उदाहरण:" : "Curriculum Example:"}
                    </span>{" "}
                    {msg.example}
                  </div>
                )}

                {/* Genuine Page-Level Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3">
                    {msg.citations.map((cite, cIdx) => (
                      <CitationCard key={cIdx} citation={cite} />
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-2 text-right">
                  <span
                    className={`text-[10px] ${
                      msg.sender === "user"
                        ? "text-teal-100"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center space-x-3 bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 max-w-sm shadow-xs">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("chatSendingBtn")}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Sticky Input Bar */}
      <div className="sticky bottom-0 z-40 bg-white/95 dark:bg-[#070F1E]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t("chatPlaceholder")}
            disabled={loading}
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-2xl shadow-xs flex items-center space-x-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t("chatSendBtn")}</span>
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
