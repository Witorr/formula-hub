'use client';

/**
 * HeroSection.tsx — Seção principal da landing page (above the fold).
 *
 * Responsabilidades:
 *  - Badge de status
 *  - Título com efeito de digitação animado
 *  - Subtítulo com as linguagens suportadas
 *  - Barra de busca hero (com ação de gerar via IA quando sem resultados)
 *  - Bloco de estatísticas (fórmulas, linguagens, visualização)
 *  - Seção de Preview Mockup
 */

import type { Language, Operation } from '@/data/formulas';
import { operations } from '@/data/formulas';
import { MatrixRain } from './MatrixRain';
import { PreviewMockup } from './PreviewMockup';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  filteredCount: number;
  heroGenerating: boolean;
  heroGenerateError: string | null;
  typedHeroWord: string;
  onHeroGenerate: () => void;
  onScrollToFormulas: () => void;
  onOpenSpotlight: () => void;
  onVisualize: (op: Operation, lang: Language) => void;
};

export function HeroSection({
  search,
  setSearch,
  filteredCount,
  heroGenerating,
  heroGenerateError,
  typedHeroWord,
  onHeroGenerate,
  onScrollToFormulas,
  onOpenSpotlight,
  onVisualize,
}: Props) {
  const noResults = search.trim().length > 0 && filteredCount === 0;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6"
      >
        <MatrixRain />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-transparent to-zinc-950 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(56,189,248,0.05),transparent)] pointer-events-none" />

        {/* Content */}
        <div
          className="relative z-10 w-full max-w-5xl 2xl:max-w-6xl mx-auto text-center pt-20 sm:pt-24"
          style={{ animation: 'slideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-violet-500/8 border border-violet-500/20 text-violet-300 text-sm sm:text-base font-medium mb-8 sm:mb-10 backdrop-blur-sm">
            <span
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400"
              style={{ animation: 'pulse-soft 2s ease-in-out infinite' }}
            />
            Hub de Fórmulas Ativas
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl 2xl:text-[6.5rem] font-black tracking-tight leading-[1.15] mb-6 sm:mb-8 overflow-visible">
            <span className="sr-only">Seu Glossário de fórmulas ativas</span>
            <span aria-hidden="true">
              <span className="inline-flex items-baseline font-bold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                <span className="hero-typing-caret inline-block mr-[0.16em] bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                  {typedHeroWord || '\u00A0'}
                </span>
                <span>Glossário de</span>
              </span>
              <br className="hidden sm:block" />
              <span
                className="inline-block bg-gradient-to-r from-violet-400 via-purple-300 to-sky-400 bg-clip-text text-transparent pt-2 pb-4 -mb-4 px-4 -mx-4"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 8s ease infinite',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                }}
              >
                ƒórmulas ativas
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 sm:mb-14 leading-relaxed">
            Equivalências entre{' '}
            <span className="text-emerald-400 font-semibold">Excel</span>
            {' · '}
            <span className="text-yellow-400 font-semibold">DAX</span>
            {' · '}
            <span className="text-purple-400 font-semibold">Power Fx</span>
            {' · '}
            <span className="text-blue-400 font-semibold">SQL</span>
            {' · '}
            <span className="text-sky-400 font-semibold">Python</span>
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-3xl 2xl:max-w-4xl mx-auto mb-10 sm:mb-14">
            <svg
              className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              id="hero-search"
              type="text"
              placeholder="Buscar fórmula... Ex: PROCV, SOMASE, IF"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  noResults ? onHeroGenerate() : onScrollToFormulas();
                }
              }}
              className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-2xl pl-14 sm:pl-16 pr-28 sm:pr-40 py-4 sm:py-5 text-base sm:text-lg text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all duration-300 backdrop-blur-md"
            />
            <button
              onClick={noResults ? onHeroGenerate : onScrollToFormulas}
              disabled={heroGenerating}
              className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl text-white transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
                noResults
                  ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-fuchsia-900/30'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-900/20'
              }`}
            >
              {heroGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Gerando...</span>
                </>
              ) : noResults ? (
                <>
                  <span>✨</span>
                  <span>Gerar</span>
                </>
              ) : (
                <span>Buscar</span>
              )}
            </button>
          </div>

          {heroGenerateError && (
            <p className="text-sm text-red-400 -mt-6 mb-10 sm:mb-14 text-center">
              {heroGenerateError}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 text-sm sm:text-base text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center">
                <span className="text-violet-400 text-sm sm:text-base font-bold">{operations.length}</span>
              </div>
              <span>Fórmulas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center">
                <span className="text-sky-400 text-sm sm:text-base font-bold">5</span>
              </div>
              <span>Linguagens</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span>Visualização interativa</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Preview ───────────────────────────────────────────────── */}
      <section className="relative z-10 w-full max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 mb-12 sm:mb-20">
        <div style={{ animation: 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}>
          <PreviewMockup onVisualize={onVisualize} />
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-violet-600/10 blur-3xl rounded-full pointer-events-none" />
      </section>
    </>
  );
}
