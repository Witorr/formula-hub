/**
 * constants.ts — Configurações e constantes globais da Home.
 *
 * Mantém toda a configuração estática em um único lugar (DRY),
 * facilitando futuras alterações sem tocar nos componentes.
 */

import type { Language } from '@/data/formulas';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type CategoryConfig = {
  icon: string;
  lottie: string;
  desc: string;
  gradient: string;
  iconBg: string;
  iconScale?: number;
};

// ─── Configuração por categoria ───────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'Busca e Referência': {
    icon: '🔍',
    lottie: '/assets/search.json',
    desc: 'PROCV, Lookup e mais',
    gradient: 'hover:border-violet-500/40',
    iconBg: 'bg-violet-500/10',
    iconScale: 1,
  },
  'Lógica': {
    icon: '⚡',
    lottie: '/assets/Iq.json',
    desc: 'SE, IF, CASE e mais',
    gradient: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10',
    iconScale: 1,
  },
  'Matemática e Estatística': {
    icon: '∑',
    lottie: '/assets/Calculator.json',
    desc: 'SOMASE, CONT.SE e mais',
    gradient: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10',
    iconScale: 1,
  },
  'Texto': {
    icon: 'Aa',
    lottie: '/assets/Sync.json',
    desc: 'CONCATENAR, ESQUERDA e mais',
    gradient: 'hover:border-sky-500/40',
    iconBg: 'bg-sky-500/10',
    iconScale: 1,
  },
  'Data e Hora': {
    icon: '📅',
    lottie: '/assets/calendar%20V3.json',
    desc: 'HOJE, TODAY e mais',
    gradient: 'hover:border-rose-500/40',
    iconBg: 'bg-rose-500/10',
    iconScale: 1,
  },
  'Outros': {
    icon: '✓',
    lottie: '/assets/Validation.json',
    desc: 'Fórmulas diversas',
    gradient: 'hover:border-zinc-500/40',
    iconBg: 'bg-zinc-500/10',
    iconScale: 1,
  },
};

export const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  icon: '📁',
  lottie: '/assets/Validation.json',
  desc: 'Fórmulas diversas',
  gradient: 'hover:border-zinc-500/40',
  iconBg: 'bg-zinc-500/10',
  iconScale: 2,
};

/** Retorna a config de uma categoria, com fallback seguro. */
export function getCategoryConfig(cat: string): CategoryConfig {
  return CATEGORY_CONFIG[cat] ?? DEFAULT_CATEGORY_CONFIG;
}

// ─── Estilos por linguagem (PreviewMockup) ───────────────────────────────────

export const PREVIEW_LANG_STYLE: Record<Language, { text: string; border: string }> = {
  Excel:      { text: 'text-emerald-400', border: 'border-emerald-400' },
  DAX:        { text: 'text-yellow-400',  border: 'border-yellow-400'  },
  'Power Fx': { text: 'text-purple-400',  border: 'border-purple-400'  },
  SQL:        { text: 'text-blue-400',    border: 'border-blue-400'    },
  Python:     { text: 'text-sky-400',     border: 'border-sky-400'     },
};

// ─── Configuração geral da página ────────────────────────────────────────────

export const FORMULAS_PER_PAGE = 12;
export const HERO_TYPING_WORDS = ['SEU', 'MEU', 'NOSSO'];
