
"use client";

import { useLanguage } from "@/hooks/use-language.tsx";
import { useEffect } from "react";

export function LanguageSetter() {
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    // On initial mount, check localStorage and update the context if needed.
    const storedLanguage = localStorage.getItem("language") as "en" | "ar" | null;
    if (storedLanguage && storedLanguage !== language) {
      setLanguage(storedLanguage);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // This effect runs whenever the language changes.
    // It updates the HTML element attributes and localStorage.
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("language", language);
  }, [language]);

  return null; // This component doesn't render anything
}
