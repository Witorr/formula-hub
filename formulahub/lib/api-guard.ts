/**
 * Camada de proteção para endpoints públicos:
 *   - validação de input (whitelist de charset, limites de tamanho)
 *   - rate-limit em memória (token bucket por IP)
 *   - verificação de Origin
 *   - extração robusta do IP cliente atrás de proxy
 *
 * Limitação conhecida: o rate-limit é por-instância (cada cold-start na
 * Vercel zera o estado). Atacante distribuído por múltiplas regions ainda
 * passa. Para fechar isso, migrar para @upstash/ratelimit (Redis).
 */

// ─── Input validation ────────────────────────────────────────────────────────

const SEARCH_QUERY_REGEX = /^[\p{L}\p{N} \-_().,?!]+$/u;
const MIN_LEN = 2;
const MAX_LEN = 100;

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateSearchQuery(input: unknown): ValidationResult {
  if (typeof input !== 'string') {
    return { ok: false, error: 'searchQuery deve ser uma string.' };
  }
  const trimmed = input.trim();
  if (trimmed.length < MIN_LEN) {
    return { ok: false, error: `searchQuery muito curto (mínimo ${MIN_LEN} caracteres).` };
  }
  if (trimmed.length > MAX_LEN) {
    return { ok: false, error: `searchQuery muito longo (máximo ${MAX_LEN} caracteres).` };
  }
  if (!SEARCH_QUERY_REGEX.test(trimmed)) {
    return { ok: false, error: 'searchQuery contém caracteres inválidos.' };
  }
  return { ok: true, value: trimmed };
}

// ─── Rate limit (token bucket por IP, em memória) ────────────────────────────

const CAPACITY = Number(process.env.RATE_LIMIT_CAPACITY) || 8;
const REFILL_PER_MIN = Number(process.env.RATE_LIMIT_REFILL_PER_MIN) || 4;
const REFILL_PER_MS = REFILL_PER_MIN / (60 * 1000);
const STALE_AFTER_MS = 60 * 60 * 1000;
const SWEEP_EVERY_N_CALLS = 200;

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();
let callsSinceSweep = 0;

function sweepIfNeeded() {
  if (++callsSinceSweep < SWEEP_EVERY_N_CALLS) return;
  callsSinceSweep = 0;
  const cutoff = Date.now() - STALE_AFTER_MS;
  for (const [k, b] of buckets) {
    if (b.lastRefill < cutoff) buckets.delete(k);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function takeToken(key: string): RateLimitResult {
  sweepIfNeeded();
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: CAPACITY, lastRefill: now };
    buckets.set(key, b);
  }
  const elapsed = now - b.lastRefill;
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_MS);
  b.lastRefill = now;
  if (b.tokens < 1) {
    const retryAfterMs = (1 - b.tokens) / REFILL_PER_MS;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  b.tokens -= 1;
  return { ok: true };
}

// ─── Client IP extraction ────────────────────────────────────────────────────

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

// ─── Origin check ────────────────────────────────────────────────────────────

function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const list: string[] = [];
  if (process.env.NEXT_PUBLIC_SITE_URL) list.push(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.VERCEL_URL) list.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== 'production') {
    list.push('http://localhost:3000', 'http://localhost:3001');
  }
  return list;
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin);
}

// ─── LLM output validation (defesa contra prompt injection / cache poisoning) ─

const URL_RE = /\b(?:https?:\/\/|www\.)\S+/i;
// Pega apenas tags HTML que são vetores reais de XSS — evita falso positivo em
// notação de placeholder estilo "FUNC(<column>)" que Gemini comumente produz.
const HTML_TAG_RE = /<\/?(?:script|iframe|object|embed|img|svg|link|style|a|button|input|textarea|form|meta|base|body|html|frame|frameset|applet|video|audio|source|math|marquee)\b[^>]*>/i;
const EXECUTABLE_EXT_RE = /\.(?:exe|dll|bat|ps1|vbs|jar|msi|apk|scr)\b/i;

const ALLOWED_CATEGORIES = new Set([
  'Busca e Referência',
  'Lógica',
  'Matemática e Estatística',
  'Texto',
  'Data e Hora',
  'Outros',
]);

const ALLOWED_LANGUAGES = new Set(['Excel', 'DAX', 'Power Fx', 'SQL', 'Python']);

const FIELD_MAX_LEN = {
  name: 80,
  category: 50,
  description: 600,
  language: 20,
  syntax: 400,
  example: 600,
  eqDescription: 600,
  headerCell: 40,
  rowCell: 80,
  stepLabel: 80,
  stepDescription: 600,
  stepResult: 100,
} as const;

export type OutputValidation = { ok: true } | { ok: false; error: string };

function checkText(
  val: unknown,
  field: string,
  maxLen: number,
  errs: string[],
): void {
  if (typeof val !== 'string') {
    errs.push(`${field}: tipo inválido`);
    return;
  }
  if (val.length > maxLen) errs.push(`${field}: comprimento ${val.length} > ${maxLen}`);
  if (URL_RE.test(val)) errs.push(`${field}: contém URL`);
  if (HTML_TAG_RE.test(val)) errs.push(`${field}: contém HTML`);
  if (EXECUTABLE_EXT_RE.test(val)) errs.push(`${field}: contém extensão executável`);
}

export function validateLlmOutput(op: unknown): OutputValidation {
  const errs: string[] = [];

  if (!op || typeof op !== 'object') return { ok: false, error: 'output não é objeto' };
  const o = op as Record<string, unknown>;

  checkText(o.name, 'name', FIELD_MAX_LEN.name, errs);
  checkText(o.category, 'category', FIELD_MAX_LEN.category, errs);
  checkText(o.description, 'description', FIELD_MAX_LEN.description, errs);

  if (typeof o.category === 'string' && !ALLOWED_CATEGORIES.has(o.category)) {
    errs.push(`category: '${o.category}' fora do enum permitido`);
  }

  if (!Array.isArray(o.equivalents) || o.equivalents.length !== 5) {
    errs.push('equivalents: deve ser array com exatamente 5 itens');
  } else {
    const seen = new Set<string>();
    for (const eq of o.equivalents as Array<Record<string, unknown>>) {
      checkText(eq?.language, 'equivalents.language', FIELD_MAX_LEN.language, errs);
      checkText(eq?.syntax, 'equivalents.syntax', FIELD_MAX_LEN.syntax, errs);
      checkText(eq?.description, 'equivalents.description', FIELD_MAX_LEN.eqDescription, errs);
      checkText(eq?.example, 'equivalents.example', FIELD_MAX_LEN.example, errs);
      if (typeof eq?.language === 'string') {
        if (!ALLOWED_LANGUAGES.has(eq.language)) errs.push(`equivalents.language: '${eq.language}' fora do enum`);
        if (seen.has(eq.language)) errs.push(`equivalents.language: '${eq.language}' duplicado`);
        seen.add(eq.language);
      }
    }
  }

  const viz = o.visualization as Record<string, unknown> | undefined;
  if (!viz || typeof viz !== 'object') {
    errs.push('visualization: ausente');
  } else {
    if (!Array.isArray(viz.headers)) errs.push('visualization.headers: deve ser array');
    else {
      if (viz.headers.length > 8) errs.push('visualization.headers: máximo 8 colunas');
      for (const h of viz.headers) checkText(h, 'visualization.headers[]', FIELD_MAX_LEN.headerCell, errs);
    }
    if (!Array.isArray(viz.rows)) errs.push('visualization.rows: deve ser array');
    else {
      if (viz.rows.length > 12) errs.push('visualization.rows: máximo 12 linhas');
      for (const row of viz.rows as unknown[]) {
        if (!Array.isArray(row)) { errs.push('visualization.rows[]: deve ser array'); continue; }
        for (const cell of row) checkText(cell, 'visualization.rows[][]', FIELD_MAX_LEN.rowCell, errs);
      }
    }
    if (!Array.isArray(viz.steps)) errs.push('visualization.steps: deve ser array');
    else {
      if (viz.steps.length > 4) errs.push('visualization.steps: máximo 4 passos');
      for (const step of viz.steps as Array<Record<string, unknown>>) {
        checkText(step?.label, 'visualization.steps.label', FIELD_MAX_LEN.stepLabel, errs);
        checkText(step?.description, 'visualization.steps.description', FIELD_MAX_LEN.stepDescription, errs);
        if (step?.resultValue !== null && step?.resultValue !== undefined) {
          checkText(step.resultValue, 'visualization.steps.resultValue', FIELD_MAX_LEN.stepResult, errs);
        }
      }
    }
  }

  if (errs.length > 0) return { ok: false, error: errs.join('; ') };
  return { ok: true };
}
