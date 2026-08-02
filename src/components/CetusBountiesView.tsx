'use client';

import React, { useState } from 'react';
import {
  BountyJob,
  LocationBountiesData,
  RotationType,
  isGreenBounty,
  getTierCategoryDetails,
  getWikiIconUrl,
  translateBountyName,
  translateItemName,
} from '@/lib/warframeApi';
import { useSettings } from '@/context/SettingsContext';

interface CetusBountiesViewProps {
  jobs: BountyJob[];
  locationData?: LocationBountiesData | null;
  activeRotation: RotationType;
}

interface BountyItem {
  id: string;
  rawLabel: string;
  prefix?: string;
  levels: string;
  isGreen: boolean;
  rewardPoolDrops: BountyJob['rewardPoolDrops'];
}

export const CetusBountiesView: React.FC<CetusBountiesViewProps> = ({
  jobs = [],
  locationData,
  activeRotation,
}) => {
  const { t } = useSettings();
  const [expandedRewards, setExpandedRewards] = useState<Record<string, boolean>>({});
  const [showAllGlobal, setShowAllGlobal] = useState<boolean>(false);

  const toggleRewards = (id: string) => {
    setExpandedRewards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllGlobal = () => {
    const nextVal = !showAllGlobal;
    setShowAllGlobal(nextVal);
    const newMap: Record<string, boolean> = {};
    if (nextVal) {
      (jobs || []).forEach((j, idx) => (newMap[`konzu_${j?.id || 'job'}_${idx}`] = true));
      ['ta_0', 'ta_1', 'ta_2', 'tb_0', 'tb_1', 'tb_2', 'tc_0', 'tc_1', 'tc_2'].forEach(
        (id) => (newMap[id] = true)
      );
    }
    setExpandedRewards(newMap);
  };

  // Safe helper to construct a BountyItem from a live job
  const getSafeJobItem = (job: BountyJob, idx: number, keyPrefix = 'bounty'): BountyItem | null => {
    if (!job || !Array.isArray(job.enemyLevels) || job.enemyLevels.length < 2) {
      return null;
    }
    const minLvl = job.enemyLevels[0];
    const maxLvl = job.enemyLevels[1];
    const cat = getTierCategoryDetails(minLvl, maxLvl, job.type || '', idx);
    const isGreen = isGreenBounty(job.type || '');
    return {
      id: `${keyPrefix}_${job.id || 'job'}_${idx}`,
      rawLabel: job.type || '',
      prefix: cat.prefix,
      levels: `${t.level} ${minLvl}-${maxLvl}`,
      isGreen,
      rewardPoolDrops: job.rewardPoolDrops || [],
    };
  };

  // 1. Konzu List: All live jobs from warframestat.us (T1 through Steel Path & Narmer)
  const konzuList: BountyItem[] = (jobs || [])
    .map((job, idx) => getSafeJobItem(job, idx, 'konzu'))
    .filter((item): item is BountyItem => item !== null);

  // Filter out Narmer jobs for standard field tent consoles
  const standardJobs = (jobs || []).filter(
    (job) => !(job?.type || '').toLowerCase().includes('narmer')
  );

  // Hybrid Determination: Match Oracle Lotus Keys to warframestat.us Live Jobs
  const resolveTentItemFromLotusPath = (
    lotusPath: string,
    fallbackIdx: number,
    tentKeyPrefix: string
  ): BountyItem => {
    const key = lotusPath.split('/').pop() || lotusPath;
    const cleanKeyNoNumbers = key.replace(/\d+$/, '');

    // Step 1: Direct ID Prefix Match with warframestat.us job.id
    let matchedJob = standardJobs.find(
      (j) => j.id.startsWith(cleanKeyNoNumbers) || cleanKeyNoNumbers.startsWith(j.id.replace(/\d+$/, ''))
    );

    // Step 2: Keyword Match with warframestat.us job.type
    if (!matchedJob) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('sabotage')) {
        matchedJob = standardJobs.find((j) => (j.type || '').toLowerCase().includes('sabotage'));
      } else if (lowerKey.includes('rescue')) {
        matchedJob = standardJobs.find((j) => (j.type || '').toLowerCase().includes('rescue'));
      } else if (lowerKey.includes('assassinate')) {
        matchedJob = standardJobs.find(
          (j) => (j.type || '').toLowerCase().includes('assassinate') || (j.type || '').toLowerCase().includes('leader')
        );
      } else if (lowerKey.includes('capture') || lowerKey.includes('reclamation') || lowerKey.includes('attrition')) {
        matchedJob = standardJobs.find(
          (j) => (j.type || '').toLowerCase().includes('capture') || (j.type || '').toLowerCase().includes('agent') || (j.type || '').toLowerCase().includes('leader')
        );
      }
    }

    // Step 3: Tier Position Fallback
    if (!matchedJob) {
      matchedJob = standardJobs[fallbackIdx % standardJobs.length] || standardJobs[0] || jobs[0];
    }

    const item = getSafeJobItem(matchedJob, fallbackIdx, `${tentKeyPrefix}_${key}`);
    if (item) return item;

    return {
      id: `${tentKeyPrefix}_${fallbackIdx}`,
      rawLabel: matchedJob?.type || 'Cetus Bounty',
      prefix: `T${fallbackIdx + 1}`,
      levels: `${t.level} 10-30`,
      isGreen: isGreenBounty(matchedJob?.type || ''),
      rewardPoolDrops: matchedJob?.rewardPoolDrops || [],
    };
  };

  const mapTentList = (
    paths: string[] | undefined,
    tentKeyPrefix: string,
    defaultIndices: number[]
  ): BountyItem[] => {
    if (paths && Array.isArray(paths) && paths.length > 0) {
      return paths.map((path, idx) =>
        resolveTentItemFromLotusPath(path, defaultIndices[idx] ?? idx, tentKeyPrefix)
      );
    }

    // Default Fallback indices if locationData is absent
    return defaultIndices.map((jobIdx, slotIdx) => {
      const job = standardJobs[jobIdx] || standardJobs[0] || jobs[0];
      const item = getSafeJobItem(job, jobIdx, tentKeyPrefix);
      if (item) return item;

      return {
        id: `${tentKeyPrefix}_${slotIdx}`,
        rawLabel: job?.type || 'Cetus Bounty',
        prefix: `T${jobIdx + 1}`,
        levels: `${t.level} 10-30`,
        isGreen: isGreenBounty(job?.type || ''),
        rewardPoolDrops: job?.rewardPoolDrops || [],
      };
    });
  };

  // Tent A (Low Level Outpost): T1 (idx 0), T2 (idx 1), T3 (idx 2)
  const tentAList = mapTentList(locationData?.CetusSyndicate?.TentA, 'ta', [0, 1, 2]);

  // Tent B (Mid Level Outpost): T2 (idx 1), T3 (idx 2), T4 (idx 3)
  const tentBList = mapTentList(locationData?.CetusSyndicate?.TentB, 'tb', [1, 2, 3]);

  // Tent C (High Level Outpost): T3 (idx 2), T4 (idx 3), T5 (idx 4)
  const tentCList = mapTentList(locationData?.CetusSyndicate?.TentC, 'tc', [2, 3, 4]);

  const renderItemRow = (item: BountyItem) => {
    const isExpanded = expandedRewards[item.id] || showAllGlobal;
    const translatedName = translateBountyName(item.rawLabel);
    const displayTitle = item.prefix ? `${item.prefix} ${translatedName}` : translatedName;

    return (
      <div
        key={item.id}
        onClick={() => toggleRewards(item.id)}
        className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] cursor-pointer transition-colors flex flex-col gap-2 text-xs sm:text-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            {/* Minimalist 2-Color Indicator Dot */}
            {item.isGreen ? (
              <span className="dot-green" />
            ) : (
              <span className="dot-red" />
            )}

            <span className="font-bold text-[var(--text-main)] truncate text-xs sm:text-sm">
              {displayTitle}
            </span>

            {/* Level Badge */}
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-subcard)] px-1.5 py-0.5 border border-[var(--border-color)]">
              {item.levels}
            </span>

            {/* Only Aya Icon */}
            {item.isGreen && (
              <img
                src="https://wiki.warframe.com/w/Special:FilePath/Aya.png"
                alt="Aya"
                className="w-4 h-4 object-contain ml-0.5"
                title="Aya"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>
        </div>

        {/* Collapsible Rewards */}
        {isExpanded && (
          <div className="pt-2 border-t border-[var(--border-color)] text-xs">
            <div className="text-xs text-[var(--text-muted)] mb-1.5 font-bold flex items-center gap-1">
              {t.rewards} ({t.rotation} {activeRotation}):
            </div>
            {item.rewardPoolDrops && item.rewardPoolDrops.length > 0 ? (
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {item.rewardPoolDrops.map((drop, idx) => {
                  const iconUrl = getWikiIconUrl(drop.item);
                  const translatedDropItem = translateItemName(drop.item);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2 py-1 bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 max-w-[75%]">
                        {iconUrl && (
                          <img
                            src={iconUrl}
                            alt={drop.item}
                            className="w-4 h-4 object-contain flex-shrink-0"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        <span className="text-[var(--text-main)] truncate font-medium">
                          {translatedDropItem} {drop.count && drop.count > 1 ? `x${drop.count}` : ''}
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">
                        {drop.chance}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-[var(--text-muted)] italic">
                {t.noRewards}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Header & Global Toggle */}
      <div className="clean-panel p-3.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <img
            src="https://wiki.warframe.com/w/Special:FilePath/Konzu.png"
            alt="Konzu"
            className="w-6 h-6 object-contain border border-[var(--border-color)] bg-[var(--bg-subcard)]"
            onError={(e) => {
              e.currentTarget.src = 'https://wiki.warframe.com/w/Special:FilePath/OstronSigil.png';
            }}
          />
          <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-main)] uppercase tracking-wider">
            {t.konzuTitle}
          </h2>
        </div>

        <button
          onClick={toggleAllGlobal}
          className="text-xs sm:text-sm font-bold px-3 py-1.5 bg-[var(--button-bg)] text-[var(--button-text)] border border-[var(--border-color)] hover:bg-[var(--button-hover)] transition-colors shadow-sm"
        >
          {showAllGlobal ? t.hideRewards : t.showRewards}
        </button>
      </div>

      {/* Horizontal 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {/* Column 1: Konzu Bounties */}
        <div className="clean-panel p-3.5 flex flex-col gap-2.5">
          <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
            {t.konzuBounties}
          </h3>
          <div className="flex flex-col gap-2">
            {konzuList.map((item) => renderItemRow(item))}
          </div>
        </div>

        {/* Column 2: Tent A Bounties */}
        <div className="clean-panel p-3.5 flex flex-col gap-2.5">
          <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
            {t.tentABounties}:
          </h3>
          <div className="flex flex-col gap-2">
            {tentAList.map((item) => renderItemRow(item))}
          </div>
        </div>

        {/* Column 3: Tent B Bounties */}
        <div className="clean-panel p-3.5 flex flex-col gap-2.5">
          <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
            {t.tentBBounties}:
          </h3>
          <div className="flex flex-col gap-2">
            {tentBList.map((item) => renderItemRow(item))}
          </div>
        </div>

        {/* Column 4: Tent C Bounties */}
        <div className="clean-panel p-3.5 flex flex-col gap-2.5">
          <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
            {t.tentCBounties}:
          </h3>
          <div className="flex flex-col gap-2">
            {tentCList.map((item) => renderItemRow(item))}
          </div>
        </div>
      </div>
    </div>
  );
};
