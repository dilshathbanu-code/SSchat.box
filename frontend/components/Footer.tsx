"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, ShieldCheck, ExternalLink, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-white dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                SSchat<span className="text-teal-600 dark:text-teal-400">.box</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
              {t("footerAbout")}
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-teal-700 dark:text-teal-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Zero-Hallucination Grounding</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t("footerQuickLinks")}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/chat" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("navChat")}
                </Link>
              </li>
              <li>
                <Link href="/chapter" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("navChapter")}
                </Link>
              </li>
              <li>
                <Link href="/textbooks" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("navLibrary")}
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("navQuiz")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("navDashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Curricula */}
          <div className="space-y-2.5">
            <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t("footerCurricula")}
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Tamil Nadu Samacheer Kalvi</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>NCERT National Textbooks</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>CBSE Academic Curriculum</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Early Learning (LKG & UKG)</span>
              </li>
            </ul>
          </div>

          {/* Integrity & Legal */}
          <div className="space-y-2.5">
            <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t("footerLegal")}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("footerPrivacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("footerTerms")}
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t("navSettings")}
                </Link>
              </li>
            </ul>
            <div className="pt-2 text-[10px] text-slate-400 leading-normal">
              {t("footerDisclaimer")}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <p>© 2026 SSchat.box. {t("footerRights")}</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <a
              href="https://textbookcorp.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-600 dark:hover:text-teal-400 inline-flex items-center space-x-1"
            >
              <span>TN Textbook Corp</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://ncert.nic.in/textbook.php"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-600 dark:hover:text-teal-400 inline-flex items-center space-x-1"
            >
              <span>NCERT Portal</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
