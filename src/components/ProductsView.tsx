import React, { useState } from 'react';
import {
  Package,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Users,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Product } from '../types.js';
import { formatRupiah, formatRupiahCompact, formatPercentage } from '../utils/formatters.js';

interface ProductsViewProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product | null) => void;
  onRunProductDiagnosis: (productId: string) => Promise<any>;
  onRefreshProducts?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onRunProductDiagnosis,
  onRefreshProducts
}) => {
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const healthyCount = products.filter(p => p.status === 'GROWING' || p.status === 'STABLE').length;
  const attentionCount = products.filter(p => p.status === 'AT RISK' || p.status === 'DECLINING').length;

  const handleSyncFromTransactions = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/products/sync', { method: 'POST' });
      if (res.ok) {
        onRefreshProducts?.();
      }
    } catch (err) {
      console.error('Gagal sinkronisasi produk dari transaksi:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/products/clear', { method: 'POST' });
      if (res.ok) {
        setShowClearModal(false);
        onSelectProduct(null);
        onRefreshProducts?.();
      }
    } catch (err) {
      console.error('Gagal membersihkan data produk:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'GROWING':
        return (
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
            GROWING
          </span>
        );
      case 'STABLE':
        return (
          <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-300">
            STABLE
          </span>
        );
      case 'AT RISK':
        return (
          <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
            AT RISK
          </span>
        );
      case 'DECLINING':
        return (
          <span className="rounded bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
            DECLINING
          </span>
        );
    }
  };

  const handleOpenCockpit = async (product: Product) => {
    onSelectProduct(product);
    setDiagnosisResult(null);
    // Auto-run diagnosis on open
    setDiagnosing(true);
    try {
      const diag = await onRunProductDiagnosis(product.id);
      setDiagnosisResult(diag);
    } catch (e) {
      console.error(e);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              PORTOFOLIO PRODUK EKOSISTEM VALIYO
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Data produk disinkronkan langsung dari daftar transaksi buku kas
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-xs font-mono text-slate-400 mr-2 hidden sm:block">
            {products.length === 0 ? (
              <span className="text-slate-500">0 Produk Aktif</span>
            ) : (
              <span>
                Status: <strong className="text-emerald-400">{healthyCount} Sehat</strong> •{' '}
                <strong className="text-amber-400">{attentionCount} Butuh Perhatian</strong>
              </span>
            )}
          </div>

          <button
            onClick={handleSyncFromTransactions}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
            title="Sinkronkan data produk dari transaksi yang ada"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Ambil dari Transaksi'}</span>
          </button>

          {products.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center space-x-1.5 rounded-lg border border-rose-500/40 bg-rose-950/20 px-3 py-1.5 text-xs font-mono font-semibold text-rose-300 hover:bg-rose-900/30 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Bersihkan (0)</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Cards Grid or Zero State */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-12 text-center">
          <Package className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">Data Produk Ekosistem Mulai dari 0</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-mono">
            Data produk ekosistem telah dibersihkan. Setiap transaksi baru yang Anda catat pada menu Transaksi akan otomatis diekstrak menjadi katalog produk, lengkap dengan funnel dan performanya.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSyncFromTransactions}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Ambil & Ekstrak dari Transaksi'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => {
            const isGrowthPositive = product.growthRate >= 0;
            const isConvDown = product.conversionRate < product.previousConversionRate;
            return (
              <div
                key={product.id}
                onClick={() => handleOpenCockpit(product)}
                className="group rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-300 uppercase block mb-0.5">
                        {product.category} • {formatRupiahCompact(product.price)}
                      </span>
                      <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>

                  <div className="my-3 font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block">
                      Pendapatan Bulan Berjalan
                    </span>
                    <div className="text-xl font-bold text-white">
                      {formatRupiah(product.monthlyRevenue)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Target: {formatRupiah(product.monthlyTarget)} (
                      {product.monthlyTarget > 0
                        ? Math.round((product.monthlyRevenue / product.monthlyTarget) * 100)
                        : 0}
                      %)
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-300 block">Pertumbuhan:</span>
                      <span
                        className={`font-semibold flex items-center gap-0.5 ${
                          isGrowthPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isGrowthPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {(product.growthRate * 100).toFixed(1)}% MoM
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-300 block">Konversi:</span>
                      <span
                        className={`font-semibold ${
                          isConvDown ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {(product.conversionRate * 100).toFixed(1)}%{' '}
                        <span className="text-[9px] text-slate-300 font-normal">
                          ({(product.previousConversionRate * 100).toFixed(1)}%)
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-300 block">Pelanggan:</span>
                      <span className="text-slate-200 font-medium">
                        {product.activeCustomers} Aktif
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-300 block">Gross Margin:</span>
                      <span className="text-emerald-400 font-medium">
                        {(product.grossMargin * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 font-medium transition-colors">
                  <span>Buka Product Cockpit</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Clear Products */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  Bersihkan Portofolio Produk Ekosistem?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Tindakan ini akan mengosongkan seluruh daftar produk ekosistem menjadi 0. Anda dapat mengekstrak kembali kapan saja dengan menekan &quot;Ambil dari Transaksi&quot;.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-1.5 text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
              >
                {isClearing ? 'Membersihkan...' : 'Ya, Bersihkan (0)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT COCKPIT SLIDE-OVER / MODAL                                        */}
      {/* ========================================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                    PRODUCT COCKPIT
                  </span>
                  {getStatusBadge(selectedProduct.status)}
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedProduct.category} • Harga Retail: {formatRupiah(selectedProduct.price)} • Margin: {(selectedProduct.grossMargin * 100).toFixed(0)}%
                </p>
              </div>

              <button
                onClick={() => onSelectProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400 block uppercase">REVENUE (SEP)</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {formatRupiah(selectedProduct.monthlyRevenue)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Target: {formatRupiahCompact(selectedProduct.monthlyTarget)}
                </span>
              </div>

              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400 block uppercase">GROWTH MoM</span>
                <span
                  className={`text-base font-bold block mt-0.5 ${
                    selectedProduct.growthRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {(selectedProduct.growthRate * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">Bulan sebelumnya</span>
              </div>

              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400 block uppercase">KONVERSI</span>
                <span
                  className={`text-base font-bold block mt-0.5 ${
                    selectedProduct.conversionRate < selectedProduct.previousConversionRate
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {(selectedProduct.conversionRate * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">
                  Sebelumnya: {(selectedProduct.previousConversionRate * 100).toFixed(1)}%
                </span>
              </div>

              <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3">
                <span className="text-[10px] text-slate-400 block uppercase">PENGGUNA AKTIF</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {selectedProduct.activeCustomers}
                </span>
                <span className="text-[10px] text-emerald-400">Retensi Kuat</span>
              </div>
            </div>

            {/* Funnel Stage Visualization */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 block">
                CONVERSION FUNNEL STAGES
              </span>

              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">1. VISITORS</span>
                  <span className="text-sm font-bold text-white">
                    {selectedProduct.funnel.visitors.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">2. LEADS</span>
                  <span className="text-sm font-bold text-white">
                    {selectedProduct.funnel.leads.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">3. CHECKOUTS</span>
                  <span className="text-sm font-bold text-white">
                    {selectedProduct.funnel.checkouts.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="rounded bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block">4. PURCHASES</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {selectedProduct.funnel.purchases.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* AI DIAGNOSIS: WHAT'S WORKING, WHAT'S NOT, WHAT TO CHANGE */}
            <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase text-emerald-300">
                    DIAGNOSIS PRODUK VALIYO OS AI
                  </span>
                </div>
                <button
                  onClick={() => handleOpenCockpit(selectedProduct)}
                  disabled={diagnosing}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${diagnosing ? 'animate-spin' : ''}`} />
                  Diagnosa Ulang
                </button>
              </div>

              {diagnosing ? (
                <div className="py-6 text-center text-xs font-mono text-slate-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Menganalisis funnel, konversi, dan dinamika pasar...</span>
                </div>
              ) : diagnosisResult ? (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                    <span className="text-emerald-400 font-mono font-bold block mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> APA YANG BEKERJA DENGAN BAIK:
                    </span>
                    <p className="text-slate-200">{diagnosisResult.whatsWorking}</p>
                  </div>

                  <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                    <span className="text-rose-400 font-mono font-bold block mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> MASALAH / BOTTLENECK UTAMA:
                    </span>
                    <p className="text-slate-200">{diagnosisResult.whatsNot}</p>
                  </div>

                  <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                    <span className="text-amber-400 font-mono font-bold block mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> TINDAKAN YANG HARUS DIUBAH HARI INI:
                    </span>
                    <p className="text-slate-200">{diagnosisResult.whatToChange}</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Diagnosis siap dijalankan.</div>
              )}
            </div>

            {/* Recent Activities */}
            <div>
              <span className="text-xs font-mono font-bold uppercase text-slate-300 block mb-2">
                AKTIVITAS TERKINI PRODUK
              </span>
              <div className="space-y-1.5">
                {selectedProduct.recentActivities.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-slate-900 text-xs font-mono"
                  >
                    <span className="text-slate-300">{act.event}</span>
                    <span className="text-slate-300">{act.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
