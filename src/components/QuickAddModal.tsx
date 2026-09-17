import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Users,
  Package,
  Target,
  CheckSquare,
  Briefcase,
  AlertCircle,
  Phone,
  Mail,
  User,
  Tag,
  Share2,
  Check
} from 'lucide-react';
import { Product, Customer, Freelancer } from '../types.js';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  products: Product[];
  customers: Customer[];
  freelancers?: Freelancer[];
  onSuccess: () => void;
}

type AddTab = 'tx' | 'customer' | 'product' | 'goal' | 'task' | 'b2b';

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'tx',
  products,
  customers,
  freelancers = [],
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<AddTab>(
    (defaultTab as AddTab) || 'tx'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [txData, setTxData] = useState({
    customerId: customers[0]?.id || '',
    customerName: customers[0]?.name || '', // Buyer
    hp: customers[0]?.phone || '',           // HP
    email: customers[0]?.email || '',        // Email
    productId: products[0]?.id || 'kids',
    productName: products[0]?.name || 'Valiyo Kids', // Nama Produk
    amount: products[0]?.price ? String(products[0].price) : '150000', // Harga Produk
    source: 'Organic',
    referrer: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [custData, setCustData] = useState({
    name: '',
    email: '',
    phone: '',
    segment: 'Parent',
    source: 'Organic'
  });

  const [prodData, setProdData] = useState({
    name: '',
    category: 'Digital Education',
    price: '250000',
    monthlyTarget: '25000000'
  });

  const [goalData, setGoalData] = useState({
    name: '',
    target: '100000000',
    period: 'Q3 2026',
    owner: 'Anas'
  });

  const [taskData, setTaskData] = useState({
    title: '',
    category: 'Revenue',
    priority: 'HIGH',
    impact: 8,
    urgency: 8,
    owner: 'Anas'
  });

  const [b2bData, setB2BData] = useState({
    institutionName: '',
    contactPerson: '',
    dealValue: '35000000',
    stage: 'PROSPECT',
    owner: 'Rian'
  });

  if (!isOpen) return null;

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txData.customerName.trim()) {
      setError('Buyer (Nama Pembeli) wajib diisi');
      return;
    }
    if (!txData.amount || Number(txData.amount) <= 0) {
      setError('Nominal harga produk harus lebih besar dari 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...txData,
          buyer: txData.customerName.trim(),
          customerName: txData.customerName.trim(),
          hp: txData.hp.trim(),
          buyerPhone: txData.hp.trim(),
          email: txData.email.trim(),
          buyerEmail: txData.email.trim(),
          productName: txData.productName.trim(),
          amount: Number(txData.amount),
          status: 'COMPLETED'
        })
      });
      if (!res.ok) throw new Error('Gagal mencatat transaksi');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custData.name.trim()) {
      setError('Nama pelanggan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...custData, status: 'ACTIVE' })
      });
      if (!res.ok) throw new Error('Gagal menyimpan pelanggan');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodData.name.trim()) {
      setError('Nama produk wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...prodData,
          price: Number(prodData.price),
          monthlyTarget: Number(prodData.monthlyTarget)
        })
      });
      if (!res.ok) throw new Error('Gagal menambah produk');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalData.name.trim()) {
      setError('Nama target wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...goalData,
          target: Number(goalData.target),
          actual: 0
        })
      });
      if (!res.ok) throw new Error('Gagal membuat target');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) {
      setError('Judul tugas wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Gagal membuat tugas');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitB2B = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!b2bData.institutionName.trim()) {
      setError('Nama institusi/sekolah wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...b2bData,
          dealValue: Number(b2bData.dealValue)
        })
      });
      if (!res.ok) throw new Error('Gagal membuat kesepakatan B2B');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-100">Tambah Data Cepat</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex overflow-x-auto border-b border-slate-800 px-4 pt-2 bg-slate-950/20 text-xs no-scrollbar">
          <button
            onClick={() => { setActiveTab('tx'); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'tx'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            Transaksi
          </button>

          <button
            onClick={() => { setActiveTab('customer'); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'customer'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Pelanggan
          </button>

          <button
            onClick={() => { setActiveTab('product'); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'product'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            Produk
          </button>

          <button
            onClick={() => { setActiveTab('goal'); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'goal'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            Target
          </button>

          <button
            onClick={() => { setActiveTab('task'); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'task'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Tugas
          </button>

          <button
            onClick={() => { setActiveTab('b2b'); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'b2b'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Deal B2B
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB: TRANSAKSI */}
          {activeTab === 'tx' && (
            <form onSubmit={handleSubmitTx} className="space-y-3.5">
              {/* Data Buyer & Kontak */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Data Pembeli (Buyer)</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Buyer (Nama Pembeli) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pembeli / wali murid..."
                    value={txData.customerName}
                    onChange={e => setTxData({ ...txData, customerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                  {customers.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Atau pilih:</span>
                      <select
                        value={txData.customerId}
                        onChange={e => {
                          const c = customers.find(cust => cust.id === e.target.value);
                          if (c) {
                            setTxData({
                              ...txData,
                              customerId: c.id,
                              customerName: c.name,
                              hp: c.phone || txData.hp,
                              email: c.email || txData.email
                            });
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Pilih Pelanggan Terdaftar --</option>
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
                      <span>HP (No. HP / WA)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0812-xxxx-xxxx"
                      value={txData.hp}
                      onChange={e => setTxData({ ...txData, hp: e.target.value })}
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
                      placeholder="email@buyer.com"
                      value={txData.email}
                      onChange={e => setTxData({ ...txData, email: e.target.value })}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Produk *</label>
                  <div className="space-y-1.5">
                    <select
                      value={txData.productId}
                      onChange={e => {
                        const p = products.find(prod => prod.id === e.target.value);
                        setTxData({
                          ...txData,
                          productId: e.target.value,
                          productName: p ? p.name : e.target.value,
                          amount: p?.price ? String(p.price) : txData.amount
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                      {products.length === 0 && <option value="general">Produk Standar</option>}
                    </select>
                    <input
                      type="text"
                      placeholder="Nama spesifik / varian produk..."
                      value={txData.productName}
                      onChange={e => setTxData({ ...txData, productName: e.target.value })}
                      className="w-full bg-slate-900/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Opsi Harga Cepat */}
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Tag className="h-3 w-3 text-emerald-400" />
                    <span>Opsi Pilihan Harga Produk:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { label: 'Standar', price: Number(txData.amount) || 150000 },
                      { label: 'Paket 3 Bulan', price: Math.round((Number(txData.amount) || 150000) * 3 * 0.9) },
                      { label: 'Paket 6 Bulan', price: Math.round((Number(txData.amount) || 150000) * 6 * 0.8) },
                      { label: 'Promo Spesial', price: Math.round((Number(txData.amount) || 150000) * 0.85) }
                    ].map((pkg, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setTxData({ ...txData, amount: String(pkg.price) })}
                        className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-[11px] text-slate-300 hover:text-emerald-300 transition-colors"
                      >
                        <span className="block truncate text-[10px] text-slate-400">{pkg.label}</span>
                        <span className="font-mono text-emerald-400 font-bold">Rp{pkg.price.toLocaleString('id-ID')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Harga Produk (Nominal Transaksi Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Harga produk..."
                    value={txData.amount}
                    onChange={e => setTxData({ ...txData, amount: e.target.value })}
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
                      Klik Kode Freelancer untuk Hubungkan Otomatis:
                    </span>
                    {freelancers.map(fr => {
                      const isSelected = txData.referrer.toUpperCase().includes(fr.code.toUpperCase());
                      return (
                        <button
                          type="button"
                          key={fr.id}
                          onClick={() => {
                            if (isSelected) {
                              setTxData(prev => ({ ...prev, referrer: '' }));
                            } else {
                              setTxData(prev => ({
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
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik kode freelancer (cth: DIMAS-EDU) atau nama pereferal..."
                    value={txData.referrer}
                    onChange={e => {
                      const val = e.target.value;
                      setTxData({
                        ...txData,
                        referrer: val,
                        source: val.trim() && txData.source === 'Organic' ? 'Referral' : txData.source
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 placeholder-slate-500 font-mono"
                  />
                  {txData.referrer && (
                    <button
                      type="button"
                      onClick={() => setTxData(prev => ({ ...prev, referrer: '' }))}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Match indicator */}
                {(() => {
                  const matched = freelancers.find(
                    f => txData.referrer && (
                      f.code.toUpperCase() === txData.referrer.trim().toUpperCase() ||
                      txData.referrer.toUpperCase().includes(f.code.toUpperCase()) ||
                      txData.referrer.toUpperCase().includes(f.name.toUpperCase())
                    )
                  );
                  if (matched) {
                    return (
                      <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-[11px] text-teal-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-teal-400" />
                          <span>Terhubung ke Freelancer: <strong className="text-teal-200">{matched.name}</strong> ({matched.roleOrSkill})</span>
                        </span>
                        <span className="font-mono font-bold text-teal-300">Komisi {matched.commissionRate || 10}%</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Saluran</label>
                  <select
                    value={txData.source}
                    onChange={e => setTxData({ ...txData, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Organic">Organik / Web</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Media Sosial</option>
                    <option value="B2B">B2B Kemitraan</option>
                    <option value="Direct">Langsung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={txData.date}
                    onChange={e => setTxData({ ...txData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Langsung'}
              </button>
            </form>
          )}

          {/* TAB: PELANGGAN */}
          {activeTab === 'customer' && (
            <form onSubmit={handleSubmitCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Anita Wijaya"
                  value={custData.name}
                  onChange={e => setCustData({ ...custData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="anita@example.com"
                    value={custData.email}
                    onChange={e => setCustData({ ...custData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. HP / WA</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={custData.phone}
                    onChange={e => setCustData({ ...custData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Segmen</label>
                  <select
                    value={custData.segment}
                    onChange={e => setCustData({ ...custData, segment: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Parent">Parent (Keluarga)</option>
                    <option value="Student">Student (Siswa)</option>
                    <option value="Professional">Professional</option>
                    <option value="Teacher">Teacher (Guru)</option>
                    <option value="School">School (Sekolah)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Saluran Akuisisi</label>
                  <select
                    value={custData.source}
                    onChange={e => setCustData({ ...custData, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Organic">Organic</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Referral">Referral</option>
                    <option value="B2B">B2B</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
              </button>
            </form>
          )}

          {/* TAB: PRODUK */}
          {activeTab === 'product' && (
            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Valiyo Coding Academy"
                  value={prodData.name}
                  onChange={e => setProdData({ ...prodData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={prodData.price}
                    onChange={e => setProdData({ ...prodData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Bulanan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={prodData.monthlyTarget}
                    onChange={e => setProdData({ ...prodData, monthlyTarget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Tambah Produk Baru'}
              </button>
            </form>
          )}

          {/* TAB: TARGET / GOAL */}
          {activeTab === 'goal' && (
            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Target Bisnis *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Target Pendapatan Q4"
                  value={goalData.name}
                  onChange={e => setGoalData({ ...goalData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nominal Target (Rp)</label>
                  <input
                    type="number"
                    required
                    value={goalData.target}
                    onChange={e => setGoalData({ ...goalData, target: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Periode</label>
                  <input
                    type="text"
                    value={goalData.period}
                    onChange={e => setGoalData({ ...goalData, period: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Target Bisnis'}
              </button>
            </form>
          )}

          {/* TAB: TUGAS / TASK */}
          {activeTab === 'task' && (
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Tugas / Eksekusi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Audit alur pembayaran checkout"
                  value={taskData.title}
                  onChange={e => setTaskData({ ...taskData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={taskData.category}
                    onChange={e => setTaskData({ ...taskData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Revenue">Revenue</option>
                    <option value="B2B">B2B</option>
                    <option value="Product">Product</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prioritas</label>
                  <select
                    value={taskData.priority}
                    onChange={e => setTaskData({ ...taskData, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL">Kritis (CRITICAL)</option>
                    <option value="HIGH">Tinggi (HIGH)</option>
                    <option value="MEDIUM">Sedang (MEDIUM)</option>
                    <option value="LOW">Rendah (LOW)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Tambah Tugas Eksekusi'}
              </button>
            </form>
          )}

          {/* TAB: B2B DEAL */}
          {activeTab === 'b2b' && (
            <form onSubmit={handleSubmitB2B} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Institusi / Sekolah *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMA Negeri 1 Surabaya"
                  value={b2bData.institutionName}
                  onChange={e => setB2BData({ ...b2bData, institutionName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nilai Kesepakatan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={b2bData.dealValue}
                    onChange={e => setB2BData({ ...b2bData, dealValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tahap (Stage)</label>
                  <select
                    value={b2bData.stage}
                    onChange={e => setB2BData({ ...b2bData, stage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="PROSPECT">PROSPECT</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="MEETING">MEETING</option>
                    <option value="PROPOSAL">PROPOSAL</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="WON">WON</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Kesepakatan B2B'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
