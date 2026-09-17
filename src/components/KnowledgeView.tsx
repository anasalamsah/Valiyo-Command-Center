import React, { useState } from 'react';
import { BookOpen, Search, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { KnowledgeDoc } from '../types.js';

interface KnowledgeViewProps {
  docs: KnowledgeDoc[];
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ docs }) => {
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);

  const filtered = docs.filter(
    d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">
              KNOWLEDGE CENTER — PUSAT PENGETAHUAN & DOKUMEN STRATEGIS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            SOP, strategi harga, playbook penutupan B2B, dan kurikulum pendidikan Valiyo
          </p>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            placeholder="Cari playbook atau SOP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 pl-3 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-emerald-400">
                  {doc.category}
                </span>
                <span>Update: {doc.lastUpdated}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">
                {doc.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {doc.content}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Penulis: {doc.author}</span>
              <span className="text-emerald-400 flex items-center gap-1 font-sans">
                Baca Lengkap <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  {selectedDoc.category}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedDoc.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Ditulis oleh {selectedDoc.author} • Terakhir diperbarui {selectedDoc.lastUpdated}
                </span>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed space-y-3 font-mono bg-slate-900/60 p-4 rounded-lg border border-slate-800 whitespace-pre-line">
              {selectedDoc.content}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
