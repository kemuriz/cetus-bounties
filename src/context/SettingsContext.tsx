'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';
export type Theme = 'dark' | 'light';

export const translations = {
  es: {
    title: 'Contratos de Cetus',
    rotation: 'Rotación',
    refresh: 'Actualizar',
    refreshing: 'Actualizando...',
    cetusStatus: 'Estado de Cetus:',
    day: 'Día',
    night: 'Noche',
    resetIn: 'Reinicio de Contratos:',
    konzuTitle: 'Contratos Activos Cetus (Konzu)',
    showRewards: 'Mostrar Recompensas',
    hideRewards: 'Ocultar Recompensas',
    konzuBounties: 'Contratos de Konzu',
    tentABounties: 'Tent A Bounties (Tienda A)',
    tentBBounties: 'Tent B Bounties (Tienda B)',
    tentCBounties: 'Tent C Bounties (Tienda C)',
    rewards: 'Recompensas',
    noRewards: 'Sin datos de recompensas.',
    optimalBadge: 'The Best',
    optimalTooltip: 'Contrato verde (The Best)',
    standardTooltip: 'Contrato rojo (Estándar)',
    level: 'Nv',
    langEs: 'Español',
    langEn: 'English',
    themeDark: 'Modo Oscuro',
    themeLight: 'Modo Claro',
    retry: 'Reintentar',
  },
  en: {
    title: 'Cetus Bounties',
    rotation: 'Rotation',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    cetusStatus: 'Cetus Status:',
    day: 'Day',
    night: 'Night',
    resetIn: 'Bounty Reset:',
    konzuTitle: 'Active Cetus Bounties (Konzu)',
    showRewards: 'Show Rewards',
    hideRewards: 'Hide Rewards',
    konzuBounties: 'Konzu Bounties',
    tentABounties: 'Tent A Bounties',
    tentBBounties: 'Tent B Bounties',
    tentCBounties: 'Tent C Bounties',
    rewards: 'Rewards',
    noRewards: 'No reward data available.',
    optimalBadge: 'The Best',
    optimalTooltip: 'Green Bounty (The Best)',
    standardTooltip: 'Red Bounty (Standard)',
    level: 'Lvl',
    langEs: 'Español',
    langEn: 'English',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    retry: 'Retry',
  },
};

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: typeof translations['es'];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const savedLang = localStorage.getItem('cetus_lang') as Language;
    if (savedLang === 'es' || savedLang === 'en') {
      setLanguageState(savedLang);
    }
    const savedTheme = localStorage.getItem('cetus_theme') as Theme;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cetus_lang', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('cetus_theme', newTheme);
  };

  const t = translations[language];

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
