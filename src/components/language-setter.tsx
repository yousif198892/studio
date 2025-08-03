
"use client";

import { useLanguage } from "@/hooks/use-language.tsx";
import { useEffect } from "react";

export function LanguageSetter() {
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") as "en" | "ar" | null;
    if (storedLanguage && storedLanguage !== language) {
      setLanguage(storedLanguage);
    }
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("language", language);
  }, [language]);

  return null;
}
