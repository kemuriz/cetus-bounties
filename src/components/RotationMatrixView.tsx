'use client';

import React, { useState } from 'react';
import { Sparkles, Layers, ShieldCheck, Check, Info, Target } from 'lucide-react';
import { RotationType, RotationDrop, getWikiIconUrl, isGreenBounty } from '@/lib/warframeApi';

interface RotationMatrixViewProps {
  dropTables: Record<string, RotationDrop[]>;
  activeRotation: RotationType;
}

const TIERS = [
  {
    id: '5-15',
    bountyName: 'Prototype Sabotage',
    label: 'Tier 1 (Nivel 5 - 15)',
    name: 'Novato',
    color: '#10b981',
    tent: 'Tent A',
  },
  {
    id: '10-30',
    bountyName: 'Capture The Grineer Agent',
    label: 'Tier 2 (Nivel 10 - 30)',
    name: 'Intermedio',
    color: '#06b6d4',
    tent: 'Tent A',
  },
  {
    id: '20-40',
    bountyName: 'Find The Hidden Artifact',
    label: 'Tier 3 (Nivel 20 - 40)',
    name: 'Avanzado',
    color: '#3b82f6',
    tent: 'Tent B',
  },
  {
    id: '30-50',
    bountyName: 'Search And Rescue',
    label: 'Tier 4 (Nivel 30 - 50)',
    name: 'Experto',
    color: '#8b5cf6',
    tent: 'Tent B',
  },
  {
    id: '40-60',
    bountyName: 'Find The Hidden Artifact',
    label: 'Tier 5 (Nivel 40 - 60)',
    name: 'Maestro',
    color: '#ec4899',
    tent: 'Tent C',
  },
  {
    id: '100-100',
    bountyName: 'Capture the New Grineer Commander',
    label: 'Camino de Acero (100 - 100)',
    name: 'Steel Path',
    color: '#f59e0b',
    tent: 'Tent C',
  },
  {
    id: '50-70',
    bountyName: 'Rise and Fall (Narmer)',
    label: 'Narmer (Nivel 50 - 70)',
    name: 'Narmer',
    color: '#ef4444',
    tent: 'Tent C',
  },
];

export const RotationMatrixView: React.FC<RotationMatrixViewProps> = ({
  dropTables,
  activeRotation,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('5-15');
  const [selectedRotTab, setSelectedRotTab] = useState<RotationType | 'ALL'>('ALL');

  const currentTierInfo = TIERS.find((t) => t.id === selectedTier) || TIERS[0];

  const getDropList = (tierId: string, rot: RotationType): RotationDrop[] => {
    const key = `${tierId}_Rot${rot}`;
    return dropTables[key] || [];
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Tier Selector Bar */}
      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--gold-light)]" />
              Selecciona el Contrato de Cetus
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Visualiza las tablas de recompensas exactas para las Rotaciones A, B y C de cada contrato.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40">
            <span>Rotación Activa en Juego:</span>
            <span className="badge badge-rot-b text-xs font-black">ROTACIÓN {activeRotation}</span>
          </div>
        </div>

        {/* Tier Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TIERS.map((tier) => {
            const isSelected = tier.id === selectedTier;
            const isGreen = isGreenBounty(tier.bountyName);
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-[var(--gold-primary)] shadow-lg shadow-amber-500/15'
                    : 'bg-slate-950/70 text-[var(--text-muted)] border-slate-800 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span
                  className={isGreen ? 'dot-green' : 'dot-red'}
                  title={isGreen ? 'Contrato verde (Recomendado)' : 'Contrato rojo (Estándar)'}
                />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">{tier.label}</span>
                  <span className="text-xs font-bold text-white">{tier.bountyName}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Bounty Details Header */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-l-4 border-l-[var(--gold-primary)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-slate-900 text-white border border-slate-700">
              {currentTierInfo.tent}
            </span>
            <span className="text-xs font-semibold text-[var(--gold-light)]">
              {currentTierInfo.label}
            </span>
          </div>
          <h3 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" />
            Contrato: {currentTierInfo.bountyName}
          </h3>
        </div>

        {/* Rotation Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedRotTab('ALL')}
            className={`btn-tab text-xs ${selectedRotTab === 'ALL' ? 'active' : ''}`}
          >
            Ver A, B y C
          </button>
          <button
            onClick={() => setSelectedRotTab('A')}
            className={`btn-tab text-xs ${selectedRotTab === 'A' ? 'active' : ''}`}
          >
            Rotación A {activeRotation === 'A' && '🟢 (En Vivo)'}
          </button>
          <button
            onClick={() => setSelectedRotTab('B')}
            className={`btn-tab text-xs ${selectedRotTab === 'B' ? 'active' : ''}`}
          >
            Rotación B {activeRotation === 'B' && '🟢 (En Vivo)'}
          </button>
          <button
            onClick={() => setSelectedRotTab('C')}
            className={`btn-tab text-xs ${selectedRotTab === 'C' ? 'active' : ''}`}
          >
            Rotación C {activeRotation === 'C' && '🟢 (En Vivo)'}
          </button>
        </div>
      </div>

      {/* Rotations Grid Matrix */}
      <div
        className={`grid gap-6 ${
          selectedRotTab === 'ALL'
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 max-w-2xl mx-auto w-full'
        }`}
      >
        {(['A', 'B', 'C'] as RotationType[]).map((rot) => {
          if (selectedRotTab !== 'ALL' && selectedRotTab !== rot) return null;

          const isLive = activeRotation === rot;
          const drops = getDropList(selectedTier, rot);

          return (
            <div
              key={rot}
              className={`glass-panel p-5 flex flex-col gap-4 relative overflow-hidden transition-all ${
                isLive ? 'border-[var(--gold-light)] bg-slate-900/95 shadow-xl shadow-amber-500/10' : ''
              }`}
            >
              {/* Live Ribbon */}
              {isLive && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-amber-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-md">
                  🟢 ROTACIÓN ACTIVA EN JUEGO
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                    rot === 'A'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : rot === 'B'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  }`}
                >
                  {rot}
                </div>
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    ROTACIÓN {rot}
                    {isLive && <span className="badge badge-active text-[9px]">EN VIVO</span>}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Pool de Recompensas de la Rotación {rot}
                  </p>
                </div>
              </div>

              {/* Drops List */}
              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                {drops.length > 0 ? (
                  drops.map((drop, idx) => {
                    const iconUrl = getWikiIconUrl(drop.item);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2.5 rounded bg-slate-950/80 border border-slate-800/80 hover:bg-slate-900 transition-colors gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0 max-w-[72%]">
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt={drop.item}
                              className="w-4 h-4 object-contain flex-shrink-0"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          )}
                          <span className={`rarity-${drop.rarity} font-semibold truncate`}>
                            {drop.item}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[var(--gold-light)] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {drop.chance}%
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-[var(--text-muted)] text-center py-8">
                    Cargando recompensas exactas para la rotación {rot}...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
