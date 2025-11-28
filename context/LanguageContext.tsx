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
    // Settings Page
    profileSettings: 'Profile Settings',
    visualIdentity: 'Visual Identity',
    profileAvatar: 'Profile Avatar',
    profileBanner: 'Profile Banner',
    languagePreferences: 'Language & Preferences',
    interfaceLanguage: 'Interface Language',
    languageHelp: 'Changes the language of the sidebar and menus.',
    personalInfo: 'Personal Info',
    username: 'Username',
    usernameHelp: 'Username cannot be changed',
    displayName: 'Display Name',
    bio: 'Bio',
    bioPlaceholder: 'Tell your story...',
    socialConnections: 'Social Connections',
    aiConfiguration: 'AI Configuration',
    geminiApiKey: 'Gemini API Key',
    apiKeyHelp: 'Your key is stored securely and used only for your requests.',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    livePreview: 'Live Preview',
    yourName: 'Your Name',
    bioPreview: 'Your biography will appear here...',
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
    // Settings Page
    profileSettings: 'Configurações de Perfil',
    visualIdentity: 'Identidade Visual',
    profileAvatar: 'Avatar do Perfil',
    profileBanner: 'Banner do Perfil',
    languagePreferences: 'Idioma e Preferências',
    interfaceLanguage: 'Idioma da Interface',
    languageHelp: 'Altera o idioma da barra lateral e menus.',
    personalInfo: 'Informações Pessoais',
    username: 'Nome de Usuário',
    usernameHelp: 'O nome de usuário não pode ser alterado',
    displayName: 'Nome de Exibição',
    bio: 'Biografia',
    bioPlaceholder: 'Conte sua história...',
    socialConnections: 'Conexões Sociais',
    aiConfiguration: 'Configuração de IA',
    geminiApiKey: 'Chave da API Gemini',
    apiKeyHelp: 'Sua chave é armazenada com segurança e usada apenas para suas solicitações.',
    saveChanges: 'Salvar Alterações',
    saving: 'Salvando...',
    livePreview: 'Pré-visualização',
    yourName: 'Seu Nome',
    bioPreview: 'Sua biografia aparecerá aqui...',
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
    // Settings Page
    profileSettings: 'プロフィール設定',
    visualIdentity: 'ビジュアルアイデンティティ',
    profileAvatar: 'プロフィールアバター',
    profileBanner: 'プロフィールバナー',
    languagePreferences: '言語と設定',
    interfaceLanguage: 'インターフェース言語',
    languageHelp: 'サイドバーとメニューの言語を変更します。',
    personalInfo: '個人情報',
    username: 'ユーザー名',
    usernameHelp: 'ユーザー名は変更できません',
    displayName: '表示名',
    bio: '自己紹介',
    bioPlaceholder: 'あなたの物語を語ってください...',
    socialConnections: 'ソーシャル接続',
    aiConfiguration: 'AI設定',
    geminiApiKey: 'Gemini APIキー',
    apiKeyHelp: 'キーは安全に保存され、リクエストにのみ使用されます。',
    saveChanges: '変更を保存',
    saving: '保存中...',
    livePreview: 'ライブプレビュー',
    yourName: 'あなたの名前',
    bioPreview: 'あなたの自己紹介がここに表示されます...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Client-side only initialization
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['en', 'pt', 'jp'].includes(savedLang)) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
