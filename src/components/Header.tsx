import React from 'react';
import {
  Sparkles,
  Bell,
  RefreshCw,
  Info,
  Plus,
  ShieldCheck,
  Database
} from 'lucide-react';
import { HealthScoreBreakdown } from '../types.js';
import { getGreeting } from '../utils/formatters.js';

interface HeaderProps {
  health: HealthScoreBreakdown | null;
  dataTrustScore?: number;
  isDemoMode?: boolean;
  onResetDemo?: () => void;
  onClearDemo?: () => void;
  onOpenQuickAdd?: () => void;
  onOpenAskValiyo: (presetQuestion?: string) => void;
  onOpenHealthModal: () => void;
  onOpenAlerts: () => void;
  onOpenDataQuality?: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  dataTrustScore,
  isDemoMode = true,
  onResetDemo,
  onClearDemo,
  onOpenQuickAdd,
  onOpenAskValiyo,
  onOpenHealthModal,
  onOpenAlerts,
  onOpenDataQuality,
  onRefresh,
  isRefreshing,
  activeAlertsCount
}) => {
  const greeting = getGreeting('Anas');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ON TRACK':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'AT RISK':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'OFF TRACK':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur-md">
      {/* Left: Founder Greeting & Status */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            <span>{greeting}</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-[11px] text-slate-400 font-mono">
            Valiyo Executive Mission Control • Target Tahunan Rp1 Miliar
          </p>
        </div>

        {/* Health Score Pill */}
        {health && (
          <button
            onClick={onOpenHealthModal}
            className={`group hidden sm:flex items-center space-x-2 rounded-full border px-3 py-1 transition-all hover:scale-102 ${getStatusColor(
              health.status
            )}`}
            title="Klik untuk melihat kalkulasi transparansi skor kesehatan Valiyo"
          >
            <div className="flex items-baseline space-x-1">
              <span className="text-[11px] font-mono font-bold tracking-tight">
                {health.overallScore}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">/ 100</span>
            </div>
            <span className="h-3 w-px bg-slate-700/60" />
            <span className="text-[10px] font-semibold tracking-wider uppercase">
              {health.status}
            </span>
            <Info className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        {/* Demo Mode Badge with Toggle */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
          <Database className="h-3 w-3 text-slate-400" />
          <span className="text-slate-400">Mode:</span>
          <span className={`font-mono font-bold ${isDemoMode ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {isDemoMode ? 'DEMO' : 'LIVE'}
          </span>
          {isDemoMode ? (
            <button
              onClick={onClearDemo}
              title="Kosongkan data untuk input riil"
              className="text-[10px] text-slate-400 hover:text-rose-400 underline ml-1"
            >
              Reset Kosong
            </button>
          ) : (
            <button
              onClick={onResetDemo}
              title="Muat kembali data demo Valiyo"
              className="text-[10px] text-slate-400 hover:text-cyan-400 underline ml-1"
            >
              Muat Demo
            </button>
          )}
        </div>
      </div>

      {/* Right Actions: Quick Add, Ask Valiyo, Alerts, Refresh */}
      <div className="flex items-center space-x-2.5">
        {/* Global Quick Add Button */}
        {onOpenQuickAdd && (
          <button
            id="btn-header-quick-add"
            onClick={onOpenQuickAdd}
            className="flex items-center space-x-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-98 shadow-emerald-950/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ ADD</span>
          </button>
        )}

        {/* ASK VALIYO AI Trigger */}
        <button
          onClick={() => onOpenAskValiyo()}
          className="flex items-center space-x-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all active:scale-98 border border-indigo-400/30"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
          <span className="font-semibold tracking-wide">ASK VALIYO</span>
        </button>

        {/* Alerts Button */}
        <button
          onClick={onOpenAlerts}
          className={`relative flex h-8 items-center space-x-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
            activeAlertsCount > 0
              ? 'border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
          title="Lihat Peringatan Sistem"
        >
          <Bell className="h-3.5 w-3.5" />
          {activeAlertsCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors disabled:opacity-50"
          title="Perbarui Data Sistem"
          aria-label="Refresh Data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
