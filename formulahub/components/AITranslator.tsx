'use client';

import { useState } from 'react';

const LANGUAGES = ['Excel', 'DAX', 'Power Fx', 'SQL', 'Python'];

export function AITranslator({ initialSearch = '' }: { initialSearch?: string }) {
  const [sourceCode, setSourceCode] = useState(initialSearch);
  const [sourceLang, setSourceLang] = useState('Excel');
  const [targetLang, setTargetLang] = useState('SQL');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; explanation: string | null; source: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceCode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          sourceCode: sourceCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      setResult({
        code: data.data.translatedCode,
        explanation: data.data.explanation,
        source: data.source, // 'database' ou 'llm'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-zinc-900/60 border border-violet-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-violet-900/10">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/40">
          ✨
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">Tradutor de IA</h3>
          <p className="text-sm text-zinc-400">Traduza qualquer fórmula sob demanda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            De (Origem)
          </label>
          <select 
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500/50"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Para (Destino)
          </label>
          <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500/50"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
          Fórmula Original
        </label>
        <textarea
          rows={3}
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          placeholder="Ex: =PROCV(A2; Vendas!A:D; 2; 0)"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
        />
      </div>

      <button
        onClick={handleTranslate}
        disabled={loading || !sourceCode.trim()}
        className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="animate-pulse">Traduzindo (Pode levar alguns segundos)...</span>
        ) : (
          <>
            Gerar Tradução
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </>
        )}
      </button>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 rounded-xl bg-zinc-950 border border-emerald-500/30 relative overflow-hidden">
          {/* Badge: IA vs Database */}
          <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 border-b border-l border-emerald-500/20 px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-bl-xl">
            {result.source === 'database' ? '⚡ Instantâneo (Cache)' : '✨ Gerado por IA'}
          </div>

          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Tradução ({targetLang})
          </label>
          <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {result.code}
          </pre>

          {result.explanation && (
            <div className="mt-5 pt-5 border-t border-zinc-800">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                Explicação
              </label>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {result.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
