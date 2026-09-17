import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Users2,
  TrendingUp,
  ArrowUpRight,
  Send,
  Download,
  Search,
  Check,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText
} from 'lucide-react';
import { MonthlyReferralRecap, FreelancerPayoutSummary, Transaction, Freelancer } from '../types.js';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters.js';

interface MonthlyReferralRecapViewProps {
  recaps: MonthlyReferralRecap[];
  transactions: Transaction[];
  freelancers: Freelancer[];
  onRefresh?: () => Promise<void>;
  onSettlePayout?: (period: string, freelancerCode?: string, notes?: string) => Promise<void>;
  onRevertPayout?: (period: string, freelancerCode?: string) => Promise<void>;
}

export const MonthlyReferralRecapView: React.FC<MonthlyReferralRecapViewProps> = ({
  recaps,
  transactions,
  freelancers,
  onRefresh,
  onSettlePayout,
  onRevertPayout
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    return recaps.length > 0 ? recaps[0].period : 'September 2026';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFreelancer, setExpandedFreelancer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settleModal, setSettleModal] = useState<{
    open: boolean;
    period: string;
    freelancerCode?: string;
    freelancerName?: string;
    amount: number;
  } | null>(null);
  const [settleNotes, setSettleNotes] = useState('');

  // Fallback to active recap or create empty one
  const activeRecap = useMemo(() => {
    const found = recaps.find(r => r.period === selectedPeriod);
    if (found) return found;
    if (recaps.length > 0) return recaps[0];
    return {
      period: selectedPeriod,
      scheduledPayoutDate: '1 Oktober 2026',
      dueDateIso: '2026-10-01',
      totalReferralSales: 0,
      totalTransactions: 0,
      totalCommission: 0,
      totalPaid: 0,
      totalPending: 0,
      freelancersCount: 0,
      status: 'PENDING' as const,
      freelancers: []
    };
  }, [recaps, selectedPeriod]);

  // Filtered freelancers in active recap
  const filteredFreelancers = useMemo(() => {
    if (!activeRecap || !activeRecap.freelancers) return [];
    return activeRecap.freelancers.filter(f => {
      const q = searchQuery.toLowerCase();
      return (
        f.freelancerName.toLowerCase().includes(q) ||
        f.freelancerCode.toLowerCase().includes(q) ||
        (f.phone && f.phone.includes(q))
      );
    });
  }, [activeRecap, searchQuery]);

  // Handle settling single or all
  const handleConfirmSettle = async () => {
    if (!settleModal) return;
    try {
      setIsProcessing(true);
      setStatusMessage(null);

      if (onSettlePayout) {
        await onSettlePayout(settleModal.period, settleModal.freelancerCode, settleNotes);
      } else {
        // Direct API call fallback
        const res = await fetch('/api/referrals/payouts/settle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period: settleModal.period,
            freelancerCode: settleModal.freelancerCode,
            paymentDate: new Date().toISOString().split('T')[0],
            notes: settleNotes || undefined
          })
        });
        if (!res.ok) throw new Error('Gagal mencatat pembayaran komisi');
      }

      setStatusMessage({
        type: 'success',
        text: `Berhasil mencatat pembayaran komisi untuk ${settleModal.freelancerName || `Periode ${settleModal.period}`} sebagai LUNAS.`
      });
      setSettleModal(null);
      setSettleNotes('');
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevert = async (freelancerCode: string, freelancerName: string) => {
    if (!confirm(`Kembalikan status komisi ${freelancerName} menjadi Terjadwal (Belum Lunas)?`)) return;
    try {
      setIsProcessing(true);
      setStatusMessage(null);
      if (onRevertPayout) {
        await onRevertPayout(activeRecap.period, freelancerCode);
      } else {
        const res = await fetch('/api/referrals/payouts/revert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period: activeRecap.period,
            freelancerCode
          })
        });
        if (!res.ok) throw new Error('Gagal mengembalikan status komisi');
      }
      setStatusMessage({
        type: 'success',
        text: `Status komisi ${freelancerName} telah dikembalikan menjadi Terjadwal.`
      });
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengubah status' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate WhatsApp message for freelancer
  const handleSendWhatsApp = (f: FreelancerPayoutSummary) => {
    const phone = f.phone ? f.phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;

    const message = encodeURIComponent(
      `Halo ${f.freelancerName}! 👋\n\nBerikut rekap penjualan dan komisi referral Anda di Valiyo OS untuk *Periode ${activeRecap.period}*:\n` +
      `• Kode Referral: *${f.freelancerCode}*\n` +
      `• Total Transaksi Berhasil: *${f.transactionCount} transaksi*\n` +
      `• Total Omset Penjualan: *${formatRupiah(f.totalSales)}*\n` +
      `• Komisi (${f.commissionRate}${f.commissionType === 'FIXED' ? ' Flat' : '%'}): *${formatRupiah(f.totalCommission)}*\n` +
      `• Jadwal Pencairan: *${activeRecap.scheduledPayoutDate}*\n` +
      `• Status Payout: *${f.payoutStatus === 'PAID' ? 'LUNAS ✅' : 'TERJADWAL ⏳'}*\n\n` +
      `Terima kasih atas kontribusi Anda bersama Valiyo!`
    );

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      navigator.clipboard.writeText(decodeURIComponent(message));
      alert('Nomor HP mitra belum terdaftar. Teks rekap komisi telah disalin ke clipboard!');
    }
  };

  // Export recap as text summary to clipboard
  const handleCopyRecapSummary = () => {
    let summary = `📋 REKAP KOMISI REFERRAL VALIYO OS - PERIODE ${activeRecap.period.toUpperCase()}\n`;
    summary += `Jadwal Payout: ${activeRecap.scheduledPayoutDate}\n`;
    summary += `Total Penjualan: ${formatRupiah(activeRecap.totalReferralSales)}\n`;
    summary += `Total Komisi: ${formatRupiah(activeRecap.totalCommission)}\n`;
    summary += `Sudah Dibayar: ${formatRupiah(activeRecap.totalPaid)}\n`;
    summary += `Sisa Belum Dibayar: ${formatRupiah(activeRecap.totalPending)}\n\n`;
    summary += `RINCIAN PER FREELANCER:\n`;

    activeRecap.freelancers.forEach((f, idx) => {
      summary += `${idx + 1}. ${f.freelancerName} (${f.freelancerCode}) | ${f.transactionCount} Penjualan | Omset: ${formatRupiah(f.totalSales)} | Komisi: ${formatRupiah(f.totalCommission)} | Status: ${f.payoutStatus === 'PAID' ? 'LUNAS' : 'PENDING'}\n`;
    });

    navigator.clipboard.writeText(summary);
    setStatusMessage({ type: 'success', text: 'Ringkasan rekap komisi berhasil disalin ke clipboard!' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Period Selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  Rekap Pembayaran Komisi Referral
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                    Auto-Spend Aktif
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aturan: Komisi penjualan bulan <span className="text-slate-200 font-medium">X</span> dijadwalkan cair per{' '}
                  <span className="text-emerald-400 font-semibold font-mono">tanggal 1 di bulan X+1</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Period Selector and Global Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Pilih Periode:</span>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 shadow-inner"
              >
                {recaps.map(r => (
                  <option key={r.period} value={r.period}>
                    Bulan {r.period} (Jatuh Tempo: {r.scheduledPayoutDate})
                  </option>
                ))}
                {recaps.length === 0 && <option value="September 2026">September 2026</option>}
              </select>
            </div>

            <button
              onClick={handleCopyRecapSummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Salin rekap bulanan ke clipboard"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Salin Rekap</span>
            </button>

            {activeRecap.totalPending > 0 && (
              <button
                onClick={() =>
                  setSettleModal({
                    open: true,
                    period: activeRecap.period,
                    amount: activeRecap.totalPending
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Bayar Semua Komisi ({formatRupiahCompact(activeRecap.totalPending)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center justify-between border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-xs underline hover:opacity-80">
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* 2. Key Metrics for the Selected Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Omset Referral</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-2">
            {formatRupiah(activeRecap.totalReferralSales)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-mono text-sky-400">{activeRecap.totalTransactions} transaksi</span>
            <span>penjualan berhasil</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Komisi Terjadwal</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-2">
            {formatRupiah(activeRecap.totalCommission)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Jatuh tempo pencairan:</span>
            <span className="font-mono text-slate-200 font-semibold">{activeRecap.scheduledPayoutDate}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Sisa Belum Ditransfer</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-2">
            {formatRupiah(activeRecap.totalPending)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeRecap.totalPending === 0 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Semua komisi telah lunas
              </span>
            ) : (
              <span>Harus diselesaikan per {activeRecap.scheduledPayoutDate}</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Sudah Dibayarkan (Lunas)</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
            {formatRupiah(activeRecap.totalPaid)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>{activeRecap.freelancersCount} mitra freelancer aktif</span>
          </div>
        </div>
      </div>

      {/* 3. Freelancer Commission Details Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, kode referral, no. HP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Periode: <strong className="text-slate-200">{activeRecap.period}</strong></span>
            <span>•</span>
            <span>Jadwal Bayar: <strong className="text-emerald-400 font-mono">{activeRecap.scheduledPayoutDate}</strong></span>
          </div>
        </div>

        {/* Freelancers List Table */}
        {filteredFreelancers.length === 0 ? (
          <div className="p-12 text-center">
            <Users2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">Belum Ada Penjualan Referral di Periode Ini</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? 'Tidak ditemukan mitra freelancer yang cocok dengan pencarian.'
                : `Belum ada transaksi berstatus Selesai dengan kode referral pada bulan ${activeRecap.period}. Ketika transaksi referral tercatat, auto-spend dan rekap komisi akan otomatis muncul di sini.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Mitra Freelancer / Referral</th>
                  <th className="py-3 px-4 text-center">Penjualan</th>
                  <th className="py-3 px-4">Total Omset Dibantu</th>
                  <th className="py-3 px-4">Skema Komisi</th>
                  <th className="py-3 px-4">Komisi Yang Harus Dibayar</th>
                  <th className="py-3 px-4">Jadwal Pencairan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi & Notifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredFreelancers.map(f => {
                  const isExpanded = expandedFreelancer === f.freelancerCode;
                  const isPaid = f.payoutStatus === 'PAID';

                  // Matching transactions for this freelancer
                  const relatedTxs = transactions.filter(t => f.transactionIds.includes(t.id));

                  return (
                    <React.Fragment key={f.freelancerCode}>
                      <tr className={`hover:bg-slate-800/30 transition-colors ${isPaid ? 'bg-slate-900/30' : ''}`}>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => setExpandedFreelancer(isExpanded ? null : f.freelancerCode)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Lihat rincian transaksi"
                            >
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            <div>
                              <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                                {f.freelancerName}
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400">
                                  {f.freelancerCode}
                                </span>
                              </div>
                              {f.phone && (
                                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                                  HP: {f.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-bold">
                            {f.transactionCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          {formatRupiah(f.totalSales)}
                        </td>

                        <td className="py-3.5 px-4 font-sans text-slate-400">
                          {f.commissionType === 'FIXED'
                            ? `${formatRupiah(f.commissionRate)} / closing`
                            : `${f.commissionRate}% dari penjualan`}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-amber-400 text-xs">
                          {formatRupiah(f.totalCommission)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>{f.scheduledDateLabel || activeRecap.scheduledPayoutDate}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">1 bulan berikutnya</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              LUNAS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Clock className="h-3 w-3" />
                              TERJADWAL
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp notification button */}
                            <button
                              onClick={() => handleSendWhatsApp(f)}
                              className="p-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 transition-colors"
                              title="Kirim rincian komisi via WhatsApp"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>

                            {/* Mark as paid or revert */}
                            {isPaid ? (
                              <button
                                onClick={() => handleRevert(f.freelancerCode, f.freelancerName)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors"
                                title="Kembalikan status ke Terjadwal"
                              >
                                <RotateCcw className="h-3 w-3 inline mr-1" />
                                Batal Lunas
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setSettleModal({
                                    open: true,
                                    period: activeRecap.period,
                                    freelancerCode: f.freelancerCode,
                                    freelancerName: f.freelancerName,
                                    amount: f.totalCommission
                                  })
                                }
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors"
                              >
                                Bayar Komisi
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row: list of transactions for this freelancer */}
                      {isExpanded && (
                        <tr className="bg-slate-950/60">
                          <td colSpan={8} className="py-3 px-6 border-y border-slate-800/80">
                            <div className="text-[11px] font-sans text-slate-400 mb-2 font-medium flex items-center justify-between">
                              <span>Daftar Transaksi Referral: {f.freelancerName} ({f.freelancerCode})</span>
                              <span>Auto-spend tercatat di buku Pengeluaran</span>
                            </div>
                            {relatedTxs.length === 0 ? (
                              <div className="text-xs text-slate-500 py-1 font-sans">
                                Rincian transaksi langsung dapat dilihat pada buku Transaksi.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {relatedTxs.map(tx => {
                                  const pct = f.commissionType === 'FIXED' ? 0 : f.commissionRate;
                                  const fee = f.commissionType === 'FIXED' ? f.commissionRate : Math.round(((tx.amount || 0) * pct) / 100);
                                  return (
                                    <div key={tx.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                                      <div>
                                        <div className="font-semibold text-slate-200">{tx.productName || 'Produk'}</div>
                                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                          {tx.customerName || 'Pelanggan'} • {tx.date}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-mono text-slate-200">{formatRupiah(tx.amount)}</div>
                                        <div className="font-mono text-[11px] text-amber-400 font-medium">
                                          Fee: +{formatRupiah(fee)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Explanation & Transparency Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-emerald-400" />
          Bagaimana Cara Kerja Auto-Spend & Jadwal Payout Komisi?
        </div>
        <p className="leading-relaxed">
          1. <strong>Otomatisasi Penuh (Auto-Spend):</strong> Setiap transaksi penjualan yang memiliki kode referral otomatis menciptakan catatan pengeluaran di bawah kategori <em>Komisi Freelancer</em>.
        </p>
        <p className="leading-relaxed">
          2. <strong>Jadwal Pembayaran Tanggal 1 Bulan Berikutnya:</strong> Penjualan di bulan September akan dijadwalkan bayar per <strong>1 Oktober</strong>. Hal ini memberi waktu bagi bisnis untuk merekonsiliasi pembayaran pelanggan dan memastikan tidak ada refund sebelum komisi dibayarkan.
        </p>
        <p className="leading-relaxed">
          3. <strong>Pencatatan Lunas:</strong> Menekan tombol <em>Bayar Komisi</em> akan menandai pengeluaran terkait sebagai <strong>LUNAS</strong> dan mendokumentasikan waktu transfer ke rekening mitra.
        </p>
      </div>

      {/* 5. Settlement Confirmation Modal */}
      {settleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Konfirmasi Pembayaran Komisi
              </h3>
              <button
                onClick={() => setSettleModal(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Anda akan menandai komisi berikut sebagai <strong>LUNAS (Sudah Ditransfer)</strong>:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Penerima:</span>
                  <span className="text-slate-200 font-semibold">{settleModal.freelancerName || 'Semua Mitra'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Periode Penjualan:</span>
                  <span className="text-slate-200">{settleModal.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Total Nominal:</span>
                  <span className="text-amber-400 font-bold text-sm">{formatRupiah(settleModal.amount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium font-sans">
                  Catatan / No. Bukti Transfer (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer via BCA / Mandiri ref #998822"
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSettleModal(null)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50"
              >
                {isProcessing ? 'Memproses...' : 'Ya, Sudah Ditransfer (Lunas)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
