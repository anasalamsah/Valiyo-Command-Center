import React, { useState } from 'react';
import {
  Briefcase,
  PlusCircle,
  TrendingUp,
  School,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  ChevronRight,
  ArrowRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { B2BDeal } from '../types.js';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters.js';

interface B2BViewProps {
  deals: B2BDeal[];
  onUpdateDealStage: (dealId: string, newStage: B2BDeal['stage'], probability?: number) => void;
  onAddNewDeal: (deal: Partial<B2BDeal>) => void;
  onRefreshDeals?: () => void;
}

export const B2BView: React.FC<B2BViewProps> = ({
  deals,
  onUpdateDealStage,
  onAddNewDeal,
  onRefreshDeals
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [instName, setInstName] = useState('');
  const [contact, setContact] = useState('');
  const [val, setVal] = useState<number>(30000000);
  const [owner, setOwner] = useState('Rian');
  const [notes, setNotes] = useState('');

  const stages: { id: B2BDeal['stage']; label: string; defaultProb: number }[] = [
    { id: 'PROSPECT', label: '1. Prospek', defaultProb: 0.2 },
    { id: 'QUALIFIED', label: '2. Terkualifikasi', defaultProb: 0.4 },
    { id: 'PROPOSAL', label: '3. Pengajuan Proposal', defaultProb: 0.6 },
    { id: 'NEGOTIATION', label: '4. Negosiasi SPK', defaultProb: 0.8 },
    { id: 'CLOSED_WON', label: '5. Selesai (Closing Won)', defaultProb: 1.0 }
  ];

  const totalPipeline = deals
    .filter(d => d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + d.dealValue, 0);

  const weightedPipeline = deals
    .filter(d => d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + d.dealValue * d.probability, 0);

  const negotiationDeals = deals.filter(d => d.stage === 'NEGOTIATION');
  const negotiationValue = negotiationDeals.reduce((sum, d) => sum + d.dealValue, 0);

  const handleSaveDeal = () => {
    if (!instName) return;
    onAddNewDeal({
      institutionName: instName,
      contactPerson: contact || 'Kepala Sekolah / Yayasan',
      dealValue: val,
      probability: 0.4,
      stage: 'QUALIFIED',
      expectedCloseDate: '2026-10-15',
      owner,
      notes
    });
    setShowAddModal(false);
    setInstName('');
    setContact('');
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/b2b/clear', { method: 'POST' });
      if (res.ok) {
        setShowClearModal(false);
        onRefreshDeals?.();
      }
    } catch (err) {
      console.error('Gagal membersihkan pipeline B2B:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              PIPELINE B2B SEKOLAH & YAYASAN
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Tuas terbesar penopang target Rp1 Miliar dengan margin kotor 74%
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {deals.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center space-x-1.5 rounded-lg border border-rose-500/40 bg-rose-950/20 px-3 py-1.5 text-xs font-mono font-semibold text-rose-300 hover:bg-rose-900/30 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Bersihkan (0)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tambah Akun Sekolah Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            TOTAL NILAI PIPELINE AKTIF
          </span>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {formatRupiah(totalPipeline)}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {deals.length} Institusi Pendidikan
          </span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-4">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
            NILAI BERBOBOT PROBABILITAS (WEIGHTED)
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-300 mt-1">
            {formatRupiah(weightedPipeline)}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Digunakan langsung pada proyeksi akhir tahun
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            DEAL TAHAP NEGOSIASI MATANG
          </span>
          <div className="text-2xl font-mono font-bold text-amber-300 mt-1">
            {negotiationDeals.length} Sekolah ({formatRupiahCompact(negotiationValue)})
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Fokus penutupan founder bulan ini
          </span>
        </div>
      </div>

      {/* Pipeline Board / List */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
          DAFTAR DEAL AKTIF & TAHAPAN CLOSING
        </h3>

        {deals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-12 text-center">
            <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-200">Pipeline B2B Dimulai dari 0</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-mono">
              Belum ada prospek atau deal kemitraan institusi sekolah/yayasan yang tercatat. Klik tombol di bawah untuk mencatat akun institusi baru.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Akun Sekolah Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map(deal => {
              const isNegotiation = deal.stage === 'NEGOTIATION';
              const isWon = deal.stage === 'CLOSED_WON';
              return (
                <div
                  key={deal.id}
                  className={`rounded-xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                    isNegotiation
                      ? 'border-amber-500/40 bg-slate-950/90'
                      : isWon
                      ? 'border-emerald-500/40 bg-slate-950/90'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                          PIC: {deal.contactPerson} • Owner: {deal.owner}
                        </span>
                        <h4 className="text-sm font-semibold text-white">
                          {deal.institutionName}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isWon
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isNegotiation
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {deal.stage}
                      </span>
                    </div>

                    <div className="my-2.5 flex items-baseline justify-between font-mono">
                      <div>
                        <span className="text-base font-bold text-white">
                          {formatRupiah(deal.dealValue)}
                        </span>
                        <span className="text-xs text-slate-400 block">
                          Probabilitas: {(deal.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-emerald-400 font-bold block">
                          Tertimbang: {formatRupiahCompact(deal.dealValue * deal.probability)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Target Close: {deal.expectedCloseDate}
                        </span>
                      </div>
                    </div>

                    {deal.notes && (
                      <div className="rounded bg-slate-900/80 p-2 text-xs text-slate-300 leading-relaxed font-mono mb-3 border border-slate-800">
                        <strong>Catatan:</strong> {deal.notes}
                      </div>
                    )}
                  </div>

                  {/* Stage Progression Action Buttons */}
                  {!isWon && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Aksi Tahapan:</span>
                      <div className="flex items-center space-x-1.5">
                        {deal.stage !== 'NEGOTIATION' && (
                          <button
                            onClick={() => onUpdateDealStage(deal.id, 'NEGOTIATION', 0.8)}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 hover:bg-slate-800"
                          >
                            Pindah ke Negosiasi
                          </button>
                        )}
                        <button
                          onClick={() => onUpdateDealStage(deal.id, 'CLOSED_WON', 1.0)}
                          className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Close Won
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal: Clear B2B Pipeline */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Bersihkan Seluruh Pipeline B2B?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Tindakan ini akan mengosongkan semua prospek institusi, sekolah, dan deal kemitraan B2B untuk mulai dari 0.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-1.5 text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
              >
                {isClearing ? 'Membersihkan...' : 'Ya, Bersihkan (0)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                Tambah Akun Sekolah / Yayasan Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Nama Sekolah / Yayasan *</label>
                <input
                  type="text"
                  placeholder="Contoh: SMA Al-Azhar Jakarta"
                  value={instName}
                  onChange={e => setInstName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Kontak Person / Jabatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Ibu Rina (Ketua Yayasan)"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Estimasi Nilai Kontrak (Rupiah)</label>
                <input
                  type="number"
                  value={val}
                  onChange={e => setVal(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Catatan Kebutuhan</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Kebutuhan lisensi siswa dan pelatihan guru..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDeal}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white"
              >
                Simpan Prospek
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
