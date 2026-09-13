'use client';

/**
 * PreviewMockup.tsx — Card estilizado "screenshot do produto".
 *
 * Exibe o PROCV em múltiplas linguagens dentro de um mock de janela de app,
 * funcionando como CTA visual na seção Hero.
 */

import { useState, useMemo } from 'react';
import { operations } from '@/data/formulas';
import type { Language, Operation } from '@/data/formulas';
import { PREVIEW_LANG_STYLE } from './constants';

type Props = {
  onVisualize?: (op: Operation, lang: Language) => void;
};

export function PreviewMockup({ onVisualize }: Props) {
  const previewOp = useMemo(
    () => operations.find((op) => op.id === 'lookup') ?? operations[0],
    [],
  );
  const languages = Object.keys(previewOp.equivalents) as Language[];
  const [activeLang, setActiveLang] = useState<Language>('Excel');
  const activeFormula = previewOp.equivalents[activeLang];
  const activeStyle = PREVIEW_LANG_STYLE[activeLang];

  return (
    <div
      className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-violet-500/30"
      style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}
    >
      {/* Window chrome */}
      <div className="bg-zinc-900 px-5 py-3.5 flex items-center gap-3 border-b border-zinc-800">
        <div className="flex gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-red-500/70" />
          <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/70" />
          <span className="w-3.5 h-3.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs sm:text-sm text-zinc-500 font-medium">FormulaHub — {previewOp.name}</span>
        </div>
      </div>

      {/* Card content */}
      <div className="bg-zinc-900/95 p-5 sm:p-8">
        {/* Card header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-white text-lg sm:text-xl lg:text-2xl">{previewOp.name}</h3>
            <p className="text-sm sm:text-base text-zinc-400 mt-1.5 leading-relaxed">
              {previewOp.description}
            </p>
          </div>
          <span className="shrink-0 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 font-medium">
            {previewOp.category}
          </span>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-zinc-800 mb-5">
          {languages.map((lang) => {
            const style = PREVIEW_LANG_STYLE[lang];
            const isActive = activeLang === lang;
            return (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`flex-1 text-xs sm:text-sm py-3 font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? `${style.text} border-b-2 ${style.border} -mb-px bg-zinc-800/40`
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>

        {/* Formula display */}
        <div className="space-y-4">
          <div>
            <p className="text-xs sm:text-sm text-zinc-500 mb-1.5 uppercase tracking-widest font-medium">Sintaxe</p>
            <code className={`text-sm sm:text-base font-mono ${activeStyle.text} block leading-relaxed break-all`}>
              {activeFormula.syntax}
            </code>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500 mb-2 uppercase tracking-widest font-medium">Exemplo</p>
            <pre className="text-sm sm:text-base font-mono bg-zinc-950 rounded-xl p-4 sm:p-5 text-zinc-300 border border-zinc-800/60 whitespace-pre-wrap break-all overflow-x-auto">
              {activeFormula.example}
            </pre>
          </div>
        </div>

        {/* CTA inside preview */}
        <button
          onClick={() => onVisualize?.(previewOp, activeLang)}
          className="mt-5 w-full flex items-center justify-center gap-2.5 text-sm sm:text-base font-semibold px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Ver em ação
        </button>
      </div>
    </div>
  );
}
