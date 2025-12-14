
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, getTranslations, Language } from '@/lib/i18n';

type TranslationObject = typeof translations.es;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationObject;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
