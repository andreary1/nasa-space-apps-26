// Configuração do provedor e chamada ao modelo (formato OpenAI chat/completions).
// Compartilhado pelo gerador de linha de comando e pelo servidor local.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const PROVIDERS = {
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-3.1-flash-lite', reasoning: '', fallbacks: ['gemini-3.5-flash'] },
  groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-120b', reasoning: 'low' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', model: '', reasoning: '' },
};

// Leitor mínimo de .env (KEY=valor), sem dependências.
export async function loadEnv() {
  const file = path.join(ROOT, '.env');
  if (!existsSync(file)) return;
  for (const line of (await readFile(file, 'utf8')).split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    if (!(match[1] in process.env)) process.env[match[1]] = value;
  }
}

export function providerConfig({ requireKey = true } = {}) {
  const name = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const preset = PROVIDERS[name] || {};
  if (!PROVIDERS[name] && !process.env.AI_BASE_URL) {
    throw new Error(`AI_PROVIDER "${name}" desconhecido. Use ${Object.keys(PROVIDERS).join(', ')} ou defina AI_BASE_URL.`);
  }
  const config = {
    name,
    baseUrl: (process.env.AI_BASE_URL || preset.baseUrl).replace(/\/$/, ''),
    model: process.env.AI_MODEL || preset.model,
    apiKey: process.env.AI_API_KEY,
    // "low" deixa o Gemini bem mais rápido; vazio = padrão do modelo.
    reasoning: process.env.AI_REASONING_EFFORT ?? preset.reasoning,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
  };
  config.totalTimeoutMs = Number(process.env.AI_TOTAL_TIMEOUT_MS || 70000);
  for (const key of ['timeoutMs', 'totalTimeoutMs']) {
    if (!Number.isSafeInteger(config[key]) || config[key] <= 0 || config[key] > 70000) {
      throw new Error(`${key} deve ser um inteiro entre 1 e 70000 ms.`);
    }
  }
  // Modelos reserva, usados quando o principal está sobrecarregado (HTTP 503/429).
  const fallbacks = process.env.AI_FALLBACK_MODELS !== undefined
    ? process.env.AI_FALLBACK_MODELS.split(',').map(item => item.trim()).filter(Boolean)
    : preset.fallbacks || [];
  config.models = [...new Set([config.model, ...fallbacks].filter(Boolean))];
  if (!config.model) throw new Error('Defina AI_MODEL no .env para este provedor.');
  if (requireKey && (!config.apiKey || config.apiKey === 'coloque_sua_chave_aqui')) {
    throw new Error('AI_API_KEY não definida. Copie .env.example para .env e coloque sua chave.');
  }
  return config;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Extrai JSON mesmo que o modelo devolva dentro de ```json ... ```.
export function parseJsonContent(content) {
  const cleaned = String(content).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('A resposta não contém JSON.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function request(config, model, messages, useReasoning) {
  const body = { model, messages, max_tokens: 4096, temperature: 0.3, response_format: { type: 'json_object' } };
  if (useReasoning && config.reasoning) body.reasoning_effort = config.reasoning;
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.any([AbortSignal.timeout(config.timeoutMs), config.signal]),
  });
  const text = await response.text();
  return { response, text };
}

// Converte erros de rede/tempo em mensagens claras (sem alterar o erro original,
// cujo "message" pode ser somente leitura).
export function describeError(error, config) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return Object.assign(new Error(`a IA não respondeu em ${config.timeoutMs / 1000}s (rode o diagnóstico: node scripts/ai_reports/check.mjs)`), { fatal: true, fallback: true });
  }
  if (error instanceof TypeError && /fetch failed/i.test(error.message)) {
    const cause = error.cause?.code || error.cause?.message || 'sem detalhes';
    return Object.assign(new Error(`falha de conexão com ${config.baseUrl} (${cause})`), { retry: true });
  }
  return error instanceof Error ? error : new Error(String(error));
}

async function callOneModel(config, model, messages, { attempts, log }) {
  let lastError;
  let useReasoning = true;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (config.signal.aborted) throw new Error("Tempo total de geração excedido.");
    const started = Date.now();
    try {
      const { response, text } = await request(config, model, messages, useReasoning);
      // Alguns modelos não aceitam reasoning_effort: tenta de novo sem ele.
      if (response.status === 400 && useReasoning && /reasoning/i.test(text)) {
        useReasoning = false;
        throw Object.assign(new Error('modelo não aceita reasoning_effort'), { quick: true });
      }
      if (response.status === 429 || response.status >= 500) {
        throw Object.assign(new Error(`HTTP ${response.status}: ${summarize(text)}`), { retry: true, overloaded: true });
      }
      if (response.status === 404) throw Object.assign(new Error(`Modelo ${model} indisponível (HTTP 404).`), { fatal: true, fallback: true });
      if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}: ${summarize(text)}`), { fatal: true });
      const content = JSON.parse(text)?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Resposta sem conteúdo.');
      return { data: parseJsonContent(content), seconds: (Date.now() - started) / 1000, model };
    } catch (caught) {
      const error = describeError(caught, config);
      lastError = error;
      if (config.signal.aborted) throw new Error("Tempo total de geração excedido. Tente novamente mais tarde.");
      if (error.fatal || attempt >= attempts) break;
      const wait = error.quick ? 0 : error.retry ? 5000 * attempt : 2000;
      log(`   ${model}: tentativa ${attempt} falhou (${error.message.split('\n')[0]})${wait ? `. Nova tentativa em ${wait / 1000}s…` : ''}`);
      await sleep(Math.min(wait, Math.max(0, config.deadline - Date.now())));
    }
  }
  throw lastError;
}

// Extrai a mensagem útil de um erro JSON da API.
function summarize(text) {
  try {
    const body = JSON.parse(text);
    const error = Array.isArray(body) ? body[0]?.error : body.error;
    if (error?.message) return error.message.slice(0, 300);
  } catch { /* não é JSON */ }
  return String(text).slice(0, 300);
}

// Tenta o modelo principal e, se estiver sobrecarregado, os modelos reserva.
export async function callModel(config, messages, { attempts = 2, log = console.warn } = {}) {
  const started = Date.now();
  const total = config.totalTimeoutMs || 70000;
  config = { ...config, signal: AbortSignal.timeout(total), deadline: started + total };
  const models = config.models?.length ? config.models : [config.model];
  let lastError;
  for (const [index, model] of models.entries()) {
    try {
      const result = await callOneModel(config, model, messages, { attempts, log });
      return {...result, seconds: (Date.now() - started) / 1000};
    } catch (error) {
      lastError = error;
      const next = models[index + 1];
      if (config.signal.aborted || (!error.overloaded && !error.fallback) || !next) break;
      log(`   ${model} indisponível; tentando ${next}…`);
    }
  }
  throw lastError;
}
