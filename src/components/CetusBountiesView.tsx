'use client';

import React, { useState } from 'react';
import {
  BountyJob,
  LocationBountiesData,
  RotationType,
  isGreenBounty,
  getTierCategoryDetails,
  getWikiIconUrl,
  getBountyNameFromLotusPath,
  groupRewardPoolDropsByStage,
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

  // Map each Tent's 3 slots directly from Oracle Lotus paths + Tier indices
  const mapTentList = (
    paths: string[] | undefined,
    tentKeyPrefix: string,
    tierIndices: number[]
  ): BountyItem[] => {
    return tierIndices.map((jobTierIdx, slotIdx) => {
      const matchedJob = standardJobs[jobTierIdx] || standardJobs[0] || jobs[0];
      const minLvl = matchedJob?.enemyLevels?.[0] ?? (jobTierIdx + 1) * 10;
      const maxLvl = matchedJob?.enemyLevels?.[1] ?? (jobTierIdx + 1) * 10 + 20;

      const lotusPath = paths && Array.isArray(paths) ? paths[slotIdx] : undefined;
      const rawLabel = lotusPath
        ? getBountyNameFromLotusPath(lotusPath, matchedJob?.type)
        : matchedJob?.type || 'Cetus Bounty';

      const isGreen = isGreenBounty(rawLabel);

      return {
        id: `${tentKeyPrefix}_${slotIdx}_${lotusPath ? lotusPath.split('/').pop() : jobTierIdx}`,
        rawLabel,
        prefix: `T${jobTierIdx + 1}`,
        levels: `${t.level} ${minLvl}-${maxLvl}`,
        isGreen,
        rewardPoolDrops: matchedJob?.rewardPoolDrops || [],
      };
    });
  };

  // Tent A (Low Level Outpost): T1 (jobTierIdx 0), T2 (jobTierIdx 1), T3 (jobTierIdx 2)
  const tentAList = mapTentList(locationData?.CetusSyndicate?.TentA, 'ta', [0, 1, 2]);

  // Tent B (Mid Level Outpost): T2 (jobTierIdx 1), T3 (jobTierIdx 2), T4 (jobTierIdx 3)
  const tentBList = mapTentList(locationData?.CetusSyndicate?.TentB, 'tb', [1, 2, 3]);

  // Tent C (High Level Outpost): T3 (jobTierIdx 2), T4 (jobTierIdx 3), T5 (jobTierIdx 4)
  const tentCList = mapTentList(locationData?.CetusSyndicate?.TentC, 'tc', [2, 3, 4]);

  const renderItemRow = (item: BountyItem) => {
    const isExpanded = expandedRewards[item.id] || showAllGlobal;
    const translatedName = translateBountyName(item.rawLabel);
    const displayTitle = item.prefix ? `${item.prefix} ${translatedName}` : translatedName;
    const groupedStages = groupRewardPoolDropsByStage(item.rewardPoolDrops || []);

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
          <div className="pt-2 border-t border-[var(--border-color)] text-xs flex flex-col gap-2">
            <div className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
              {t.rewards} ({t.rotation} {activeRotation}):
            </div>
            {groupedStages.length > 0 ? (
              <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {groupedStages.map((stage, stageIdx) => (
                  <div key={stageIdx} className="flex flex-col gap-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-subcard)] px-2 py-0.5 border border-[var(--border-color)] w-fit">
                      {stage.stageName}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {stage.drops.map((drop, dropIdx) => {
                        const iconUrl = getWikiIconUrl(drop.item);
                        const translatedDropItem = translateItemName(drop.item);
                        return (
                          <div
                            key={dropIdx}
                            className="flex items-center justify-between px-2 py-1 bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs"
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
                  </div>
                ))}
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
