'use client';

import { useState } from 'react';
import { Operation, Language } from '@/data/formulas';
import { visualizations } from '@/data/visualizations';

const LANGUAGE_CONFIG: Record<Language, { color: string; border: string; badge: string }> = {
  Excel:      { color: 'text-emerald-400', border: 'border-emerald-400', badge: 'bg-emerald-400/10 text-emerald-400' },
  DAX:        { color: 'text-yellow-400',  border: 'border-yellow-400',  badge: 'bg-yellow-400/10 text-yellow-400'  },
  'Power Fx': { color: 'text-purple-400',  border: 'border-purple-400',  badge: 'bg-purple-400/10 text-purple-400'  },
  SQL:        { color: 'text-blue-400',    border: 'border-blue-400',    badge: 'bg-blue-400/10 text-blue-400'      },
  Python:     { color: 'text-sky-400',     border: 'border-sky-400',     badge: 'bg-sky-400/10 text-sky-400'        },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-0.5 rounded-lg hover:bg-zinc-800"
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  );
}

function LanguagePanel({ operation, lang }: { operation: Operation; lang: Language }) {
  const cfg = LANGUAGE_CONFIG[lang];
  const formula = operation.equivalents[lang];
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-zinc-500 mb-1.5 uppercase tracking-widest font-medium">Sintaxe</p>
        <code className={`text-sm font-mono ${cfg.color} block break-all leading-relaxed`}>{formula.syntax}</code>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{formula.description}</p>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Exemplo</p>
          <CopyButton text={formula.example} />
        </div>
        <pre className="text-sm font-mono bg-zinc-950 rounded-xl p-4 text-zinc-300 whitespace-pre-wrap border border-zinc-800/60">
          {formula.example}
        </pre>
      </div>
    </div>
  );
}

export function FormulaCard({
  operation,
  compareMode,
  onVisualize,
}: {
  operation: Operation;
  compareMode: boolean;
  onVisualize: (lang: Language) => void;
}) {
  const [activeLang, setActiveLang] = useState<Language>('Excel');
  const languages = Object.keys(operation.equivalents) as Language[];
  const hasViz = !!visualizations[operation.id];

  return (
    <div
      className="
        group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col
        hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40
        transition-all duration-300
        hover:-translate-y-0.5
      "
    >
      {/* ── Header ── */}
      <div className="p-5 border-b border-zinc-800/80">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-white text-base leading-snug">{operation.name}</h3>
          <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 whitespace-nowrap font-medium">
            {operation.category}
          </span>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-4">{operation.description}</p>

        {/* Botão Ver em ação */}
        {hasViz && (
          <button
            onClick={() => onVisualize(activeLang)}
            className="
              w-full flex items-center justify-center gap-2
              text-sm font-semibold px-4 py-2.5 rounded-xl
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              text-white shadow-md shadow-violet-900/30
              transition-all duration-200
              hover:shadow-lg hover:shadow-violet-900/40
            "
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Ver em ação
          </button>
        )}
      </div>

      {compareMode ? (
        /* ── Modo comparativo ── */
        <div className="divide-y divide-zinc-800/80">
          {languages.map((lang) => {
            const cfg = LANGUAGE_CONFIG[lang];
            return (
              <div key={lang} className="p-5 space-y-3">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                  {lang}
                </span>
                <LanguagePanel operation={operation} lang={lang} />
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Modo tabs ── */
        <>
          <div className="flex border-b border-zinc-800/80">
            {languages.map((lang) => {
              const cfg = LANGUAGE_CONFIG[lang];
              const isActive = activeLang === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`flex-1 text-xs py-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? `${cfg.color} border-b-2 ${cfg.border} -mb-px bg-zinc-800/40`
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
          <div className="p-5 flex-1">
            <LanguagePanel operation={operation} lang={activeLang} />
          </div>
        </>
      )}
    </div>
  );
}
