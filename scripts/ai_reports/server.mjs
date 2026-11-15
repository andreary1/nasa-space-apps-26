#!/usr/bin/env node
// Servidor local da demo com geração de relatórios pelo botão.
//
//   node scripts/ai_reports/server.mjs        (na raiz do repositório)
//   abra http://localhost:8000/
//   --open abre o navegador automaticamente (usado pelo iniciar-demo.bat)
//
// Serve apenas deliverables/demo/ (nunca o .env) e expõe:
//   GET  /api/health    provedor configurado?
//   POST /api/reports   { site } -> gera o relatório, salva e devolve
// A chave fica só aqui no servidor; o navegador nunca a recebe.
// Escuta só em 127.0.0.1: não fica acessível para outras máquinas da rede.

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { SITES_DATA } from '../../deliverables/demo/js/data/sites.js';
import { ROOT, loadEnv, providerConfig } from './ai_client.mjs';
import { saveEntry, generateEntry } from './reports_store.mjs';

const DEMO_DIR = path.join(ROOT, 'deliverables/demo');
const PORT = Number(process.env.PORT || 8000);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

await loadEnv();
const inFlight = new Map();

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req, limit = 200_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) { reject(Object.assign(new Error('Corpo muito grande.'), { status: 413 })); req.destroy(); }
      else chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(Object.assign(new Error('JSON inválido.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

// Localidades do catálogo usam a versão do sites.js e são salvas no arquivo.
// Localidades cadastradas na sessão vêm do navegador e não são salvas.
function resolveSite(input) {
  const catalog = SITES_DATA.find(site => site.id === input?.id);
  if (catalog) return { site: catalog, persist: true };
  const valid = input && typeof input.id === 'string' && typeof input.name === 'string'
    && ['dune', 'crater'].includes(input.type) && input.metrics && typeof input.metrics === 'object';
  if (!valid) throw Object.assign(new Error('Localidade inválida.'), { status: 400 });
  return { site: input, persist: false };
}

async function handleGenerate(req, res) {
  let config;
  try { config = providerConfig(); }
  catch (error) { return sendJson(res, 503, { error: error.message }); }

  const { site, persist } = resolveSite((await readBody(req)).site);
  // Dois cliques seguidos na mesma localidade aproveitam a mesma geração.
  if (!inFlight.has(site.id)) {
    console.log(`→ gerando ${site.id} (${config.name}/${config.model})…`);
    inFlight.set(site.id, generateEntry(site, config).then(async entry => {
      if (persist) await saveEntry(site.id, entry);
      console.log(`✓ ${site.id} com ${entry.model} em ${entry.seconds.toFixed(1)}s${persist ? '' : ' (não salvo: cadastro da sessão)'}`);
      return entry;
    }).finally(() => inFlight.delete(site.id)));
  }
  try {
    sendJson(res, 200, { id: site.id, persisted: persist, entry: await inFlight.get(site.id) });
  } catch (error) {
    console.error(`✗ ${site.id}: ${error.message}`);
    sendJson(res, 502, { error: error.message });
  }
}

async function serveStatic(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  // Compatibilidade com o endereço antigo /deliverables/demo/...
  if (pathname.startsWith('/deliverables/demo')) pathname = pathname.slice('/deliverables/demo'.length) || '/';
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(DEMO_DIR, `.${pathname}`);
  const blocked = !file.startsWith(DEMO_DIR + path.sep) || pathname.split('/').some(part => part.startsWith('.'));
  if (blocked) { res.writeHead(403); return res.end('Proibido'); }
  try {
    if (!(await stat(file)).isFile()) throw new Error();
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404); res.end('Não encontrado');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/api/health' && req.method === 'GET') {
      let configured = true;
      let model = null;
      try { model = providerConfig().model; } catch { configured = false; }
      return sendJson(res, 200, { ok: true, configured, provider: process.env.AI_PROVIDER || 'gemini', model });
    }
    if (req.url === '/api/reports' && req.method === 'POST') return await handleGenerate(req, res);
    if (req.url.startsWith('/api/')) return sendJson(res, 404, { error: 'Rota não encontrada.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    return await serveStatic(req, res);
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message });
  }
});

const URL_DEMO = `http://localhost:${PORT}/`;
const shouldOpen = process.argv.includes('--open');

function openBrowser() {
  const [command, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', URL_DEMO]]
    : process.platform === 'darwin' ? ['open', [URL_DEMO]] : ['xdg-open', [URL_DEMO]];
  try {
    const child = spawn(command, args, { stdio: 'ignore', detached: true });
    child.on('error', () => console.log(`Abra manualmente: ${URL_DEMO}`));
    child.unref();
  }
  catch { console.log(`Abra manualmente: ${URL_DEMO}`); }
}

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.log(`A porta ${PORT} já está em uso — a demo provavelmente já está aberta em outra janela.`);
    if (shouldOpen) openBrowser();
    process.exit(0);
  }
  throw error;
});

server.listen(PORT, '127.0.0.1', () => {
  let status;
  try { const config = providerConfig(); status = `IA: ${config.name}/${config.model}`; }
  catch (error) { status = `IA desativada — ${error.message}`; }
  console.log(`Demo em ${URL_DEMO}\n${status}\nPara parar, feche esta janela ou use Ctrl+C.`);
  if (shouldOpen) openBrowser();
});
