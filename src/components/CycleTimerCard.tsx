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
  const [bountyTimeLeftSec, setBountyTimeLeftSec] = useState<number>(0);
  const [cycleTimeLeftSec, setCycleTimeLeftSec] = useState<number>(0);

  // 1. Bounty Reset Timer
  useEffect(() => {
    if (!bountyExpiry) return;

    const updateBountyTimer = () => {
      const expiryTime = new Date(bountyExpiry).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      if (diff === 0) {
        onTimerExpired();
      }
      setBountyTimeLeftSec(diff);
    };

    updateBountyTimer();
    const timer = setInterval(updateBountyTimer, 1000);
    return () => clearInterval(timer);
  }, [bountyExpiry, onTimerExpired]);

  // 2. Cetus Day / Night Cycle Timer
  useEffect(() => {
    if (!cycle?.expiry) return;

    const updateCycleTimer = () => {
      const expiryTime = new Date(cycle.expiry).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      if (diff === 0) {
        onTimerExpired();
      }
      setCycleTimeLeftSec(diff);
    };

    updateCycleTimer();
    const timer = setInterval(updateCycleTimer, 1000);
    return () => clearInterval(timer);
  }, [cycle?.expiry, onTimerExpired]);

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

  const isDay = cycle?.isDay ?? true;

  return (
    <div className="clean-panel p-3.5 sm:p-4 flex flex-wrap items-center justify-between text-sm gap-3">
      {/* Cetus Day/Night Status & Phase Timer */}
      <div className="flex items-center gap-2.5 flex-wrap text-[var(--text-main)]">
        {isDay ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-400" />
        )}
        <span className="font-bold text-sm sm:text-base">{t.cetusStatus}</span>
        <span
          className={`text-xs sm:text-sm font-extrabold px-3 py-1 border border-[var(--border-color)] ${
            isDay
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
          }`}
        >
          {isDay ? t.day : t.night}
        </span>

        {/* Dynamic Day/Night Phase Timer */}
        {cycle?.expiry && (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {isDay ? (t.nightIn || 'Night in:') : (t.dayIn || 'Day in:')}
            </span>
            <span className="font-mono text-xs sm:text-sm font-extrabold bg-[var(--bg-subcard)] px-2.5 py-1 border border-[var(--border-color)]">
              {formatTime(cycleTimeLeftSec)}
            </span>
          </div>
        )}
      </div>

      {/* Bounty Expiry Timer */}
      <div className="flex items-center gap-2.5 text-[var(--text-main)]">
        <Clock className="w-5 h-5 text-emerald-400" />
        <span className="font-bold text-sm sm:text-base">{t.resetIn}</span>
        <span className="font-mono text-emerald-400 text-sm sm:text-base font-extrabold bg-[var(--bg-subcard)] px-3 py-1 border border-[var(--border-color)] shadow-sm">
          {formatTime(bountyTimeLeftSec)}
        </span>
      </div>
    </div>
  );
};
