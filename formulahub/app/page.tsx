import prisma from '@/lib/prisma';
import { HomeClient } from '@/components/HomeClient';
import { Operation, Language, FormulaExample } from '@/data/formulas';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let initialDynamicOperations: Operation[] = [];

  try {
    const dbOperations = await prisma.generatedOperation.findMany({
      include: {
        equivalents: true,
        visualization: {
          include: { steps: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    initialDynamicOperations = dbOperations.map((dbOp: any) => {
      const equivalentsMap = dbOp.equivalents.reduce((acc: any, eq: any) => {
        acc[eq.language as Language] = {
          language: eq.language as Language,
          syntax: eq.syntax,
          description: eq.description,
          example: eq.example,
        } as FormulaExample;
        return acc;
      }, {} as Record<Language, FormulaExample>);

      return {
        id: dbOp.id,
        name: dbOp.name,
        category: dbOp.category,
        description: dbOp.description,
        equivalents: equivalentsMap,
        visualization: dbOp.visualization,
      } as Operation;
    });
  } catch (error) {
    console.error('Erro ao buscar operações do banco:', error);
  }

  return <HomeClient initialDynamicOperations={initialDynamicOperations} />;
}
