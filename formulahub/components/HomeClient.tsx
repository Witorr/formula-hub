'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { operations, categories, Language, Operation } from '@/data/formulas';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FormulaCard } from '@/components/FormulaCard';
import { FormulaVisualizer } from '@/components/FormulaVisualizer';
import { AITranslator } from '@/components/AITranslator';

/* ═══════════════════════════════════════════════════════════════════════════════
   Matrix Rain — canvas com caracteres de fórmula caindo estilo terminal
   ═══════════════════════════════════════════════════════════════════════════════ */

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const chars = '0123456789+=−×÷∑∫πΣΔ√∞≈≠≤≥∂∏∈∉∀∃fxFXSUMIFCOUNTLEFTRIGHTVLOOKUP'.split('');
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    const init = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      columns = Math.floor(canvas.offsetWidth / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -150);
    };

    init();

    let lastTime = 0;
    const draw = (time: number) => {
      animId = requestAnimationFrame(draw);
      if (time - lastTime < 45) return; // ~22fps for subtlety
      lastTime = time;

      ctx.fillStyle = 'rgba(9, 9, 11, 0.06)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = `${fontSize}px "Courier New", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Brighter leading char, dim trail
        const ratio = Math.min(1, Math.max(0, drops[i] / (canvas.offsetHeight / fontSize)));
        const alpha = drops[i] > 0 ? 0.15 - ratio * 0.12 : 0;

        // Alternate between violet and sky tones
        if (i % 3 === 0) {
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.7})`; // sky
        } else {
          ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`; // violet
        }

        ctx.fillText(char, x, y);

        if (y > canvas.offsetHeight && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.25 + Math.random() * 0.35;
      }
    };

    animId = requestAnimationFrame(draw);

    const handleResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      init();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Preview Mockup — card do PROCV estilizado como "screenshot do produto"
   ═══════════════════════════════════════════════════════════════════════════════ */

function PreviewMockup() {
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
          <span className="text-xs sm:text-sm text-zinc-500 font-medium">FormulaHub — Busca Vertical (PROCV)</span>
        </div>
      </div>

      {/* Card content */}
      <div className="bg-zinc-900/95 p-5 sm:p-8">
        {/* Card header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-white text-lg sm:text-xl lg:text-2xl">Busca Vertical (PROCV)</h3>
            <p className="text-sm sm:text-base text-zinc-400 mt-1.5 leading-relaxed">
              Busca um valor em uma coluna e retorna um valor correspondente na mesma linha de outra coluna.
            </p>
          </div>
          <span className="shrink-0 text-xs sm:text-sm px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 font-medium">
            Busca e Referência
          </span>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-zinc-800 mb-5">
          {(['Excel', 'DAX', 'Power Fx', 'SQL', 'Python'] as const).map((lang, i) => {
            const colors = [
              'text-emerald-400 border-emerald-400',
              'text-yellow-400',
              'text-purple-400',
              'text-blue-400',
              'text-sky-400',
            ];
            return (
              <button
                key={lang}
                className={`flex-1 text-xs sm:text-sm py-3 font-semibold transition-colors ${i === 0
                  ? `${colors[i]} border-b-2 -mb-px bg-zinc-800/40`
                  : 'text-zinc-500'
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
            <code className="text-sm sm:text-base font-mono text-emerald-400 block leading-relaxed">
              PROCV(valor_procurado, matriz_tabela, num_indice_coluna, [procurar_intervalo])
            </code>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500 mb-2 uppercase tracking-widest font-medium">Exemplo</p>
            <pre className="text-sm sm:text-base font-mono bg-zinc-950 rounded-xl p-4 sm:p-5 text-zinc-300 border border-zinc-800/60">
              {`=PROCV("A123", Clientes!A:D, 2, FALSO)`}
            </pre>
          </div>
        </div>

        {/* CTA inside preview */}
        <button className="mt-5 w-full flex items-center justify-center gap-2.5 text-sm sm:text-base font-semibold px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Ver em ação
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Configuração de Categorias
   ═══════════════════════════════════════════════════════════════════════════════ */

const CATEGORY_CONFIG: Record<string, { icon: string; lottie: string; desc: string; gradient: string; iconBg: string }> = {
  'Busca e Referência': {
    icon: '🔍',
    lottie: '/assets/search.lottie',
    desc: 'PROCV, Lookup e mais',
    gradient: 'hover:border-violet-500/40',
    iconBg: 'bg-violet-500/10',
  },
  'Lógica': {
    icon: '⚡',
    lottie: '/assets/logic.lottie',
    desc: 'SE, IF, CASE e mais',
    gradient: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10',
  },
  'Matemática e Estatística': {
    icon: '∑',
    lottie: '/assets/math.lottie',
    desc: 'SOMASE, CONT.SE e mais',
    gradient: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10',
  },
  'Texto': {
    icon: 'Aa',
    lottie: '/assets/text.lottie',
    desc: 'CONCATENAR, ESQUERDA e mais',
    gradient: 'hover:border-sky-500/40',
    iconBg: 'bg-sky-500/10',
  },
  'Data e Hora': {
    icon: '📅',
    lottie: '/assets/calendar.lottie',
    desc: 'HOJE, TODAY e mais',
    gradient: 'hover:border-rose-500/40',
    iconBg: 'bg-rose-500/10',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Ícones de categorias para o filtro (mantido do original)
   ═══════════════════════════════════════════════════════════════════════════════ */

const CATEGORY_ICONS: Record<string, string> = {
  'Busca e Referência': '/assets/search.lottie',
  'Lógica': '/assets/logic.lottie',
  'Matemática e Estatística': '/assets/math.lottie',
  'Texto': '/assets/text.lottie',
  'Data e Hora': '/assets/calendar.lottie',
};

/* ═══════════════════════════════════════════════════════════════════════════════
   Página Principal (Client Component)
   ═══════════════════════════════════════════════════════════════════════════════ */

export function HomeClient({ initialDynamicOperations }: { initialDynamicOperations: Operation[] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [vizState, setVizState] = useState<{ operation: Operation; language: Language } | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [dynamicOperations, setDynamicOperations] = useState<Operation[]>(initialDynamicOperations);
  const [spotlightGenerating, setSpotlightGenerating] = useState(false);
  const [spotlightGenerateError, setSpotlightGenerateError] = useState<string | null>(null);

  const combinedOperations = useMemo(() => {
    // Unindo operações estáticas com as geradas por IA, omitindo possíveis id duplicados
    return [...operations, ...dynamicOperations];
  }, [dynamicOperations]);

  const formulasSectionRef = useRef<HTMLElement>(null);

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

  // Detect scroll for navbar background
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Ctrl+K para abrir Spotlight Search (estilo Mac/VSCode)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Impede o scroll de fundo quando o modal estiver aberto
  useEffect(() => {
    if (isSpotlightOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSpotlightOpen]);

  const scrollToFormulas = useCallback(() => {
    formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSpotlightGenerate = useCallback(async () => {
    if (!search.trim() || spotlightGenerating) return;
    setSpotlightGenerating(true);
    setSpotlightGenerateError(null);
    try {
      const res = await fetch('/api/generate-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: search }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Erro desconhecido');
      const dbOp = json.data;
      const mappedOp: Operation = {
        id: dbOp.id,
        name: dbOp.name,
        category: dbOp.category,
        description: dbOp.description,
        equivalents: dbOp.equivalents.reduce((acc: any, eq: any) => {
          acc[eq.language] = { language: eq.language, syntax: eq.syntax, description: eq.description, example: eq.example };
          return acc;
        }, {}),
        visualization: dbOp.visualization,
      };
      setDynamicOperations(prev => [mappedOp, ...prev]);
      setIsSpotlightOpen(false);
      setTimeout(() => formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setSpotlightGenerateError(err.message);
    } finally {
      setSpotlightGenerating(false);
    }
  }, [search, spotlightGenerating]);

  const handleCategoryClick = useCallback((cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setTimeout(() => {
      formulasSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ══════════════════════════════════════════════════════════════════════
          Navbar
          ═══════════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${navScrolled
          ? 'bg-zinc-950/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/20'
          : 'bg-transparent border-b border-transparent'
          }`}
      >
        {/* Linha de destaque sutil no topo (como VSCode) */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center">
          {/* Logo + Nav links juntos (estilo VSCode: logo seguido dos links inline) */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a href="#" className="flex items-center gap-0.5 group select-none shrink-0">
              <span
                className="text-3xl font-bold bg-gradient-to-br from-violet-400 to-sky-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-sky-300 transition-all duration-300 px-2 -mx-2"
                style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: 'italic' }}
              >
                ƒ
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white/90 -ml-0.5">
                ormula
                <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
                  Hub
                </span>
              </span>
            </a>

            {/* Nav links (inline com o logo, como no VSCode/GitHub) */}
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

                {/* Dropdown Menu - Fundido ao botão */}
                <div className="absolute top-full left-0 w-60 -mt-px opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out z-40">
                  <div className="p-1.5 rounded-b-xl rounded-tr-xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/80 overflow-hidden">
                    <div className="px-2.5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                      Explorar por
                    </div>
                    {categories.map(cat => (
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

                {/* Dropdown Menu - Fundido ao botão */}
                <div className="absolute top-full left-0 w-64 -mt-px opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out z-40">
                  <div className="p-1.5 rounded-b-xl rounded-tr-xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/80 overflow-hidden">
                    <div className="px-2.5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                      Visualização
                    </div>
                    <button
                      onClick={() => {
                        setSearch('');
                        setActiveCategory(null);
                        setCompareMode(false);
                        scrollToFormulas();
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors group/item"
                    >
                      Explorar Todas
                      <svg className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setCompareMode(true);
                        scrollToFormulas();
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors group/item mt-0.5"
                    >
                      Modo Comparativo
                      <span className="text-[10px] py-0.5 px-2 bg-violet-500/15 text-violet-300 rounded border border-violet-500/20 font-medium tracking-wide">
                        NOVO
                      </span>
                    </button>

                    <div className="h-px bg-zinc-800/60 my-2 mx-2" />

                    <div className="px-2.5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                      Linguagens Suportadas
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-1 pb-1">
                      {(['Excel', 'DAX', 'Power Fx', 'SQL', 'Python'] as const).map((lang, i) => {
                        const dotColors = [
                          'bg-emerald-400', 'bg-yellow-400', 'bg-purple-400', 'bg-blue-400', 'bg-sky-400'
                        ];
                        return (
                          <button
                            key={lang}
                            onClick={() => {
                              setSearch('');
                              setActiveCategory(null);
                              scrollToFormulas();
                            }}
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* Ações à direita (Search hint + Comparar + Explorar) */}
          <div className="flex items-center gap-2.5">
            {/* Search shortcut hint (estilo VSCode) */}
            <button
              onClick={() => setIsSpotlightOpen(true)}
              className="hidden lg:flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span>Buscar</span>
              <kbd className="text-[10px] text-zinc-600 bg-zinc-800 rounded px-1.5 py-0.5 font-mono border border-zinc-700/50">
                Ctrl+K
              </kbd>
            </button>

            {/* Comparar */}
            <button
              onClick={() => setCompareMode((v) => !v)}
              className={`hidden sm:flex items-center gap-2 text-sm px-3.5 py-1.5 rounded-lg border font-medium transition-all duration-300 ${compareMode
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900/50'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
                />
              </svg>
              {compareMode ? 'Comparar ✓' : 'Comparar'}
            </button>

            {/* Explorar (CTA principal, como "Download" no VSCode) */}
            <button
              onClick={scrollToFormulas}
              className="px-5 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/25 transition-all duration-300 hover:shadow-violet-900/50"
            >
              Explorar
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          Hero Section
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6"
      >
        {/* Matrix Rain Background */}
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
            Seu Glossário de{' '}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              id="hero-search"
              type="text"
              placeholder="Buscar fórmula... Ex: PROCV, SOMASE, IF"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value) scrollToFormulas();
              }}
              className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-2xl pl-14 sm:pl-16 pr-28 sm:pr-40 py-4 sm:py-5 text-base sm:text-lg text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all duration-300 backdrop-blur-md"
            />
            <button
              onClick={scrollToFormulas}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-300 shadow-md shadow-violet-900/20"
            >
              Buscar
            </button>
          </div>

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
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span>Visualização interativa</span>
            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Product Preview — CTA estilo VSCode
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 mb-12 sm:mb-20">
        <div
          style={{
            animation: 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
          }}
        >
          <PreviewMockup />
        </div>
        {/* Glow reflection */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-violet-600/10 blur-3xl rounded-full pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Categorias — estilo Fiverr
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="categories" className="w-full max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-28">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            Explore por{' '}
            <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
              categoria
            </span>
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base lg:text-lg max-w-xl mx-auto">
            Encontre a fórmula certa navegando pelas categorias disponíveis
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeCategory === cat;
            const count = operations.filter((op) => op.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`group relative flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-7 lg:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${isActive
                  ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-900/20'
                  : `bg-zinc-900/50 border-zinc-800/60 ${cfg.gradient}`
                  }`}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${cfg.iconBg}`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
                    <DotLottieReact src={cfg.lottie} loop autoplay />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm lg:text-base font-semibold text-white/90 leading-tight">{cat}</p>
                  <p className="text-[11px] sm:text-xs lg:text-sm text-zinc-500 mt-1">{count} {count === 1 ? 'fórmula' : 'fórmulas'}</p>
                </div>
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Grid de Fórmulas
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="formulas" ref={formulasSectionRef} className="w-full max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-28">
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
                <span className="text-violet-400">
                  {' '}em {activeCategory}
                </span>
              )}
            </p>
          </div>

          {/* Mobile compare toggle */}
          <button
            onClick={() => setCompareMode((v) => !v)}
            className={`sm:hidden flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border font-medium transition-all ${compareMode
              ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40'
              : 'border-zinc-700/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
              />
            </svg>
            {compareMode ? 'Comparar ✓' : 'Comparar'}
          </button>
        </div>

        {/* Barra de busca secundária + filtros */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              id="formula-search"
              type="text"
              placeholder="Filtrar fórmulas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 sm:pl-13 pr-5 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 outline-none focus:border-violet-600/50 focus:ring-2 focus:ring-violet-600/15 transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-lg sm:text-xl leading-none transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border font-medium transition-all duration-200 ${!activeCategory
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
                className={`flex items-center gap-2 text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border font-medium transition-all duration-200 ${activeCategory === cat
                  ? 'bg-white text-zinc-900 border-white shadow-md'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 bg-zinc-900/50'
                  }`}
              >
                <span className="opacity-70 w-5 h-5 flex items-center justify-center">
                  <DotLottieReact src={CATEGORY_ICONS[cat]} loop autoplay />
                </span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div
            className={`grid gap-4 sm:gap-5 lg:gap-6 ${compareMode
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
              }`}
          >
            {filtered.map((op, index) => (
              <div
                key={op.id}
                className="h-full"
                style={{
                  animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s both`,
                }}
              >
                <FormulaCard
                  operation={op}
                  compareMode={compareMode}
                  onVisualize={(lang) => setVizState({ operation: op, language: lang })}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 sm:py-28 max-w-4xl mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Fórmula não catalogada!</h3>
            <p className="text-zinc-400 text-sm sm:text-base mb-10">Não encontramos essa fórmula no catálogo estático, mas nossa Inteligência Artificial pode gerar ela agora mesmo para você.</p>

            <div className="text-left mt-6">
              <AITranslator
                 initialSearch={search}
                 onVisualize={(op, lang) => setVizState({ operation: op, language: lang })}
                 onGenerate={(newOp) => setDynamicOperations(prev => [newOp, ...prev])}
              />
            </div>

            <div className="mt-8">
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-sm sm:text-base text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
                >
                  Limpar busca e voltar ao catálogo
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Footer
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="w-full max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-0.5">
              <span
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-violet-400 to-sky-400 bg-clip-text text-transparent px-2 -mx-2"
                style={{ fontFamily: "'Noto Serif', Georgia, serif", fontStyle: 'italic' }}
              >
                ƒ
              </span>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white/90 -ml-0.5">
                ormula
                <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
                  Hub
                </span>
              </span>
            </div>

            {/* Info */}
            <p className="text-sm sm:text-base text-zinc-600 text-center">
              Seu Glossário comparativo de fórmulas entre Excel, DAX, Power Fx, SQL e Python
            </p>

            {/* Badge */}
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

      {/* ══════════════════════════════════════════════════════════════════════
          Visualizador (popup)
          ═══════════════════════════════════════════════════════════════════ */}
      {vizState && (
        <FormulaVisualizer
          operation={vizState.operation}
          initialLanguage={vizState.language}
          onClose={() => setVizState(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Spotlight Search / Command Palette
          ═══════════════════════════════════════════════════════════════════ */}
      {isSpotlightOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
          {/* Backdrop responsivo e opaco (desfocado nativo) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSpotlightOpen(false)}
          />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] sm:max-h-[80vh] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Barra de Input superior do popup */}
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
                onClick={() => setIsSpotlightOpen(false)}
                className="shrink-0 flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-500 hover:text-zinc-300 font-mono"
              >
                <kbd className="bg-zinc-800/80 border border-zinc-700 rounded px-1.5 py-0.5 shadow-sm">ESC</kbd>
                <span className="hidden sm:inline">para fechar</span>
              </button>
            </div>

            {/* Lista de Resultados Interna ao Modal */}
            <div className="overflow-y-auto p-2 sm:p-3" style={{ scrollbarWidth: 'thin' }}>
              {filtered.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-4">
                  <div className="w-14 h-14 mx-auto opacity-20">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-zinc-400 font-medium">Nenhuma fórmula encontrada para <span className="text-white">"{search}"</span></p>
                    <p className="text-sm text-zinc-600 mt-1">Não está no catálogo, mas a IA pode gerar agora.</p>
                  </div>
                  {spotlightGenerateError && (
                    <p className="text-xs text-red-400 max-w-xs">{spotlightGenerateError}</p>
                  )}
                  <button
                    onClick={handleSpotlightGenerate}
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
                  {filtered.map(op => (
                    <button
                      key={op.name}
                      onClick={() => {
                        setSearch(op.name);
                        setActiveCategory(null);
                        setIsSpotlightOpen(false);
                        scrollToFormulas();
                      }}
                      className="w-full text-left p-3 hover:bg-zinc-800/80 focus:bg-zinc-800/80 rounded-xl flex items-center justify-between group transition-colors outline-none border border-transparent hover:border-zinc-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_CONFIG[op.category]?.iconBg || 'bg-zinc-800'}`}>
                           <div className="w-7 h-7">
                              <span className="text-2xl">{CATEGORY_CONFIG[op.category]?.icon}</span>
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
                         <svg className="w-5 h-5 text-zinc-600 group-hover:text-violet-400 transition-colors -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer / Hint (Instrução estática estilo VS Code Command Palette) */}
            <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-t border-zinc-800/50 bg-zinc-950/50 relative z-20">
               <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">↑</kbd> <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">↓</kbd> para navegar</span>
               <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">Enter</kbd> para selecionar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
