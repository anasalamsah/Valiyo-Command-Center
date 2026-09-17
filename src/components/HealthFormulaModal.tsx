import React from 'react';
import { X, ShieldCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { HealthScoreBreakdown } from '../types.js';

interface HealthFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthScoreBreakdown;
}

export const HealthFormulaModal: React.FC<HealthFormulaModalProps> = ({
  isOpen,
  onClose,
  health
}) => {
  if (!isOpen) return null;

  const components = Object.entries(health.components) as [
    string,
    { weight: number; score: number; label: string; explanation: string }
  ][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                FORMULA TRANSPARANSI SKOR KESEHATAN
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Skor Komposit 0-100 dihitung secara deterministik dari 7 pilar kinerja
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Composite Score */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              TOTAL COMPOSITE HEALTH SCORE
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-3xl font-mono font-extrabold text-white">
                {health.score}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
              health.status === 'ON TRACK'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : health.status === 'AT RISK'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {health.status}
          </span>
        </div>

        {/* Breakdown of 7 Pillars */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-300 block">
            RINCIAN 7 KOMPONEN & BOBOT MATEMATIS
          </span>

          <div className="space-y-2">
            {components.map(([key, item]) => {
              const contribution = ((item.score * item.weight) / 100).toFixed(1);
              return (
                <div
                  key={key}
                  className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-slate-200">
                      {item.label} (Bobot: {item.weight}%)
                    </span>
                    <div className="space-x-2">
                      <span className="text-slate-400">Skor Sub: {item.score}/100</span>
                      <span className="font-bold text-emerald-400">
                        +{contribution} poin
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.score}%` }}
                      className={`h-full ${
                        item.score >= 80
                          ? 'bg-emerald-400'
                          : item.score >= 65
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                    {item.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-[11px] font-mono text-slate-300 leading-relaxed">
          <strong>Kriteria Evaluasi:</strong> &ge;80 = ON TRACK (Ekosistem sehat dan laju tercapai) • 65 - 79 = AT RISK (Perlu perhatian dan intervensi) • &lt;65 = OFF TRACK (Defisit kritis yang mengancam kelangsungan).
        </div>
      </div>
    </div>
  );
};
