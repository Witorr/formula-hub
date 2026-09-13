'use client';

/**
 * SpotlightSearch.tsx — Modal de busca estilo Command Palette (Ctrl+K).
 *
 * Responsabilidade única: renderizar o modal de busca rápida.
 * Gerencia apenas interações internas (foco, ESC, seleção de item).
 * Estado de abertura é controlado pelo HomeClient.
 */

import type { Operation } from '@/data/formulas';
import { CATEGORY_CONFIG } from './constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  setSearch: (v: string) => void;
  filtered: Operation[];
  spotlightGenerating: boolean;
  spotlightGenerateError: string | null;
  onSpotlightGenerate: () => void;
  onSelectFormula: (name: string) => void;
};

export function SpotlightSearch({
  isOpen,
  onClose,
  search,
  setSearch,
  filtered,
  spotlightGenerating,
  spotlightGenerateError,
  onSpotlightGenerate,
  onSelectFormula,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] sm:max-h-[80vh] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Input */}
        <div className="flex items-center px-5 sm:px-6 py-2 border-b border-zinc-800/80 bg-zinc-900/50">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            placeholder="Procurar fórmula... Ex: PROCV, SOMASE, IF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none py-4 px-4 text-lg sm:text-xl text-white placeholder-zinc-500 outline-none w-full font-medium"
          />
          <button
            onClick={onClose}
            className="shrink-0 flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-500 hover:text-zinc-300 font-mono"
          >
            <kbd className="bg-zinc-800/80 border border-zinc-700 rounded px-1.5 py-0.5 shadow-sm">ESC</kbd>
            <span className="hidden sm:inline">para fechar</span>
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto p-2 sm:p-3" style={{ scrollbarWidth: 'thin' }}>
          {filtered.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 mx-auto opacity-20">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-zinc-400 font-medium">
                  Nenhuma fórmula encontrada para <span className="text-white">"{search}"</span>
                </p>
                <p className="text-sm text-zinc-600 mt-1">Não está no catálogo, mas a IA pode gerar agora.</p>
              </div>
              {spotlightGenerateError && (
                <p className="text-xs text-red-400 max-w-xs">{spotlightGenerateError}</p>
              )}
              <button
                onClick={onSpotlightGenerate}
                disabled={spotlightGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 hover:border-violet-500/50 text-violet-300 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {spotlightGenerating ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Gerando com IA...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Gerar com Gemini AI
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {search ? 'Resultados da Busca' : 'Fórmulas Disponíveis'}
              </div>
              {filtered.map((op) => (
                <button
                  key={op.name}
                  onClick={() => onSelectFormula(op.name)}
                  className="w-full text-left p-3 hover:bg-zinc-800/80 focus:bg-zinc-800/80 rounded-xl flex items-center justify-between group transition-colors outline-none border border-transparent hover:border-zinc-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_CONFIG[op.category]?.iconBg || 'bg-zinc-800'}`}>
                      <div className="w-7 h-7 flex items-center justify-center leading-none">
                        <span className="text-2xl leading-none">{CATEGORY_CONFIG[op.category]?.icon}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-white font-medium sm:text-lg leading-none">{op.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {op.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-500 line-clamp-1">{op.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pr-2">
                    <span className="hidden sm:flex text-xs text-zinc-600 font-medium group-hover:text-violet-400 transition-colors">Explorar</span>
                    <svg className="w-5 h-5 text-zinc-600 group-hover:text-violet-400 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-t border-zinc-800/50 bg-zinc-950/50 relative z-20">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">↑</kbd>
            <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">↓</kbd>
            para navegar
          </span>
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">Enter</kbd>
            para selecionar
          </span>
        </div>
      </div>
    </div>
  );
}
