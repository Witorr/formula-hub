import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Operation, Language, FormulaExample } from '@/data/formulas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbOperations = await prisma.generatedOperation.findMany({
      include: {
        equivalents: true,
        visualization: {
          include: {
            steps: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const mappedOperations: Operation[] = dbOperations.map((dbOp: any) => {
      const equivalentsMap = dbOp.equivalents.reduce((acc: any, eq: any) => {
        acc[eq.language as Language] = {
          language: eq.language as Language,
          syntax: eq.syntax,
          description: eq.description,
          example: eq.example,
        };
        return acc;
      }, {} as Record<Language, FormulaExample>);

      return {
        id: dbOp.id,
        name: dbOp.name,
        category: dbOp.category,
        description: dbOp.description,
        equivalents: equivalentsMap,
        visualization: dbOp.visualization,
      };
    });

    return NextResponse.json({ success: true, data: mappedOperations });
  } catch (error: any) {
    console.error('Erro ao buscar operações geradas:', error);
    return NextResponse.json({ error: 'Erro ao buscar operações geradas' }, { status: 500 });
  }
}
