const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Isolated environments and SDK mocks: no real credentials, network or database.
function loadModule(file, env = {}, overrides = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, require, process: { env }, URL, AbortController, setTimeout, clearTimeout,
    ...overrides,
  }, { filename: file });
  return exports;
}

function request(origin, url = 'https://formulahub.app/api/generate-operation', extra = {}) {
  return new Request(url, { headers: { ...(origin ? { origin } : {}), ...extra } });
}

test('production accepts its own origin without environment configuration', () => {
  const guard = loadModule('lib/api-guard.ts', { NODE_ENV: 'production' });
  assert.equal(guard.isOriginAllowed(request('https://formulahub.app')), true);
  assert.equal(guard.isOriginAllowed(request('http://127.0.0.1:3010', 'http://127.0.0.1:3010/api/generate-operation')), true);
  for (const origin of [undefined, 'null', 'https://evil.example', 'https://formulahub.app.evil.example', 'https://formulahub.app/path', 'http://formulahub.app']) {
    assert.equal(guard.isOriginAllowed(request(origin)), false, String(origin));
  }
  assert.equal(guard.isOriginAllowed(request('https://evil.example', undefined, {
    'x-forwarded-host': 'evil.example', 'x-forwarded-proto': 'https',
  })), false);
});

test('explicit allowlist is normalized and remains exclusive', () => {
  const guard = loadModule('lib/api-guard.ts', {
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: ' https://FORMULAHUB.app/, https://www.formulahub.app:443/ ',
  });
  assert.equal(guard.isOriginAllowed(request('https://formulahub.app')), true);
  assert.equal(guard.isOriginAllowed(request('https://www.formulahub.app')), true);
  assert.equal(guard.isOriginAllowed(request('https://preview.example', 'https://preview.example/api/generate-operation')), false);
});

test('public URL works behind a proxy; invalid configured URLs fail closed', () => {
  const guard = loadModule('lib/api-guard.ts', {
    NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://formulahub.app/',
  });
  assert.equal(guard.isOriginAllowed(request('https://formulahub.app', 'http://internal:3000/api/generate-operation')), true);
  const invalid = loadModule('lib/api-guard.ts', { ALLOWED_ORIGINS: 'null,*,https://user:pass@formulahub.app' });
  assert.equal(invalid.isOriginAllowed(request('https://formulahub.app')), false);
});

function loadLlm(env, generateContent, timers = {}) {
  return loadModule('lib/llm.ts', env, {
    require: () => ({ GoogleGenAI: class { models = { generateContent }; } }),
    ...timers,
  });
}

test('generation uses a bounded thinking budget and clears the 90s timer', async () => {
  let cleared = false;
  const llm = loadLlm({}, async (args) => {
    assert.equal(args.config.thinkingConfig.thinkingBudget, 1024);
    assert.equal(args.config.responseMimeType, 'application/json');
    assert.equal(args.config.abortSignal.aborted, false);
    return { text: '{"name":"SE"}' };
  }, {
    setTimeout: (_, ms) => { assert.equal(ms, 90_000); return 123; },
    clearTimeout: (id) => { assert.equal(id, 123); cleared = true; },
  });
  assert.equal((await llm.generateDynamicFormula('SE condicional')).name, 'SE');
  assert.equal(cleared, true);
});

test('timeout aborts the SDK request and returns the typed timeout error', async () => {
  const llm = loadLlm({ LLM_TIMEOUT_MS: '5' }, ({ config }) => new Promise((resolve, reject) => {
    config.abortSignal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
  await assert.rejects(llm.generateDynamicFormula('SE'), llm.LlmTimeoutError);
});

test('invalid timeouts use the default and excessive timeouts are capped', async () => {
  for (const [value, expected] of [['-1', 90000], ['Infinity', 90000], ['abc', 90000], ['0', 90000], ['200000', 100000]]) {
    const llm = loadLlm({ LLM_TIMEOUT_MS: value }, async () => ({ text: '{}' }), {
      setTimeout: (_, ms) => { assert.equal(ms, expected); return 1; }, clearTimeout: () => {},
    });
    await llm.generateDynamicFormula('SE');
  }
});

test('provider errors remain distinguishable from timeouts', async () => {
  const providerError = Object.assign(new Error('quota'), { status: 429 });
  const llm = loadLlm({}, async () => { throw providerError; });
  await assert.rejects(llm.generateDynamicFormula('SE'), (error) => error === providerError);
});
