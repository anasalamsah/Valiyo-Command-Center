import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  TrendingUp,
  RotateCcw,
  UserCheck,
  Tag,
  Share2,
  Phone,
  Mail,
  User,
  Package
} from 'lucide-react';
import { Transaction, Customer, Product, RevenueSource, Freelancer } from '../types.js';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters.js';

interface TransactionsViewProps {
  transactions: Transaction[];
  customers: Customer[];
  products: Product[];
  freelancers?: Freelancer[];
  onRefresh: () => void;
  onOpenQuickAdd: (defaultTab?: string) => void;
}

export const PRODUCT_PRICE_OPTIONS: Record<string, { label: string; price: number; badge?: string }[]> = {
  kids: [
    { label: 'Bulanan Reguler', price: 150000, badge: 'Standar' },
    { label: 'Paket Semester (6 Bln)', price: 750000, badge: 'Hemat 16%' },
    { label: 'Paket Tahunan (12 Bln)', price: 1350000, badge: 'Terlaris' },
    { label: 'Promo Khusus Early Bird', price: 120000, badge: 'Diskon' }
  ],
  students: [
    { label: 'Bulanan Standar', price: 200000, badge: 'Standar' },
    { label: 'Tryout & Modul Latihan', price: 99000, badge: 'Add-on' },
    { label: 'Paket Intensif UTBK', price: 850000, badge: 'Populer' },
    { label: 'Paket Semester Lengkap', price: 950000, badge: 'Hemat' }
  ],
  skill: [
    { label: 'Single Course Skill', price: 350000, badge: 'Dasar' },
    { label: 'Bootcamp Intensif 1 Bulan', price: 950000, badge: 'Intensif' },
    { label: 'Career Track Pro', price: 2400000, badge: 'Komprehensif' },
    { label: 'Promo Spesial Skill', price: 290000, badge: 'Promo' }
  ],
  teacher: [
    { label: 'Workshop Mandiri', price: 175000, badge: 'Workshop' },
    { label: 'Sertifikasi Guru AI', price: 650000, badge: 'Sertifikat' },
    { label: 'Member Komunitas Guru (1 Thn)', price: 450000, badge: 'Tahunan' }
  ],
  b2b: [
    { label: 'Lisensi Lab Sekolah (Pilot)', price: 5000000, badge: 'Starter' },
    { label: 'Paket Enterprise 1 Tahun', price: 25000000, badge: 'Lengkap' },
    { label: 'In-House Training Guru & Staf', price: 8500000, badge: 'Pelatihan' }
  ]
};

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  customers,
  products,
  freelancers = [],
  onRefresh,
  onOpenQuickAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [onlyReferral, setOnlyReferral] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '', // Buyer
    buyerPhone: '',   // HP
    buyerEmail: '',   // Email
    productId: 'kids',
    productName: 'Valiyo Kids', // Nama Produk
    amount: '',                 // Harga Produk
    source: 'Organic' as RevenueSource,
    referrer: '',
    status: 'COMPLETED' as Transaction['status'],
    date: new Date().toISOString().split('T')[0]
  });

  const [selectedPriceLabel, setSelectedPriceLabel] = useState<string>('');

  // Get available price options for selected product in form
  const currentPriceOptions = useMemo(() => {
    const prodId = formData.productId;
    if (PRODUCT_PRICE_OPTIONS[prodId]) {
      return PRODUCT_PRICE_OPTIONS[prodId];
    }
    const matched = products.find(p => p.id === prodId);
    const basePrice = matched?.price || 150000;
    return [
      { label: 'Harga Standar', price: basePrice, badge: 'Standar' },
      { label: 'Paket 3 Bulan', price: Math.round(basePrice * 3 * 0.9), badge: 'Hemat 10%' },
      { label: 'Paket 6 Bulan', price: Math.round(basePrice * 6 * 0.8), badge: 'Hemat 20%' },
      { label: 'Promo Spesial', price: Math.round(basePrice * 0.85), badge: 'Diskon 15%' }
    ];
  }, [formData.productId, products]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch =
        tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.referrer && tx.referrer.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesProduct = selectedProduct === 'ALL' || tx.productId === selectedProduct;
      const matchesStatus = selectedStatus === 'ALL' || tx.status === selectedStatus;
      const matchesSource = selectedSource === 'ALL' || tx.source === selectedSource;
      const matchesReferral = !onlyReferral || Boolean(tx.referrer && tx.referrer.trim());

      return matchesSearch && matchesProduct && matchesStatus && matchesSource && matchesReferral;
    });
  }, [transactions, searchQuery, selectedProduct, selectedStatus, selectedSource, onlyReferral]);

  // Aggregate metrics
  const completedTransactions = useMemo(
    () => transactions.filter(t => t.status === 'COMPLETED'),
    [transactions]
  );
  const totalVolume = useMemo(
    () => completedTransactions.reduce((acc, t) => acc + (t.amount || 0), 0),
    [completedTransactions]
  );
  const avgTicket = completedTransactions.length > 0 ? totalVolume / completedTransactions.length : 0;
  const referralCount = useMemo(
    () => transactions.filter(t => Boolean(t.referrer && t.referrer.trim())).length,
    [transactions]
  );

  const handleOpenAdd = () => {
    const firstCust = customers[0];
    const firstProd = products[0] || { id: 'kids', name: 'Valiyo Kids', price: 150000 };
    const defaultAmount = firstProd.price || 150000;

    setFormData({
      customerId: firstCust ? firstCust.id : '',
      customerName: firstCust ? firstCust.name : '',
      buyerPhone: firstCust ? firstCust.phone || '' : '',
      buyerEmail: firstCust ? firstCust.email || '' : '',
      productId: firstProd.id,
      productName: firstProd.name,
      amount: String(defaultAmount),
      source: 'Organic',
      referrer: '',
      status: 'COMPLETED',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedPriceLabel('Harga Standar');
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    const matchedCust = customers.find(c => c.id === tx.customerId);
    setFormData({
      customerId: tx.customerId,
      customerName: tx.customerName,
      buyerPhone: tx.buyerPhone || (matchedCust ? matchedCust.phone || '' : ''),
      buyerEmail: tx.buyerEmail || (matchedCust ? matchedCust.email || '' : ''),
      productId: tx.productId,
      productName: tx.productName,
      amount: String(tx.amount),
      source: tx.source,
      referrer: tx.referrer || '',
      status: tx.status,
      date: tx.date
    });
    setSelectedPriceLabel('');
    setError(null);
  };

  const handleOpenDelete = (tx: Transaction) => {
    setDeletingTx(tx);
    setError(null);
  };

  const handleProductChange = (prodId: string) => {
    const p = products.find(item => item.id === prodId);
    const prodName = p ? p.name : 'Produk Valiyo';
    const opts = PRODUCT_PRICE_OPTIONS[prodId];
    const newAmount = opts && opts[0] ? String(opts[0].price) : p?.price ? String(p.price) : '150000';

    setFormData(prev => ({
      ...prev,
      productId: prodId,
      productName: prodName,
      amount: newAmount
    }));
    setSelectedPriceLabel(opts && opts[0] ? opts[0].label : '');
  };

  const handleCustomerChange = (custId: string) => {
    const c = customers.find(item => item.id === custId);
    if (c) {
      setFormData(prev => ({
        ...prev,
        customerId: c.id,
        customerName: c.name,
        buyerPhone: c.phone || prev.buyerPhone,
        buyerEmail: c.email || prev.buyerEmail
      }));
    } else {
      setFormData(prev => ({ ...prev, customerId: custId }));
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      setError('Buyer (Nama Pembeli) wajib diisi');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Harga produk / nominal transaksi harus lebih dari 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        buyer: formData.customerName.trim(),
        customerName: formData.customerName.trim(),
        hp: formData.buyerPhone.trim(),
        buyerPhone: formData.buyerPhone.trim(),
        email: formData.buyerEmail.trim(),
        buyerEmail: formData.buyerEmail.trim(),
        customerId: formData.customerId,
        productId: formData.productId,
        productName: formData.productName,
        amount: Number(formData.amount),
        source: formData.source,
        referrer: formData.referrer.trim() || undefined,
        status: formData.status,
        date: formData.date
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menyimpan transaksi');
      }

      setIsAddModalOpen(false);
      setSuccessMsg('Transaksi baru berhasil dicatat ke buku kas.');
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    if (!formData.customerName.trim()) {
      setError('Buyer (Nama Pembeli) wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        buyer: formData.customerName.trim(),
        customerName: formData.customerName.trim(),
        hp: formData.buyerPhone.trim(),
        buyerPhone: formData.buyerPhone.trim(),
        email: formData.buyerEmail.trim(),
        buyerEmail: formData.buyerEmail.trim(),
        productId: formData.productId,
        productName: formData.productName,
        amount: Number(formData.amount),
        source: formData.source,
        referrer: formData.referrer.trim() || undefined,
        status: formData.status,
        date: formData.date
      };

      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal memperbarui transaksi');
      }

      setEditingTx(null);
      setSuccessMsg('Transaksi berhasil diperbarui.');
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTx) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/transactions/${deletingTx.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menghapus transaksi');
      }

      setDeletingTx(null);
      setSuccessMsg('Transaksi berhasil dihapus.');
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmClearAll = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/transactions/clear', {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Gagal mengosongkan buku transaksi');
      }

      setIsClearModalOpen(false);
      setSuccessMsg('Buku kas transaksi telah bersih. Siap mulai dari 0!');
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengosongkan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="transactions-view" className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Buku Transaksi Kas & Penjualan
            </h2>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400">
              {transactions.length} Entri
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Buku besar transaksi kas riil dengan opsi harga paket produk dan pelacakan referral
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {transactions.length > 0 && (
            <button
              id="btn-clear-transactions"
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800 text-slate-400 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              title="Kosongkan seluruh data transaksi untuk mulai dari 0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Bersihkan (Mulai dari 0)</span>
            </button>
          )}

          <button
            id="btn-add-transaction"
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Transaksi Kas</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{formatRupiah(totalVolume)}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">
              {completedTransactions.length} transaksi selesai
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-medium text-slate-400">Rata-rata Pembelian (AOV)</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{formatRupiah(avgTicket)}</div>
            <div className="text-[11px] text-indigo-400 mt-0.5 font-mono">Rata-rata per tiket</div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-medium text-slate-400">Transaksi via Referral</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{referralCount}</div>
            <div className="text-[11px] text-teal-400 mt-0.5 font-mono">
              {completedTransactions.length > 0
                ? `${Math.round((referralCount / completedTransactions.length) * 100)}% dari total penjualan`
                : 'Belum ada data'}
            </div>
          </div>
          <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400">
            <Share2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="input-transaction-search"
            type="text"
            placeholder="Cari transaksi, nama pelanggan, produk, atau referrer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            id="select-tx-product-filter"
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Produk</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            id="select-tx-status-filter"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="COMPLETED">Selesai (Completed)</option>
            <option value="PENDING">Menunggu (Pending)</option>
            <option value="REFUNDED">Refund</option>
          </select>

          <select
            id="select-tx-source-filter"
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Saluran</option>
            <option value="Organic">Organik / Web</option>
            <option value="Social Media">Media Sosial</option>
            <option value="Referral">Referral</option>
            <option value="B2B">B2B</option>
            <option value="Direct">Langsung</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyReferral(!onlyReferral)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              onlyReferral
                ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🤝 Hanya Referral
          </button>
        </div>
      </div>

      {/* Transactions Table / Empty State */}
      {transactions.length === 0 ? (
        <div id="transactions-empty-state" className="p-12 rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-center shadow-sm">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <CreditCard className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Buku Transaksi Bersih (Mulai dari 0)</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Buku kas Anda siap digunakan dari nol. Catat transaksi penjualan riil pertama Anda dengan opsi harga paket produk dan nama pereferal.
          </p>
          <button
            id="btn-empty-add-tx"
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            + Catat Transaksi Baru
          </button>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 border border-slate-850 rounded-xl shadow-sm">
          <p className="text-xs text-slate-400">Tidak ada transaksi yang cocok dengan filter pencarian.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-850 bg-slate-950 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/60 text-slate-400">
                  <th className="py-3 px-4 font-semibold">ID & Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Buyer (Pembeli) & Kontak</th>
                  <th className="py-3 px-4 font-semibold">Nama Produk</th>
                  <th className="py-3 px-4 font-semibold">Saluran</th>
                  <th className="py-3 px-4 font-semibold">Direferensikan Oleh</th>
                  <th className="py-3 px-4 font-semibold text-right">Harga Produk</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredTransactions.map(tx => {
                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-300 font-medium">{tx.id}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{tx.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>{tx.customerName}</span>
                        </div>
                        {(tx.buyerPhone || tx.buyerEmail) && (
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            {tx.buyerPhone && (
                              <span className="flex items-center gap-1 text-slate-300">
                                <Phone className="h-2.5 w-2.5 text-emerald-400" />
                                <span>{tx.buyerPhone}</span>
                              </span>
                            )}
                            {tx.buyerPhone && tx.buyerEmail && <span className="text-slate-600">•</span>}
                            {tx.buyerEmail && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Mail className="h-2.5 w-2.5 text-indigo-400" />
                                <span>{tx.buyerEmail}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                          {tx.productName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{tx.source}</td>
                      <td className="py-3 px-4">
                        {tx.referrer ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 font-medium text-[11px]">
                            <span>🤝</span>
                            <span>{tx.referrer}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                        {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.status === 'COMPLETED' ? 'SELESAI' : tx.status === 'PENDING' ? 'MENUNGGU' : 'REFUND'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Ubah Transaksi"
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Hapus Transaksi"
                            onClick={() => handleOpenDelete(tx)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Transaction */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Catat Transaksi Kas Baru</h3>
                  <p className="text-[11px] text-slate-400">Pilih opsi harga paket & cantumkan pereferal bila ada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-3.5">
              {/* Identitas Pembeli (Buyer, HP, Email) */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Data Pembeli (Buyer)</span>
                  </span>
                  {customers.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {customers.length} data tersimpan
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Buyer (Nama Pembeli) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pembeli / wali murid / PIC..."
                    value={formData.customerName}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        customerName: e.target.value
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                  {customers.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Pilih cepat pembeli lama:</span>
                      <select
                        value={formData.customerId}
                        onChange={e => handleCustomerChange(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Pilih dari Database Pelanggan --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.phone ? `(${c.phone})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>HP (No. HP / WhatsApp)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0812-xxxx-xxxx"
                      value={formData.buyerPhone}
                      onChange={e => setFormData({ ...formData, buyerPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-indigo-400" />
                      <span>Email (Email Pembeli)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="buyer@example.com"
                      value={formData.buyerEmail}
                      onChange={e => setFormData({ ...formData, buyerEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Data Produk & Harga */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Pembelian Produk</span>
                  </span>
                </div>

                {/* Nama Produk */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Produk *
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={formData.productId}
                      onChange={e => handleProductChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatRupiahCompact(p.price || 0)})
                        </option>
                      ))}
                      {products.length === 0 && <option value="kids">Valiyo Kids</option>}
                    </select>
                    <input
                      type="text"
                      placeholder="Kustom nama produk / paket..."
                      value={formData.productName}
                      onChange={e => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Opsi Harga Paket Produk */}
                <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Tag className="h-3 w-3 text-emerald-400" />
                      <span>Opsi Pilihan Harga Produk:</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Klik untuk isi otomatis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentPriceOptions.map(opt => {
                      const isSelected = Number(formData.amount) === opt.price;
                      return (
                        <button
                          type="button"
                          key={opt.label}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, amount: String(opt.price) }));
                            setSelectedPriceLabel(opt.label);
                          }}
                          className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-[11px]">{opt.label}</span>
                            {opt.badge && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <div className="font-mono font-bold mt-0.5 text-slate-100">
                            {formatRupiah(opt.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Harga Produk */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Harga Produk (Rp) *
                    </label>
                    {selectedPriceLabel && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Paket: {selectedPriceLabel}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Nominal harga produk..."
                    value={formData.amount}
                    onChange={e => {
                      setFormData({ ...formData, amount: e.target.value });
                      setSelectedPriceLabel('');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Referrer & Freelancer Code Connection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-teal-400" />
                    <span>Direferensikan Oleh (Referral Freelancer / Pengajak)</span>
                  </label>
                  {freelancers.length > 0 && (
                    <span className="text-[10px] text-teal-400 font-medium">
                      Pilih dari {freelancers.length} Mitra Freelancer
                    </span>
                  )}
                </div>

                {/* Freelancer Quick Selection Chips */}
                {freelancers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-teal-500/20">
                    <span className="text-[10px] text-slate-400 font-semibold w-full block mb-0.5">
                      Pilih Kode Freelancer untuk Hubungkan Otomatis:
                    </span>
                    {freelancers.map(fr => {
                      const isSelected = formData.referrer.toUpperCase().includes(fr.code.toUpperCase());
                      return (
                        <button
                          type="button"
                          key={fr.id}
                          onClick={() => {
                            if (isSelected) {
                              setFormData(prev => ({ ...prev, referrer: '' }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                referrer: fr.code,
                                source: 'Referral'
                              }));
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-500 text-slate-950 font-bold border border-teal-400 shadow'
                              : 'bg-slate-900 border border-slate-800 hover:border-teal-500/60 text-slate-300 hover:text-teal-300'
                          }`}
                        >
                          <Tag className="h-3 w-3" />
                          <span>{fr.code}</span>
                          <span className="text-[10px] opacity-75 font-sans">({fr.name})</span>
                          {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nama orang tua, guru, mitra afiliasi, atau kode referral (cth: DIMAS-EDU)..."
                    value={formData.referrer}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        referrer: val,
                        source: val.trim() && prev.source === 'Organic' ? 'Referral' : prev.source
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 placeholder-slate-500 font-mono"
                  />
                  {formData.referrer && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, referrer: '' }))}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Match indicator */}
                {(() => {
                  const matched = freelancers.find(
                    f => formData.referrer && (
                      f.code.toUpperCase() === formData.referrer.trim().toUpperCase() ||
                      formData.referrer.toUpperCase().includes(f.code.toUpperCase()) ||
                      formData.referrer.toUpperCase().includes(f.name.toUpperCase())
                    )
                  );
                  if (matched) {
                    return (
                      <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-[11px] text-teal-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                          <span>Terhubung ke Freelancer: <strong className="text-teal-200">{matched.name}</strong> ({matched.roleOrSkill})</span>
                        </span>
                        <span className="font-mono font-bold text-teal-300">Komisi {matched.commissionRate || 10}%</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <p className="text-[11px] text-slate-500">
                  Mencatat siapa yang merekomendasikan produk ini untuk komisi otomatis atau analisis kemitraan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Saluran Penjualan</label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Organic">Organik / Website</option>
                    <option value="Referral">Referral / Rekomendasi</option>
                    <option value="Social Media">Media Sosial</option>
                    <option value="B2B">B2B Kemitraan</option>
                    <option value="Direct">Kontak Langsung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Transaksi</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="COMPLETED">Selesai (Completed)</option>
                    <option value="PENDING">Menunggu (Pending)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Catat Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Transaction */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Ubah Data Transaksi</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{editingTx.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              {/* Identitas Pembeli (Buyer, HP, Email) */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Data Pembeli (Buyer)</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Buyer (Nama Pembeli) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>HP (No. HP / WhatsApp)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0812-xxxx-xxxx"
                      value={formData.buyerPhone}
                      onChange={e => setFormData({ ...formData, buyerPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-indigo-400" />
                      <span>Email (Email Pembeli)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="buyer@example.com"
                      value={formData.buyerEmail}
                      onChange={e => setFormData({ ...formData, buyerEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Data Produk & Harga */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Pembelian Produk</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Produk *</label>
                  <div className="space-y-1.5">
                    <select
                      value={formData.productId}
                      onChange={e => handleProductChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Kustom nama produk / paket..."
                      value={formData.productName}
                      onChange={e => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Opsi Harga Paket Produk */}
                <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-indigo-400" />
                    <span>Opsi Pilihan Harga Produk:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentPriceOptions.map(opt => {
                      const isSelected = Number(formData.amount) === opt.price;
                      return (
                        <button
                          type="button"
                          key={opt.label}
                          onClick={() => setFormData(prev => ({ ...prev, amount: String(opt.price) }))}
                          className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-[11px]">{opt.label}</span>
                            {opt.badge && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <div className="font-mono font-bold mt-0.5 text-slate-100">
                            {formatRupiah(opt.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Harga Produk (Nominal Transaksi Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Referrer */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-teal-400" />
                  <span>Direferensikan Oleh (Referrer)</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama referrer atau kode..."
                  value={formData.referrer}
                  onChange={e => setFormData({ ...formData, referrer: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Saluran Penjualan</label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Organic">Organik / Website</option>
                    <option value="Referral">Referral / Rekomendasi</option>
                    <option value="Social Media">Media Sosial</option>
                    <option value="B2B">B2B Kemitraan</option>
                    <option value="Direct">Kontak Langsung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="COMPLETED">Selesai (Completed)</option>
                    <option value="PENDING">Menunggu (Pending)</option>
                    <option value="REFUNDED">Refund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Single Tx */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Hapus Transaksi</h3>
                <p className="text-xs text-slate-400 font-mono">{deletingTx.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Hapus transaksi senilai <strong className="text-white">{formatRupiah(deletingTx.amount)}</strong> untuk pelanggan <strong className="text-white">{deletingTx.customerName}</strong> ({deletingTx.productName})?
            </p>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Clear All Transactions */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Kosongkan Buku Transaksi?</h3>
                <p className="text-xs text-slate-400">Mulai dari 0 entri</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan menghapus semua catatan transaksi kas saat ini ({transactions.length} transaksi) sehingga buku kas bersih dan siap mencatat transaksi riil Anda dari Rp0.
            </p>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Membersihkan...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Ya, Bersihkan Buku Kas</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
