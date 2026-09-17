import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart2,
  Sliders,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  RevenueForecast,
  MonthlyHistoryItem,
  Product,
  B2BDeal,
  Transaction,
  Expense
} from '../types.js';
import { formatRupiah, formatRupiahCompact, formatPercentage } from '../utils/formatters.js';

interface RevenueViewProps {
  forecast: RevenueForecast;
  history: MonthlyHistoryItem[];
  products: Product[];
  b2bDeals: B2BDeal[];
  transactions?: Transaction[];
  expenses?: Expense[];
}

export const RevenueView: React.FC<RevenueViewProps> = ({
  forecast,
  history,
  products,
  b2bDeals,
  transactions = [],
  expenses = []
}) => {
  // Simulator states for founder decision modeling
  const [b2bMultiplier, setB2bMultiplier] = useState<number>(1.0); // 0.5x to 1.5x
  const [b2cAdjustment, setB2cAdjustment] = useState<number>(0); // -10M to +20M per month

  // Compute total simulated forecast
  const simulatedForecastB2B = Math.round(forecast.forecastB2BWeighted * b2bMultiplier);
  const simulatedMonthlyB2C = Math.max(30000000, (forecast.forecastB2C / 3) + b2cAdjustment);
  const simulatedForecastB2C = Math.round(simulatedMonthlyB2C * 3);
  const simulatedTotalForecast = forecast.ytdRevenue + simulatedForecastB2C + simulatedForecastB2B;
  const simulatedGap = forecast.annualTarget - simulatedTotalForecast;

  // Real transactions calculation (Single Source of Truth)
  const completedTxs = useMemo(() => {
    return transactions.filter(t => t.status !== 'REFUNDED');
  }, [transactions]);

  const currentTotalRevenue = useMemo(() => {
    if (completedTxs.length > 0) {
      return completedTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
    return forecast.ytdRevenue || 0;
  }, [completedTxs, forecast.ytdRevenue]);

  const currentTotalOrders = completedTxs.length;
  const aov = currentTotalOrders > 0 ? Math.round(currentTotalRevenue / currentTotalOrders) : 0;

  // Total Spending & Net Cash Flow
  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);
  const netCashFlow = currentTotalRevenue - totalSpending;
  const netMarginPct = currentTotalRevenue > 0 ? Math.round((netCashFlow / currentTotalRevenue) * 100) : 0;

  // Dynamic Revenue Breakdown by channel / source from transactions
  const revenueSources = useMemo(() => {
    if (completedTxs.length === 0) {
      return [
        { name: 'Kanal B2B Sekolah & Yayasan', value: 0, pct: 0, color: 'bg-emerald-500' },
        { name: 'Direct Website & Organic SEO', value: 0, pct: 0, color: 'bg-teal-500' },
        { name: 'Referral Siswa & Komunitas Guru', value: 0, pct: 0, color: 'bg-blue-500' },
        { name: 'Media Sosial & Webinar Edukasi', value: 0, pct: 0, color: 'bg-indigo-500' },
        { name: 'Freelancer & Affiliate Partner', value: 0, pct: 0, color: 'bg-amber-500' },
        { name: 'Partnership Lainnya', value: 0, pct: 0, color: 'bg-purple-500' }
      ];
    }

    const sourceMap = new Map<string, number>();
    for (const tx of completedTxs) {
      const src = tx.source || (tx.referrer ? 'Referral' : 'Direct');
      sourceMap.set(src, (sourceMap.get(src) || 0) + (tx.amount || 0));
    }

    const total = Array.from(sourceMap.values()).reduce((a, b) => a + b, 0);
    const colorMap: Record<string, string> = {
      'B2B': 'bg-emerald-500',
      'Direct': 'bg-teal-500',
      'Referral': 'bg-blue-500',
      'Social Media': 'bg-indigo-500',
      'Freelancer': 'bg-amber-500',
      'Organic': 'bg-cyan-500',
      'Partnership': 'bg-purple-500'
    };

    return Array.from(sourceMap.entries()).map(([name, val]) => ({
      name: name === 'B2B' ? 'Kanal B2B Sekolah & Yayasan' : name === 'Direct' ? 'Direct Website & Online' : name === 'Referral' ? 'Referral & Komunitas' : name,
      value: val,
      pct: total > 0 ? Math.round((val / total) * 1000) / 10 : 0,
      color: colorMap[name] || 'bg-indigo-500'
    })).sort((a, b) => b.value - a.value);
  }, [completedTxs]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              REVENUE COCKPIT & ENGINE FORECAST 2026
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Dimulai 1 Sep 2026
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Bisnis dimulai pada 1 September 2026 • Realisasi kas ditarik otomatis dari buku transaksi
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span>Target Tahunan:</span>
          <strong className="text-emerald-400 font-bold">Rp1.000.000.000</strong>
        </div>
      </div>

      {/* Top 4 Financial Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            REVENUE BUKU KAS (SEJAK 1 SEP 2026)
          </span>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {formatRupiahCompact(currentTotalRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>Progress: {forecast.achievementPercentage}%</span>
            <span className="text-emerald-400 font-semibold">{currentTotalOrders} Transaksi</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            TOTAL SPENDING & OPERASIONAL
          </span>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-1">
            {formatRupiahCompact(totalSpending)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>AI, Zoom & Komisi</span>
            <span className="text-slate-300 font-mono">{expenses.length} Pos Pengeluaran</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            ARUS KAS BERSIH (NET CASH FLOW)
          </span>
          <div className={`text-2xl font-mono font-bold mt-1 ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatRupiahCompact(netCashFlow)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>Margin Bersih: {netMarginPct}%</span>
            <span className={netCashFlow >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {netCashFlow >= 0 ? 'Surplus Kas' : 'Defisit Kas'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            PROYEKSI AKHIR TAHUN
          </span>
          <div className="text-2xl font-mono font-bold text-slate-100 mt-1">
            {formatRupiahCompact(forecast.totalForecast)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
            <span>Status: <strong className="text-amber-400">{forecast.forecastStatus}</strong></span>
            <span>Gap: Rp{((forecast.annualTarget - forecast.totalForecast) / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </div>

      {/* Interactive Forecast Simulator for the Founder */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              SIMULATOR KEPUTUSAN TARGET AKHIR TAHUN (SISA 3 BULAN)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Uji sensitivitas B2B & Retail untuk menutup defisit
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Multiplikator Keberhasilan Closing B2B:</span>
                <span className="text-emerald-400 font-bold">{(b2bMultiplier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.5"
                step="0.1"
                value={b2bMultiplier}
                onChange={e => setB2bMultiplier(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
                <span>Konservatif (30%)</span>
                <span>Normal (100%)</span>
                <span>Agresif (150%)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Penyesuaian Run Rate B2C Bulanan:</span>
                <span className="text-emerald-400 font-bold">
                  {b2cAdjustment >= 0 ? `+Rp${(b2cAdjustment / 1000000).toFixed(0)}M` : `-Rp${Math.abs(b2cAdjustment / 1000000).toFixed(0)}M`}/bln
                </span>
              </div>
              <input
                type="range"
                min="-15000000"
                max="25000000"
                step="5000000"
                value={b2cAdjustment}
                onChange={e => setB2cAdjustment(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
                <span>-Rp15M/bln</span>
                <span>Baseline (Rp54M)</span>
                <span>+Rp25M/bln</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-[11px] text-slate-300 leading-relaxed">
              <strong>Catatan Keputusan:</strong> Mengamankan minimal 3 closing sekolah (nilai total Rp85M) langsung membuat total proyeksi tembus ke <strong>Rp1.002.000.000</strong> tanpa perlu menaikkan anggaran iklan B2C.
            </div>
          </div>

          {/* Real-time Simulated Outcome Box */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                HASIL SIMULASI PROYEKSI AKHIR 2026
              </span>
              <div className="flex items-baseline space-x-3 my-2">
                <span className="text-3xl font-mono font-extrabold text-white">
                  {formatRupiahCompact(simulatedTotalForecast)}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({Math.round((simulatedTotalForecast / forecast.annualTarget) * 100)}% target)
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Realisasi YTD (Terkunci):</span>
                  <span className="text-slate-200">{formatRupiah(forecast.ytdRevenue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Simulasi B2C Sisa (3 Bulan):</span>
                  <span className="text-slate-200">{formatRupiah(simulatedForecastB2C)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Simulasi B2B Sisa:</span>
                  <span className="text-slate-200">{formatRupiah(simulatedForecastB2B)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                {simulatedGap <= 0 ? 'Surplus Sasaran:' : 'Defisit Sisa:'}
              </span>
              <span
                className={`text-sm font-mono font-bold ${
                  simulatedGap <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {simulatedGap <= 0
                  ? `+Rp${Math.abs(simulatedGap).toLocaleString('id-ID')} (TERCAPAI)`
                  : `-Rp${simulatedGap.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Source & Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-3">
            KOMPOSISI PENDAPATAN PER KANAL (SEP 2026)
          </h3>

          <div className="space-y-3">
            {revenueSources.map(source => (
              <div key={source.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{source.name}</span>
                  <div className="space-x-2">
                    <span className="text-slate-400">{formatRupiah(source.value)}</span>
                    <span className="font-bold text-emerald-400">{source.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${source.pct}%` }} className={`h-full ${source.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Revenue Trend Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-3">
            TREN HISTORIS BULANAN (MULAI 1 SEP 2026)
          </h3>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
            {history.slice().reverse().map(item => {
              const diff = item.revenue - item.target;
              const isWin = diff >= 0;
              return (
                <div
                  key={item.month}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{item.month}</span>
                    <span className="text-[10px] text-slate-300 block">
                      B2C: {formatRupiahCompact(item.b2cRevenue)} • B2B: {formatRupiahCompact(item.b2bRevenue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white block">
                      {formatRupiah(item.revenue)}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isWin ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isWin ? '+' : ''}
                      {formatRupiahCompact(diff)} vs target
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
