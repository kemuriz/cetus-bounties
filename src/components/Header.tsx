'use client';

import React from 'react';
import { RotationType } from '@/lib/warframeApi';
import { useSettings } from '@/context/SettingsContext';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeRotation: RotationType;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  lastUpdated?: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeRotation,
}) => {
  const { theme, setTheme, t } = useSettings();

  return (
    <header className="w-full border-b border-[var(--border-color)] bg-[var(--bg-header)] px-4 py-3.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <img
            src="https://wiki.warframe.com/w/Special:FilePath/OstronSigil.png"
            alt="Ostron Emblem"
            className="w-7 h-7 object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <h1 className="text-lg sm:text-xl font-extrabold text-[var(--text-main)] tracking-wide">
            {t.title}
          </h1>
          <span className="text-xs sm:text-sm font-mono font-bold text-[var(--text-main)] bg-[var(--bg-subcard)] px-2.5 py-1 border border-[var(--border-color)]">
            {t.rotation} {activeRotation}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--border-hover)] transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[var(--text-main)]" />
                <span className="hidden sm:inline">{t.themeLight}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[var(--text-main)]" />
                <span className="hidden sm:inline">{t.themeDark}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
