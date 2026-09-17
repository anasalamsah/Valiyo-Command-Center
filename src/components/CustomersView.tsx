import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  DollarSign,
  ShoppingBag,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Customer, Product } from '../types.js';
import { formatRupiah } from '../utils/formatters.js';

interface CustomersViewProps {
  customers: Customer[];
  products: Product[];
  onRefresh: () => void;
  onOpenQuickAdd: (defaultTab?: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  products,
  onRefresh,
  onOpenQuickAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    segment: 'Parent' as Customer['segment'],
    source: 'Organic' as Customer['source'],
    status: 'ACTIVE' as Customer['status']
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);

      const matchesSegment = selectedSegment === 'ALL' || c.segment === selectedSegment;
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

      return matchesSearch && matchesSegment && matchesStatus;
    });
  }, [customers, searchQuery, selectedSegment, selectedStatus]);

  // Aggregate metrics
  const totalSpend = useMemo(() => customers.reduce((acc, c) => acc + (c.totalSpend || 0), 0), [customers]);
  const activeCount = useMemo(() => customers.filter(c => c.status === 'ACTIVE').length, [customers]);
  const avgSpend = customers.length > 0 ? totalSpend / customers.length : 0;

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      segment: 'Parent',
      source: 'Organic',
      status: 'ACTIVE'
    });
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      segment: c.segment,
      source: c.source,
      status: c.status
    });
    setError(null);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Nama pelanggan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan pelanggan');
      }

      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan pelanggan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memperbarui pelanggan');
      }

      setEditingCustomer(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memperbarui pelanggan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (customer: Customer) => {
    setDeletingCustomer(customer);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/customers/${deletingCustomer.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menghapus data pelanggan dari server');
      }

      const deletedName = deletingCustomer.name;
      if (viewingCustomer?.id === deletingCustomer.id) {
        setViewingCustomer(null);
      }
      setDeletingCustomer(null);
      setSuccessMsg(`Pelanggan "${deletedName}" berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus pelanggan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmClearCustomers = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/customers/clear', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Gagal membersihkan daftar pelanggan');
      }
      setIsClearModalOpen(false);
      setViewingCustomer(null);
      setSuccessMsg('Daftar pelanggan telah dibersihkan (mulai dari 0).');
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengosongkan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductName = (pid: string) => {
    const p = products.find(prod => prod.id === pid);
    return p ? p.name : pid;
  };

  return (
    <div id="customers-view" className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Database Pelanggan</h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
              {customers.length} Entitas
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manajemen direktori pelanggan, segmentasi profil, dan riwayat belanja ekosistem Valiyo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {customers.length > 0 && (
            <button
              id="btn-clear-customers"
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Bersihkan seluruh data pelanggan (mulai dari 0)"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bersihkan (0)</span>
            </button>
          )}

          <button
            id="btn-add-customer"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            Tambah Pelanggan
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Pelanggan Aktif</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{activeCount}</div>
            <div className="text-xs text-emerald-400 mt-0.5">
              {customers.length > 0 ? Math.round((activeCount / customers.length) * 100) : 0}% dari total
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Nilai Akumulasi (LTV)</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{formatRupiah(totalSpend)}</div>
            <div className="text-xs text-slate-400 mt-0.5">Semua produk & transaksi</div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Rata-rata Nilai per Pelanggan</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{formatRupiah(avgSpend)}</div>
            <div className="text-xs text-indigo-400 mt-0.5">ARPU konsisten</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="input-customer-search"
            type="text"
            placeholder="Cari nama, email, atau nomor HP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            id="select-segment-filter"
            value={selectedSegment}
            onChange={e => setSelectedSegment(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Segmen</option>
            <option value="Parent">Parent (Keluarga)</option>
            <option value="Student">Student (Siswa)</option>
            <option value="Professional">Professional</option>
            <option value="Teacher">Teacher (Guru)</option>
            <option value="School">School (Sekolah)</option>
          </select>

          <select
            id="select-status-filter"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="LEAD">Calon Pelanggan (Lead)</option>
            <option value="CHURNED">Tidak Aktif (Churned)</option>
          </select>
        </div>
      </div>

      {/* Customer List / Table */}
      {customers.length === 0 ? (
        <div id="customers-empty-state" className="p-12 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center">
          <div className="inline-flex p-4 rounded-full bg-slate-800/50 text-slate-400 mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Belum Ada Pelanggan</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Database pelanggan masih kosong. Mulai input pelanggan pertama Anda atau lakukan transaksi penjualan.
          </p>
          <button
            id="btn-empty-add-customer"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Tambah Pelanggan Baru
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/20 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">Tidak ada pelanggan yang sesuai dengan kriteria pencarian.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Nama & Kontak</th>
                  <th className="py-3 px-4 font-semibold">Segmen</th>
                  <th className="py-3 px-4 font-semibold">Sumber</th>
                  <th className="py-3 px-4 font-semibold">Produk Terdaftar</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Belanja</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map(customer => {
                  return (
                    <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{customer.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{customer.email}</span>
                          <span>•</span>
                          <span>{customer.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {customer.segment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{customer.source}</td>
                      <td className="py-3 px-4">
                        {customer.productsPurchased && customer.productsPurchased.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {customer.productsPurchased.map(pid => (
                              <span key={pid} className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px]">
                                {getProductName(pid)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Belum ada</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                        {formatRupiah(customer.totalSpend || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            customer.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : customer.status === 'LEAD'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit"
                            onClick={() => handleOpenEdit(customer)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Hapus"
                            onClick={() => handleOpenDelete(customer)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
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

      {/* Modal Add Customer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Tambah Pelanggan Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Melati"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rina@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp/HP</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Segmen</label>
                  <select
                    value={formData.segment}
                    onChange={e => setFormData({ ...formData, segment: e.target.value as any })}
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Aktif (Pelanggan)</option>
                    <option value="LEAD">Calon (Lead)</option>
                    <option value="CHURNED">Churned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sumber Akuisisi</label>
                <select
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Organic">Organik (SEO / Web)</option>
                  <option value="Social Media">Media Sosial (Instagram / TikTok)</option>
                  <option value="Referral">Rekomendasi (Word of Mouth)</option>
                  <option value="B2B">B2B / Kemitraan Sekolah</option>
                  <option value="Direct">Kontak Langsung</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Customer */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Ubah Data Pelanggan</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp/HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Segmen</label>
                  <select
                    value={formData.segment}
                    onChange={e => setFormData({ ...formData, segment: e.target.value as any })}
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Aktif (Pelanggan)</option>
                    <option value="LEAD">Calon (Lead)</option>
                    <option value="CHURNED">Churned</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (In-App, No window.confirm) */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Hapus Data Pelanggan</h3>
                <p className="text-xs text-slate-400 font-mono">{deletingCustomer.id}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-2">
              Hapus pelanggan <strong className="text-white font-semibold">{deletingCustomer.name}</strong> ({deletingCustomer.segment})?
            </p>
            <p className="text-xs text-slate-400 mb-6 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              Total riwayat belanja <span className="font-mono text-slate-200">{formatRupiah(deletingCustomer.totalSpend || 0)}</span> dan profil pelanggan ini akan dihapus dari sistem.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
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

      {/* Modal Confirm Clear Customers */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Bersihkan Seluruh Pelanggan?</h3>
                <p className="text-xs text-slate-400">Mulai ulang direktori pelanggan dari 0</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-2">
              Anda akan mengosongkan seluruh <strong className="text-white font-semibold">{customers.length} data pelanggan</strong> dari database.
            </p>
            <p className="text-xs text-slate-400 mb-6 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              Data pelanggan baru akan terdaftar secara otomatis saat Anda mencatat transaksi penjualan produk baru, atau Anda dapat menambahkannya secara manual kapan saja.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
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
                onClick={handleConfirmClearCustomers}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Membersihkan...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Bersihkan (0 Pelanggan)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 border border-indigo-500/40 text-indigo-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
