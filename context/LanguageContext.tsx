'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt' | 'jp';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    overview: 'Overview',
    myBooks: 'My Books',
    communities: 'Communities',
    settings: 'Settings',
    createNewBook: 'Create New Book',
    signOut: 'Sign Out',
    bookVerse: 'BookVerse',
    browse: 'Browse',
  },
  pt: {
    overview: 'Visão Geral',
    myBooks: 'Meus Livros',
    communities: 'Comunidades',
    settings: 'Configurações',
    createNewBook: 'Criar Novo Livro',
    signOut: 'Sair',
    bookVerse: 'BookVerse',
    browse: 'Explorar',
  },
  jp: {
    overview: '概要',
    myBooks: '私の本',
    communities: 'コミュニティ',
    settings: '設定',
    createNewBook: '新しい本を作成',
    signOut: 'サインアウト',
    bookVerse: 'ブックバース',
    browse: '閲覧',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['en', 'pt', 'jp'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
