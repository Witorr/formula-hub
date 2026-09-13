'use client';

/**
 * CategoriesSection.tsx — Grid de cards de categorias com animações Lottie.
 *
 * Responsabilidade única: exibir e gerenciar a seleção de categoria.
 * Recebe dados e callbacks do HomeClient, sem estado próprio.
 */

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { Operation } from '@/data/formulas';
import { getCategoryConfig, CATEGORY_CONFIG } from './constants';

type Props = {
  allCategories: string[];
  activeCategory: string | null;
  combinedOperations: Operation[];
  onCategoryClick: (cat: string) => void;
};

export function CategoriesSection({ allCategories, activeCategory, combinedOperations, onCategoryClick }: Props) {
  return (
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
        {allCategories.map((cat) => {
          const cfg = getCategoryConfig(cat);
          const isActive = activeCategory === cat;
          const count = combinedOperations.filter((op) => op.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => onCategoryClick(cat)}
              className={`group relative flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-7 lg:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${
                isActive
                  ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-900/20'
                  : `bg-zinc-900/50 border-zinc-800/60 ${cfg.gradient}`
              }`}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${cfg.iconBg}`}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 grid place-items-center"
                  style={{ transform: `scale(${cfg.iconScale ?? 1})` }}
                >
                  {cfg.lottie
                    ? <DotLottieReact className="w-full h-full" src={cfg.lottie} loop autoplay />
                    : <span className="text-2xl">{cfg.icon}</span>
                  }
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm lg:text-base font-semibold text-white/90 leading-tight">{cat}</p>
                <p className="text-[11px] sm:text-xs lg:text-sm text-zinc-500 mt-1">
                  {count} {count === 1 ? 'fórmula' : 'fórmulas'}
                </p>
              </div>
              {isActive && (
                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

