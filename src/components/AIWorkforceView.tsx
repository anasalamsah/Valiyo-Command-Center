import React, { useState, useMemo } from 'react';
import {
  Users,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Briefcase,
  HelpCircle,
  Clock,
  Filter
} from 'lucide-react';
import { AIAgent } from '../types.js';

interface AIWorkforceViewProps {
  agents: AIAgent[];
  onOpenAskValiyo: (presetQuestion?: string) => void;
  onRefresh?: () => void;
}

const PRESET_EMOJIS = ['👑', '💼', '🚀', '🤝', '📦', '📚', '🔍', '⚙️', '💻', '⚖️', '🎯', '🛡️'];

export const AIWorkforceView: React.FC<AIWorkforceViewProps> = ({
  agents,
  onOpenAskValiyo,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<AIAgent | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    department: 'Executive Leadership',
    avatar: '👑',
    status: 'ACTIVE' as AIAgent['status'],
    mission: '',
    currentFocus: '',
    recentInsight: '',
    activeDirectives: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Departments for filtering
  const departments = useMemo(() => {
    const set = new Set(agents.map(a => a.department));
    return ['ALL', ...Array.from(set)];
  }, [agents]);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchSearch =
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.currentFocus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = selectedDeptFilter === 'ALL' || agent.department === selectedDeptFilter;

      return matchSearch && matchDept;
    });
  }, [agents, searchQuery, selectedDeptFilter]);

  const activeCount = agents.filter(a => a.status === 'ACTIVE').length;
  const analyzingCount = agents.filter(a => a.status === 'ANALYZING').length;

  const getStatusBadge = (status: AIAgent['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AKTIF</span>
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>ANALISIS</span>
          </span>
        );
      case 'IDLE':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            <span>STANDBY</span>
          </span>
        );
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      role: '',
      name: '',
      department: 'Executive Leadership',
      avatar: '👑',
      status: 'ACTIVE',
      mission: 'Mengawal arahan strategis dan pertumbuhan bisnis Valiyo.',
      currentFocus: 'Meningkatkan efisiensi dan akselerasi milestone.',
      recentInsight: 'Siap mengeksekusi instruksi kerja spesifik.',
      activeDirectives: 'Kawal target pendapatan.\nJaga efisiensi biaya dan SLA.'
    });
    setError(null);
    setIsAddModalOpen(true);
  };

  // Quick Preset for Add
  const applyPreset = (role: string, name: string, dept: string, avatar: string, focus: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      name,
      department: dept,
      avatar,
      currentFocus: focus
    }));
  };

  // Open Edit Modal
  const handleOpenEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    setFormData({
      role: agent.role,
      name: agent.name,
      department: agent.department,
      avatar: agent.avatar || '👔',
      status: agent.status,
      mission: agent.mission,
      currentFocus: agent.currentFocus,
      recentInsight: agent.recentInsight || '',
      activeDirectives: Array.isArray(agent.activeDirectives)
        ? agent.activeDirectives.join('\n')
        : ''
    });
    setError(null);
  };

  // Open Delete Modal
  const handleOpenDelete = (agent: AIAgent) => {
    setDeletingAgent(agent);
    setError(null);
  };

  // Save Add
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.name.trim()) {
      setError('Role dan nama anggota dewan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        activeDirectives: formData.activeDirectives
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      };

      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menambahkan anggota dewan');
      }

      setIsAddModalOpen(false);
      setSuccessMsg(`Anggota dewan "${formData.role}" berhasil ditambahkan.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    if (!formData.role.trim() || !formData.name.trim()) {
      setError('Role dan nama anggota dewan wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        activeDirectives: formData.activeDirectives
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      };

      const res = await fetch(`/api/agents/${editingAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal memperbarui anggota dewan');
      }

      setEditingAgent(null);
      setSuccessMsg(`Data dewan "${formData.role}" berhasil diperbarui.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingAgent) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/agents/${deletingAgent.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menghapus anggota dewan');
      }

      const deletedRole = deletingAgent.role;
      setDeletingAgent(null);
      setSuccessMsg(`Anggota dewan "${deletedRole}" berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghapus');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="ai-workforce-board" className="space-y-6 pb-12">
      {/* Header & Control Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xl text-indigo-400">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  Dewan Eksekutif (Board)
                </h1>
                <span className="rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono font-bold">
                  {agents.length} Posisi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengarah strategis AI per departemen (CEO, CFO, CMO, dll) pengawal target Rp1 Miliar Valiyo OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Tambah Anggota Board</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenAskValiyo('Konsultasi strategi mingguan dengan seluruh dewan eksekutif AI')
              }
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Konsultasi Dewan</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-850">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari posisi, nama, atau fokus..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {departments.map(dept => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedDeptFilter === dept
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {dept === 'ALL' ? 'Semua Departemen' : dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Cards Grid */}
      {filteredAgents.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Tidak ada anggota dewan yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter departemen.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptFilter('ALL');
            }}
            className="mt-3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 hover:bg-slate-800"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 hover:border-slate-700 p-4.5 flex flex-col justify-between transition-all shadow-sm space-y-4"
            >
              {/* Card Top: Avatar, Role, Name, Status, and Controls */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-xl shadow-inner flex-shrink-0">
                      {agent.avatar || '👔'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 leading-tight">
                        {agent.role}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {agent.name}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      title="Edit Anggota Dewan"
                      onClick={() => handleOpenEdit(agent)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Hapus Anggota Dewan"
                      onClick={() => handleOpenDelete(agent)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges: Department & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-500/20 truncate">
                    {agent.department}
                  </span>
                  {getStatusBadge(agent.status)}
                </div>

                {/* Mission */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {agent.mission}
                </p>

                {/* Current Focus */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 p-2.5 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Fokus Strategis:
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-snug">
                    {agent.currentFocus}
                  </p>
                </div>

                {/* Recent Insight Quote */}
                {agent.recentInsight && (
                  <div className="text-[11px] text-slate-300 italic border-l-2 border-emerald-500/60 pl-2.5 py-0.5 leading-snug">
                    "{agent.recentInsight}"
                  </div>
                )}

                {/* Directives */}
                {agent.activeDirectives && agent.activeDirectives.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                      Direktif Aktif:
                    </span>
                    <ul className="space-y-1">
                      {agent.activeDirectives.slice(0, 2).map((dir, idx) => (
                        <li key={idx} className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-tight">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span className="line-clamp-2">{dir}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer: Run time & Tanya Agen button */}
              <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{agent.lastRunTime || 'Aktif'}</span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onOpenAskValiyo(
                      `Tanya ke ${agent.role} (${agent.name}): Apa evaluasi strategis dan rekomendasi taktis Anda saat ini mengenai: "${agent.currentFocus}"?`
                    )
                  }
                  className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>Tanya Agen</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah Anggota Dewan */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Tambah Anggota Board Eksekutif</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                Preset Posisi Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset('CTO Agent', 'Tech & Architecture Architect', 'Technology & Platform', '💻', 'Menjaga reliabilitas server 99.9% dan keamanan data')
                  }
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300"
                >
                  + CTO Agent
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset('COO Agent', 'Execution & Scale Officer', 'Operations & Logistics', '⚙️', 'Menghilangkan bottleneck produksi & delivery kurikulum')
                  }
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300"
                >
                  + COO Agent
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset('Legal & Compliance', 'Governance & Risk Counsel', 'Finance & Governance', '⚖️', 'Audit kontrak kerja sama institusi B2B dan MoU')
                  }
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300"
                >
                  + Legal Agent
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset('Customer Success Lead', 'Student & Parent Advocate', 'Customer Experience', '🎯', 'Memonitor kepuasan siswa dan mencegah churn')
                  }
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300"
                >
                  + CX Agent
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Posisi / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: CTO Agent"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Karakter / Persona *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Platform Architect"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Departemen</label>
                  <input
                    type="text"
                    placeholder="Contoh: Technology & Platform"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="ANALYZING">Analisis</option>
                    <option value="IDLE">Standby</option>
                  </select>
                </div>
              </div>

              {/* Avatar Emoji Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar / Simbol</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-center text-lg focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PRESET_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: emoji })}
                        className={`h-8 w-8 rounded-lg border text-sm flex items-center justify-center transition-colors ${
                          formData.avatar === emoji
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fokus Strategis Saat Ini</label>
                <input
                  type="text"
                  placeholder="Contoh: Mengoptimalkan arsitektur server untuk lonjakan siswa baru"
                  value={formData.currentFocus}
                  onChange={e => setFormData({ ...formData, currentFocus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Misi & Tanggung Jawab Utama</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan peran spesifik agen ini dalam menjaga operasional bisnis..."
                  value={formData.mission}
                  onChange={e => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Direktif Mandat (1 per baris)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh:&#10;Kawal uptime platform di atas 99.9%&#10;Selesaikan insiden dalam waktu <15 menit"
                  value={formData.activeDirectives}
                  onChange={e => setFormData({ ...formData, activeDirectives: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-none"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambah ke Dewan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Anggota Dewan */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Edit Anggota Board Eksekutif</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{editingAgent.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAgent(null)}
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

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Posisi / Role *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Karakter / Persona *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Departemen</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="ANALYZING">Analisis</option>
                    <option value="IDLE">Standby</option>
                  </select>
                </div>
              </div>

              {/* Avatar Emoji Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar / Simbol</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-center text-lg focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PRESET_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: emoji })}
                        className={`h-8 w-8 rounded-lg border text-sm flex items-center justify-center transition-colors ${
                          formData.avatar === emoji
                            ? 'bg-indigo-600/30 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fokus Strategis Saat Ini</label>
                <input
                  type="text"
                  value={formData.currentFocus}
                  onChange={e => setFormData({ ...formData, currentFocus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Misi & Tanggung Jawab Utama</label>
                <textarea
                  rows={2}
                  value={formData.mission}
                  onChange={e => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Temuan Terakhir (Insight)</label>
                <input
                  type="text"
                  value={formData.recentInsight}
                  onChange={e => setFormData({ ...formData, recentInsight: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Direktif Mandat (1 per baris)</label>
                <textarea
                  rows={3}
                  value={formData.activeDirectives}
                  onChange={e => setFormData({ ...formData, activeDirectives: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Dewan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation (In-App, No window.confirm) */}
      {deletingAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Hapus Anggota Dewan</h3>
                <p className="text-xs text-slate-400 font-mono">{deletingAgent.id}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Hapus posisi <strong className="text-white font-semibold">{deletingAgent.role}</strong> ({deletingAgent.name}) dari jajaran Board Eksekutif?
            </p>
            <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              Agen ini tidak lagi berpartisipasi dalam orkestrasi otomatis dan konsultasi dewan.
            </p>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAgent(null)}
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

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 border border-indigo-500/40 text-indigo-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
