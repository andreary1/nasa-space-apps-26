#!/usr/bin/env node
// Diagnóstico rápido da conexão com a IA.
//   node scripts/ai_reports/check.mjs     (na raiz do repositório)
// Testa: .env carregado, chave aceita, modelo existente e tempo de resposta.
import { loadEnv, providerConfig } from './ai_client.mjs';

await loadEnv();
let config;
try {
  config = providerConfig();
} catch (error) {
  console.log(`✗ Configuração: ${error.message}`);
  process.exit(1);
}
console.log(`Provedor: ${config.name}\nEndpoint: ${config.baseUrl}\nModelo: ${config.model}\nChave: ${config.apiKey.length} caracteres, começa com "${config.apiKey.slice(0, 4)}…"`);
if (/\s/.test(config.apiKey)) console.log('⚠ A chave contém espaços. Confira o .env.');

async function timed(label, run) {
  const started = Date.now();
  try {
    const result = await run();
    console.log(`✓ ${label} (${((Date.now() - started) / 1000).toFixed(1)}s)${result ? `: ${result}` : ''}`);
    return true;
  } catch (error) {
    const cause = error.cause?.code || error.cause?.message;
    const reason = error.name === 'TimeoutError' ? 'sem resposta no tempo limite' : `${error.message}${cause ? ` (${cause})` : ''}`;
    console.log(`✗ ${label} (${((Date.now() - started) / 1000).toFixed(1)}s): ${reason}`);
    return false;
  }
}

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` };

console.log('\n1. Lista de modelos (testa rede e chave)');
let modelIds = [];
const listed = await timed('GET /models', async () => {
  const response = await fetch(`${config.baseUrl}/models`, { headers, signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
  modelIds = (JSON.parse(text).data || []).map(model => String(model.id).replace(/^models\//, ''));
  return `${modelIds.length} modelos`;
});
if (listed && modelIds.length) {
  const found = modelIds.includes(config.model.replace(/^models\//, ''));
  console.log(found ? `✓ Modelo "${config.model}" disponível` : `⚠ Modelo "${config.model}" não aparece na lista`);
  const flash = modelIds.filter(id => /flash/i.test(id) && !/image|tts|audio|live|embedding/i.test(id)).slice(0, 8);
  if (flash.length) console.log(`  Modelos "flash" disponíveis: ${flash.join(', ')}`);
}

async function chat(reasoning) {
  const body = { model: config.model, messages: [{ role: 'user', content: 'Responda apenas com a palavra: ok' }], max_tokens: 50 };
  if (reasoning) body.reasoning_effort = reasoning;
  const response = await fetch(`${config.baseUrl}/chat/completions`, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(45000) });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
  return JSON.stringify(JSON.parse(text).choices?.[0]?.message?.content ?? '').slice(0, 60);
}

console.log('\n2. Resposta curta');
if (config.reasoning) await timed(`com reasoning_effort=${config.reasoning}`, () => chat(config.reasoning));
await timed('sem reasoning_effort', () => chat(''));

console.log('\nSe algo falhou, cole esta saída na conversa.');
