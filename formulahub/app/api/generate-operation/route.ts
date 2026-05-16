import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDynamicFormula } from '@/lib/llm';
import {
  getClientIp,
  isOriginAllowed,
  takeToken,
  validateLlmOutput,
  validateSearchQuery,
} from '@/lib/api-guard';

function cachedOpToValidatableShape(cached: any) {
  const equivalents = (cached.equivalents ?? []).map((eq: any) => ({
    language: eq.language,
    syntax: eq.syntax,
    description: eq.description,
    example: eq.example,
  }));
  const viz = cached.visualization;
  return {
    name: cached.name,
    category: cached.category,
    description: cached.description,
    equivalents,
    visualization: viz
      ? {
          headers: viz.headers ?? [],
          rows: viz.rows ?? [],
          steps: (viz.steps ?? []).map((s: any) => ({
            label: s.label,
            description: s.description,
            resultValue: s.resultValue,
          })),
        }
      : undefined,
  };
}

export async function POST(req: Request) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  }

  const ip = getClientIp(req);
  const rl = takeToken(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Muitas requisições. Tente novamente em ${rl.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const validation = validateSearchQuery(
    (body as { searchQuery?: unknown })?.searchQuery,
  );
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const searchStr = validation.value;

  try {
    // 1. Cache lookup (exact match, case-sensitive — consistente com schema)
    const cachedOperation = await prisma.generatedOperation.findUnique({
      where: { searchQuery: searchStr },
      include: {
        equivalents: true,
        visualization: { include: { steps: true } },
      },
    });

    if (cachedOperation) {
      // Defesa em profundidade: revalida o conteúdo cacheado.
      // Se um registro antigo (gerado antes desta defesa) contiver URLs,
      // HTML, categoria/linguagem fora do enum ou tamanho anômalo, ele é
      // descartado e regerado. Auto-limpeza progressiva do cache poluído.
      const cachedCheck = validateLlmOutput(cachedOpToValidatableShape(cachedOperation));
      if (cachedCheck.ok) {
        return NextResponse.json({
          success: true,
          data: cachedOperation,
          source: 'database',
        });
      }
      console.warn(
        `[api-guard] Cache record id=${cachedOperation.id} searchQuery=${JSON.stringify(searchStr)} falhou validação: ${cachedCheck.error}. Removendo e regerando.`,
      );
      await prisma.generatedOperation.delete({ where: { id: cachedOperation.id } });
    }

    // 2. Não encontrou (ou foi descartado) → gera via LLM
    const opData = await generateDynamicFormula(searchStr);

    // 2b. Valida output do LLM antes de qualquer escrita no DB.
    const outputCheck = validateLlmOutput(opData);
    if (!outputCheck.ok) {
      console.warn(
        `[api-guard] LLM output rejeitado para searchQuery=${JSON.stringify(searchStr)}: ${outputCheck.error}`,
      );
      return NextResponse.json(
        { error: 'A IA retornou um resultado que não passou na verificação de segurança. Tente reformular a busca.' },
        { status: 422 },
      );
    }

    // 3. Persiste estrutura relacional
    const newOp = await prisma.generatedOperation.create({
      data: {
        searchQuery: searchStr,
        name: opData.name,
        category: opData.category,
        description: opData.description,
        llmProvider: 'gemini-2.5-flash',
        equivalents: {
          create: opData.equivalents.map((eq: any) => ({
            language: eq.language,
            syntax: eq.syntax,
            description: eq.description,
            example: eq.example,
          })),
        },
        visualization: {
          create: {
            headers: opData.visualization.headers || [],
            rows: opData.visualization.rows || [],
            steps: {
              create: (opData.visualization.steps || []).map((step: any) => ({
                label: step.label,
                description: step.description,
                highlightRows: step.highlightRows,
                highlightCols: step.highlightCols,
                highlightCells: step.highlightCells,
                dimRows: step.dimRows,
                resultValue: step.resultValue ? String(step.resultValue) : null,
              })),
            },
          },
        },
      },
      include: {
        equivalents: true,
        visualization: { include: { steps: true } },
      },
    });

    return NextResponse.json({ success: true, data: newOp, source: 'llm' });
  } catch (error: any) {
    console.error('Erro na rota /api/generate-operation:', error);

    const status = error?.status ?? error?.cause?.status ?? 0;
    const msg = error?.message ?? '';

    if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota')) {
      return NextResponse.json(
        { error: 'Limite da IA atingido. Tente novamente em instantes.' },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: 'Não foi possível gerar a operação no momento.' },
      { status: 500 },
    );
  }
}
