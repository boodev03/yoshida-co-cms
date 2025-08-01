"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isJapanese: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ja');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('cms-language') as Language;
    if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('cms-language', newLanguage);
  };

  const value = {
    language,
    setLanguage,
    isJapanese: language === 'ja',
    isEnglish: language === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}