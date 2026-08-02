'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CetusCycle,
  OstronSyndicateData,
  RotationType,
  fetchCetusCycle,
  fetchOstronBounties,
  getRotationFromUniqueName,
} from '@/lib/warframeApi';

import { Header } from '@/components/Header';
import { CycleTimerCard } from '@/components/CycleTimerCard';
import { CetusBountiesView } from '@/components/CetusBountiesView';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';

function MainApp() {
  const { theme, t } = useSettings();
  const [cycle, setCycle] = useState<CetusCycle | null>(null);
  const [bountiesData, setBountiesData] = useState<OstronSyndicateData | null>(null);
  const [activeRotation, setActiveRotation] = useState<RotationType>('A');

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    setError(null);

    try {
      const [cycleData, ostronData] = await Promise.all([
        fetchCetusCycle(),
        fetchOstronBounties(),
      ]);

      setCycle(cycleData);
      setBountiesData(ostronData);

      const firstJob = ostronData.jobs?.[0];
      const currentRot = getRotationFromUniqueName(firstJob?.uniqueName);
      setActiveRotation(currentRot);

      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('Error fetching Warframe data:', err);
      const errMsg = err instanceof Error ? err.message : 'Error de conexión con API';
      setError(errMsg);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleTimerExpired = useCallback(() => {
    loadData();
  }, [loadData]);

  return (
    <div className={`min-h-screen flex flex-col relative text-[var(--text-main)] transition-colors ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
      {/* Blurred Background Wallpaper Layer */}
      <div className="bg-wallpaper-container">
        <div className="bg-wallpaper-image" />
        <div className="bg-wallpaper-overlay" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          onRefresh={() => loadData()}
          isRefreshing={isRefreshing}
          activeRotation={activeRotation}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          lastUpdated={lastUpdated}
        />

        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-4 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs sm:text-sm flex items-center justify-between backdrop-blur-md">
              <span>{error}</span>
              <button
                onClick={() => loadData()}
                className="px-3 py-1 bg-red-900 text-white font-bold hover:bg-red-800 transition-colors"
              >
                {t.retry}
              </button>
            </div>
          )}

          <CycleTimerCard
            cycle={cycle}
            bountyExpiry={bountiesData?.expiry}
            activeRotation={activeRotation}
            onTimerExpired={handleTimerExpired}
          />

          <CetusBountiesView
            jobs={bountiesData?.jobs || []}
            activeRotation={activeRotation}
          />
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  );
}
