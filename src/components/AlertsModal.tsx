import React from 'react';
import { X, Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { Alert } from '../types.js';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onNavigateTab: (tab: any) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  const getSeverityBadge = (sev: Alert['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
            KRITIS
          </span>
        );
      case 'WARNING':
        return (
          <span className="rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
            PERINGATAN
          </span>
        );
      case 'INFO':
        return (
          <span className="rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-rose-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              PERINGATAN SISTEM VALIYO OS ({alerts.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs leading-relaxed"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white text-sm">
                  {alert.title}
                </h4>
                {getSeverityBadge(alert.severity)}
              </div>

              <div className="space-y-1 text-slate-300">
                <p>
                  <strong className="text-slate-200">Kejadian:</strong> {alert.whatHappened}
                </p>
                <p>
                  <strong className="text-amber-400">Mengapa penting:</strong> {alert.whyItMatters}
                </p>
                <p className="text-emerald-400">
                  <strong>Tindakan Disarankan:</strong> {alert.recommendedAction}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Modul Terkait: <strong>{alert.relatedModule}</strong></span>
                <button
                  onClick={() => {
                    onClose();
                    if (alert.relatedModule === 'Revenue') onNavigateTab('revenue');
                    else if (alert.relatedModule === 'Products') onNavigateTab('products');
                    else if (alert.relatedModule === 'B2B') onNavigateTab('b2b');
                    else onNavigateTab('tasks');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  Buka Modul Terkait <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
