import React from 'react';
import { Layers, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { NavTab } from './Sidebar.js';

interface PlaceholderViewProps {
  tab: NavTab;
  onNavigateTab: (tab: NavTab) => void;
  customersCount?: number;
  transactionsCount?: number;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  tab,
  onNavigateTab,
  customersCount = 60,
  transactionsCount = 110
}) => {
  const getTabDetails = () => {
    switch (tab) {
      case 'funnel':
        return {
          title: 'CONVERSION & ACQUISITION FUNNEL',
          desc: 'Visualisasi alur konversi dari Pengunjung, Leads, Checkout, hingga Pelanggan Berbayar di seluruh 5 lini produk.',
          phase: 'Fase 2 / 3',
          stats: [
            { label: 'Total Pengunjung September', val: '64.500' },
            { label: 'Total Leads Terkumpul', val: '4.780' },
            { label: 'Total Checkouts', val: '1.240' },
            { label: 'Purchases Konversi', val: '248' }
          ],
          recommendation: 'Lihat data funnel mendalam di Product Cockpit untuk diagnosis per produk.'
        };
      case 'customers':
        return {
          title: 'CUSTOMER INTELLIGENCE & RETENTION',
          desc: 'Database 360° pelanggan aktif (orang tua, siswa, guru, institusi sekolah) dengan riwayat pembelian dan status retensi.',
          phase: 'Fase 3',
          stats: [
            { label: 'Total Database Pelanggan', val: `${customersCount} Akun Terverifikasi` },
            { label: 'Total Transaksi Tercatat', val: `${transactionsCount} Order` },
            { label: 'Retensi Pengguna Aktif', val: '86.4%' },
            { label: 'NPS Kepuasan', val: '72 (Sangat Baik)' }
          ],
          recommendation: 'Valiyo Kids & Students memiliki tingkat retensi tertinggi di atas 88%.'
        };
      case 'ai_workforce':
        return {
          title: 'VALIYO AI WORKFORCE & AUTONOMOUS AGENTS',
          desc: 'Manajemen agen cerdas otomatis untuk penulisan materi belajar, analisis kepuasan siswa, dan otomatisasi followup sekolah.',
          phase: 'Fase 2',
          stats: [
            { label: 'Agen Aktif', val: '4 Agen AI' },
            { label: 'Tugas Terotomatisasi', val: '142 per minggu' },
            { label: 'Penghematan Jam Kerja', val: '~38 jam/minggu' },
            { label: 'Tingkat Akurasi Evaluasi', val: '98.5%' }
          ],
          recommendation: 'Gunakan ASK VALIYO di pojok kanan atas untuk berinteraksi dengan AI Copilot saat ini.'
        };
      case 'content':
        return {
          title: 'CONTENT ENGINE & CURRICULUM PIPELINE',
          desc: 'Pusat produksi kurikulum digital, modul video, lembar kerja siswa, dan audio visualisasi karakter.',
          phase: 'Fase 3',
          stats: [
            { label: 'Modul Aktif Dirilis', val: '320 Modul' },
            { label: 'Materi Dalam Uji Coba', val: '14 Paket' },
            { label: 'Kontributor Pendidik', val: '48 Guru & Mentor' },
            { label: 'Penyelesaian Modul', val: '89%' }
          ],
          recommendation: 'Valiyo OS merekomendasikan menunda redesain kosmetik dan fokus pada distribusi materi yang sudah terbukti laris.'
        };
      case 'experiments':
        return {
          title: 'GROWTH EXPERIMENTS & A/B TESTING',
          desc: 'Pelacakan uji coba harga dinamis, copywriting halaman pendaftaran, dan formula paket bundling antar produk.',
          phase: 'Fase 3',
          stats: [
            { label: 'Eksperimen Berjalan', val: '3 Uji Coba' },
            { label: 'Uji Harga Skill Cicilan', val: 'Tahap Pengumpulan Data' },
            { label: 'Uji Bundling Kids + Students', val: '+24% Minat Awal' },
            { label: 'Signifikansi Statistik', val: '84%' }
          ],
          recommendation: 'Eksperimen checkout 1-klik untuk Valiyo Skill diprioritaskan minggu ini.'
        };
      case 'analytics':
        return {
          title: 'DEEP COHORT & TELEMETRY ANALYTICS',
          desc: 'Analisis kohort retensi bulanan, LTV:CAC per segmen usia, dan distribusi margin kotor produk.',
          phase: 'Fase 3',
          stats: [
            { label: 'LTV/CAC Keseluruhan', val: '5.2x' },
            { label: 'Payback Period', val: '<1.5 Bulan' },
            { label: 'Margin Kotor Rata-rata', val: '83.4%' },
            { label: 'Burn Multiple', val: '0.12 (Sangat Ramping)' }
          ],
          recommendation: 'Kunjungi Cockpit Revenue untuk analisis breakdown finansial lengkap.'
        };
      case 'settings':
        return {
          title: 'SYSTEM CONFIGURATION & OPERATING PARAMETERS',
          desc: 'Konfigurasi parameter operasional Valiyo OS, ambang batas alert, integrasi gateway pembayaran, dan kunci akses eksekutif.',
          phase: 'Konfigurasi Sistem',
          stats: [
            { label: 'Status Runtime', val: 'Node.js Express + Vite SPA' },
            { label: 'Enjin AI', val: 'Gemini 3.8 Flash' },
            { label: 'Protokol Keamanan', val: 'Server-Side API Proxy' },
            { label: 'Mode Operasi', val: 'Founder Autonomous Control' }
          ],
          recommendation: 'Seluruh logika finansial dan skor kesehatan menggunakan formulasi transparan.'
        };
      default:
        return {
          title: 'MODUL SISTEM',
          desc: 'Modul sistem internal Valiyo OS.',
          phase: 'Fase Terjadwal',
          stats: [],
          recommendation: 'Kembali ke Command Center untuk kontrol utama.'
        };
    }
  };

  const info = getTabDetails();

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-slate-100 uppercase tracking-wide">
            {info.title}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">{info.desc}</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">
              STATUS TELEMETRI DATA AKTIF ({info.phase})
            </span>
          </div>
          <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
            Terhubung ke Database Inti
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {info.stats.map((s, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-1"
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                {s.label}
              </span>
              <span className="text-sm font-mono font-bold text-white block">
                {s.val}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3.5 text-xs text-emerald-300 leading-relaxed font-mono flex items-center justify-between">
          <span>💡 <strong>Insight Eksekutif:</strong> {info.recommendation}</span>
          <button
            onClick={() => onNavigateTab('command')}
            className="flex items-center gap-1 text-xs text-white hover:text-emerald-300 font-bold ml-4 shrink-0"
          >
            Ke Command Center <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
