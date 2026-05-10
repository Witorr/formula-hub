import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { translateFormula } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sourceLanguage, targetLanguage, sourceCode } = body;

    if (!sourceLanguage || !targetLanguage || !sourceCode) {
      return NextResponse.json(
        { error: 'Parâmetros ausentes: sourceLanguage, targetLanguage ou sourceCode' },
        { status: 400 }
      );
    }

    // 1. Verificar Cache no Banco de Dados
    const cachedTranslation = await prisma.formulaTranslation.findFirst({
      where: {
        sourceLanguage,
        targetLanguage,
        sourceCode: sourceCode.trim()
      }
    });

    if (cachedTranslation) {
      return NextResponse.json({
        success: true,
        data: cachedTranslation,
        source: 'database'
      });
    }

    // 2. Se não encontrou, chama o LLM
    const { translatedCode, explanation } = await translateFormula(
      sourceLanguage,
      targetLanguage,
      sourceCode
    );

    // 3. Salvar no Banco de Dados
    const newTranslation = await prisma.formulaTranslation.create({
      data: {
        sourceLanguage,
        targetLanguage,
        sourceCode: sourceCode.trim(),
        translatedCode,
        explanation,
        llmProvider: 'gemini-1.5-flash',
      }
    });

    return NextResponse.json({
      success: true,
      data: newTranslation,
      source: 'llm'
    });

  } catch (error: any) {
    console.error('Erro na rota /api/translate:', error);

    const status = error?.status ?? error?.cause?.status ?? 0;
    const msg = error?.message ?? '';

    if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota')) {
      // Tenta extrair o tempo de retry da mensagem da API
      const retryMatch = msg.match(/retry in (\d+)/i);
      const retrySeconds = retryMatch ? parseInt(retryMatch[1]) + 1 : 60;
      return NextResponse.json(
        { error: `Limite de requisições da IA atingido. Tente novamente em ${retrySeconds} segundos.` },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Não foi possível gerar a tradução no momento.', details: msg },
      { status: 500 }
    );
  }
}
