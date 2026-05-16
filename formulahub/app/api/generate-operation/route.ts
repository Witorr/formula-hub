import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDynamicFormula } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchQuery } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Parâmetro ausente: searchQuery' },
        { status: 400 }
      );
    }

    const searchStr = searchQuery.trim();

    // 1. Verificar Cache no Banco de Dados via searchQuery exata (case sensitive, mas podemos usar insensitive em outro momento)
    const cachedOperation = await prisma.generatedOperation.findUnique({
      where: {
        searchQuery: searchStr,
      },
      include: {
        equivalents: true,
        visualization: {
          include: {
            steps: true,
          }
        }
      }
    });

    if (cachedOperation) {
      return NextResponse.json({
        success: true,
        data: cachedOperation,
        source: 'database'
      });
    }

    // 2. Se não encontrou, chama o LLM para estruturar todo o Operation
    const opData = await generateDynamicFormula(searchStr);

    // 3. Salvar toda a estrutura relacional no banco
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
          }))
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
                resultValue: step.resultValue ? String(step.resultValue) : null
              }))
            }
          }
        }
      },
      include: {
        equivalents: true,
        visualization: {
          include: { steps: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newOp,
      source: 'llm'
    });

  } catch (error: any) {
    console.error('Erro na rota /api/generate-operation:', error);

    const status = error?.status ?? error?.cause?.status ?? 0;
    const msg = error?.message ?? '';

    if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota')) {
      const retryMatch = msg.match(/retry in (\d+)/i);
      const retrySeconds = retryMatch ? parseInt(retryMatch[1]) + 1 : 60;
      return NextResponse.json(
        { error: `Limite de requisições da IA atingido. Tente novamente em ${retrySeconds} segundos.` },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Não foi possível gerar a operação no momento.', details: msg },
      { status: 500 }
    );
  }
}
