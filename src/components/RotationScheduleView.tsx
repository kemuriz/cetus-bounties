'use client';

import React from 'react';
import { Calendar, Clock, Sun, Moon, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { RotationScheduleItem } from '@/lib/warframeApi';

interface RotationScheduleViewProps {
  schedule: RotationScheduleItem[];
}

export const RotationScheduleView: React.FC<RotationScheduleViewProps> = ({ schedule }) => {
  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Description Banner */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--gold-light)]" />
            Horario de Próximos Contratos y Rotaciones
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Planifica tus partidas: Los contratos de Cetus rotan secuencialmente A ➔ B ➔ C cada 2 horas y 30 minutos.
          </p>
        </div>
      </div>

      {/* Schedule Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((item, idx) => {
          const startTimeStr = item.startTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const endTimeStr = item.endTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          const isToday = item.startTime.toDateString() === new Date().toDateString();
          const dayLabel = isToday
            ? 'Hoy'
            : item.startTime.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });

          const nightStartTimeStr = item.nightStartTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={idx}
              className={`glass-panel p-5 flex flex-col justify-between gap-3 relative overflow-hidden transition-all ${
                item.isCurrent
                  ? 'border-[var(--gold-primary)] bg-slate-900/90 shadow-lg shadow-amber-500/15'
                  : 'hover:border-slate-700'
              }`}
            >
              {item.isCurrent && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-bl-lg">
                  🟢 ACTIVO AHORA
                </div>
              )}

              {/* Card Header: Day & Rotation */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {dayLabel}
                </span>

                <span className={`badge badge-rot-${item.rotation.toLowerCase()} text-xs font-black`}>
                  ROTACIÓN {item.rotation}
                </span>
              </div>

              {/* Main Time Range */}
              <div className="flex items-center gap-2 my-1">
                <Clock className="w-4 h-4 text-[var(--gold-light)]" />
                <span className="text-xl font-bold text-white font-mono">
                  {startTimeStr} - {endTimeStr}
                </span>
              </div>

              {/* Day & Night Breakdown */}
              <div className="pt-2 border-t border-slate-800 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" />
                    <span>Día (100 min):</span>
                  </span>
                  <span>{startTimeStr} hs</span>
                </div>
                <div className="flex items-center justify-between text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Noche (50 min):</span>
                  </span>
                  <span>{nightStartTimeStr} hs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
