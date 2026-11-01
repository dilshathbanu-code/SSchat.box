"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  GraduationCap, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut,
  Sparkles
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme, uiLang, setUiLang, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; class_grade: string } | null>(null);

  useEffect(() => {
    // Check saved student session
    const savedUser = localStorage.getItem("sschatbox_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sschatbox_user");
    localStorage.removeItem("sschatbox_token");
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: t("navHome") },
    { href: "/chat", label: t("navChat"), highlight: true },
    { href: "/chapter", label: t("navChapter") },
    { href: "/textbooks", label: t("navLibrary") },
    { href: "/quiz", label: t("navQuiz") },
    { href: "/dashboard", label: t("navDashboard") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#070F1E]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  SSchat<span className="text-teal-600 dark:text-teal-400">.box</span>
                </span>
                <span className="text-[10px] bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-700/50">
                  {t("lkgTo12Badge")}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {t("brandSubtitle")}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 font-semibold"
                      : link.highlight
                      ? "text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar: Theme Toggle, Language Selector & Auth */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 transition-colors"
              title={resolvedTheme === "dark" ? t("themeLight") : t("themeDark")}
              aria-label={t("switchTheme")}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Language Switcher (EN, தமிழ், हिन्दी) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setUiLang("en")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  uiLang === "en"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="English Interface"
              >
                EN
              </button>
              <button
                onClick={() => setUiLang("ta")}
                className={`px-2.5 py-1 rounded-lg transition-all font-tamil ${
                  uiLang === "ta"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="தமிழ் இடைமுகம்"
              >
                தமிழ்
              </button>
              <button
                onClick={() => setUiLang("hi")}
                className={`px-2.5 py-1 rounded-lg transition-all font-hindi ${
                  uiLang === "hi"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="हिन्दी इंटरफ़ेस"
              >
                हिन्दी
              </button>
            </div>

            {/* User Session or Login/Register */}
            {user ? (
              <div className="flex items-center space-x-1.5">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="max-w-[80px] truncate">{user.name}</span>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-1.5 py-0.5 rounded font-medium">
                    {user.class_grade || "Class 10"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={t("navLogout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {t("navSignIn")}
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs shadow-teal-600/30 transition-all"
                >
                  {t("navGetStarted")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions (Theme + Menu) */}
          <div className="flex md:hidden items-center space-x-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              aria-label={t("switchTheme")}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070F1E] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname === link.href
                    ? "bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language selector in mobile */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
              {t("settingsUiLangSection")}:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <button
                onClick={() => { setUiLang("en"); setMobileMenuOpen(false); }}
                className={`py-2 rounded-xl border ${
                  uiLang === "en"
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                English
              </button>
              <button
                onClick={() => { setUiLang("ta"); setMobileMenuOpen(false); }}
                className={`py-2 rounded-xl border font-tamil ${
                  uiLang === "ta"
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => { setUiLang("hi"); setMobileMenuOpen(false); }}
                className={`py-2 rounded-xl border font-hindi ${
                  uiLang === "hi"
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Auth options in mobile */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Signed in as <b className="text-teal-600 dark:text-teal-400">{user.name}</b>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-500 dark:text-rose-400 hover:underline flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t("navLogout")}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl"
                >
                  {t("navSignIn")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs"
                >
                  {t("navGetStarted")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
