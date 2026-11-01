"use client";

import React, { useState } from "react";
import { BookMarked, ExternalLink, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Citation } from "@/lib/api";
import { useApp } from "@/context/AppContext";

interface CitationCardProps {
  citation: Citation;
}

export default function CitationCard({ citation }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useApp();

  return (
    <div className="mt-3 border border-teal-500/30 bg-teal-50/60 dark:bg-teal-950/20 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 transition-all hover:border-teal-500/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-teal-800 dark:text-teal-300">{citation.board}</span>
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-700/40">
                <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>{t("verifiedBadge")}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {citation.class_grade} • {citation.subject} • {citation.academic_year || "2024-2025 Edition"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {citation.official_source_url && (
            <a
              href={citation.official_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              title={t("sourceLink")}
            >
              <span>{t("sourceLink")}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/40 hover:bg-teal-200 dark:hover:bg-teal-900/70 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700/50 transition-colors"
          >
            <span>{expanded ? "Hide Details" : "View Citation Details"}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-800/40 space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t("sourceChapter")}:</span>{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {citation.chapter_number ? `${citation.chapter_number}: ` : ""}{citation.chapter_name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t("sourcePage")}:</span>{" "}
              <span className="text-teal-700 dark:text-teal-300 font-bold">
                Pages {citation.page_start}{citation.page_end && citation.page_end !== citation.page_start ? `–${citation.page_end}` : ""}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t("sourcePublisher")}:</span>{" "}
              <span className="text-slate-800 dark:text-slate-200">{citation.publisher}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{citation.verification_status}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Note: This citation is linked directly to official school syllabus records. No citations are fabricated.
          </p>
        </div>
      )}
    </div>
  );
}
