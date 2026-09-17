import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Database, Info, ArrowRight } from 'lucide-react';
import { DataQualityReport } from '../types.js';

interface DataQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DataQualityReport | null;
}

export const DataQualityModal: React.FC<DataQualityModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  DATA TRUST & QUALITY REPORT
                </h3>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/40">
                  {report.score}% TRUST SCORE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Audit Integritas Data Operasional Valiyo OS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Primary Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">TRUST SCORE</span>
            <span className="text-xl font-mono font-bold text-emerald-400 block">{report.score}/100</span>
            <span className="text-[10px] text-slate-400 font-mono">Status: {report.status}</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">KELENGKAPAN</span>
            <span className="text-xl font-mono font-bold text-white block">{report.completeness}%</span>
            <span className="text-[10px] text-slate-400 font-mono">Field Wajib Terisi</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">KONSISTENSI</span>
            <span className="text-xl font-mono font-bold text-white block">{report.consistency}%</span>
            <span className="text-[10px] text-slate-400 font-mono">Lintas 5 Produk</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">KEBARUAN</span>
            <span className="text-xl font-mono font-bold text-teal-300 block">&lt;24 Jam</span>
            <span className="text-[10px] text-slate-400 font-mono">Sinkronisasi Realtime</span>
          </div>
        </div>

        {/* Audit Checklist */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-300 block">
            HASIL AUDIT VALIDASI ATURAN DATA:
          </span>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800/80 overflow-hidden text-xs">
            {report.checks.map(check => (
              <div key={check.id} className="p-3 flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2.5">
                  {check.status === 'PASS' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200">{check.name}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                        {check.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{check.details}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    check.status === 'PASS'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Confidence Connection Explanation */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-xs text-emerald-300 leading-relaxed font-mono flex items-start space-x-2.5">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <strong>Korelasi terhadap Tingkat Keyakinan AI:</strong>
            <p className="text-slate-300 text-[11px] mt-0.5 font-sans">
              Tingkat keyakinan (Confidence) pada setiap insight AI dihitung langsung dari skor kualitas data. Karena Trust Score berada pada level {report.score}%, analisis diagnostik dan rekomendasi tindakan dapat diandalkan sebagai basis keputusan strategis founder.
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
