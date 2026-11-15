// Geração de um relatório e leitura/gravação de ai-reports.json.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { buildComparison } from '../../deliverables/demo/js/services/comparisonModel.js';
import { ROOT, callModel } from './ai_client.mjs';
import { PROMPT_VERSION, buildPayload, buildMessages, validateReport, mockReport } from './prompt.mjs';

const DATA_DIR = path.join(ROOT, 'deliverables/demo/js/data');
export const OUTPUT = path.join(DATA_DIR, 'ai-reports.json');
const CONTEXT = path.join(DATA_DIR, 'geographical-context.json');

async function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function readReports() {
  const data = await readJson(OUTPUT, { version: 1, reports: {} });
  data.reports ||= {};
  return data;
}

let contextCache = null;
async function contextFor(id) {
  contextCache ||= readJson(CONTEXT, { sites: {} }).then(data => data.sites || {});
  return (await contextCache)[id];
}

// Gravações em fila: evita que duas gerações simultâneas sobrescrevam uma à outra.
let writeQueue = Promise.resolve();
export function saveEntry(id, entry) {
  writeQueue = writeQueue.then(async () => {
    const data = await readReports();
    data.version = 1;
    data.updated_at = new Date().toISOString();
    data.reports[id] = entry;
    await writeFile(OUTPUT, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  });
  return writeQueue;
}

export async function payloadFor(site) {
  const model = buildComparison(site);
  return { model, payload: buildPayload(model, await contextFor(site.id)) };
}

export async function generateEntry(site, config, { mock = false, log } = {}) {
  const { model, payload } = await payloadFor(site);
  let report;
  let seconds = 0;
  let usedModel = config?.model;
  if (mock) report = mockReport(payload);
  else {
    const result = await callModel(config, buildMessages(payload), { log });
    report = validateReport(result.data, payload);
    seconds = result.seconds;
    usedModel = result.model;
  }
  return {
    generated_at: new Date().toISOString(),
    provider: mock ? 'mock' : config.name,
    model: mock ? 'mock' : usedModel,
    prompt_version: PROMPT_VERSION,
    mock,
    seconds,
    // Usado pelo front para avisar quando os dados mudaram depois da geração.
    input: { metrics: site.metrics, best_reference_id: model.best?.target.id ?? null },
    report,
  };
}
