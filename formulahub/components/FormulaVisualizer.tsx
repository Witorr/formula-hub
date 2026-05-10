'use client';

import { useState, useEffect, useCallback } from 'react';
import { Operation, Language } from '@/data/formulas';
import { visualizations, VizStep, OperationViz } from '@/data/visualizations';

// ─── Config por linguagem ────────────────────────────────────────────────────

const LANG_CONFIG: Record<Language, {
  label: string;
  headerBg: string;
  headerText: string;
  accentText: string;
  highlightBg: string;
  highlightText: string;
  tabActive: string;
  tabBorder: string;
  windowDot: string;
  formulaPrefix: string;
}> = {
  Excel: {
    label: 'Microsoft Excel',
    headerBg: 'bg-[#1d6f42]',
    headerText: 'text-white',
    accentText: 'text-emerald-400',
    highlightBg: 'bg-emerald-400/20',
    highlightText: 'text-emerald-200 font-semibold',
    tabActive: 'text-emerald-400 border-emerald-400',
    tabBorder: 'border-emerald-800',
    windowDot: 'bg-emerald-300',
    formulaPrefix: 'fx',
  },
  DAX: {
    label: 'Power BI · DAX',
    headerBg: 'bg-[#1a1a2e]',
    headerText: 'text-yellow-300',
    accentText: 'text-yellow-400',
    highlightBg: 'bg-yellow-400/20',
    highlightText: 'text-yellow-200 font-semibold',
    tabActive: 'text-yellow-400 border-yellow-400',
    tabBorder: 'border-yellow-900',
    windowDot: 'bg-yellow-400',
    formulaPrefix: '[Medida]',
  },
  'Power Fx': {
    label: 'Power Apps · Power Fx',
    headerBg: 'bg-[#2d1b5e]',
    headerText: 'text-purple-200',
    accentText: 'text-purple-400',
    highlightBg: 'bg-purple-400/20',
    highlightText: 'text-purple-200 font-semibold',
    tabActive: 'text-purple-400 border-purple-400',
    tabBorder: 'border-purple-900',
    windowDot: 'bg-purple-400',
    formulaPrefix: '=',
  },
  SQL: {
    label: 'SQL',
    headerBg: 'bg-[#0f1b2d]',
    headerText: 'text-blue-300',
    accentText: 'text-blue-400',
    highlightBg: 'bg-blue-400/20',
    highlightText: 'text-blue-200 font-semibold',
    tabActive: 'text-blue-400 border-blue-400',
    tabBorder: 'border-blue-900',
    windowDot: 'bg-blue-400',
    formulaPrefix: 'SQL',
  },
  Python: {
    label: 'Python · Pandas',
    headerBg: 'bg-[#0d1117]',
    headerText: 'text-sky-300',
    accentText: 'text-sky-400',
    highlightBg: 'bg-sky-400/20',
    highlightText: 'text-sky-200 font-semibold',
    tabActive: 'text-sky-400 border-sky-400',
    tabBorder: 'border-sky-900',
    windowDot: 'bg-sky-400',
    formulaPrefix: '>>>',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isCellActive(step: VizStep, rowIdx: number, colIdx: number): boolean {
  if (step.highlightRows?.includes(rowIdx)) return true;
  if (step.highlightCols?.includes(colIdx)) return true;
  if (step.highlightCells?.some(([r, c]) => r === rowIdx && c === colIdx)) return true;
  return false;
}

// ─── Scene: cena animada da tabela ───────────────────────────────────────────

function Scene({
  viz,
  stepIndex,
  language,
  formula,
}: {
  viz: OperationViz;
  stepIndex: number;
  language: Language;
  formula: string;
}) {
  const cfg = LANG_CONFIG[language];
  const step = viz.steps[stepIndex];
  const isExcel = language === 'Excel';

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
      {/* Barra de título da "janela" */}
      <div className={`${cfg.headerBg} px-4 py-2.5 flex items-center gap-3 shrink-0`}>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className={`w-3 h-3 rounded-full ${cfg.windowDot}/80`} />
        </div>
        <span className={`text-xs font-semibold ${cfg.headerText} tracking-wide`}>{cfg.label}</span>
      </div>

      {/* Barra de fórmula */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center gap-3 shrink-0">
        <span className={`text-xs font-mono font-bold ${cfg.accentText} opacity-70 shrink-0`}>
          {cfg.formulaPrefix}
        </span>
        <div className="w-px h-4 bg-zinc-700 shrink-0" />
        <code className={`text-xs font-mono ${cfg.accentText} truncate`}>{formula}</code>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-xs border-collapse">
          {/* Letras de colunas (Excel) */}
          {isExcel && (
            <thead>
              <tr>
                <th className="w-8" />
                {viz.headers.map((_, i) => (
                  <th key={i} className="text-zinc-600 font-normal text-center pb-1 px-2">
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {/* Header da tabela */}
            <tr>
              {isExcel && <td className="text-zinc-600 text-center pr-2 py-1.5 text-xs select-none">1</td>}
              {viz.headers.map((h, colIdx) => (
                <td
                  key={colIdx}
                  className={`
                    py-1.5 px-3 text-center font-semibold text-zinc-300
                    border border-zinc-700 bg-zinc-800
                    transition-all duration-400
                    ${step.highlightCols?.includes(colIdx) ? `${cfg.highlightBg} ${cfg.highlightText}` : ''}
                  `}
                >
                  {h}
                </td>
              ))}
            </tr>

            {/* Linhas de dados */}
            {viz.rows.map((row, rowIdx) => {
              const dimmed = step.dimRows?.includes(rowIdx);
              return (
                <tr
                  key={rowIdx}
                  style={{ transition: 'opacity 0.5s' }}
                  className={dimmed ? 'opacity-20' : 'opacity-100'}
                >
                  {isExcel && (
                    <td className="text-zinc-600 text-center pr-2 py-1.5 text-xs select-none">
                      {rowIdx + 2}
                    </td>
                  )}
                  {row.map((cell, colIdx) => {
                    const active = isCellActive(step, rowIdx, colIdx);
                    return (
                      <td
                        key={colIdx}
                        className={`
                          py-1.5 px-3 text-center font-mono border border-zinc-800
                          transition-all duration-500
                          ${active ? `${cfg.highlightBg} ${cfg.highlightText}` : 'text-zinc-400'}
                        `}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Resultado */}
        <div
          className={`
            mt-4 px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-900
            flex items-center gap-3
            transition-all duration-500
            ${step.resultValue !== undefined ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
          `}
          style={{ transition: 'opacity 0.5s, transform 0.5s' }}
        >
          <span className="text-zinc-500 text-xs shrink-0">Resultado →</span>
          <span className={`font-mono font-bold text-sm ${cfg.accentText}`}>
            {step.resultValue}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Painel direito: descrição do passo ──────────────────────────────────────

function StepPanel({
  viz,
  stepIndex,
  language,
  playing,
  onPlay,
  onPause,
  onStep,
}: {
  viz: OperationViz;
  stepIndex: number;
  language: Language;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: (i: number) => void;
}) {
  const cfg = LANG_CONFIG[language];
  const step = viz.steps[stepIndex];
  const total = viz.steps.length;

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      {/* Passo atual */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 ${cfg.accentText}`}>
            Passo {stepIndex + 1} / {total}
          </span>
          <span className="text-xs font-semibold text-zinc-300">{step.label}</span>
        </div>
        <p
          key={stepIndex}
          className="text-sm text-zinc-400 leading-relaxed"
          style={{ animation: 'fadeIn 0.4s ease' }}
        >
          {step.description}
        </p>
      </div>

      {/* Indicadores de passo */}
      <div className="flex items-center gap-2">
        {viz.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => onStep(i)}
            className={`
              h-1.5 rounded-full transition-all duration-300
              ${i === stepIndex ? `w-6 ${cfg.accentText.replace('text-', 'bg-')}` : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'}
            `}
          />
        ))}
        <div className="ml-auto flex items-center gap-2">
          {/* Voltar */}
          <button
            onClick={() => onStep(Math.max(0, stepIndex - 1))}
            disabled={stepIndex === 0}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Play / Pause */}
          <button
            onClick={playing ? onPause : onPlay}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${cfg.accentText.replace('text-', 'bg-').replace('400', '500')} hover:opacity-80`}
          >
            {playing ? (
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          {/* Avançar */}
          <button
            onClick={() => onStep(Math.min(total - 1, stepIndex + 1))}
            disabled={stepIndex === total - 1}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Separador */}
      <div className="h-px bg-zinc-800" />

      {/* Sobre a operação */}
      <div className="space-y-1">
        <p className="text-xs text-zinc-600 uppercase tracking-wider">O que faz</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {step.resultValue !== undefined
            ? `Esta fórmula retorna o valor ${step.resultValue}.`
            : 'Prossiga pelos passos para ver o resultado final.'}
        </p>
      </div>
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

interface FormulaVisualizerProps {
  operation: Operation;
  initialLanguage: Language;
  onClose: () => void;
}

export function FormulaVisualizer({ operation, initialLanguage, onClose }: FormulaVisualizerProps) {
  const [activeLang, setActiveLang] = useState<Language>(initialLanguage);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const viz = operation.visualization || visualizations[operation.id];
  const languages = Object.keys(operation.equivalents) as Language[];
  const formula = operation.equivalents[activeLang]?.example ?? '';

  // Reset ao trocar linguagem
  useEffect(() => {
    setStepIndex(0);
    setPlaying(true);
  }, [activeLang]);

  // Auto-avançar passos
  useEffect(() => {
    if (!playing || !viz) return;
    const timer = setInterval(() => {
      setStepIndex((s) => {
        if (s >= viz.steps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 2200);
    return () => clearInterval(timer);
  }, [playing, viz]);

  const handleStep = useCallback((i: number) => {
    setStepIndex(i);
    setPlaying(false);
  }, []);

  const handlePlay = useCallback(() => {
    if (stepIndex >= (viz?.steps.length ?? 1) - 1) setStepIndex(0);
    setPlaying(true);
  }, [stepIndex, viz]);

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!viz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-zinc-400 text-sm">
          Visualização não disponível para esta fórmula.
          <button onClick={onClose} className="block mt-4 text-xs text-zinc-600 hover:text-zinc-400">Fechar</button>
        </div>
      </div>
    );
  }

  const cfg = LANG_CONFIG[activeLang];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-5xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
          style={{ maxHeight: '90vh', animation: 'slideUp 0.25s ease' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do modal */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
            <div>
              <p className="text-xs text-zinc-500">Visualizador · FormulaHub</p>
              <h2 className="text-base font-bold text-white mt-0.5">{operation.name}</h2>
            </div>

            {/* Tabs de linguagem */}
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
              {languages.map((lang) => {
                const lCfg = LANG_CONFIG[lang];
                const isActive = lang === activeLang;
                return (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                      isActive
                        ? `bg-zinc-700 ${lCfg.accentText}`
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors ml-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0">
            {/* Cena animada (esquerda, 60%) */}
            <div className="flex-[3] p-4 min-h-0">
              <Scene
                viz={viz}
                stepIndex={stepIndex}
                language={activeLang}
                formula={formula}
              />
            </div>

            {/* Painel de descrição (direita, 40%) */}
            <div className="flex-[2] border-l border-zinc-800 min-h-0 overflow-y-auto">
              <StepPanel
                viz={viz}
                stepIndex={stepIndex}
                language={activeLang}
                playing={playing}
                onPlay={handlePlay}
                onPause={() => setPlaying(false)}
                onStep={handleStep}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
