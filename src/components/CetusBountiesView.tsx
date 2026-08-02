'use client';

import React, { useState } from 'react';
import {
  BountyJob,
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
  activeRotation: RotationType;
}

interface BountyItem {
  id: string;
  rawLabel: string;
  levels: string;
  isGreen: boolean;
  rewardPoolDrops: BountyJob['rewardPoolDrops'];
}

export const CetusBountiesView: React.FC<CetusBountiesViewProps> = ({
  jobs,
  activeRotation,
}) => {
  const { language, t } = useSettings();
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
      jobs.forEach((j, idx) => (newMap[`konzu_${j.id || 'job'}_${idx}`] = true));
      ['ta_1', 'ta_2', 'ta_3', 'tb_1', 'tb_2', 'tb_3', 'tc_1', 'tc_2', 'tc_3'].forEach(
        (id) => (newMap[id] = true)
      );
    }
    setExpandedRewards(newMap);
  };

  // Build Konzu List
  const konzuList: BountyItem[] = jobs.map((job, idx) => {
    const cat = getTierCategoryDetails(job.enemyLevels[0], job.enemyLevels[1], job.type, idx);
    const isGreen = isGreenBounty(job.type);
    return {
      id: `konzu_${job.id || 'job'}_${idx}`,
      rawLabel: job.type,
      levels: `${t.level} ${job.enemyLevels[0]}-${job.enemyLevels[1]}`,
      isGreen,
      rewardPoolDrops: job.rewardPoolDrops || [],
    };
  });

  // Tent Lists with levels
  const tentAList: BountyItem[] = [
    {
      id: 'ta_1',
      rawLabel: 'Capture The Grineer Agent',
      levels: `${t.level} 10-30`,
      isGreen: isGreenBounty('Capture The Grineer Agent'),
      rewardPoolDrops: jobs[1]?.rewardPoolDrops || [],
    },
    {
      id: 'ta_2',
      rawLabel: 'Sabotage Grineer Supply Lines',
      levels: `${t.level} 10-30`,
      isGreen: isGreenBounty('Sabotage Grineer Supply Lines'),
      rewardPoolDrops: jobs[2]?.rewardPoolDrops || [],
    },
    {
      id: 'ta_3',
      rawLabel: 'Prototype Sabotage',
      levels: `${t.level} 5-15`,
      isGreen: isGreenBounty('Prototype Sabotage'),
      rewardPoolDrops: jobs[0]?.rewardPoolDrops || [],
    },
  ];

  const tentBList: BountyItem[] = [
    {
      id: 'tb_1',
      rawLabel: 'Find The Hidden Artifact',
      levels: `${t.level} 20-40`,
      isGreen: isGreenBounty('Find The Hidden Artifact'),
      rewardPoolDrops: jobs[4]?.rewardPoolDrops || [],
    },
    {
      id: 'tb_2',
      rawLabel: 'Search And Rescue',
      levels: `${t.level} 30-50`,
      isGreen: isGreenBounty('Search And Rescue'),
      rewardPoolDrops: jobs[3]?.rewardPoolDrops || [],
    },
    {
      id: 'tb_3',
      rawLabel: 'Capture The Grineer Commander',
      levels: `${t.level} 30-50`,
      isGreen: isGreenBounty('Capture The Grineer Commander'),
      rewardPoolDrops: jobs[5]?.rewardPoolDrops || [],
    },
  ];

  const tentCList: BountyItem[] = [
    {
      id: 'tc_1',
      rawLabel: 'Find The Hidden Artifact',
      levels: `${t.level} 40-60`,
      isGreen: isGreenBounty('Find The Hidden Artifact'),
      rewardPoolDrops: jobs[4]?.rewardPoolDrops || [],
    },
    {
      id: 'tc_2',
      rawLabel: 'Search And Rescue',
      levels: `${t.level} 40-60`,
      isGreen: isGreenBounty('Search And Rescue'),
      rewardPoolDrops: jobs[3]?.rewardPoolDrops || [],
    },
    {
      id: 'tc_3',
      rawLabel: 'Cull The Enemy',
      levels: `${t.level} 40-60`,
      isGreen: isGreenBounty('Cull The Enemy'),
      rewardPoolDrops: jobs[2]?.rewardPoolDrops || [],
    },
  ];

  const renderItemRow = (item: BountyItem, prefixLabel?: string) => {
    const isExpanded = expandedRewards[item.id] || showAllGlobal;
    const translatedName = translateBountyName(item.rawLabel, language);
    const displayTitle = prefixLabel ? `${prefixLabel} ${translatedName}` : translatedName;

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

            {/* Only Aya Icon, no text */}
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
                  const translatedDropItem = translateItemName(drop.item, language);
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
            {konzuList.map((item, idx) => {
              const cat = getTierCategoryDetails(jobs[idx]?.enemyLevels[0] || 0, jobs[idx]?.enemyLevels[1] || 0, item.rawLabel, idx);
              return renderItemRow(item, cat.prefix);
            })}
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
