import React, { useState, useRef } from 'react';
import {
  Database,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  Server,
  Sparkles,
  Info
} from 'lucide-react';
import {
  Transaction,
  Customer,
  Product,
  Expense,
  Employee,
  Freelancer,
  Task,
  B2BDeal,
  Goal,
  DecisionItem
} from '../types.js';
import {
  saveStateToLocalStorage,
  loadStateFromLocalStorage,
  exportBackupFile,
  LocalStorageSnapshot
} from '../utils/localStorageStore.js';

interface SettingsViewProps {
  transactions: Transaction[];
  customers: Customer[];
  products: Product[];
  expenses: Expense[];
  employees: Employee[];
  freelancers: Freelancer[];
  tasks: Task[];
  b2bDeals: B2BDeal[];
  goals: Goal[];
  decisions: DecisionItem[];
  isDemoMode: boolean;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  transactions,
  customers,
  products,
  expenses,
  employees,
  freelancers,
  tasks,
  b2bDeals,
  goals,
  decisions,
  isDemoMode,
  onRefresh
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download complete backup
  const handleDownloadBackup = () => {
    try {
      const snapshot: LocalStorageSnapshot = {
        version: 1,
        timestamp: new Date().toISOString(),
        transactions,
        customers,
        products,
        expenses,
        employees,
        freelancers,
        tasks,
        b2bDeals,
        goals,
        decisions
      };
      exportBackupFile(snapshot);
      setSyncStatusMsg('Berkas cadangan JSON berhasil diunduh ke perangkat Anda.');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } catch (err: any) {
      setSyncError('Gagal mengunduh cadangan: ' + err.message);
    }
  };

  // Push local state to server (manual force sync)
  const handleForceSyncToServer = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const payload = {
        transactions,
        customers,
        products,
        expenses,
        employees,
        freelancers,
        tasks,
        b2bDeals,
        goals,
        decisions,
        isDemoMode
      };

      const res = await fetch('/api/sync/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      // Also save to localStorage
      saveStateToLocalStorage(payload);

      setSyncStatusMsg('Semua data berhasil disinkronkan ke server & penyimpanan persisten.');
      onRefresh();
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } catch (err: any) {
      setSyncError('Gagal sinkronisasi ke server: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload backup file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Format berkas tidak valid.');
        }

        setIsSyncing(true);
        const res = await fetch('/api/sync/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });

        if (!res.ok) {
          throw new Error('Gagal memulihkan ke server');
        }

        saveStateToLocalStorage(parsed);
        setSyncStatusMsg('Data berhasil dipulihkan dari berkas cadangan!');
        onRefresh();
        setTimeout(() => setSyncStatusMsg(null), 4000);
      } catch (err: any) {
        setSyncError('Gagal membaca berkas cadangan: ' + err.message);
      } finally {
        setIsSyncing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                PENGATURAN & KETAHANAN DATA PERSISTEN
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Manajemen penyimpanan data, sinkronisasi cloud/serverless Vercel, dan pencadangan bisnis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-sync-to-server"
              onClick={handleForceSyncToServer}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
            <button
              id="btn-download-backup"
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-sm transition-all"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Unduh Cadangan (.json)</span>
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-4 py-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {syncError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 px-4 py-2.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{syncError}</span>
          </div>
        )}
      </div>

      {/* Persistence Architecture Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Layer 1: Disk Storage (/tmp) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Server className="h-4 w-4 text-emerald-400" />
              Penyimpanan Server (Disk)
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
              AKTIF
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data transaksi, karyawan, produk, dan pengeluaran langsung ditulis ke berkas disk di server backend setiap kali ada penambahan atau perubahan data.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Lokasi: <span className="text-slate-200">/tmp/valiyo_db.json</span>
          </div>
        </div>

        {/* Layer 2: Browser Local Storage Mirror */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <HardDrive className="h-4 w-4 text-cyan-400" />
              Sinkronisasi Browser
            </span>
            <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-400 font-mono">
              TERLINDUNGI
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Browser menyimpan salinan cadangan instan (LocalStorage). Jika server Vercel mengalami cold start atau instance baru, data otomatis dipulihkan.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Kunci: <span className="text-slate-200">valiyo_os_db_v1</span>
          </div>
        </div>

        {/* Layer 3: Disaster Recovery JSON */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileJson className="h-4 w-4 text-amber-400" />
              Cadangan Mandiri (JSON)
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400 font-mono">
              PORTABEL
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Anda dapat mengunduh seluruh data bisnis Valiyo kapan saja ke dalam berkas JSON mandiri dan memulihkannya di domain atau perangkat mana pun dengan 1 klik.
          </p>
          <div className="pt-2 border-t border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Unggah & Pulihkan dari Berkas JSON...
            </button>
          </div>
        </div>
      </div>

      {/* Live Record Counters */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          STATUS JUMLAH REKAMAN DATA TERKINI
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3">
            <div className="text-[10px] text-slate-400 font-mono">Transaksi</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {transactions.length}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3">
            <div className="text-[10px] text-slate-400 font-mono">Pelanggan</div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
              {customers.length}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3">
            <div className="text-[10px] text-slate-400 font-mono">Pengeluaran</div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
              {expenses.length}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3">
            <div className="text-[10px] text-slate-400 font-mono">Karyawan</div>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
              {employees.length}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3">
            <div className="text-[10px] text-slate-400 font-mono">Freelancer</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {freelancers.length}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-3">
            <div className="text-[10px] text-slate-400 font-mono">Produk Aktif</div>
            <div className="text-lg font-bold text-teal-400 font-mono mt-0.5">
              {products.length}
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory FAQ for the Founder */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Info className="h-4 w-4 text-emerald-400" />
          Mengapa sebelumnya data tidak tersimpan di live domain Vercel?
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Pada hosting serverless seperti Vercel, fungsi server dihidupkan dan dimatikan secara berkala (ephemeral cold-starts). Ketika server baru hidup, memori RAM direset ke kondisi awal.
          <br /><br />
          <strong>Solusi yang kini aktif:</strong> Sistem Valiyo OS telah dilengkapi arsitektur <em>Dual-Layer Auto-Persistence</em>:
        </p>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>
            Setiap transaksi, karyawan baru, atau pengeluaran langsung ditulis ke disk persisten <code>/tmp/valiyo_db.json</code>.
          </li>
          <li>
            Browser Anda juga secara otomatis menyimpan rekaman terenkripsi ke LocalStorage dan siap merehidrasi server seketika jika serverless baru saja reboot.
          </li>
          <li>
            Fitur <strong>Unduh Cadangan</strong> memungkinkan Anda menyimpan arsip lengkap bisnis kapan pun diinginkan.
          </li>
        </ul>
      </div>
    </div>
  );
};
