// Vercel: POST /api/reports { site } — gera o relatório de IA de uma localidade.
// A chave fica nas variáveis de ambiente do projeto na Vercel (AI_API_KEY etc.).
// Em serverless não há disco persistente: o relatório volta para a página, que o
// mantém enquanto a aba estiver aberta. Para relatórios fixos, gere-os localmente
// (npm run reports) e faça commit de deliverables/demo/js/data/ai-reports.json.
import { SITES_DATA } from '../deliverables/demo/js/data/sites.js';
import { providerConfig } from '../scripts/ai_reports/ai_client.mjs';
import { generateEntry } from '../scripts/ai_reports/reports_store.mjs';

// Cache simples por instância: evita chamar a IA de novo para a mesma localidade.
const cache = new Map();
const CACHE_MS = 60 * 60 * 1000;

function resolveSite(input) {
  const catalog = SITES_DATA.find(site => site.id === input?.id);
  if (catalog) return catalog;
  // Cadastros da sessão só são aceitos se o projeto permitir (ALLOW_CUSTOM_SITES=true).
  const valid = process.env.ALLOW_CUSTOM_SITES === 'true' && input && typeof input.id === 'string'
    && typeof input.name === 'string' && ['dune', 'crater'].includes(input.type)
    && input.metrics && typeof input.metrics === 'object' && JSON.stringify(input).length < 20000;
  return valid ? input : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  let config;
  try { config = providerConfig(); }
  catch (error) { return res.status(503).json({ error: error.message }); }
  // Cabe no limite da função (maxDuration em vercel.json) mesmo com uma nova tentativa.
  config.timeoutMs = Math.min(config.timeoutMs, 45000);

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const site = resolveSite(body.site);
  if (!site) return res.status(400).json({ error: 'Localidade inválida ou fora do catálogo.' });

  const hit = cache.get(site.id);
  if (hit && Date.now() - hit.at < CACHE_MS && JSON.stringify(hit.metrics) === JSON.stringify(site.metrics)) {
    return res.status(200).json({ id: site.id, persisted: false, hosted: true, cached: true, entry: hit.entry });
  }
  try {
    const entry = await generateEntry(site, config, { log: console.warn });
    cache.set(site.id, { at: Date.now(), metrics: site.metrics, entry });
    console.log(`✓ ${site.id} com ${entry.model} em ${entry.seconds.toFixed(1)}s`);
    return res.status(200).json({ id: site.id, persisted: false, hosted: true, entry });
  } catch (error) {
    console.error(`✗ ${site.id}: ${error.message}`);
    return res.status(502).json({ error: error.message });
  }
}
