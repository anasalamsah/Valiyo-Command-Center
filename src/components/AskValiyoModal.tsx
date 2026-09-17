import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Database,
  ArrowRight,
  PlusCircle,
  MessageSquare
} from 'lucide-react';
import { AskValiyoResponse } from '../../server/services/gemini.js';
import { ActionableTaskDraft, ConversationTurn } from '../types.js';

interface AskValiyoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  onAsk: (question: string, history?: ConversationTurn[]) => Promise<any>;
  onCreateTaskDraft?: (taskDraft: any) => void;
}

export const AskValiyoModal: React.FC<AskValiyoModalProps> = ({
  isOpen,
  onClose,
  initialQuestion,
  onAsk,
  onCreateTaskDraft
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    'Kenapa revenue turun bulan ini?',
    'Apa yang harus saya lakukan hari ini?',
    'Deal B2B mana yang harus diprioritaskan?',
    'Bagaimana status pencapaian target Rp1 Miliar?',
    'Di mana bottleneck terbesar konversi produk?'
  ];

  useEffect(() => {
    if (initialQuestion && isOpen) {
      setQuery(initialQuestion);
      handleExecute(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleExecute = async (qText?: string) => {
    const textToAsk = qText || query;
    if (!textToAsk.trim()) return;

    setLoading(true);
    setError(null);
    const userTurn: ConversationTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToAsk,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...conversation, userTurn];
    setConversation(newHistory);
    setQuery('');

    try {
      const response = await onAsk(textToAsk, newHistory);
      const assistantTurn: ConversationTurn = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer || 'Analisis telah disiapkan.',
        timestamp: new Date().toISOString(),
        structuredResponse: response
      };
      setConversation([...newHistory, assistantTurn]);
    } catch (err: any) {
      setError(err.message || 'Gagal memperoleh jawaban AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-emerald-500/40 bg-slate-950 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        {/* Top Section */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    ASK VALIYO OS (AI INTELLIGENCE COPILOT)
                  </h3>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/40">
                    V2 Context-Aware
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Analisis Eksekutif Grounded • Menjaga Konteks Percakapan Multi-turn
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase py-1 mr-1">
              PROMPT CEPAT:
            </span>
            {presets.map(preset => (
              <button
                key={preset}
                onClick={() => handleExecute(preset)}
                className="rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-all font-mono cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Conversation Stream */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {conversation.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-slate-400 font-mono space-y-2">
                <MessageSquare className="h-6 w-6 text-emerald-400 mx-auto" />
                <p>Tanyakan hal strategis terkait performa bisnis, defisit revenue, atau prioritas harian.</p>
              </div>
            )}

            {conversation.map(turn => {
              if (turn.role === 'user') {
                return (
                  <div key={turn.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs text-emerald-100 font-medium">
                      <span className="text-[9px] font-mono text-emerald-400 uppercase block mb-1">FOUNDER:</span>
                      {turn.content}
                    </div>
                  </div>
                );
              }

              const res = turn.structuredResponse;
              return (
                <div key={turn.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> VALIYO INTELLIGENCE ENGINE
                    </span>
                    {res?.confidence && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        KEYAKINAN {res.confidence}
                      </span>
                    )}
                  </div>

                  {/* 1. Answer */}
                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                      1. JAWABAN LANGSUNG:
                    </span>
                    <p className="text-slate-100 text-sm font-medium leading-relaxed">
                      {res?.answer || turn.content}
                    </p>
                  </div>

                  {/* 2. Root cause Why */}
                  {res?.why && (
                    <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                        2. MENGAPA INI TERJADI (ROOT CAUSE):
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {res.why}
                      </p>
                    </div>
                  )}

                  {/* 3. What to do */}
                  {res?.whatToDo && (
                    <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                        3. REKOMENDASI TINDAKAN:
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {res.whatToDo}
                      </p>
                    </div>
                  )}

                  {/* Impact & Actionable Task Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    {res?.expectedImpact && (
                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-400 font-mono">Estimasi Dampak: </span>
                        <strong className="text-emerald-400">{res.expectedImpact}</strong>
                      </div>
                    )}

                    {res?.actionableTaskDraft && onCreateTaskDraft && (
                      <button
                        onClick={() => {
                          onCreateTaskDraft(res.actionableTaskDraft);
                          onClose();
                        }}
                        className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Terapkan Sebagai Task Baru</span>
                      </button>
                    )}
                  </div>

                  {/* Source Facts */}
                  {res?.sourceFacts && res.sourceFacts.length > 0 && (
                    <div className="pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800/80">
                      <span className="block text-slate-500 uppercase mb-1">DATA FAKTUAL YANG DIGUNAKAN:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {res.sourceFacts.map((f: string, idx: number) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center space-y-2">
              <RefreshCw className="h-5 w-5 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs font-mono text-slate-300">
                Menyusun analisis grounded dari seluruh metrik Valiyo OS...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}
        </div>

        {/* Input Form at Bottom */}
        <div className="pt-3 border-t border-slate-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExecute()}
              placeholder="Tuliskan pertanyaan lanjutan atau instruksi (contoh: Buat rencana tindakan untuk Al-Azhar)..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-medium"
            />
            <button
              onClick={() => handleExecute()}
              disabled={loading || !query.trim()}
              className="absolute right-2 rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

