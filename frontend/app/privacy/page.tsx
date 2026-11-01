import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Student Privacy Commitment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Privacy Policy & Safeguards
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            How SSchat.box protects young learners from LKG through Class 12 with age-appropriate safety standards.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>1. Minimal Student Data Collection</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              SSchat.box operates on a strict principle of data minimization. We only collect the minimal information necessary to deliver educational answers: an email address, grade/class level, and board preference. No government identification, phone numbers, or physical addresses are ever requested.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>2. Child Privacy & Age-Appropriate Safeguards</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Because SSchat.box is designed for school students ranging from foundational early childhood (LKG/UKG) through higher secondary (Class 12), all queries are filtered against explicit content, harmful material, and commercial profiling. We do not sell student data, deliver third-party advertisements, or create cross-site behavioral profiles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>3. Public Access Without Compulsory Login</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Any student can freely search curriculum topics, explore textbook chapters, and verify answers without ever creating an account. Account creation is strictly optional and used solely for saving study streaks and quiz histories.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>4. Educational Fair Use & Textbook Provenance</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Textbook citations reference official materials issued by the Tamil Nadu Textbook and Educational Services Corporation, NCERT, and CBSE Academic. Passages are indexed under educational fair-use principles to support student comprehension and academic study.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
