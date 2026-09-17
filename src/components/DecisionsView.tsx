import React, { useState } from 'react';
import { Scale, PlusCircle, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { DecisionItem } from '../types.js';

interface DecisionsViewProps {
  decisions: DecisionItem[];
  onAddDecision: (dec: Partial<DecisionItem>) => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({ decisions, onAddDecision }) => {
  const [showModal, setShowModal] = useState(false);
  const [decisionText, setDecisionText] = useState('');
  const [context, setContext] = useState('');
  const [reason, setReason] = useState('');
  const [outcome, setOutcome] = useState('');
  const [reviewDate, setReviewDate] = useState('2026-12-31');

  const handleSave = () => {
    if (!decisionText) return;
    onAddDecision({
      decision: decisionText,
      context,
      reason,
      expectedOutcome: outcome,
      reviewDate
    });
    setShowModal(false);
    setDecisionText('');
    setContext('');
    setReason('');
    setOutcome('');
  };

  const getStatusBadge = (st: DecisionItem['status']) => {
    switch (st) {
      case 'ACTIVE':
        return (
          <span className="rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
            ACTIVE
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
            SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
            FAILED
          </span>
        );
      case 'REVIEW':
        return (
          <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
            NEEDS REVIEW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              DECISION CENTER — MEMORI KEPUTUSAN STRATEGIS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Merekam logika, alasan, dan ekspektasi hasil agar institusi tidak mengulang kesalahan
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Catat Keputusan Baru</span>
        </button>
      </div>

      <div className="space-y-4">
        {decisions.map(item => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                  Tanggal: {item.date} • Diputuskan oleh: {item.owner}
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {item.decision}
                </h3>
              </div>
              {getStatusBadge(item.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
              <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
                <strong className="text-slate-400 block font-mono text-[10px] mb-1">
                  KONTEKS PERMASALAHAN:
                </strong>
                <p className="text-slate-300">{item.context}</p>
              </div>

              <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
                <strong className="text-amber-400 block font-mono text-[10px] mb-1">
                  ALASAN & JUSTIFIKASI:
                </strong>
                <p className="text-slate-300">{item.reason}</p>
              </div>

              <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
                <strong className="text-emerald-400 block font-mono text-[10px] mb-1">
                  EKSPEKTASI HASIL:
                </strong>
                <p className="text-slate-300">{item.expectedOutcome}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span>Jadwal Evaluasi / Review: <strong>{item.reviewDate}</strong></span>
              <span>Status: Terpantau</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-semibold text-white">Catat Keputusan Strategis Founder</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Keputusan yang Diambil</label>
                <input
                  type="text"
                  placeholder="Contoh: Menunda peluncuran fitur X untuk fokus pada closing B2B"
                  value={decisionText}
                  onChange={e => setDecisionText(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Konteks Permasalahan</label>
                <textarea
                  rows={2}
                  placeholder="Situasi data atau pasar saat keputusan ini dibuat..."
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Alasan Mengapa Memilih Opsi Ini</label>
                <textarea
                  rows={2}
                  placeholder="Analisis pro & kontra serta risiko yang diterima..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Ekspektasi Hasil Nyata</label>
                <input
                  type="text"
                  placeholder="Contoh: Mengamankan Rp80M cash-in sebelum akhir kuartal"
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white"
              >
                Simpan ke Memori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
