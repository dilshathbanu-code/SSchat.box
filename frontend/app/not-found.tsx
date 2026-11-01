import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GraduationCap, ArrowLeft, Home, MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto text-2xl font-black">
            404
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The curriculum page or lesson you were looking for does not exist in the SSchat.box index.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors"
            >
              <Home className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              <span>Ask AI Chat</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
