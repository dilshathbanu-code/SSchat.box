import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, ShieldAlert, Award, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Academic Guidelines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Terms of Use & Academic Ethics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Guidelines for students, teachers, and examiners using SSchat.box educational assistant.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Educational Purpose & Capstone Scope</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              SSchat.box is an AI-powered educational technology project built for demonstration, student study support, and academic evaluation. It is designed to supplement classroom teaching and official textbooks, not to replace teachers or schools.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Zero Hallucination & Evidence Grounding</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              While SSchat.box enforces strict RAG grounding and fallback mechanisms when supporting textbook evidence is insufficient, students are encouraged to refer directly to physical textbooks and school syllabi for formal board examinations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Curriculum Attribution</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Tamil Nadu Samacheer Kalvi textbooks remain the intellectual property of the Tamil Nadu Textbook and Educational Services Corporation. NCERT textbooks remain the property of the National Council of Educational Research and Training. All brand names are used solely for identification and syllabus alignment.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
