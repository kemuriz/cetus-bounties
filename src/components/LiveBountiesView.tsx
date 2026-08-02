'use client';

import React, { useState } from 'react';
import { Shield, Award, Layers, Target, Search, CheckCircle2, Star, Sparkles, MapPin } from 'lucide-react';
import { BountyJob, RotationType, getTierCategoryDetails, getWikiIconUrl, isGreenBounty } from '@/lib/warframeApi';

interface LiveBountiesViewProps {
  jobs: BountyJob[];
  activeRotation: RotationType;
}

export const LiveBountiesView: React.FC<LiveBountiesViewProps> = ({
  jobs,
  activeRotation,
}) => {
  const [activeTentFilter, setActiveTentFilter] = useState<'all' | 'Tent A' | 'Tent B' | 'Tent C' | 'konzu'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredJobs = jobs.filter((job) => {
    const category = getTierCategoryDetails(job.enemyLevels[0], job.enemyLevels[1], job.type);

    if (activeTentFilter !== 'all') {
      if (activeTentFilter === 'konzu') {
        // Show all
      } else if (category.tent !== activeTentFilter) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchType = job.type.toLowerCase().includes(q);
      const matchReward = job.rewardPoolDrops?.some((drop) =>
        drop.item.toLowerCase().includes(q)
      );
      return matchType || matchReward;
    }

    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Tent Selector Bar */}
      <div className="glass-panel p-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--gold-light)]" />
              Contratos por Ubicación (Konzu & Tiendas en las Llanuras)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Filtra los contratos asignados a Konzu en Cetus o a las radio-consolas de las tiendas A, B y C en el mapa abierto.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar contrato o recompensa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--gold-primary)] placeholder:text-[var(--text-dim)]"
            />
          </div>
        </div>

        {/* Tent Buttons Group */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTentFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              activeTentFilter === 'all'
                ? 'bg-[var(--gold-primary)] text-slate-950 border-[var(--gold-light)] shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-[var(--text-muted)] border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            Todos los Contratos de Konzu ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTentFilter('Tent A')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-2 ${
              activeTentFilter === 'Tent A'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 text-emerald-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>Tent A Bounties</span>
            <span className="text-[10px] opacity-80">(Nivel 5-30)</span>
          </button>

          <button
            onClick={() => setActiveTentFilter('Tent B')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-2 ${
              activeTentFilter === 'Tent B'
                ? 'bg-blue-500 text-white border-blue-300 shadow-md shadow-blue-500/20'
                : 'bg-slate-900/80 text-blue-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>Tent B Bounties</span>
            <span className="text-[10px] opacity-80">(Nivel 20-50)</span>
          </button>

          <button
            onClick={() => setActiveTentFilter('Tent C')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-2 ${
              activeTentFilter === 'Tent C'
                ? 'bg-purple-500 text-white border-purple-300 shadow-md shadow-purple-500/20'
                : 'bg-slate-900/80 text-purple-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>Tent C Bounties</span>
            <span className="text-[10px] opacity-80">(Nivel 40-100 / Narmer)</span>
          </button>
        </div>
      </div>

      {/* Bounties Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job, idx) => {
          const category = getTierCategoryDetails(
            job.enemyLevels[0],
            job.enemyLevels[1],
            job.type
          );

          const totalStanding = job.standingStages.reduce((a, b) => a + b, 0);

          return (
            <div
              key={job.id || idx}
              className="glass-panel p-5 flex flex-col justify-between gap-4 hover:border-[var(--gold-primary)]/60 group transition-all"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-bold text-slate-300 border border-slate-800">
                      {category.tent}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--gold-light)] font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{totalStanding.toLocaleString()} Rep</span>
                  </div>
                </div>

                {/* Bounty Mission Title */}
                <div className="flex items-center gap-2 mt-1">
                  {isGreenBounty(job.type) || isGreenBounty(category.name) ? (
                    <span className="dot-green" title="Contrato recomendado (Verde)" />
                  ) : (
                    <span className="dot-red" title="Contrato estándar (Rojo)" />
                  )}
                  <h3 className="text-lg font-black text-white group-hover:text-[var(--gold-light)] transition-colors">
                    {job.type}
                  </h3>
                </div>

                {/* Stats Sub-row */}
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-red-400" />
                    <span>Enemigos: Nvl {job.enemyLevels[0]} - {job.enemyLevels[1]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{job.standingStages.length} Etapas</span>
                  </div>
                  {job.minMR > 0 && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5" />
                      <span>RM {job.minMR}+</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rewards List */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--gold-light)]" />
                    Recompensas Activas (Rotación {activeRotation}):
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    En Vivo
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {job.rewardPoolDrops?.map((drop, dIdx) => {
                    const iconUrl = getWikiIconUrl(drop.item);
                    return (
                      <div
                        key={dIdx}
                        className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/70 border border-slate-800/80 hover:bg-slate-900 transition-colors gap-2"
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
                          <span className={`rarity-${drop.rarity} truncate`}>
                            {drop.item} {drop.count && drop.count > 1 ? `x${drop.count}` : ''}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--gold-light)] font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {drop.chance}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="glass-panel p-10 text-center text-[var(--text-muted)]">
          No se encontraron contratos para el filtro seleccionado.
        </div>
      )}
    </div>
  );
};
