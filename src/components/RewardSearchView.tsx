'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Target, Layers, MapPin, CheckCircle } from 'lucide-react';
import { BountyJob, RotationDrop, getTierCategoryDetails, getWikiIconUrl } from '@/lib/warframeApi';

interface RewardSearchViewProps {
  jobs: BountyJob[];
  dropTables: Record<string, RotationDrop[]>;
}

const POPULAR_ITEMS = [
  'Aya',
  'Gara Chassis Blueprint',
  'Revenant Neuroptics Blueprint',
  'Narmer Isoplast',
  'Eidolon Lens Blueprint',
  'Breath Of The Eidolon',
  'Kuva',
  'Endo',
  'Cetus Wisp',
];

export const RewardSearchView: React.FC<RewardSearchViewProps> = ({
  jobs,
  dropTables,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('Aya');

  // Search through live jobs first
  const liveResults = jobs.filter((job) =>
    job.rewardPoolDrops?.some((drop) =>
      drop.item.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Search through matrix rot tables
  const matrixResults: {
    tierId: string;
    bountyName: string;
    rotation: string;
    tent: string;
    item: string;
    rarity: string;
    chance: number;
  }[] = [];

  const tierMap: Record<string, { name: string; tent: string }> = {
    '5-15': { name: 'Weaken the Grineer Foothold', tent: 'Tent A' },
    '10-30': { name: 'Sabotage Bounty', tent: 'Tent A' },
    '20-40': { name: 'Cull the Enemy', tent: 'Tent B' },
    '30-50': { name: 'Sabotage Supply Lines', tent: 'Tent B' },
    '40-60': { name: 'Reclaim the Stolen Artifact', tent: 'Tent C' },
    '100-100': { name: 'Capture the New Grineer Commander', tent: 'Tent C' },
    '50-70': { name: 'Rise and Fall (Narmer)', tent: 'Tent C' },
  };

  if (searchTerm.trim().length >= 2) {
    const q = searchTerm.toLowerCase();
    Object.keys(dropTables).forEach((key) => {
      const [tierId, rotRaw] = key.split('_Rot');
      const rot = rotRaw || 'A';
      const tierInfo = tierMap[tierId] || { name: `Nivel ${tierId}`, tent: 'Konzu' };

      dropTables[key].forEach((drop) => {
        if (drop.item.toLowerCase().includes(q)) {
          matrixResults.push({
            tierId,
            bountyName: tierInfo.name,
            rotation: rot,
            tent: tierInfo.tent,
            item: drop.item,
            rarity: drop.rarity,
            chance: drop.chance,
          });
        }
      });
    });
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Search Header */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[var(--gold-light)]" />
            Buscador Global de Recompensas de Cetus
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Encuentra en qué contratos de Konzu y en qué rotaciones (Tent A, Tent B, Tent C) aparece la recompensa que buscas.
          </p>
        </div>

        {/* Input Bar */}
        <div className="relative w-full">
          <Search className="w-5 h-5 text-[var(--gold-light)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Escribe un ítem (ej. Aya, Gara, Revenant, Narmer Isoplast, Eidolon Lens)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm rounded-xl bg-slate-950 border border-[var(--border-glow)] text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
          />
        </div>

        {/* Popular Tags */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[var(--text-muted)] font-semibold">Búsquedas populares:</span>
          {POPULAR_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => setSearchTerm(item)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                searchTerm.toLowerCase() === item.toLowerCase()
                  ? 'bg-[var(--gold-primary)] text-slate-950 border-[var(--gold-light)] shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Live Active Matches */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--gold-light)] flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Disponible en los Contratos Activos Ahora Mismo ({liveResults.length})
        </h3>

        {liveResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveResults.map((job) => {
              const category = getTierCategoryDetails(
                job.enemyLevels[0],
                job.enemyLevels[1],
                job.type
              );
              const matchingDrops = job.rewardPoolDrops?.filter((drop) =>
                drop.item.toLowerCase().includes(searchTerm.toLowerCase())
              );

              return (
                <div
                  key={job.id}
                  className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-emerald-500 bg-slate-900/90"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-slate-950"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-bold text-slate-300 border border-slate-800">
                        {category.tent}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white mt-1">{job.type}</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Enemigos Nvl {job.enemyLevels[0]} - {job.enemyLevels[1]}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Coincidencia en este contrato:
                    </span>
                    {matchingDrops?.map((drop, idx) => {
                      const iconUrl = getWikiIconUrl(drop.item);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded bg-slate-950 border border-slate-800 gap-2"
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
                            <span className={`rarity-${drop.rarity} font-bold truncate`}>{drop.item}</span>
                          </div>
                          <span className="text-[11px] font-mono text-[var(--gold-light)] font-bold">
                            {drop.chance}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-6 text-center text-[var(--text-muted)] text-xs">
            No se encontró &quot;{searchTerm}&quot; en los contratos activos en este momento exacto.
            Revisa las tablas generales de rotaciones abajo.
          </div>
        )}
      </div>

      {/* Rotation Matrix Matches */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Apariciones en Tablas de Rotaciones Generales ({matrixResults.length})
        </h3>

        {matrixResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {matrixResults.map((res, idx) => {
              const iconUrl = getWikiIconUrl(res.item);
              return (
                <div
                  key={idx}
                  className="glass-panel p-3.5 flex flex-col justify-between gap-2 hover:border-amber-500/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[var(--gold-light)]">{res.tent}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-950/80 text-purple-300 border border-purple-800/40">
                        Rotación {res.rotation}
                      </span>
                    </div>
                    <h5 className="text-xs font-extrabold text-white">{res.bountyName}</h5>
                    <p className="text-[11px] text-[var(--text-muted)]">Tier {res.tierId}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950 border border-slate-800 mt-1 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 max-w-[70%]">
                      {iconUrl && (
                        <img
                          src={iconUrl}
                          alt={res.item}
                          className="w-3.5 h-3.5 object-contain flex-shrink-0"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <span className={`rarity-${res.rarity} font-bold text-xs truncate`}>
                        {res.item}
                      </span>
                    </div>
                    <span className="font-mono text-[var(--gold-light)] font-bold text-[11px]">
                      {res.chance}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-6 text-center text-[var(--text-muted)] text-xs">
            Sin resultados adicionales en las tablas de rotaciones.
          </div>
        )}
      </div>
    </div>
  );
};
