import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  FileCheck,
  Zap,
  Info,
  Layers,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import {
  AIInsight,
  InsightType,
  InsightSeverity,
  InsightStatus,
  DecisionFeedbackResult,
  ActionableTaskDraft,
  DataQualityReport
} from '../types.js';

interface IntelligenceViewProps {
  insights: AIInsight[];
  dataQuality: DataQualityReport | null;
  onUpdateInsightStatus: (insightId: string, status: InsightStatus, decision?: 'ACTED' | 'DISMISSED') => void;
  onRecordFeedback: (insightId: string, result: DecisionFeedbackResult, note: string) => void;
  onOpenCreateTaskModal: (taskDraft?: any) => void;
  onOpenDataQualityModal: () => void;
  onOpenAskValiyo: (presetQuestion?: string) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  insights,
  dataQuality,
  onUpdateInsightStatus,
  onRecordFeedback,
  onOpenCreateTaskModal,
  onOpenDataQualityModal,
  onOpenAskValiyo
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [feedbackModalInsight, setFeedbackModalInsight] = useState<AIInsight | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<DecisionFeedbackResult>('SUCCESS');
  const [feedbackNote, setFeedbackNote] = useState('');

  const categories = [
    { id: 'ALL', label: 'Semua Insight', count: insights.length },
    { id: 'TODAY', label: 'Hari Ini (Prioritas)', count: insights.filter(i => i.priorityScore >= 80).length },
    { id: 'RISKS', label: 'Risiko & Bottleneck', count: insights.filter(i => i.type.includes('RISK') || i.type === 'CONVERSION_PROBLEM').length },
    { id: 'OPPORTUNITIES', label: 'Peluang Pertumbuhan', count: insights.filter(i => i.type.includes('OPPORTUNITY')).length },
    { id: 'PRODUCT', label: 'Produk & Konversi', count: insights.filter(i => i.relatedModule === 'products' || i.relatedProduct).length },
    { id: 'B2B', label: 'Pipeline B2B', count: insights.filter(i => i.type.includes('B2B') || i.relatedModule === 'b2b').length },
    { id: 'EXECUTION', label: 'Alokasi & Eksekusi', count: insights.filter(i => i.type.includes('OPERATIONAL') || i.type.includes('EXECUTION')).length }
  ];

  // Filtering logic
  const filteredInsights = insights.filter(insight => {
    // Category match
    if (activeCategory === 'TODAY' && insight.priorityScore < 80) return false;
    if (activeCategory === 'RISKS' && !(insight.type.includes('RISK') || insight.type === 'CONVERSION_PROBLEM')) return false;
    if (activeCategory === 'OPPORTUNITIES' && !insight.type.includes('OPPORTUNITY')) return false;
    if (activeCategory === 'PRODUCT' && !(insight.relatedModule === 'products' || insight.relatedProduct)) return false;
    if (activeCategory === 'B2B' && !(insight.type.includes('B2B') || insight.relatedModule === 'b2b')) return false;
    if (activeCategory === 'EXECUTION' && !(insight.type.includes('OPERATIONAL') || insight.type.includes('EXECUTION'))) return false;

    // Severity match
    if (selectedSeverity !== 'ALL' && insight.severity !== selectedSeverity) return false;

    // Status match
    if (selectedStatus !== 'ALL' && insight.status !== selectedStatus) return false;

    return true;
  });

  const getSeverityBadge = (severity: InsightSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="rounded bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
            KRITIS
          </span>
        );
      case 'HIGH':
        return (
          <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
            TINGGI
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="rounded bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-300">
            SEDANG
          </span>
        );
      case 'LOW':
        return (
          <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400">
            RENDAH
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: 'HIGH' | 'MEDIUM' | 'LOW', explanation?: string) => {
    let colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    let dotColor = 'bg-emerald-400';
    if (confidence === 'MEDIUM') {
      colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      dotColor = 'bg-amber-400';
    } else if (confidence === 'LOW') {
      colorClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      dotColor = 'bg-rose-400';
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${colorClass}`}
        title={explanation || 'Tingkat keyakinan data'}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        KEYAKINAN {confidence}
      </span>
    );
  };

  const getStatusBadge = (status: InsightStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-blue-300">
            BARU
          </span>
        );
      case 'ACTED':
        return (
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
            DITERAPKAN (TASK DIBUAT)
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-mono text-slate-400">
            DIABAIKAN
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="rounded bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[9px] font-mono font-bold text-teal-300">
            TERSELESAIKAN
          </span>
        );
      default:
        return null;
    }
  };

  const handleApplyInsight = (insight: AIInsight) => {
    if (insight.actionableTaskDraft) {
      onOpenCreateTaskModal(insight.actionableTaskDraft);
    }
    onUpdateInsightStatus(insight.id, 'ACTED', 'ACTED');
  };

  const handleDismissInsight = (insight: AIInsight) => {
    onUpdateInsightStatus(insight.id, 'DISMISSED', 'DISMISSED');
  };

  const handleSaveFeedback = () => {
    if (!feedbackModalInsight) return;
    onRecordFeedback(feedbackModalInsight.id, feedbackResult, feedbackNote);
    setFeedbackModalInsight(null);
    setFeedbackNote('');
  };

  // Learning metrics
  const actedCount = insights.filter(i => i.status === 'ACTED' || i.status === 'RESOLVED').length;
  const successCount = insights.filter(i => i.feedbackResult === 'SUCCESS').length;
  const learningSuccessRate = actedCount > 0 ? Math.round((Math.max(1, successCount) / Math.max(1, actedCount)) * 100) : 75;

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. HEADER & AI LEARNING LOOP BANNER                                        */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  VALIYO INTELLIGENCE ENGINE
                </h2>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/40">
                  V2.0 Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Pemisahan Faktual: [FAKTA] • [INFERENSI] • [REKOMENDASI]
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Data Trust Score Pill */}
            {dataQuality && (
              <button
                onClick={onOpenDataQualityModal}
                className="flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-900/30 transition-all cursor-pointer font-mono"
                title="Buka Audit Kualitas Data"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Data Trust: <strong>{dataQuality.score}%</strong></span>
              </button>
            )}

            <button
              onClick={() => onOpenAskValiyo()}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tanya AI Copilot</span>
            </button>
          </div>
        </div>

        {/* AI Learning Loop Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">TOTAL INSIGHT</span>
            <span className="text-lg font-mono font-bold text-white block mt-0.5">{insights.length} Temuan</span>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">DIAPLIKASIKAN KE TASK</span>
            <span className="text-lg font-mono font-bold text-emerald-400 block mt-0.5">{actedCount} Tindakan</span>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">SUCCESS RATE REKOMENDASI</span>
            <span className="text-lg font-mono font-bold text-teal-300 block mt-0.5">{learningSuccessRate}% Valid</span>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">AI LEARNING LOOP</span>
            <span className="text-xs text-slate-300 block mt-1 font-mono">Feedback Loop Aktif</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATEGORY TABS & FILTER BAR                                             */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`rounded px-1.5 py-0.2 text-[10px] ${
                activeCategory === cat.id ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Severity & Status Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono text-[11px]">Keparahan:</span>
              <select
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Keparahan</option>
                <option value="CRITICAL">Kritis</option>
                <option value="HIGH">Tinggi</option>
                <option value="MEDIUM">Sedang</option>
                <option value="LOW">Rendah</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono text-[11px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="NEW">Baru</option>
                <option value="ACTED">Diterapkan</option>
                <option value="DISMISSED">Diabaikan</option>
                <option value="RESOLVED">Selesai</option>
              </select>
            </div>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            Menampilkan {filteredInsights.length} dari {insights.length} insight terdaftar
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INSIGHTS LIST (EXPLICIT FACT / INFERENCE / RECOMMENDATION FORMAT)        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-12 text-center text-xs text-slate-400 font-mono">
            Tidak ada insight yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          filteredInsights.map(insight => {
            const isExpanded = expandedInsightId === insight.id;

            return (
              <div
                key={insight.id}
                className={`rounded-xl border transition-all duration-200 ${
                  insight.isTopPriority
                    ? 'border-emerald-500/50 bg-slate-950 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                {/* Top Banner for Rank #1 Priority */}
                {insight.isTopPriority && (
                  <div className="flex items-center justify-between bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                      <span className="font-mono font-bold text-emerald-300 uppercase tracking-wider">
                        #1 TOP PRIORITY RECOMMENDATION (SKOR PRIORITAS: {insight.priorityScore}/100)
                      </span>
                    </div>
                    {insight.whyThisIsTop && (
                      <span className="text-[11px] text-emerald-400 font-mono hidden md:inline">
                        {insight.whyThisIsTop}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Title Bar & Badges */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getSeverityBadge(insight.severity)}
                        {getConfidenceBadge(insight.confidence, insight.confidenceExplanation)}
                        {getStatusBadge(insight.status)}
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                          Skor: {insight.priorityScore}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mt-1">
                        {insight.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {insight.status !== 'ACTED' && (
                        <button
                          onClick={() => handleApplyInsight(insight)}
                          className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Terapkan (Buat Task)</span>
                        </button>
                      )}

                      {insight.status === 'NEW' && (
                        <button
                          onClick={() => handleDismissInsight(insight)}
                          className="rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          title="Abaikan rekomendasi ini"
                        >
                          Abaikan
                        </button>
                      )}

                      {insight.status === 'ACTED' && !insight.feedbackResult && (
                        <button
                          onClick={() => setFeedbackModalInsight(insight)}
                          className="flex items-center space-x-1 rounded-lg border border-teal-500/30 bg-teal-950/20 hover:bg-teal-900/30 text-teal-300 px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Beri Feedback Hasil</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 STRICT SECTIONS: [FAKTA], [INFERENSI], [REKOMENDASI] */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* 1. FACT */}
                    <div className="rounded-lg bg-slate-900/90 border border-cyan-500/20 p-3 space-y-1">
                      <div className="flex items-center space-x-1.5 text-cyan-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span>[FAKTA DATABASE]</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-[11px]">
                        {insight.fact}
                      </p>
                    </div>

                    {/* 2. INFERENCE */}
                    <div className="rounded-lg bg-slate-900/90 border border-indigo-500/20 p-3 space-y-1">
                      <div className="flex items-center space-x-1.5 text-indigo-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span>[INFERENSI ANALISIS]</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-[11px]">
                        {insight.inference}
                      </p>
                    </div>

                    {/* 3. RECOMMENDATION */}
                    <div className="rounded-lg bg-slate-900/90 border border-emerald-500/30 p-3 space-y-1">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>[REKOMENDASI FOUNDER]</span>
                      </div>
                      <p className="text-emerald-200 leading-relaxed text-[11px] font-medium">
                        {insight.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Expected Impact & Toggle Detail */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-400 font-mono">Estimasi Dampak:</span>
                      <strong className="text-emerald-400">{insight.expectedImpact}</strong>
                    </div>

                    <button
                      onClick={() => setExpandedInsightId(isExpanded ? null : insight.id)}
                      className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Sembunyikan Rincian Audit' : 'Lihat Data & Kalkulasi (Show Why)'}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expandable "Show Why" Breakdown */}
                  {isExpanded && (
                    <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-4 space-y-3 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-emerald-400 font-bold block mb-1">
                          1. DATA YANG DIGUNAKAN (SOURCE DATA):
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                          {insight.dataUsed.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      {insight.calculation && (
                        <div>
                          <span className="text-amber-400 font-bold block mb-1">
                            2. KALKULASI & FORMULA DETERMINISTIK:
                          </span>
                          <p className="text-slate-300 text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                            {insight.calculation}
                          </p>
                        </div>
                      )}

                      {insight.reasoningSummary && (
                        <div>
                          <span className="text-teal-400 font-bold block mb-1">
                            3. RINGKASAN PENALARAN (REASONING SUMMARY):
                          </span>
                          <p className="text-slate-300 text-[11px]">
                            {insight.reasoningSummary}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Basis Kepercayaan Data: {insight.confidenceExplanation}</span>
                        <span>ID: {insight.id}</span>
                      </div>
                    </div>
                  )}

                  {/* Feedback Result Pill if already logged */}
                  {insight.feedbackResult && (
                    <div className="rounded-lg bg-teal-950/20 border border-teal-500/30 p-2.5 text-xs text-teal-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-400" />
                        <span>Hasil Feedback Keputusan: <strong>{insight.feedbackResult}</strong></span>
                        {insight.feedbackNote && <span className="text-slate-300">({insight.feedbackNote})</span>}
                      </div>
                      <span className="text-[10px] font-mono text-teal-400">Dicatat dalam Model Pembelajaran AI</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DECISION FEEDBACK MODAL                                                */}
      {/* ========================================================================= */}
      {feedbackModalInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              Catat Hasil Keputusan (AI Feedback Loop)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluasi hasil tindakan untuk insight: "{feedbackModalInsight.title}"
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Hasil Implementasi:</label>
                <select
                  value={feedbackResult}
                  onChange={e => setFeedbackResult(e.target.value as DecisionFeedbackResult)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 font-mono"
                >
                  <option value="SUCCESS">Sukses (Target Tercapai)</option>
                  <option value="PARTIAL">Parsial (Dampak Sebagian)</option>
                  <option value="FAILED">Gagal / Belum Berhasil</option>
                  <option value="UNKNOWN">Belum Dapat Ditentukan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Catatan Evaluasi / Pembelajaran:</label>
                <textarea
                  value={feedbackNote}
                  onChange={e => setFeedbackNote(e.target.value)}
                  placeholder="Contoh: Konversi membaik +18% setelah QRIS diaktifkan..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setFeedbackModalInsight(null)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveFeedback}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Simpan Evaluasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
