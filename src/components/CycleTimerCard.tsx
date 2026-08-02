'use client';

import React, { useState, useEffect } from 'react';
import { CetusCycle, RotationType } from '@/lib/warframeApi';
import { useSettings } from '@/context/SettingsContext';
import { Sun, Moon, Clock } from 'lucide-react';

interface CycleTimerCardProps {
  cycle: CetusCycle | null;
  bountyExpiry?: string | null;
  activeRotation: RotationType;
  onTimerExpired: () => void;
}

export const CycleTimerCard: React.FC<CycleTimerCardProps> = ({
  cycle,
  bountyExpiry,
  onTimerExpired,
}) => {
  const { t } = useSettings();
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const targetExpiry = bountyExpiry || cycle?.expiry;

  useEffect(() => {
    if (!targetExpiry) return;

    const calculateLeft = () => {
      const expiryTime = new Date(targetExpiry).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));

      if (diff === 0) {
        onTimerExpired();
      }

      setTimeLeftSec(diff);
    };

    calculateLeft();
    const timer = setInterval(calculateLeft, 1000);
    return () => clearInterval(timer);
  }, [targetExpiry, onTimerExpired]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = String(secs).padStart(2, '0');

    if (hrs > 0) {
      return `${hrs}h ${paddedMins}m ${paddedSecs}s`;
    }
    return `${paddedMins}m ${paddedSecs}s`;
  };

  return (
    <div className="clean-panel p-3.5 sm:p-4 flex flex-wrap items-center justify-between text-sm gap-3">
      {/* Cetus Day/Night Status */}
      <div className="flex items-center gap-2.5 text-[var(--text-main)]">
        {cycle?.isDay ? (
          <Sun className="w-5 h-5 text-[var(--text-main)]" />
        ) : (
          <Moon className="w-5 h-5 text-[var(--text-main)]" />
        )}
        <span className="font-bold text-sm sm:text-base">{t.cetusStatus}</span>
        <span className="text-sm font-extrabold bg-[var(--bg-subcard)] px-3 py-1 border border-[var(--border-color)]">
          {cycle?.isDay ? t.day : t.night}
        </span>
      </div>

      {/* Bounty Timer Countdown */}
      <div className="flex items-center gap-2.5 text-[var(--text-main)]">
        <Clock className="w-5 h-5 text-emerald-400" />
        <span className="font-bold text-sm sm:text-base">{t.resetIn}</span>
        <span className="font-mono text-emerald-400 text-sm sm:text-base font-extrabold bg-[var(--bg-subcard)] px-3 py-1 border border-[var(--border-color)] shadow-sm">
          {formatTime(timeLeftSec)}
        </span>
      </div>
    </div>
  );
};
