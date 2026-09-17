import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Zap,
  Target,
  FileCheck,
  CreditCard,
  Users,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Plus,
  Wallet,
  Calendar,
  Check
} from 'lucide-react';
import {
  HealthScoreBreakdown,
  RevenueForecast,
  ExecutiveInsight,
  Task,
  Product,
  DailyBrief,
  AIInsight,
  MonthlyHistoryItem,
  Transaction,
  Expense
} from '../types.js';
import { formatRupiah, formatRupiahCompact, formatPercentage } from '../utils/formatters.js';

interface CommandCenterProps {
  health: HealthScoreBreakdown;
  forecast: RevenueForecast;
  insights: ExecutiveInsight[];
  v2Insights?: AIInsight[];
  tasks: Task[];
  products: Product[];
  dailyBrief: DailyBrief;
  monthlyHistory?: MonthlyHistoryItem[];
  transactions?: Transaction[];
  expenses?: Expense[];
  onNavigateTab: (tab: any) => void;
  onSelectProduct: (product: Product) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  onOpenCreateTaskModal: (initialData?: Partial<Task>) => void;
  onOpenAskValiyo: (presetQuestion?: string) => void;
  onOpenHealthModal: () => void;
  onOpenQuickAdd?: (defaultTab?: string) => void;
  onResetDemo?: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  health,
  forecast,
  insights,
  v2Insights = [],
  tasks,
  products,
  dailyBrief,
  monthlyHistory = [],
  transactions = [],
  expenses = [],
  onNavigateTab,
  onSelectProduct,
  onUpdateTaskStatus,
  onOpenCreateTaskModal,
  onOpenAskValiyo,
  onOpenHealthModal,
  onOpenQuickAdd,
  onResetDemo
}) => {
  const [revenueFilter, setRevenueFilter] = useState<'total' | 'b2c' | 'b2b'>('total');
  const [showAiDetail, setShowAiDetail] = useState(false);

  // Dynamic calculations from transactions and expenses (Single Source of Truth)
  const completedTxs = useMemo(() => {
    return transactions.filter(t => t.status !== 'REFUNDED');
  }, [transactions]);

  const currentRevenue = useMemo(() => {
    if (completedTxs.length > 0) {
      return completedTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
    return forecast.ytdRevenue || 0;
  }, [completedTxs, forecast.ytdRevenue]);

  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const netCashFlow = currentRevenue - totalSpending;
  const netMarginPct = currentRevenue > 0 ? Math.round((netCashFlow / currentRevenue) * 100) : 0;

  // Check if system is completely empty
  const isEmptyState =
    products.length === 0 &&
    transactions.length === 0 &&
    expenses.length === 0 &&
    (!forecast.ytdRevenue || forecast.ytdRevenue === 0);

  // Top 3 urgent founder priorities
  const topPriorities = useMemo(() => {
    return [...tasks]
      .filter(t => t.status !== 'DONE')
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 3);
  }, [tasks]);

  // Primary strategic AI insight
  const topAiInsight = v2Insights.find(i => i.isTopPriority) || v2Insights[0];

  // Health Score Badge
  const currentOverallScore = (health as any)?.overallScore ?? health?.score ?? 0;
  const healthBadge = useMemo(() => {
    const score = currentOverallScore;
    if (score >= 80) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        label: 'OPTIMAL',
        dot: 'bg-emerald-400'
      };
    }
    if (score >= 65) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        label: 'MONITORING',
        dot: 'bg-amber-400'
      };
    }
    return {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      label: 'DEVIASI',
      dot: 'bg-rose-400'
    };
  }, [currentOverallScore]);

  // Monthly Revenue Chart helpers
  const chartData = useMemo(() => {
    if (!monthlyHistory || monthlyHistory.length === 0) return [];
    const maxVal = Math.max(
      ...monthlyHistory.map(m => Math.max(m.revenue || 0, m.target || 0)),
      100000000
    );
    return monthlyHistory.map(m => {
      let displayValue = m.revenue;
      if (revenueFilter === 'b2c') displayValue = m.b2cRevenue || 0;
      if (revenueFilter === 'b2b') displayValue = m.b2bRevenue || 0;
      return {
        month: m.month,
        actual: displayValue,
        target: m.target,
        actualHeightPct: Math.min(100, Math.round((displayValue / maxVal) * 100)),
        targetHeightPct: Math.min(100, Math.round((m.target / maxVal) * 100))
      };
    });
  }, [monthlyHistory, revenueFilter]);

  // Product visual status
  const getProductStatusIndicator = (p: Product) => {
    const rate = p.monthlyTarget > 0 ? p.monthlyRevenue / p.monthlyTarget : 0;
    if (rate >= 0.8) return { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'OPTIMAL' };
    if (rate >= 0.5) return { dot: 'bg-amber-400', text: 'text-amber-400', label: 'WASPADA' };
    return { dot: 'bg-rose-400', text: 'text-rose-400', label: 'TERTINGGAL' };
  };

  // Empty State: Simple, clean setup view
  if (isEmptyState) {
    return (
      <div id="command-center-empty" className="space-y-6">
        <div className="p-8 md:p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center max-w-2xl mx-auto">
          <div className="inline-flex p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Valiyo OS Mission Control</h2>
          <p className="text-xs text-slate-400 mt-2 mb-6 max-w-md mx-auto">
            Sistem siap dioperasikan dari 0 (Dimulai 1 September 2026). Catat transaksi kas masuk atau pengeluaran operasional pertama Anda.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6">
            <button
              onClick={() => onOpenQuickAdd ? onOpenQuickAdd('tx') : onNavigateTab('transactions')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              + Catat Transaksi Masuk
            </button>

            <button
              onClick={() => onNavigateTab('spending')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Wallet className="h-4 w-4" />
              + Catat Spending (AI/Zoom)
            </button>
          </div>

          {onResetDemo && (
            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={onResetDemo}
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-400 font-medium transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Muat 110 Transaksi & Data Demo Valiyo (Mulai 1 Sep 2026)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="command-center-root" className="space-y-6">
      {/* 1. TOP HEADER: MISSION CONTROL & LAUNCH STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-base font-bold tracking-tight text-slate-100">
              MISSION CONTROL
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Dimulai 1 Sep 2026
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Data kas riil ditarik langsung dari Buku Transaksi & Pengeluaran Operasional.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Health Score Pill */}
          <button
            id="btn-inspect-health"
            onClick={onOpenHealthModal}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-slate-800/80 ${healthBadge.bg}`}
          >
            <span className={`h-2 w-2 rounded-full ${healthBadge.dot}`} />
            <div className="text-left">
              <span className="font-mono font-bold text-slate-100">{currentOverallScore}/100</span>
              <span className="text-[10px] font-medium ml-1.5 opacity-80">{healthBadge.label}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </button>

          {/* Quick Add Actions */}
          <button
            onClick={() => onOpenQuickAdd ? onOpenQuickAdd('tx') : onNavigateTab('transactions')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Kas Masuk</span>
          </button>

          <button
            onClick={() => onNavigateTab('spending')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>+ Spending</span>
          </button>
        </div>
      </div>

      {/* 2. THE 4 POWER FINANCIAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Revenue Buku Kas */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Realisasi Kas (Sejak 1 Sep)</span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">
              {completedTxs.length} Transaksi
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1.5">
            {formatRupiah(currentRevenue)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Target Rp 1 Miliar</span>
            <span className="text-slate-200 font-bold">
              {formatPercentage(forecast.achievementPercentage)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 mt-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, forecast.achievementPercentage * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Total Spending */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Spending Operasional</span>
            <span className="text-rose-400 font-mono text-[11px] font-medium">
              {expenses.length} Pos Beban
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1.5">
            {formatRupiah(totalSpending)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>AI, Zoom & Freelancer</span>
            <button
              onClick={() => onNavigateTab('spending')}
              className="text-rose-300 hover:underline font-medium"
            >
              Kelola &rarr;
            </button>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 mt-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-rose-500 transition-all"
              style={{
                width: `${currentRevenue > 0 ? Math.min(100, (totalSpending / currentRevenue) * 100) : 0}%`
              }}
            />
          </div>
        </div>

        {/* Metric 3: Arus Kas Bersih (Net Cash Flow) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Arus Kas Bersih (Net)</span>
            <span
              className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                netCashFlow >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {netCashFlow >= 0 ? 'SURPLUS' : 'DEFISIT'}
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1.5 ${
              netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatRupiah(netCashFlow)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Margin Kas: {netMarginPct}%</span>
            <span className="text-slate-300">Setelah Operasional</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${netCashFlow >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(10, netMarginPct))}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Run-Rate & Proyeksi Akhir Tahun */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Run-Rate Menuju Rp 1M</span>
            <span className="text-amber-400 font-mono text-[11px]">Sisa 4 Bulan</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1.5">
            {formatRupiahCompact(forecast.requiredMonthlyRunRate)}
            <span className="text-xs font-normal text-slate-400 font-sans">/bln</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Proyeksi: {formatRupiahCompact(forecast.totalForecast)}</span>
            <span className="text-amber-400 font-semibold">{forecast.forecastStatus}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 mt-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${Math.min(100, (forecast.totalForecast / forecast.annualTarget) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. SIMPLIFIED TWO-COLUMN CORE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Revenue Trajectory Chart & Product Ecosystem (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Revenue Trajectory Bar Chart */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider font-mono">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  Trajektori Kas Bulanan
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Realisasi transaksi vs target run-rate bulanan Rp 83.3 Juta
                </p>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                <button
                  onClick={() => setRevenueFilter('total')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    revenueFilter === 'total' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Total
                </button>
                <button
                  onClick={() => setRevenueFilter('b2c')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    revenueFilter === 'b2c' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  B2C
                </button>
                <button
                  onClick={() => setRevenueFilter('b2b')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    revenueFilter === 'b2b' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  B2B
                </button>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-5">
              <div className="h-40 flex items-end justify-between gap-3 px-1">
                {chartData.map((item, idx) => {
                  const isCurrent = idx === chartData.length - 1;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-slate-200 text-[10px] py-1 px-2 rounded font-mono shadow-xl pointer-events-none z-10 whitespace-nowrap">
                        {item.month}: {formatRupiahCompact(item.actual)} (Target: {formatRupiahCompact(item.target)})
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[32px] rounded-t transition-all duration-300 relative ${
                          isCurrent
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-indigo-600/70 hover:bg-indigo-500'
                        }`}
                        style={{ height: `${Math.max(6, item.actualHeightPct)}%` }}
                      />

                      {/* Month Label */}
                      <div className="text-[10px] font-mono text-slate-400 mt-2 font-medium">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 mt-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
                    <span>Realisasi Kas</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    <span>Mulai 1 Sep 2026</span>
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab('revenue')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  Detail Revenue &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Product Performance Matrix (From Real Transactions) */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider font-mono">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  Kinerja Produk Ekosistem ({products.length})
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ditarik otomatis dari transaksi buku kas
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                Lihat Semua &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {products.slice(0, 4).map(product => {
                const status = getProductStatusIndicator(product);
                const rate = product.monthlyTarget > 0 ? product.monthlyRevenue / product.monthlyTarget : 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onNavigateTab('products');
                    }}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200 truncate group-hover:text-indigo-300">
                        {product.name}
                      </span>
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-slate-900 ${status.text}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-sm font-bold font-mono text-slate-100">
                        {formatRupiah(product.monthlyRevenue || 0)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target: {formatRupiahCompact(product.monthlyTarget || 0)}
                      </span>
                    </div>

                    <div className="h-1 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rate >= 0.8 ? 'bg-emerald-500' : rate >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, rate * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tasks, Health Breakdown, AI Strategic Pulse (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Top 3 Prioritas Eksekusi Founder */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider font-mono">
                  <Target className="h-3.5 w-3.5 text-rose-400" />
                  Prioritas Tindakan Founder
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tugas berbobot tertinggi untuk mendongkrak target 1M
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Semua ({tasks.filter(t => t.status !== 'DONE').length})
              </button>
            </div>

            <div className="space-y-2 pt-3">
              {topPriorities.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  Semua tugas prioritas selesai.
                </div>
              ) : (
                topPriorities.map((task, idx) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                          {task.category}
                        </span>
                        <span>Dampak: {task.impact}/10</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpdateTaskStatus(task.id, 'DONE')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Check className="h-3 w-3" />
                      <span>Selesai</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Fokus: Eksekusi B2B & Upsell Kids</span>
              <button
                onClick={() => onOpenCreateTaskModal()}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 text-xs"
              >
                <Plus className="h-3 w-3" /> Tambah Tugas
              </button>
            </div>
          </div>

          {/* Health Score Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Pilar Kesehatan Bisnis
              </h2>
              <button
                onClick={onOpenHealthModal}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Detail &rarr;
              </button>
            </div>

            <div className="space-y-2.5 pt-3">
              {Object.entries(health.components || {}).map(([catKey, rawData]) => {
                const catData = rawData as { weight: number; score: number; label: string; explanation: string };
                return (
                  <div key={catKey}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium capitalize">
                        {catKey === 'b2b' ? 'B2B Pipeline' : catKey}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-200">{catData.score}</span>
                        <span className={`text-[9px] font-bold px-1 rounded ${
                          catData.score >= 80 ? 'text-emerald-400' : catData.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {catData.label}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          catData.score >= 80 ? 'bg-emerald-500' : catData.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${catData.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategic AI Pulse */}
          {topAiInsight && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 flex-shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200">
                    {topAiInsight.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {topAiInsight.recommendation}
                  </p>

                  {showAiDetail && (
                    <div className="mt-2 pt-2 border-t border-indigo-500/20 text-[11px] text-slate-300 space-y-1 font-mono">
                      <div><strong>Fakta:</strong> {topAiInsight.fact}</div>
                      <div><strong>Inferensi:</strong> {topAiInsight.inference}</div>
                      <div className="text-emerald-400"><strong>Dampak:</strong> {topAiInsight.expectedImpact}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setShowAiDetail(!showAiDetail)}
                      className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      {showAiDetail ? 'Tutup Detail' : 'Mengapa?'}
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => onNavigateTab('intelligence')}
                      className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      Buka Intelligence &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
