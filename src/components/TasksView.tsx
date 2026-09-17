import React, { useState } from 'react';
import {
  CheckSquare,
  PlusCircle,
  Filter,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types.js';

interface TasksViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateTaskModal: (initial?: Partial<Task>) => void;
  onOpenAskValiyo: (presetQuestion?: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenCreateTaskModal,
  onOpenAskValiyo
}) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 uppercase">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 uppercase">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="rounded bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-300 uppercase">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-400 uppercase">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              PRIORITAS EKSEKUSI (IMPACT × URGENCY)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Setiap inisiatif memiliki bobot dampak bisnis nyata dan alasan strategis
          </p>
        </div>

        <button
          onClick={() => onOpenCreateTaskModal()}
          className="flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Tambah Inisiatif / Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
          {(['ALL', 'TODO', 'IN PROGRESS', 'DONE'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded px-2.5 py-1 font-mono font-medium transition-all ${
                statusFilter === st
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : st}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2 font-mono">
          <span className="text-slate-400">Prioritas:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-xs text-slate-400">
            Tidak ada task yang sesuai dengan filter.
          </div>
        ) : (
          filteredTasks.map(task => {
            const isDone = task.status === 'DONE';
            return (
              <div
                key={task.id}
                className={`rounded-xl border p-4 transition-all ${
                  isDone
                    ? 'border-slate-900 bg-slate-950/40 opacity-70'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Priority, Title, Score */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(task.priority)}
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        {task.category}
                      </span>
                      <h3
                        className={`text-xs font-semibold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-800">
                        Skor Prioritas: {task.priorityScore} (Dampak {task.impact} × Urgensi {task.urgency})
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* WHY THIS MATTERS */}
                    <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-2 text-xs leading-relaxed">
                      <span className="text-amber-400 font-mono font-bold block mb-0.5 text-[10px] uppercase">
                        MENGAPA INI PENTING:
                      </span>
                      <p className="text-slate-200">{task.whyThisMatters}</p>
                      <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                        Estimasi Dampak: {task.expectedImpact}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400 pt-1">
                      <span>PIC: <strong className="text-slate-300">{task.owner}</strong></span>
                      <span>Tenggat: <strong className="text-slate-300">{task.dueDate}</strong></span>
                      <span>Dibuat oleh: {task.createdBy}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() =>
                        onOpenAskValiyo(
                          `Berikan rencana aksi taktis langkah demi langkah untuk: "${task.title}". Mengapa ini penting: ${task.whyThisMatters}`
                        )
                      }
                      className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-300 transition-colors"
                      title="Konsultasikan ke AI"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                      <span>AI Review</span>
                    </button>

                    <button
                      onClick={() =>
                        onUpdateTaskStatus(
                          task.id,
                          task.status === 'TODO'
                            ? 'IN PROGRESS'
                            : task.status === 'IN PROGRESS'
                            ? 'DONE'
                            : 'TODO'
                        )
                      }
                      className={`rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
                        task.status === 'IN PROGRESS'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          : task.status === 'DONE'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {task.status}
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-300 hover:text-rose-400 transition-colors"
                      title="Hapus Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
