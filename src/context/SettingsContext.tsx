'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en';
export type Theme = 'dark' | 'light';

export const translations = {
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
  t: typeof translations['en'];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('cetus_theme') as Theme;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState('en');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('cetus_theme', newTheme);
  };

  const t = translations['en'];

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
