import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import translations
import { translations } from "@/i18n/translations";

const STORAGE_KEY = "pigeonlab-lang";
const LEGACY_KEYS = ["axislab-lang", "dovelab-lang", "ethiolab-lang"];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const saved =
      localStorage.getItem(STORAGE_KEY) ??
      LEGACY_KEYS.map((k) => localStorage.getItem(k)).find(Boolean);
    return (saved === "am" ? "am" : "en") as Language;
  });

  useEffect(() => {
    // Reflect on <html lang> for accessibility & SEO
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* storage may be blocked */
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
