'use client';

import { useState, useMemo } from 'react';
import { operations, categories, Language, Operation } from '@/data/formulas';
import { FormulaCard } from '@/components/FormulaCard';
import { FormulaVisualizer } from '@/components/FormulaVisualizer';

const CATEGORY_ICONS: Record<string, string> = {
  'Busca e Referência':      '🔍',
  'Lógica':                  '⚡',
  'Matemática e Estatística':'∑',
  'Texto':                   'Aa',
  'Data e Hora':             '📅',
};

export default function Home() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [vizState, setVizState] = useState<{ operation: Operation; language: Language } | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return operations.filter((op) => {
      const matchesSearch =
        !q ||
        op.name.toLowerCase().includes(q) ||
        op.description.toLowerCase().includes(q) ||
        Object.values(op.equivalents).some(
          (e) => e.syntax.toLowerCase().includes(q) || e.example.toLowerCase().includes(q)
        );
      const matchesCategory = !activeCategory || op.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Header ── */}
      <header className="relative border-b border-zinc-800/60 bg-zinc-950/95 backdrop-blur sticky top-0 z-20">
        {/* linha de gradiente sutil no topo */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
          {/* Logo */}
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Formula
              <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
                Hub
              </span>
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Equivalências entre Excel · DAX · Power Fx · SQL · Python
            </p>
          </div>

          {/* Botão Comparar */}
          <button
            onClick={() => setCompareMode((v) => !v)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border font-medium transition-all ${
              compareMode
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            {compareMode ? 'Comparar (ativo)' : 'Comparar'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Busca ── */}
        <div className="relative mb-7">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, sintaxe ou exemplo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-5 py-3.5 text-base text-white placeholder-zinc-500 outline-none focus:border-violet-600/70 focus:ring-2 focus:ring-violet-600/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* ── Categorias ── */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border font-medium transition-all ${
              !activeCategory
                ? 'bg-white text-zinc-900 border-white shadow-md'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900/50'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-white text-zinc-900 border-white shadow-md'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900/50'
              }`}
            >
              <span className="opacity-70">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Contador ── */}
        <p className="text-sm text-zinc-600 mb-5">
          {filtered.length} {filtered.length === 1 ? 'fórmula' : 'fórmulas'} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className={`grid gap-5 ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filtered.map((op) => (
              <FormulaCard
                key={op.id}
                operation={op}
                compareMode={compareMode}
                onVisualize={(lang) => setVizState({ operation: op, language: lang })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-zinc-400 text-base">Nenhuma fórmula encontrada</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-sm text-zinc-600 hover:text-zinc-400 mt-3 underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Visualizador ── */}
      {vizState && (
        <FormulaVisualizer
          operation={vizState.operation}
          initialLanguage={vizState.language}
          onClose={() => setVizState(null)}
        />
      )}
    </div>
  );
}
