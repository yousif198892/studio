
"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, TranslationKey } from '@/lib/i18n';

type Language = 'en' | 'ar';
type FontSize = 'sm' | 'base' | 'lg';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: (key: TranslationKey, ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<FontSize>('base');

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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, fontSize, setFontSize, t }}>
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
