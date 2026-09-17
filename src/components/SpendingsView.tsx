import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Video,
  Users2,
  CreditCard,
  Building2,
  FileText,
  Calendar,
  X
} from 'lucide-react';
import { Expense, SpendingCategory } from '../types.js';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters.js';

interface SpendingsViewProps {
  expenses: Expense[];
  totalRevenue: number;
  onAddExpense: (expenseData: Partial<Expense>) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onClearExpenses: () => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export const SpendingsView: React.FC<SpendingsViewProps> = ({
  expenses,
  totalRevenue,
  onAddExpense,
  onDeleteExpense,
  onClearExpenses,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Expense Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Subscribe AI' as SpendingCategory,
    amount: '',
    date: '2026-09-16',
    recipient: '',
    paymentMethod: 'Transfer Bank' as const,
    notes: ''
  });

  // Calculate Metrics
  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [expenses]);

  const netCashFlow = useMemo(() => {
    return totalRevenue - totalSpending;
  }, [totalRevenue, totalSpending]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<SpendingCategory, number> = {
      'Subscribe AI': 0,
      'Software & Zoom': 0,
      'Komisi Freelancer': 0,
      'Operasional & Perlengkapan': 0,
      'Marketing & Ads': 0,
      'Lain-lain': 0
    };
    for (const exp of expenses) {
      if (map[exp.category] !== undefined) {
        map[exp.category] += exp.amount || 0;
      } else {
        map['Lain-lain'] += exp.amount || 0;
      }
    }
    return map;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchCat = selectedCategory === 'ALL' || exp.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        exp.title.toLowerCase().includes(q) ||
        (exp.recipient && exp.recipient.toLowerCase().includes(q)) ||
        (exp.notes && exp.notes.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [expenses, selectedCategory, searchQuery]);

  // Quick Preset Handlers
  const applyPreset = (type: 'ai' | 'zoom' | 'freelancer') => {
    if (type === 'ai') {
      setFormData({
        title: 'Langganan AI (Claude Pro / ChatGPT Plus / API)',
        category: 'Subscribe AI',
        amount: '650000',
        date: '2026-09-16',
        recipient: 'Anthropic / OpenAI',
        paymentMethod: 'Kartu Kredit',
        notes: 'Alokasi bulanan riset kurikulum & automasi prompt'
      });
    } else if (type === 'zoom') {
      setFormData({
        title: 'Langganan Zoom Pro (Webinar & Kelas Live)',
        category: 'Software & Zoom',
        amount: '250000',
        date: '2026-09-16',
        recipient: 'Zoom Video Communications',
        paymentMethod: 'Kartu Kredit',
        notes: 'Room hingga 100 peserta untuk sesi bimbingan siswa & parenting'
      });
    } else if (type === 'freelancer') {
      setFormData({
        title: 'Komisi Freelancer (Tutor / Editor / CS)',
        category: 'Komisi Freelancer',
        amount: '1200000',
        date: '2026-09-16',
        recipient: 'Freelancer Tim Produksi & Pengajar',
        paymentMethod: 'Transfer Bank',
        notes: 'Fee pengerjaan modul pengayaan & produksi video pembelajaran'
      });
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) {
      alert('Mohon isi keterangan dan nominal pengeluaran yang valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddExpense({
        title: formData.title,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date || '2026-09-16',
        recipient: formData.recipient,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        category: 'Subscribe AI',
        amount: '',
        date: '2026-09-16',
        recipient: '',
        paymentMethod: 'Transfer Bank',
        notes: ''
      });
    } catch (err) {
      console.error('Failed to save expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (cat: SpendingCategory) => {
    switch (cat) {
      case 'Subscribe AI':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Software & Zoom':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Komisi Freelancer':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Operasional & Perlengkapan':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Marketing & Ads':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header View */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-rose-400" />
            <h2 className="text-base font-semibold text-slate-100 uppercase tracking-wide">
              Buku Pengeluaran & Biaya Operasional (Spending)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan beban operasional riil sejak 1 September 2026: langganan AI, Zoom, dan komisi freelancer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-medium hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bersihkan (0)
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Catat Pengeluaran Baru
          </button>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            TOTAL PENGELUARAN BULAN INI
          </span>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-1">
            {formatRupiah(totalSpending)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>{expenses.length} item tercatat</span>
            <span className="text-rose-400">Beban Kas</span>
          </div>
        </div>

        {/* Total Revenue (dari Transaksi) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            TOTAL PENDAPATAN (BUKU TRANSAKSI)
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>Realisasi Kas Masuk</span>
            <span className="text-emerald-400 font-bold">100% Riil</span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            NET CASH FLOW (SISA KAS)
          </span>
          <div
            className={`text-2xl font-mono font-bold mt-1 ${
              netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatRupiah(netCashFlow)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>Omzet - Pengeluaran</span>
            <span className={netCashFlow >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {netCashFlow >= 0 ? 'Surplus Kas' : 'Defisit Kas'}
            </span>
          </div>
        </div>

        {/* Fokus Pengeluaran Terbesar */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            KOMISI & TOOLS UTAMA
          </span>
          <div className="text-sm font-semibold text-slate-200 mt-2 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-400" /> AI & Zoom
              </span>
              <span className="font-mono text-slate-200">
                {formatRupiahCompact(categoryBreakdown['Subscribe AI'] + categoryBreakdown['Software & Zoom'])}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Users2 className="h-3 w-3 text-amber-400" /> Freelancer
              </span>
              <span className="font-mono text-slate-200">
                {formatRupiahCompact(categoryBreakdown['Komisi Freelancer'])}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Breakdown Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-slate-400" />
          Alokasi Biaya Berdasarkan Kategori
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.keys(categoryBreakdown) as SpendingCategory[]).map(cat => {
            const val = categoryBreakdown[cat];
            const pct = totalSpending > 0 ? Math.round((val / totalSpending) * 100) : 0;
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
                className={`cursor-pointer p-3 rounded-lg border transition-all text-left ${
                  selectedCategory === cat
                    ? 'bg-slate-800 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-medium text-slate-400 truncate">{cat}</div>
                <div className="text-sm font-mono font-bold text-slate-100 mt-1">
                  {formatRupiahCompact(val)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{pct}% dari total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Table Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari keterangan, vendor, atau catatan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter Kategori:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Subscribe AI">Subscribe AI</option>
            <option value="Software & Zoom">Software & Zoom</option>
            <option value="Komisi Freelancer">Komisi Freelancer</option>
            <option value="Operasional & Perlengkapan">Operasional & Perlengkapan</option>
            <option value="Marketing & Ads">Marketing & Ads</option>
            <option value="Lain-lain">Lain-lain</option>
          </select>
        </div>
      </div>

      {/* 5. Spending Records Table */}
      {filteredExpenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center">
          <Wallet className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Belum Ada Catatan Pengeluaran</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Tidak ada pengeluaran yang sesuai dengan filter pencarian.'
              : 'Catat beban langganan AI (Claude/ChatGPT), Zoom, atau komisi freelancer untuk mengontrol cash flow secara real-time.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => {
                applyPreset('ai');
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs hover:bg-purple-600/30 transition-colors"
            >
              + Preset AI
            </button>
            <button
              onClick={() => {
                applyPreset('zoom');
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 text-xs hover:bg-sky-600/30 transition-colors"
            >
              + Preset Zoom
            </button>
            <button
              onClick={() => {
                applyPreset('freelancer');
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs hover:bg-amber-600/30 transition-colors"
            >
              + Preset Freelancer
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Keterangan Pengeluaran</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Penerima / Vendor</th>
                  <th className="py-3 px-4">Nominal (Rp)</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredExpenses.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-100">
                      <div>{item.title}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap font-sans">
                      {item.recipient || '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-400 whitespace-nowrap">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.paymentMethod || 'Transfer'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus catatan pengeluaran "${item.title}"?`)) {
                            onDeleteExpense(item.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus pengeluaran"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Modal: Catat Pengeluaran Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Catat Pengeluaran Baru</h3>
            </div>

            {/* Quick Presets */}
            <div className="mb-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 mb-2">Preset Cepat:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('ai')}
                  className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/20 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Subscribe AI
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('zoom')}
                  className="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs hover:bg-sky-500/20 transition-colors flex items-center gap-1"
                >
                  <Video className="h-3 w-3" /> Zoom Pro
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('freelancer')}
                  className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                >
                  <Users2 className="h-3 w-3" /> Komisi Freelancer
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Keterangan Pengeluaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Langganan Claude Pro & ChatGPT, Zoom Pro, Komisi Tutor..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Kategori <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value as SpendingCategory })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="Subscribe AI">Subscribe AI (ChatGPT / Claude / API)</option>
                    <option value="Software & Zoom">Software & Zoom (Meeting / LMS)</option>
                    <option value="Komisi Freelancer">Komisi Freelancer (Tutor / Editor / CS)</option>
                    <option value="Operasional & Perlengkapan">Operasional & Perlengkapan</option>
                    <option value="Marketing & Ads">Marketing & Ads</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nominal Biaya (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="Contoh: 650000"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Penerima / Vendor</label>
                  <input
                    type="text"
                    placeholder="Nama Vendor / Freelancer"
                    value={formData.recipient}
                    onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Metode Bayar</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Kartu Kredit">Kartu Kredit</option>
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="Kas">Kas Tunai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan alokasi tugas atau link invoice/pembayaran..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Konfirmasi Bersihkan (0) */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Bersihkan Buku Pengeluaran?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tindakan ini akan mengosongkan seluruh daftar pengeluaran kembali menjadi <strong className="text-white font-mono">0 item</strong>. Anda dapat mencatat pengeluaran riil baru dari awal kapan saja.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  await onClearExpenses();
                  setIsClearModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Ya, Bersihkan Menjadi 0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
