
"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, TranslationKey } from '@/lib/i18n';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, ...args: any[]) => string;
  translateContent: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: TranslationKey, ...args: any[]): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return key if not found
      }
    }
    
    if (typeof result === 'string') {
        return result.replace(/{(\d+)}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }

    return key;
  };

  const translateContent = (text: string): string => {
    if (language !== 'ar' || !text) {
        return text;
    }
    return text
        .replace(/^Unit\s*/i, 'الوحدة ')
        .replace(/^Lesson\s*/i, 'الدرس ');
  };


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateContent }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
