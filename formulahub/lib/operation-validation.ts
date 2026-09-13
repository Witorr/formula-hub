import {
  ApprovedOperation,
  SUPPORTED_CATEGORIES,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '@/lib/approved-operations';

const INVALID_VALUE = /\b(n\/?a|nao aplicavel|não aplicável|indisponivel|indisponível|placeholder)\b/i;
const OFFICIAL_HOSTS = new Set([
  'support.microsoft.com',
  'learn.microsoft.com',
  'www.postgresql.org',
  'docs.python.org',
  'pandas.pydata.org',
]);

export type RejectionReason =
  | 'invalid_query'
  | 'ambiguous'
  | 'unknown_operation'
  | 'unsupported_equivalence'
  | 'unverified';

export type ClassificationResult =
  | { status: 'valid'; canonicalId: string }
  | { status: 'rejected'; reason: RejectionReason; message: string };

export function validateSearchQuery(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const query = value.trim().replace(/\s+/g, ' ');
  if (query.length < 2 || query.length > 120) return null;
  if (!/[\p{L}\p{N}]/u.test(query)) return null;
  return query;
}

export function createRejection(reason: RejectionReason, message: string): ClassificationResult {
  return { status: 'rejected', reason, message };
}

function isOfficialSource(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:' && OFFICIAL_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

function isValidText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !INVALID_VALUE.test(value);
}

export function validateApprovedOperation(operation: ApprovedOperation): string | null {
  if (!SUPPORTED_CATEGORIES.includes(operation.category as (typeof SUPPORTED_CATEGORIES)[number])) {
    return 'Categoria não permitida.';
  }

  if (operation.sqlDialect !== 'PostgreSQL 16') {
    return 'O dialeto SQL deve ser PostgreSQL 16.';
  }

  const languages = Object.keys(operation.equivalents) as SupportedLanguage[];
  if (
    languages.length !== SUPPORTED_LANGUAGES.length ||
    !SUPPORTED_LANGUAGES.every((language) => languages.includes(language))
  ) {
    return 'A operação precisa conter exatamente as cinco linguagens suportadas.';
  }

  for (const language of SUPPORTED_LANGUAGES) {
    const formula = operation.equivalents[language];
    if (!formula || formula.language !== language || !isValidText(formula.syntax) || !isValidText(formula.description) || !isValidText(formula.example)) {
      return `O equivalente ${language} é inválido.`;
    }
    if (!isOfficialSource(operation.sources[language])) {
      return `A fonte de ${language} não é oficial.`;
    }
  }

  return null;
}
