"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UILanguage, getTranslation } from "@/lib/translations";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface AppContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  uiLang: UILanguage;
  setUiLang: (lang: UILanguage) => void;
  aiLang: UILanguage;
  setAiLang: (lang: UILanguage) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [uiLang, setUiLangState] = useState<UILanguage>("en");
  const [aiLang, setAiLangState] = useState<UILanguage>("ta");
  const [mounted, setMounted] = useState(false);

  // Apply theme to HTML root element
  const applyTheme = useCallback((mode: ThemeMode) => {
    let resolved: ResolvedTheme = "light";
    if (mode === "dark") {
      resolved = "dark";
    } else if (mode === "light") {
      resolved = "light";
    } else {
      // System mode
      if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        resolved = "dark";
      } else {
        resolved = "light";
      }
    }

    setResolvedTheme(resolved);
    if (typeof document !== "undefined") {
      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Initialize from localStorage safely
  useEffect(() => {
    setMounted(true);

    // 1. Theme initialization
    const savedTheme = (localStorage.getItem("sschatbox_theme") as ThemeMode) || "system";
    setThemeState(savedTheme);
    applyTheme(savedTheme);

    // 2. UI Language initialization
    const savedUiLang = (localStorage.getItem("sschatbox_ui_lang") as UILanguage) || "en";
    setUiLangState(savedUiLang);
    document.documentElement.lang = savedUiLang;

    // 3. AI Answer Language initialization (defaults to Tamil for regional student audience)
    const savedAiLang = (localStorage.getItem("sschatbox_ai_lang") as UILanguage) || "ta";
    setAiLangState(savedAiLang);

    // System theme change listener
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const currentStored = localStorage.getItem("sschatbox_theme") as ThemeMode;
      if (!currentStored || currentStored === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [applyTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("sschatbox_theme", newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const setUiLang = (lang: UILanguage) => {
    setUiLangState(lang);
    localStorage.setItem("sschatbox_ui_lang", lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const setAiLang = (lang: UILanguage) => {
    setAiLangState(lang);
    localStorage.setItem("sschatbox_ai_lang", lang);
  };

  const t = useCallback(
    (key: string): string => {
      return getTranslation(uiLang, key);
    },
    [uiLang]
  );

  return (
    <AppContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        uiLang,
        setUiLang,
        aiLang,
        setAiLang,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
