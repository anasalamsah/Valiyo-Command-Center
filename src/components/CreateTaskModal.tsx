import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Sparkles } from 'lucide-react';
import { Task, TaskPriority } from '../types.js';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Partial<Task>) => void;
  initialData?: Partial<Task>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialData
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Task['category']>('Operations');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [impact, setImpact] = useState<number>(8);
  const [urgency, setUrgency] = useState<number>(7);
  const [owner, setOwner] = useState('Anas (Founder)');
  const [dueDate, setDueDate] = useState('2026-09-30');
  const [whyThisMatters, setWhyThisMatters] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Operations');
      setPriority(initialData.priority || 'HIGH');
      setImpact(initialData.impact || 8);
      setUrgency(initialData.urgency || 7);
      setWhyThisMatters(initialData.whyThisMatters || '');
      setExpectedImpact(initialData.expectedImpact || '');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const score = impact * urgency;

  const handleSave = () => {
    if (!title.trim()) return;
    onSaveTask({
      title,
      description,
      category,
      priority,
      impact,
      urgency,
      owner,
      dueDate,
      whyThisMatters: whyThisMatters || 'Dibutuhkan untuk menjaga laju pencapaian target bulanan.',
      expectedImpact: expectedImpact || 'Mendukung efisiensi dan peningkatan omzet bisnis.'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              TAMBAH PRIORITAS EKSEKUSI (TASK)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-medium">Judul Inisiatif / Task</label>
            <input
              type="text"
              placeholder="Contoh: Audit & Sederhanakan Checkout Funnel Valiyo Skill"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Revenue">Revenue & Pricing</option>
              <option value="Product">Product & Funnel</option>
              <option value="B2B">B2B & School Outreach</option>
              <option value="Growth">Growth & Marketing</option>
              <option value="Operations">Operations & Tech</option>
            </select>
          </div>

          {/* Impact & Urgency Sliders */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Skor Prioritas Otomatis:</span>
              <span className="text-sm font-bold text-emerald-400">
                {score} / 100 (Dampak {impact} × Urgensi {urgency})
              </span>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Estimasi Dampak Bisnis (1 - 10):</span>
                <span className="text-white font-bold">{impact}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={impact}
                onChange={e => setImpact(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Tingkat Urgensi Waktu (1 - 10):</span>
                <span className="text-white font-bold">{urgency}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={urgency}
                onChange={e => setUrgency(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-amber-400 block mb-1 font-medium font-mono text-[11px] uppercase">
              Mengapa Ini Penting (Why This Matters):
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan alasan strategis mengapa task ini harus dieksekusi sekarang..."
              value={whyThisMatters}
              onChange={e => setWhyThisMatters(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-emerald-400 block mb-1 font-medium font-mono text-[11px] uppercase">
              Ekspektasi Dampak Nyata:
            </label>
            <input
              type="text"
              placeholder="Contoh: Memulihkan konversi Skill ke 2.8% (+Rp8M-Rp11M per bulan)"
              value={expectedImpact}
              onChange={e => setExpectedImpact(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Penanggung Jawab (PIC)</label>
              <input
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Tenggat Waktu</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm"
          >
            Simpan Task
          </button>
        </div>
      </div>
    </div>
  );
};
