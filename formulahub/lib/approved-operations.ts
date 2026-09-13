import { Language, Operation, operations } from '@/data/formulas';

export const SUPPORTED_LANGUAGES = ['Excel', 'DAX', 'Power Fx', 'SQL', 'Python'] as const;
export const SUPPORTED_CATEGORIES = [
  'Busca e Referência',
  'Lógica',
  'Matemática e Estatística',
  'Texto',
  'Data e Hora',
  'Outros',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type SupportedCategory = (typeof SUPPORTED_CATEGORIES)[number];

export type ApprovedOperation = Operation & {
  aliases: readonly string[];
  sqlDialect: 'PostgreSQL 16';
  sources: Record<Language, string>;
};

const OFFICIAL_SOURCES: Record<Language, string> = {
  Excel: 'https://support.microsoft.com/en-us/excel',
  DAX: 'https://learn.microsoft.com/en-us/dax/',
  'Power Fx': 'https://learn.microsoft.com/en-us/power-platform/power-fx/formula-reference',
  SQL: 'https://www.postgresql.org/docs/16/',
  Python: 'https://pandas.pydata.org/docs/',
};

const metadata: Record<string, readonly string[]> = {
  lookup: ['procv', 'vlookup', 'lookup', 'busca vertical', 'busca de valor'],
  sumif: ['somase', 'sumif', 'soma condicional'],
  if: ['se', 'if', 'condicional', 'função se', 'funcao se'],
  concat: ['concatenar', 'concat', 'junção de texto', 'juncao de texto'],
  today: ['hoje', 'today', 'data atual'],
  countif: ['contse', 'countif', 'contagem condicional'],
  left: ['esquerda', 'left', 'primeiros caracteres'],
};

export const approvedOperations: readonly ApprovedOperation[] = operations
  .filter((operation) => metadata[operation.id])
  .map((operation) => ({
    ...operation,
    aliases: metadata[operation.id],
    sqlDialect: 'PostgreSQL 16',
    sources: OFFICIAL_SOURCES,
  }));

export function normalizeOperationQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function findApprovedOperation(query: string): ApprovedOperation | undefined {
  const normalizedQuery = normalizeOperationQuery(query);
  return approvedOperations.find((operation) =>
    operation.aliases.some((alias) => normalizeOperationQuery(alias) === normalizedQuery),
  );
}
