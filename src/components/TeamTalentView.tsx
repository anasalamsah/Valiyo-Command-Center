import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  Calendar,
  Share2,
  DollarSign,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Tag,
  TrendingUp,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Employee, Freelancer, Transaction, MonthlyReferralRecap } from '../types.js';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters.js';
import { MonthlyReferralRecapView } from './MonthlyReferralRecapView.js';

interface TeamTalentViewProps {
  employees: Employee[];
  freelancers: Freelancer[];
  transactions: Transaction[];
  monthlyReferralRecaps?: MonthlyReferralRecap[];
  onRefresh: () => void;
  onOpenQuickAdd?: (defaultTab?: string) => void;
  onRecordSpending?: (data: { title: string; category: string; amount: number; recipient: string; notes: string }) => void;
}

export const TeamTalentView: React.FC<TeamTalentViewProps> = ({
  employees,
  freelancers,
  transactions,
  monthlyReferralRecaps = [],
  onRefresh,
  onOpenQuickAdd,
  onRecordSpending
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'freelancers' | 'referral-recap'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal Employee states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    role: '',
    joinDate: new Date().toISOString().split('T')[0],
    division: 'Operasional & Kurikulum',
    status: 'FULL_TIME' as Employee['status'],
    email: '',
    phone: '',
    notes: ''
  });

  // Modal Freelancer states
  const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
  const [editingFreelancer, setEditingFreelancer] = useState<Freelancer | null>(null);
  const [freelancerFormData, setFreelancerFormData] = useState({
    name: '',
    code: '',
    roleOrSkill: '',
    joinDate: new Date().toISOString().split('T')[0],
    commissionRate: '10',
    commissionType: 'PERCENTAGE' as Freelancer['commissionType'],
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'employee' | 'freelancer'; id: string; name: string } | null>(null);

  // Calculate freelancer referral performance from live transactions
  const freelancerStats = useMemo(() => {
    const stats = new Map<string, { txCount: number; totalRevenue: number; estimatedCommission: number }>();

    for (const f of freelancers) {
      stats.set(f.id, { txCount: 0, totalRevenue: 0, estimatedCommission: 0 });
    }

    for (const tx of transactions) {
      if (tx.status === 'REFUNDED') continue;
      const refStr = (tx.referrer || '').trim().toUpperCase();
      if (!refStr) continue;

      for (const f of freelancers) {
        const codeUpper = f.code.toUpperCase();
        const nameUpper = f.name.toUpperCase();
        // Match either code or name in referrer string
        if (refStr.includes(codeUpper) || refStr.includes(nameUpper)) {
          const entry = stats.get(f.id) || { txCount: 0, totalRevenue: 0, estimatedCommission: 0 };
          entry.txCount += 1;
          const amt = tx.amount || 0;
          entry.totalRevenue += amt;

          if (f.commissionType === 'FIXED') {
            entry.estimatedCommission += (f.commissionRate || 50000);
          } else {
            const pct = (f.commissionRate || 10) / 100;
            entry.estimatedCommission += Math.round(amt * pct);
          }
          stats.set(f.id, entry);
          break;
        }
      }
    }

    return stats;
  }, [freelancers, transactions]);

  // Totals for header KPIs
  const totalEmployees = employees.length;
  const totalFreelancers = freelancers.length;
  const totalReferralTxs = useMemo(() => {
    let count = 0;
    for (const stat of freelancerStats.values()) {
      count += stat.txCount;
    }
    return count;
  }, [freelancerStats]);

  const totalReferralRevenue = useMemo(() => {
    let rev = 0;
    for (const stat of freelancerStats.values()) {
      rev += stat.totalRevenue;
    }
    return rev;
  }, [freelancerStats]);

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Add/Edit Employee
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      name: '',
      role: '',
      joinDate: new Date().toISOString().split('T')[0],
      division: 'Kurikulum & Pengajaran',
      status: 'FULL_TIME',
      email: '',
      phone: '',
      notes: ''
    });
    setFormError(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmployeeFormData({
      name: emp.name,
      role: emp.role,
      joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
      division: emp.division || 'Operasional',
      status: emp.status || 'FULL_TIME',
      email: emp.email || '',
      phone: emp.phone || '',
      notes: emp.notes || ''
    });
    setFormError(null);
    setIsEmployeeModalOpen(true);
  };

  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeFormData.name.trim() || !employeeFormData.role.trim()) {
      setFormError('Nama dan Role/Posisi karyawan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeFormData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan data karyawan');
      }

      setIsEmployeeModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Add/Edit Freelancer
  const handleOpenAddFreelancer = () => {
    setEditingFreelancer(null);
    setFreelancerFormData({
      name: '',
      code: '',
      roleOrSkill: '',
      joinDate: new Date().toISOString().split('T')[0],
      commissionRate: '10',
      commissionType: 'PERCENTAGE',
      phone: '',
      notes: ''
    });
    setFormError(null);
    setIsFreelancerModalOpen(true);
  };

  const handleOpenEditFreelancer = (fr: Freelancer) => {
    setEditingFreelancer(fr);
    setFreelancerFormData({
      name: fr.name,
      code: fr.code,
      roleOrSkill: fr.roleOrSkill,
      joinDate: fr.joinDate || new Date().toISOString().split('T')[0],
      commissionRate: String(fr.commissionRate ?? 10),
      commissionType: fr.commissionType || 'PERCENTAGE',
      phone: fr.phone || '',
      notes: fr.notes || ''
    });
    setFormError(null);
    setIsFreelancerModalOpen(true);
  };

  const handleSubmitFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancerFormData.name.trim() || !freelancerFormData.code.trim()) {
      setFormError('Nama dan Kode referral unik wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const url = editingFreelancer ? `/api/freelancers/${editingFreelancer.id}` : '/api/freelancers';
      const method = editingFreelancer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...freelancerFormData,
          code: freelancerFormData.code.trim().toUpperCase().replace(/\s+/g, '-'),
          commissionRate: Number(freelancerFormData.commissionRate) || 0
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan data freelancer');
      }

      setIsFreelancerModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setIsSubmitting(true);
      const endpoint = deleteConfirm.type === 'employee' ? `/api/employees/${deleteConfirm.id}` : `/api/freelancers/${deleteConfirm.id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus data');
      setDeleteConfirm(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter lists by search query
  const filteredEmployees = employees.filter(emp => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.division.toLowerCase().includes(q)
    );
  });

  const filteredFreelancers = freelancers.filter(fr => {
    const q = searchQuery.toLowerCase();
    return (
      fr.name.toLowerCase().includes(q) ||
      fr.code.toLowerCase().includes(q) ||
      fr.roleOrSkill.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Tim & Mitra Freelancer</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola struktur karyawan internal dan daftar freelancer dengan kode referral yang terhubung langsung ke pencatatan penjualan baru.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddEmployee}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Karyawan</span>
          </button>
          <button
            onClick={handleOpenAddFreelancer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Tag className="h-4 w-4" />
            <span>Tambah Freelancer & Kode</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Karyawan</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalEmployees} Orang</div>
          <div className="text-[11px] text-slate-500 mt-1">Tim inti internal ekosistem</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Freelancer Terdaftar</span>
            <Tag className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400">{totalFreelancers} Mitra</div>
          <div className="text-[11px] text-slate-500 mt-1">Dengan kode referral unik</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Penjualan Referral</span>
            <Share2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{totalReferralTxs} Transaksi</div>
          <div className="text-[11px] text-slate-500 mt-1">Terhubung dari kode freelancer</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Omzet dari Referral</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{formatRupiahCompact(totalReferralRevenue)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Kontribusi omzet mitra</div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'employees'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Daftar Karyawan ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('freelancers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'freelancers'
                ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Freelancer & Kode Referral ({freelancers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('referral-recap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'referral-recap'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Rekap Komisi Bulanan (Auto-Spend)</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'employees' ? 'Cari nama, role, divisi...' : 'Cari nama, kode referral, skill...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* TAB 1: KARYAWAN */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {filteredEmployees.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Belum ada data karyawan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tambahkan profil karyawan internal beserta role, divisi, dan tanggal bergabung.
              </p>
              <button
                onClick={handleOpenAddEmployee}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Karyawan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(emp => (
                <div
                  key={emp.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-base">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{emp.name}</h4>
                          <span className="text-xs font-medium text-indigo-400">{emp.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditEmployee(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                          title="Edit Karyawan"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'employee', id: emp.id, name: emp.name })}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Tgl Bergabung:</span>
                        </span>
                        <span className="font-mono text-slate-200">{emp.joinDate || '-'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>Divisi:</span>
                        </span>
                        <span className="text-slate-200">{emp.division || 'Operasional'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          <span>Status:</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {emp.status === 'FULL_TIME' ? 'Full Time' : emp.status === 'PART_TIME' ? 'Part Time' : 'Kontrak'}
                        </span>
                      </div>

                      {emp.email && (
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>Email:</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-300 truncate max-w-[150px]">{emp.email}</span>
                        </div>
                      )}

                      {emp.phone && (
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>No HP:</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-300">{emp.phone}</span>
                        </div>
                      )}

                      {emp.notes && (
                        <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 italic">
                          "{emp.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FREELANCER */}
      {activeTab === 'freelancers' && (
        <div className="space-y-4">
          {/* Banner koneksi dengan input transaksi baru */}
          <div className="bg-teal-950/40 border border-teal-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shrink-0">
                <Share2 className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-teal-200">Terhubung Otomatis ke Input Penjualan Baru</h4>
                <p className="text-[11px] text-teal-300/80 mt-0.5 leading-relaxed">
                  Setiap kode referral freelancer di bawah dapat dipilih langsung saat mencatat transaksi di{' '}
                  <span className="font-semibold text-teal-100">Buku Transaksi</span> atau{' '}
                  <span className="font-semibold text-teal-100">Tambah Cepat</span>. Transaksi dan omzet yang memakai kode referral akan terakumulasi secara real-time.
                </p>
              </div>
            </div>
            {onOpenQuickAdd && (
              <button
                onClick={() => onOpenQuickAdd('tx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tes Catat Penjualan</span>
              </button>
            )}
          </div>

          {filteredFreelancers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <Tag className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Belum ada data freelancer</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tambahkan freelancer beserta kode referral unik untuk melacak omzet dan komisi dari masing-masing mitra.
              </p>
              <button
                onClick={handleOpenAddFreelancer}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Freelancer Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFreelancers.map(fr => {
                const stat = freelancerStats.get(fr.id) || { txCount: 0, totalRevenue: 0, estimatedCommission: 0 };
                const isCopied = copiedCode === fr.code;

                return (
                  <div
                    key={fr.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-base">
                            {fr.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100">{fr.name}</h4>
                            <span className="text-xs font-medium text-teal-400">{fr.roleOrSkill}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditFreelancer(fr)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                            title="Edit Freelancer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'freelancer', id: fr.id, name: fr.name })}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                            title="Hapus Freelancer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Kode Referral Box */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-teal-500/30 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-teal-400/80">Kode Referral Unik</div>
                          <div className="font-mono font-bold text-sm text-teal-200">{fr.code}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(fr.code)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Real-time Sales Connection Stats */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Performa Penjualan Terhubung</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] text-slate-500">Penjualan Terbawa:</div>
                            <div className="font-mono font-bold text-slate-100">{stat.txCount} Transaksi</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">Omzet Dihasilkan:</div>
                            <div className="font-mono font-bold text-emerald-400">{formatRupiah(stat.totalRevenue)}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-500">
                              Hak Komisi ({fr.commissionRate || 10}%):
                            </div>
                            <div className="font-mono font-bold text-amber-400">
                              {formatRupiah(stat.estimatedCommission)}
                            </div>
                          </div>

                          {stat.estimatedCommission > 0 && onRecordSpending && (
                            <button
                              onClick={() => {
                                onRecordSpending({
                                  title: `Komisi Freelancer (${fr.name} - ${fr.code})`,
                                  category: 'Komisi Freelancer',
                                  amount: stat.estimatedCommission,
                                  recipient: fr.name,
                                  notes: `Pembayaran komisi referral untuk ${stat.txCount} transaksi buku kas`
                                });
                              }}
                              className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30 transition-all cursor-pointer"
                            >
                              Catat ke Spending
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detail Info */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tgl Bergabung:</span>
                          <span className="font-mono text-slate-300">{fr.joinDate || '-'}</span>
                        </div>
                        {fr.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Kontak:</span>
                            <span className="font-mono text-slate-300">{fr.phone}</span>
                          </div>
                        )}
                        {fr.notes && (
                          <div className="text-[11px] text-slate-500 mt-1 italic">"{fr.notes}"</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REKAP KOMISI REFERRAL BULANAN (AUTO-SPEND) */}
      {activeTab === 'referral-recap' && (
        <MonthlyReferralRecapView
          recaps={monthlyReferralRecaps}
          transactions={transactions}
          freelancers={freelancers}
          onRefresh={async () => {
            onRefresh();
          }}
          onSettlePayout={async (period, freelancerCode, notes) => {
            const res = await fetch('/api/referrals/payouts/settle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                period,
                freelancerCode,
                paymentDate: new Date().toISOString().split('T')[0],
                notes: notes || undefined
              })
            });
            if (!res.ok) throw new Error('Gagal mencatat pembayaran komisi');
            onRefresh();
          }}
          onRevertPayout={async (period, freelancerCode) => {
            const res = await fetch('/api/referrals/payouts/revert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                period,
                freelancerCode
              })
            });
            if (!res.ok) throw new Error('Gagal mengembalikan status komisi');
            onRefresh();
          }}
        />
      )}

      {/* MODAL: TAMBAH / EDIT KARYAWAN */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
              </div>
              <button onClick={() => setIsEmployeeModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEmployee} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Karyawan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={employeeFormData.name}
                  onChange={e => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Jabatan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Head of Education"
                    value={employeeFormData.role}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Join</label>
                  <input
                    type="date"
                    value={employeeFormData.joinDate}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, joinDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Divisi / Departemen</label>
                  <select
                    value={employeeFormData.division}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, division: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Kurikulum & Pengajaran">Kurikulum & Pengajaran</option>
                    <option value="Teknologi & Platform">Teknologi & Platform</option>
                    <option value="Pemasaran & Pertumbuhan">Pemasaran & Pertumbuhan</option>
                    <option value="Operasional & Layanan">Operasional & Layanan</option>
                    <option value="Kemitraan B2B">Kemitraan B2B</option>
                    <option value="Leadership & Strategy">Leadership & Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kepegawaian</label>
                  <select
                    value={employeeFormData.status}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Kontrak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@valiyo.id"
                    value={employeeFormData.email}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Handphone / WA</label>
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={employeeFormData.phone}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan / Tanggung Jawab</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi tugas dan tanggung jawab utama..."
                  value={employeeFormData.notes}
                  onChange={e => setEmployeeFormData({ ...employeeFormData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : editingEmployee ? 'Perbarui Data' : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT FREELANCER */}
      {isFreelancerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-teal-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {editingFreelancer ? 'Edit Data Freelancer' : 'Tambah Freelancer & Kode Referral'}
                </h3>
              </div>
              <button onClick={() => setIsFreelancerModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFreelancer} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Freelancer *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dimas Setiawan"
                  value={freelancerFormData.name}
                  onChange={e => {
                    const name = e.target.value;
                    const autoCode = editingFreelancer
                      ? freelancerFormData.code
                      : name.trim().split(' ')[0].toUpperCase() + '-REF';
                    setFreelancerFormData({
                      ...freelancerFormData,
                      name,
                      code: freelancerFormData.code || autoCode
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kode Referral Unik * <span className="text-teal-400 font-normal">(Digunakan saat input penjualan baru)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DIMAS-EDU, RIAN-VID"
                  value={freelancerFormData.code}
                  onChange={e => setFreelancerFormData({ ...freelancerFormData, code: e.target.value.toUpperCase().replace(/\s+/g, '-') })}
                  className="w-full bg-slate-950 border border-teal-500/50 rounded-xl px-3 py-2 text-xs text-teal-300 font-mono font-bold uppercase focus:outline-none focus:border-teal-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Kode ini akan otomatis muncul sebagai opsi di form tambah penjualan/transaksi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Spesialisasi / Peran</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tutor Matematika, Video Editor"
                    value={freelancerFormData.roleOrSkill}
                    onChange={e => setFreelancerFormData({ ...freelancerFormData, roleOrSkill: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Join</label>
                  <input
                    type="date"
                    value={freelancerFormData.joinDate}
                    onChange={e => setFreelancerFormData({ ...freelancerFormData, joinDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Persentase Komisi (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={freelancerFormData.commissionRate}
                    onChange={e => setFreelancerFormData({ ...freelancerFormData, commissionRate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Handphone / WA</label>
                  <input
                    type="tel"
                    placeholder="0813-xxxx-xxxx"
                    value={freelancerFormData.phone}
                    onChange={e => setFreelancerFormData({ ...freelancerFormData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Informasi rekening bank, portofolio, atau kesepakatan komisi..."
                  value={freelancerFormData.notes}
                  onChange={e => setFreelancerFormData({ ...freelancerFormData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFreelancerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white shadow-lg shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : editingFreelancer ? 'Perbarui Freelancer' : 'Simpan Freelancer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-100">
                Hapus {deleteConfirm.type === 'employee' ? 'Karyawan' : 'Freelancer'}?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus <span className="text-slate-200 font-semibold">{deleteConfirm.name}</span> dari sistem?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
