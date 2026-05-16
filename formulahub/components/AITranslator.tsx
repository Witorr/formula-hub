'use client';

import { useState } from 'react';
import { Operation, Language, FormulaExample } from '@/data/formulas';
import { FormulaCard } from './FormulaCard';

export function AITranslator({ 
  initialSearch = '',
  onVisualize,
  onGenerate
}: { 
  initialSearch?: string;
  onVisualize?: (op: Operation, lang: Language) => void;
  onGenerate?: (op: Operation) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Operation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!initialSearch.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: initialSearch,
        }),
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        throw new Error(json.error || 'Erro desconhecido');
      }

      // Converte o retorno do Prisma pro formato da UI
      const dbOp = json.data;
      
      const equivalentsMap = dbOp.equivalents.reduce((acc: any, eq: any) => {
        acc[eq.language as Language] = {
          language: eq.language as Language,
          syntax: eq.syntax,
          description: eq.description,
          example: eq.example,
        };
        return acc;
      }, {} as Record<Language, FormulaExample>);

      const mappedOp: Operation = {
        id: dbOp.id,
        name: dbOp.name,
        category: dbOp.category,
        description: dbOp.description,
        equivalents: equivalentsMap,
        visualization: dbOp.visualization,
      };

      setResult(mappedOp);
      if (onGenerate) onGenerate(mappedOp);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Botão Principal */}
      {!result && !loading && (
        <div className="bg-zinc-900/60 border border-violet-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-violet-900/10 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/40 mb-4 text-2xl">
            ✨
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Gerar Cartão Dinâmico</h3>
          <p className="text-sm text-zinc-400 mb-6">A IA vai montar a explicação, tabelas de simulação interativas e as equivalências completas para as 5 linguagens em tempo real.</p>
          
          <button
            onClick={handleGenerate}
            disabled={!initialSearch.trim()}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            Gerar "{initialSearch}" usando Gemini AI
          </button>
        </div>
      )}

      {/* Loading animado com CSS */}
      {loading && (
        <div className="bg-zinc-900/60 border border-violet-500/30 rounded-2xl p-10 flex flex-col items-center justify-center gap-6 backdrop-blur-md">
          <div className="relative w-20 h-20">
            {/* Spinning ring 1 */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 border-r-violet-500 animate-[spin_1.5s_linear_infinite]" />
            {/* Spinning ring 2 */}
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-sky-500 border-l-sky-500 animate-[spin_2s_linear_infinite_reverse]" />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
              🧠
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">Processando via IA</h4>
            <p className="text-sm text-zinc-400 mt-2">Criando equivalentes e montando estrutura de visualização... Isso pode levar alguns segundos.</p>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
          <button onClick={() => setError(null)} className="block mx-auto mt-2 text-white hover:underline text-xs">Tentar novamente</button>
        </div>
      )}

      {/* Resultado (FormulaCard idêntico ao nativo) */}
      {result && !loading && (
        <div className="w-full animate-[slideUp_0.4s_ease-out]">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
               Gerado com sucesso
            </span>
            <button 
              onClick={() => setResult(null)} 
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Gerar outra vez
            </button>
          </div>
          
          <FormulaCard 
             operation={result} 
             compareMode={false} 
             onVisualize={(lang) => {
               if (onVisualize) onVisualize(result, lang);
             }}
          />
        </div>
      )}
    </div>
  );
}
