'use client';

/**
 * HomeClient.tsx — Orquestrador da página principal.
 *
 * Responsabilidade: gerenciar estado global da home e compor as seções.
 * Toda a lógica de UI detalhada vive nos módulos em ./home/.
 *
 * Seguindo o princípio da responsabilidade única (SRP) e o Zen do Python:
 *   "Simple is better than complex."
 *   "Readability counts."
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { operations, categories, Language, Operation } from '@/data/formulas';
import { FormulaVisualizer } from '@/components/FormulaVisualizer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FormulasSection } from '@/components/home/FormulasSection';
import { SpotlightSearch } from '@/components/home/SpotlightSearch';
import { FORMULAS_PER_PAGE, HERO_TYPING_WORDS } from '@/components/home/constants';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type VizState = { operation: Operation; language: Language };

// ─── Helpers de mapeamento de operações do banco ─────────────────────────────

function mapDbOperation(dbOp: any): Operation {
  return {
    id: dbOp.id,
    name: dbOp.name,
    category: dbOp.category,
    description: dbOp.description,
    equivalents: dbOp.equivalents.reduce((acc: any, eq: any) => {
      acc[eq.language] = {
        language: eq.language,
        syntax: eq.syntax,
        description: eq.description,
        example: eq.example,
      };
      return acc;
    }, {}),
    visualization: dbOp.visualization,
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function HomeClient({ initialDynamicOperations }: { initialDynamicOperations: Operation[] }) {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [vizState, setVizState] = useState<VizState | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [dynamicOperations, setDynamicOperations] = useState<Operation[]>(initialDynamicOperations);
  const [spotlightGenerating, setSpotlightGenerating] = useState(false);
  const [spotlightGenerateError, setSpotlightGenerateError] = useState<string | null>(null);
  const [heroGenerating, setHeroGenerating] = useState(false);
  const [heroGenerateError, setHeroGenerateError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [typedHeroWord, setTypedHeroWord] = useState('');

  const formulasSectionRef = useRef<HTMLElement | null>(null);

  // ── Dados derivados (memoizados) ─────────────────────────────────────────────
  const combinedOperations = useMemo(() => {
    const byName = new Map<string, Operation>();
    for (const op of [...operations, ...dynamicOperations]) {
      const key = op.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, op);
    }
    return Array.from(byName.values());
  }, [dynamicOperations]);

  const allCategories = useMemo(() => {
    const seen = new Set<string>(categories);
    combinedOperations.forEach((op) => seen.add(op.category));
    return Array.from(seen);
  }, [combinedOperations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return combinedOperations.filter((op) => {
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
  }, [search, activeCategory, combinedOperations]);

  const totalPages = Math.ceil(filtered.length / FORMULAS_PER_PAGE);

  const paginatedOperations = useMemo(() => {
    const start = (currentPage - 1) * FORMULAS_PER_PAGE;
    return filtered.slice(start, start + FORMULAS_PER_PAGE);
  }, [currentPage, filtered]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items: Array<number | 'ellipsis'> = [1];
    if (currentPage > 4) items.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) items.push(p);
    if (currentPage < totalPages - 3) items.push('ellipsis');
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  // ── Efeitos ──────────────────────────────────────────────────────────────────

  // Navbar com fundo ao rolar
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Atalho Ctrl+K / ESC para o Spotlight
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      if (e.key === 'Escape') setIsSpotlightOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Trava scroll de fundo quando spotlight está aberto
  useEffect(() => {
    document.body.style.overflow = isSpotlightOpen ? 'hidden' : 'unset';
  }, [isSpotlightOpen]);

  // Reset de paginação ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, combinedOperations]);

  // Efeito de digitação animada no hero
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedHeroWord(HERO_TYPING_WORDS[0]);
      return;
    }
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const animate = () => {
      const word = HERO_TYPING_WORDS[wordIndex];
      isDeleting ? charIndex-- : charIndex++;
      setTypedHeroWord(word.slice(0, charIndex));

      if (!isDeleting && charIndex === word.length) {
        isDeleting = true;
        timer = setTimeout(animate, 1500);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % HERO_TYPING_WORDS.length;
        timer = setTimeout(animate, 450);
      } else {
        timer = setTimeout(animate, isDeleting ? 115 : 175);
      }
    };

    animate();
    return () => clearTimeout(timer);
  }, []);

  // ── Callbacks ────────────────────────────────────────────────────────────────

  const scrollToFormulas = useCallback(() => {
    formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCategoryClick = useCallback((cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setTimeout(() => formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const fetchAndAddOperation = useCallback(async (query: string): Promise<void> => {
    const res = await fetch('/api/generate-operation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery: query }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Erro desconhecido');
    setDynamicOperations((prev) => [mapDbOperation(json.data), ...prev]);
  }, []);

  const handleHeroGenerate = useCallback(async () => {
    if (!search.trim() || heroGenerating) return;
    setHeroGenerating(true);
    setHeroGenerateError(null);
    try {
      await fetchAndAddOperation(search);
      setTimeout(() => formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setHeroGenerateError(err.message);
    } finally {
      setHeroGenerating(false);
    }
  }, [search, heroGenerating, fetchAndAddOperation]);

  const handleSpotlightGenerate = useCallback(async () => {
    if (!search.trim() || spotlightGenerating) return;
    setSpotlightGenerating(true);
    setSpotlightGenerateError(null);
    try {
      await fetchAndAddOperation(search);
      setIsSpotlightOpen(false);
      setTimeout(() => formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setSpotlightGenerateError(err.message);
    } finally {
      setSpotlightGenerating(false);
    }
  }, [search, spotlightGenerating, fetchAndAddOperation]);

  const handleSpotlightSelectFormula = useCallback((name: string) => {
    setSearch(name);
    setActiveCategory(null);
    setIsSpotlightOpen(false);
    scrollToFormulas();
  }, [scrollToFormulas]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          navScrolled
            ? 'bg-zinc-950/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center">
          {/* Logo + Nav */}
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-0.5 group select-none shrink-0">
              <span
                className="text-3xl font-bold bg-gradient-to-br from-violet-400 to-sky-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-sky-300 transition-all duration-300 px-2 -mx-2"
                style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: 'italic' }}
              >
                ƒ
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white/90 -ml-0.5">
                ormula
                <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">Hub</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-1">
              <a href="#hero" className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/40 px-3 py-1.5 rounded-md transition-colors duration-200 border border-transparent hover:border-zinc-700/50">
                Início
              </a>

              {/* Categorias Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  className="relative z-50 flex items-center gap-1.5 text-sm text-zinc-400 group-hover:text-white px-3 py-2 rounded-md group-hover:rounded-b-none transition-colors border border-transparent group-hover:border-zinc-800 group-hover:bg-zinc-950 group-hover:border-b-zinc-950"
                >
                  Categorias
                  <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 w-60 -mt-px opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out z-40">
                  <div className="p-1.5 rounded-b-xl rounded-tr-xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/80 overflow-hidden">
                    <div className="px-2.5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Explorar por</div>
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors group/item"
                      >
                        {cat}
                        <svg className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fórmulas Dropdown */}
              <div className="relative group">
                <button
                  onClick={scrollToFormulas}
                  className="relative z-50 flex items-center gap-1.5 text-sm text-zinc-400 group-hover:text-white px-3 py-2 rounded-md group-hover:rounded-b-none transition-colors border border-transparent group-hover:border-zinc-800 group-hover:bg-zinc-950 group-hover:border-b-zinc-950"
                >
                  Fórmulas
                  <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 w-64 -mt-px opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out z-40">
                  <div className="p-1.5 rounded-b-xl rounded-tr-xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/80 overflow-hidden">
                    <div className="px-2.5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Visualização</div>
                    <button
                      onClick={() => { setSearch(''); setActiveCategory(null); setCompareMode(false); scrollToFormulas(); }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors group/item"
                    >
                      Explorar Todas
                      <svg className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { setCompareMode(true); scrollToFormulas(); }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors group/item mt-0.5"
                    >
                      Modo Comparativo
                      <span className="text-[10px] py-0.5 px-2 bg-violet-500/15 text-violet-300 rounded border border-violet-500/20 font-medium tracking-wide">NOVO</span>
                    </button>
                    <div className="h-px bg-zinc-800/60 my-2 mx-2" />
                    <div className="px-2.5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Linguagens Suportadas</div>
                    <div className="grid grid-cols-2 gap-1 px-1 pb-1">
                      {(['Excel', 'DAX', 'Power Fx', 'SQL', 'Python'] as const).map((lang, i) => {
                        const dotColors = ['bg-emerald-400', 'bg-yellow-400', 'bg-purple-400', 'bg-blue-400', 'bg-sky-400'];
                        return (
                          <button
                            key={lang}
                            onClick={() => { setSearch(''); setActiveCategory(null); scrollToFormulas(); }}
                            className="text-left flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[i]}`} />
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex-1" />

          {/* Ações à direita */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSpotlightOpen(true)}
              className="hidden lg:flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span>Buscar</span>
              <kbd className="text-[10px] text-zinc-600 bg-zinc-800 rounded px-1.5 py-0.5 font-mono border border-zinc-700/50">Ctrl+K</kbd>
            </button>

            <button
              onClick={() => setCompareMode((v) => !v)}
              className={`hidden sm:flex items-center gap-2 text-sm px-3.5 py-1.5 rounded-lg border font-medium transition-all duration-300 ${
                compareMode
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900/50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              {compareMode ? 'Comparar ✓' : 'Comparar'}
            </button>

            <button
              onClick={scrollToFormulas}
              className="px-5 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/25 transition-all duration-300 hover:shadow-violet-900/50"
            >
              Explorar
            </button>
          </div>
        </div>
      </header>

      {/* ── Seções ──────────────────────────────────────────────────────────── */}

      <HeroSection
        search={search}
        setSearch={(v) => { setSearch(v); if (heroGenerateError) setHeroGenerateError(null); }}
        filteredCount={filtered.length}
        totalFormulaCount={combinedOperations.length}
        heroGenerating={heroGenerating}
        heroGenerateError={heroGenerateError}
        typedHeroWord={typedHeroWord}
        onHeroGenerate={handleHeroGenerate}
        onScrollToFormulas={scrollToFormulas}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onVisualize={(op, lang) => setVizState({ operation: op, language: lang })}
      />

      <CategoriesSection
        allCategories={allCategories}
        activeCategory={activeCategory}
        combinedOperations={combinedOperations}
        onCategoryClick={handleCategoryClick}
      />

      <FormulasSection
        sectionRef={formulasSectionRef}
        filtered={filtered}
        paginatedOperations={paginatedOperations}
        paginationItems={paginationItems}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        currentPage={currentPage}
        totalPages={totalPages}
        search={search}
        setSearch={setSearch}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        allCategories={allCategories}
        onChangePage={changePage}
        onVisualize={(op, lang) => setVizState({ operation: op, language: lang })}
        onGenerate={(newOp) => setDynamicOperations((prev) => [newOp, ...prev])}
      />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="w-full max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-0.5">
              <span
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-violet-400 to-sky-400 bg-clip-text text-transparent px-2 -mx-2"
                style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: 'italic' }}
              >
                ƒ
              </span>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white/90 -ml-0.5">
                ormula
                <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">Hub</span>
              </span>
            </div>
            <p className="text-sm sm:text-base text-zinc-600 text-center">
              Seu Glossário comparativo de fórmulas entre Excel, DAX, Power Fx, SQL e Python
            </p>
            <p className="text-sm sm:text-base text-zinc-700 flex items-center gap-1.5">
              Feito de analistas para analistas
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-800/40 text-center">
            <p className="text-xs sm:text-sm text-zinc-700">
              © {new Date().getFullYear()} FormulaHub. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Overlays ─────────────────────────────────────────────────────────── */}

      {vizState && (
        <FormulaVisualizer
          operation={vizState.operation}
          initialLanguage={vizState.language}
          onClose={() => setVizState(null)}
        />
      )}

      <SpotlightSearch
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        search={search}
        setSearch={setSearch}
        filtered={filtered}
        spotlightGenerating={spotlightGenerating}
        spotlightGenerateError={spotlightGenerateError}
        onSpotlightGenerate={handleSpotlightGenerate}
        onSelectFormula={handleSpotlightSelectFormula}
      />
    </div>
  );
}
