#!/usr/bin/env node
// Gera os relatórios de IA em lote, pela linha de comando.
// Para gerar pelo botão da página Relatórios, use server.mjs.
//
// Uso (na raiz do repositório):
//   node scripts/ai_reports/generate_reports.mjs              gera os que faltam
//   node scripts/ai_reports/generate_reports.mjs --site lencois
//   node scripts/ai_reports/generate_reports.mjs --force      refaz todos
//   node scripts/ai_reports/generate_reports.mjs --dry-run    mostra o que seria enviado, sem chamar a API
//   node scripts/ai_reports/generate_reports.mjs --mock       grava relatórios de exemplo, sem chamar a API

import path from 'node:path';
import { SITES_DATA } from '../../deliverables/demo/js/data/sites.js';
import { ROOT, loadEnv, providerConfig } from './ai_client.mjs';
import { OUTPUT, readReports, saveEntry, generateEntry, payloadFor } from './reports_store.mjs';
import { buildMessages } from './prompt.mjs';

function parseArgs(argv) {
  const args = { force: false, dryRun: false, mock: false, site: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') args.force = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--mock') args.mock = true;
    else if (arg === '--site') args.site = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Argumento desconhecido: ${arg}`);
  }
  return args;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Opções: --site <id>  --force  --dry-run  --mock. Configuração em .env (veja .env.example).');
    return;
  }
  await loadEnv();

  const sites = args.site ? SITES_DATA.filter(site => site.id === args.site) : SITES_DATA;
  if (!sites.length) throw new Error(`Localidade "${args.site}" não encontrada em sites.js.`);

  const config = args.mock ? null : providerConfig({ requireKey: !args.dryRun });
  const existing = (await readReports()).reports;
  const delayMs = Number(process.env.AI_DELAY_MS ?? 4000);

  let done = 0;
  let failed = 0;
  for (const [index, site] of sites.entries()) {
    const label = `[${index + 1}/${sites.length}] ${site.id}`;
    if (existing[site.id] && !existing[site.id].mock && !args.force && !args.mock && !args.dryRun) {
      console.log(`${label}: já existe, pulando (use --force para refazer)`);
      continue;
    }
    if (args.dryRun) {
      const { payload } = await payloadFor(site);
      console.log(`\n${label}\n${buildMessages(payload)[1].content}`);
      continue;
    }
    try {
      console.log(`${label}: ${args.mock ? 'gerando exemplo' : `consultando ${config.name}/${config.model}`}…`);
      const entry = await generateEntry(site, config, { mock: args.mock });
      await saveEntry(site.id, entry);
      done += 1;
      if (!args.mock) console.log(`   ok em ${entry.seconds.toFixed(1)}s`);
      if (!args.mock && index < sites.length - 1) await sleep(delayMs);
    } catch (error) {
      failed += 1;
      console.error(`${label}: FALHOU — ${error.message}`);
    }
  }

  if (!args.dryRun) console.log(`\nConcluído: ${done} gerado(s), ${failed} falha(s). Arquivo: ${path.relative(ROOT, OUTPUT)}`);
  if (failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(`Erro: ${error.message}`);
  process.exit(1);
});
