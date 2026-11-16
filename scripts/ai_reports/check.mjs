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
  console.log(`✗ Configuration: ${error.message}`);
  process.exit(1);
}
console.log(`Provider: ${config.name}\nEndpoint: ${config.baseUrl}\nModel: ${config.model}\nKey: ${config.apiKey.length} characters, starts with "${config.apiKey.slice(0, 4)}…"`);
if (/\s/.test(config.apiKey)) console.log('⚠ The key contains spaces. Check .env.');

async function timed(label, run) {
  const started = Date.now();
  try {
    const result = await run();
    console.log(`✓ ${label} (${((Date.now() - started) / 1000).toFixed(1)}s)${result ? `: ${result}` : ''}`);
    return true;
  } catch (error) {
    const cause = error.cause?.code || error.cause?.message;
    const reason = error.name === 'TimeoutError' ? 'no response within the timeout' : `${error.message}${cause ? ` (${cause})` : ''}`;
    console.log(`✗ ${label} (${((Date.now() - started) / 1000).toFixed(1)}s): ${reason}`);
    return false;
  }
}

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` };

console.log('\n1. Model list (tests network and key)');
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
  console.log(found ? `✓ Model "${config.model}" available` : `⚠ Model "${config.model}" is not listed`);
  const flash = modelIds.filter(id => /flash/i.test(id) && !/image|tts|audio|live|embedding/i.test(id)).slice(0, 8);
  if (flash.length) console.log(`  Available "flash" models: ${flash.join(', ')}`);
}

async function chat(reasoning) {
  const body = { model: config.model, messages: [{ role: 'user', content: 'Reply with only the word: ok' }], max_tokens: 50 };
  if (reasoning) body.reasoning_effort = reasoning;
  const response = await fetch(`${config.baseUrl}/chat/completions`, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(45000) });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
  return JSON.stringify(JSON.parse(text).choices?.[0]?.message?.content ?? '').slice(0, 60);
}

console.log('\n2. Short response');
if (config.reasoning) await timed(`with reasoning_effort=${config.reasoning}`, () => chat(config.reasoning));
await timed('without reasoning_effort', () => chat(''));

console.log('\nIf anything failed, paste this output into the chat.');
