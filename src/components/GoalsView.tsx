import React, { useState, useMemo } from 'react';
import {
  Target,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  X,
  Check
} from 'lucide-react';
import { Goal, GoalLevel, GoalStatus } from '../types.js';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters.js';

interface GoalsViewProps {
  goals: Goal[];
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onRefresh?: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onUpdateGoal, onRefresh }) => {
  const [selectedLevel, setSelectedLevel] = useState<GoalLevel | 'ALL'>('ALL');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  // Form states for editing
  const [editFormData, setEditFormData] = useState({
    name: '',
    level: 'QUARTER' as GoalLevel,
    period: 'Q3 2026',
    target: 0,
    actual: 0,
    owner: 'Anas',
    deadline: '2026-12-31'
  });

  // Form states for adding
  const [addFormData, setAddFormData] = useState({
    name: '',
    level: 'QUARTER' as GoalLevel,
    period: 'Q3 2026',
    target: 50000000,
    actual: 0,
    owner: 'Anas',
    deadline: '2026-12-31'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const levels: { id: GoalLevel | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Semua Hirarki' },
    { id: 'YEAR', label: '1. Year (Tahunan)' },
    { id: 'QUARTER', label: '2. Quarter (Kuartalan)' },
    { id: 'MONTH', label: '3. Month (Bulanan)' }
  ];

  // Dynamically find North Star goal (level === 'YEAR' or first goal)
  const northStarGoal = useMemo(() => {
    return (
      goals.find(g => g.level === 'YEAR') ||
      goals[0] || {
        id: 'north-star-default',
        name: 'Target Revenue 1 Miliar (1 Tahun ke Depan)',
        level: 'YEAR' as GoalLevel,
        period: 'Sep 2026 - Agu 2027 (1 Tahun)',
        target: 1000000000,
        actual: 0,
        achievementRate: 0,
        status: 'YELLOW' as GoalStatus,
        owner: 'Anas (Founder)',
        deadline: '2027-08-31'
      }
    );
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter(g => (selectedLevel === 'ALL' ? true : g.level === selectedLevel));
  }, [goals, selectedLevel]);

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditFormData({
      name: goal.name,
      level: goal.level,
      period: goal.period,
      target: goal.target,
      actual: goal.actual,
      owner: goal.owner,
      deadline: goal.deadline
    });
    setError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;

    const t = Number(editFormData.target) || 0;
    const a = Number(editFormData.actual) || 0;
    const rate = t > 0 ? a / t : 0;

    let status: GoalStatus = 'YELLOW';
    if (rate >= 0.95) status = 'GREEN';
    else if (rate < 0.75) status = 'RED';

    try {
      setIsSubmitting(true);
      setError(null);

      await onUpdateGoal(editingGoal.id, {
        name: editFormData.name,
        level: editFormData.level,
        period: editFormData.period,
        target: t,
        actual: a,
        achievementRate: rate,
        status,
        owner: editFormData.owner,
        deadline: editFormData.deadline
      });

      setEditingGoal(null);
      setSuccessMsg(`Target "${editFormData.name}" berhasil diperbarui.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim()) {
      setError('Nama target wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData)
      });

      if (!res.ok) {
        throw new Error('Gagal menambahkan sasaran baru');
      }

      setIsAddModalOpen(false);
      setSuccessMsg(`Target "${addFormData.name}" berhasil dibuat.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menambahkan target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingGoal) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/goals/${deletingGoal.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Gagal menghapus target');
      }

      setDeletingGoal(null);
      setSuccessMsg(`Target "${deletingGoal.name}" berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghapus target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case 'GREEN':
        return (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            TERCAPAI / OPTIMAL
          </span>
        );
      case 'YELLOW':
        return (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            DALAM PENGAWALAN
          </span>
        );
      case 'RED':
        return (
          <span className="flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            DI BAWAH TARGET
          </span>
        );
    }
  };

  const northStarPercent = Math.min(
    100,
    northStarGoal.target > 0
      ? Math.round((northStarGoal.actual / northStarGoal.target) * 100)
      : 0
  );

  return (
    <div id="goals-view" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              HIRARKI TARGET BISNIS VALIYO (YEAR → QUARTER → MONTH)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kelola dan set nilai target bisnis, pantau realisasi aktual kas, dan lacak laju ketercapaian secara adaptif
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter */}
          <div className="flex items-center space-x-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            {levels.map(lvl => (
              <button
                type="button"
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  selectedLevel === lvl.id
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <button
            id="btn-add-goal"
            type="button"
            onClick={() => {
              setError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Target Baru</span>
          </button>
        </div>
      </div>

      {/* Dynamic Annual North Star Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/20 p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              NORTH STAR REVENUE ({northStarGoal.period})
            </span>
            <span className="text-xs font-medium text-slate-300">
              {northStarGoal.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              PIC: <strong className="text-slate-200">{northStarGoal.owner}</strong>
            </span>
            <button
              type="button"
              onClick={() => startEdit(northStarGoal)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Edit2 className="h-3 w-3" />
              <span>Set / Edit Target North Star</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-4 my-3">
          <div>
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
              {formatRupiah(northStarGoal.actual)}
            </span>
            <span className="text-sm font-mono text-slate-400 ml-2">
              tercapai dari target <strong className="text-emerald-400">{formatRupiah(northStarGoal.target)}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xl font-mono font-extrabold text-emerald-400">
              {northStarPercent}%
            </span>
            {getStatusBadge(northStarGoal.status)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden mb-2">
          <div
            style={{ width: `${northStarPercent}%` }}
            className={`h-full transition-all duration-500 ${
              northStarPercent >= 90
                ? 'bg-emerald-500'
                : northStarPercent >= 70
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
          <span>Tenggat Waktu: {northStarGoal.deadline}</span>
          <span>
            Sisa Kebutuhan Capaian:{' '}
            <strong className="text-slate-200">
              {formatRupiah(Math.max(0, northStarGoal.target - northStarGoal.actual))}
            </strong>
          </span>
        </div>
      </div>

      {/* Goals List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map(goal => {
          const percent =
            goal.target > 0 ? Math.round((goal.actual / goal.target) * 100) : 0;
          return (
            <div
              key={goal.id}
              className="rounded-2xl border border-slate-850 bg-slate-950 p-4 shadow-sm hover:border-slate-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      {goal.level} • {goal.period}
                    </span>
                    <h3 className="text-xs font-bold text-slate-100">{goal.name}</h3>
                  </div>
                  {getStatusBadge(goal.status)}
                </div>

                {/* Numbers */}
                <div className="flex items-baseline justify-between my-2 font-mono">
                  <div>
                    <span className="text-base font-bold text-white">
                      {formatRupiah(goal.actual)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                      / {formatRupiah(goal.target)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{percent}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-900 border border-slate-850 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${Math.min(100, percent)}%` }}
                    className={`h-full transition-all duration-500 ${
                      percent >= 90
                        ? 'bg-emerald-500'
                        : percent >= 70
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>PIC: {goal.owner}</span>
                <div className="flex items-center space-x-1">
                  <span className="mr-2 text-[10px] text-slate-500">Tenggat: {goal.deadline}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(goal)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Edit Target / Realisasi"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingGoal(goal)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus Target"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Set & Edit Target Bisnis</h3>
                  <p className="text-[11px] text-slate-400">Sesuaikan nominal sasaran & realisasi aktual</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
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
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Sasaran Target *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Hirarki Level
                  </label>
                  <select
                    value={editFormData.level}
                    onChange={e =>
                      setEditFormData({ ...editFormData, level: e.target.value as GoalLevel })
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="YEAR">YEAR (Tahunan)</option>
                    <option value="QUARTER">QUARTER (Kuartalan)</option>
                    <option value="MONTH">MONTH (Bulanan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Periode</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2026, Q3 2026, Oktober 2026"
                    value={editFormData.period}
                    onChange={e => setEditFormData({ ...editFormData, period: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Input with preset chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Nilai Target (Rupiah) *
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {formatRupiahCompact(editFormData.target)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  value={editFormData.target}
                  onChange={e => setEditFormData({ ...editFormData, target: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">Preset Cepat:</span>
                  {[50000000, 100000000, 250000000, 500000000, 1000000000].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setEditFormData({ ...editFormData, target: val })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                    >
                      {formatRupiahCompact(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actual Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Nilai Realisasi Aktual (Rupiah)
                  </label>
                  <span className="text-[11px] font-mono text-indigo-400">
                    {formatRupiahCompact(editFormData.actual)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={editFormData.actual}
                  onChange={e => setEditFormData({ ...editFormData, actual: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Preview Live Calculation */}
              <div className="rounded-xl bg-slate-950 border border-slate-850 p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Kalkulasi Ketercapaian:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {editFormData.target > 0
                      ? ((editFormData.actual / editFormData.target) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Status Proyeksi:</span>
                  <span className="font-mono font-bold text-xs text-slate-200">
                    {editFormData.target > 0 && editFormData.actual / editFormData.target >= 0.95
                      ? '🟢 Optimal (Tercapai)'
                      : editFormData.target > 0 && editFormData.actual / editFormData.target >= 0.75
                      ? '🟡 Dalam Pengawalan'
                      : '🔴 Di Bawah Target'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Pemilik Sasaran (PIC)
                  </label>
                  <input
                    type="text"
                    value={editFormData.owner}
                    onChange={e => setEditFormData({ ...editFormData, owner: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tenggat Waktu
                  </label>
                  <input
                    type="date"
                    value={editFormData.deadline}
                    onChange={e => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="rounded-xl border border-slate-800 bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-750 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Tambah Sasaran Target Baru</h3>
                  <p className="text-[11px] text-slate-400">Definisikan target baru untuk ekosistem Valiyo</p>
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
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Sasaran Target *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Target Penjualan Q4 B2B Kemitraan..."
                  value={addFormData.name}
                  onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Hirarki Level
                  </label>
                  <select
                    value={addFormData.level}
                    onChange={e =>
                      setAddFormData({ ...addFormData, level: e.target.value as GoalLevel })
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="YEAR">YEAR (Tahunan)</option>
                    <option value="QUARTER">QUARTER (Kuartalan)</option>
                    <option value="MONTH">MONTH (Bulanan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Periode</label>
                  <input
                    type="text"
                    placeholder="Contoh: Q4 2026, Oktober 2026"
                    value={addFormData.period}
                    onChange={e => setAddFormData({ ...addFormData, period: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nilai Target (Rupiah) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addFormData.target}
                  onChange={e => setAddFormData({ ...addFormData, target: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Realisasi Awal (Rupiah)
                </label>
                <input
                  type="number"
                  min="0"
                  value={addFormData.actual}
                  onChange={e => setAddFormData({ ...addFormData, actual: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Pemilik Sasaran (PIC)
                  </label>
                  <input
                    type="text"
                    value={addFormData.owner}
                    onChange={e => setAddFormData({ ...addFormData, owner: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tenggat Waktu
                  </label>
                  <input
                    type="date"
                    value={addFormData.deadline}
                    onChange={e => setAddFormData({ ...addFormData, deadline: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-750 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambahkan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Goal Modal */}
      {deletingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-3">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Hapus Sasaran Target?</h3>
                <p className="text-xs text-slate-400 font-mono">{deletingGoal.period}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus target <strong className="text-white">"{deletingGoal.name}"</strong> senilai{' '}
              <strong className="text-white">{formatRupiah(deletingGoal.target)}</strong>?
            </p>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingGoal(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Target'}
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
