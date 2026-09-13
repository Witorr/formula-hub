'use client';

/**
 * FormulasSection.tsx — Grid de fórmulas com filtros, paginação e estado vazio.
 *
 * Responsabilidades:
 *  - Barra de busca secundária + category pills
 *  - Grid paginado de FormulaCards
 *  - Navegação de paginação
 *  - Estado vazio com AITranslator integrado
 */

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { RefObject } from 'react';
import type { Language, Operation } from '@/data/formulas';
import { FormulaCard } from '@/components/FormulaCard';
import { AITranslator } from '@/components/AITranslator';
import { getCategoryConfig } from './constants';

type Props = {
  sectionRef: RefObject<HTMLElement | null>;
  filtered: Operation[];
  paginatedOperations: Operation[];
  paginationItems: Array<number | 'ellipsis'>;
  compareMode: boolean;
  setCompareMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  currentPage: number;
  totalPages: number;
  search: string;
  setSearch: (v: string) => void;
  activeCategory: string | null;
  setActiveCategory: (v: string | null) => void;
  allCategories: string[];
  onChangePage: (page: number) => void;
  onVisualize: (op: Operation, lang: Language) => void;
  onGenerate: (op: Operation) => void;
};

export function FormulasSection({
  sectionRef,
  filtered,
  paginatedOperations,
  paginationItems,
  compareMode,
  setCompareMode,
  currentPage,
  totalPages,
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
  allCategories,
  onChangePage,
  onVisualize,
  onGenerate,
}: Props) {
  return (
    <section
      id="formulas"
      ref={sectionRef}
      className="w-full max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-28"
    >
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
            Todas as{' '}
            <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
              fórmulas
            </span>
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base">
            {filtered.length} {filtered.length === 1 ? 'fórmula encontrada' : 'fórmulas encontradas'}
            {activeCategory && (
              <span className="text-violet-400"> em {activeCategory}</span>
            )}
          </p>
        </div>

        {/* Mobile compare toggle */}
        <button
          onClick={() => setCompareMode((v) => !v)}
          className={`sm:hidden flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border font-medium transition-all ${
            compareMode
              ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40'
              : 'border-zinc-700/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          {compareMode ? 'Comparar ✓' : 'Comparar'}
        </button>
      </div>

      {/* Filter bar + category pills */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10">
        <div className="flex h-12 w-full lg:w-[21rem] lg:shrink-0 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 sm:px-5 transition-all duration-200 focus-within:border-violet-600/50 focus-within:ring-2 focus-within:ring-violet-600/15">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            id="formula-search"
            type="text"
            placeholder="Filtrar fórmulas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="shrink-0 text-zinc-500 hover:text-zinc-300 text-lg sm:text-xl leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border font-medium transition-all duration-200 ${
              !activeCategory
                ? 'bg-white text-zinc-900 border-white shadow-md'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900/50'
            }`}
          >
            Todas
          </button>
          {allCategories.map((cat) => {
            const cfg = getCategoryConfig(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`flex items-center gap-2 text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-white text-zinc-900 border-white shadow-md'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900/50'
                }`}
              >
                <span className="opacity-70 w-5 h-5 flex items-center justify-center overflow-hidden">
                  {cfg.lottie ? (
                    <span className="w-full h-full grid place-items-center" style={{ transform: `scale(${cfg.iconScale ?? 1})` }}>
                      <DotLottieReact className="w-full h-full" src={cfg.lottie} loop autoplay />
                    </span>
                  ) : (
                    <span>{cfg.icon}</span>
                  )}
                </span>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
        <>
          <div
            className={`grid gap-4 sm:gap-5 lg:gap-6 ${
              compareMode
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
            }`}
          >
            {paginatedOperations.map((op, index) => (
              <div
                key={op.id}
                className="h-full"
                style={{ animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s both` }}
              >
                <FormulaCard
                  operation={op}
                  compareMode={compareMode}
                  onVisualize={(lang) => onVisualize(op, lang)}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-10 sm:mt-12 flex items-center justify-center gap-1.5 sm:gap-2" aria-label="Paginação de fórmulas">
              <button
                type="button"
                onClick={() => onChangePage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-all hover:border-violet-400 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {paginationItems.map((item, index) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="w-8 sm:w-10 text-center text-zinc-600 select-none" aria-hidden="true">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onChangePage(item)}
                    aria-label={`Ir para a página ${item}`}
                    aria-current={item === currentPage ? 'page' : undefined}
                    className={`w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-full border text-sm sm:text-base font-semibold transition-all ${
                      item === currentPage
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 border-violet-400 text-white shadow-lg shadow-violet-900/40'
                        : 'border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-violet-400 hover:text-violet-300 hover:bg-violet-500/10'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => onChangePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                className="w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-all hover:border-violet-400 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </nav>
          )}
        </>
      ) : (
        /* Empty state with AI generator */
        <div className="text-center py-20 sm:py-28 max-w-4xl mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl">🤖</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Fórmula não catalogada!</h3>
          <p className="text-zinc-400 text-sm sm:text-base mb-10">
            Não encontramos essa fórmula no catálogo estático, mas nossa Inteligência Artificial pode gerar ela agora mesmo para você.
          </p>

          <div className="text-left mt-6">
            <AITranslator
              initialSearch={search}
              onVisualize={(op, lang) => onVisualize(op, lang)}
              onGenerate={(newOp) => onGenerate(newOp)}
            />
          </div>

          {search && (
            <div className="mt-8">
              <button
                onClick={() => setSearch('')}
                className="text-sm sm:text-base text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
              >
                Limpar busca e voltar ao catálogo
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
