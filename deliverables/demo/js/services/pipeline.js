// Resultados do pipeline Python (data/pipeline-results.js, gerado por
// scripts/export_pipeline_to_demo.py). O demo NÃO calcula scores: tudo que
// aparece (atributos, score, WED, cosseno, escalonamento) vem do relatório.
import { PIPELINE } from '../data/pipeline-results.js';
import { MOON_CRATER_REFERENCES as FRONT_MOON } from '../data/moon.js';
import { MARS_DUNE_REFERENCES as FRONT_MARS } from '../data/mars.js';

export { PIPELINE };

// Referências do pipeline mandam nos valores numéricos; o catálogo do front só
// contribui com nome e campos descritivos (bordas, tipo de duna etc.).
function mergeRefs(pipelineRefs, frontRefs) {
  return pipelineRefs.map(ref => {
    const front = frontRefs.find(item => item.id === ref.id);
    return {...front, ...ref, name: front?.name ?? ref.name};
  });
}
export const MOON_REFS = mergeRefs(PIPELINE.moon_refs, FRONT_MOON);
export const MARS_REFS = mergeRefs(PIPELINE.mars_refs, FRONT_MARS);

// "pipeline" fica não enumerável para não inflar o JSON do sítio (relatório, IA).
function attach(site, entry) {
  Object.defineProperty(site, 'pipeline', {value: entry, writable: true, configurable: true, enumerable: false});
}

// Substitui os atributos do catálogo pelos medidos/registrados pelo pipeline e
// acrescenta os sítios que só o pipeline conhece. Sem resultado => sem números.
export function applyPipeline(sites) {
  for (const site of sites) {
    const entry = PIPELINE.sites[site.id] || null;
    attach(site, entry);
    site.metrics = entry?.metrics ? {...entry.metrics} : {};
  }
  for (const [id, entry] of Object.entries(PIPELINE.sites)) {
    if (sites.some(site => site.id === id)) continue;
    if (!Number.isFinite(entry.lat) || !Number.isFinite(entry.lon)) {
      console.warn(`Sítio ${id} do pipeline sem coordenadas: fora do mapa.`);
      continue;
    }
    const site = {
      id, name: entry.name || id, uf: 'Brasil',
      category: entry.category || (entry.kind === 'dune' ? 'Campo de dunas' : 'Estrutura circular'),
      type: entry.kind, body: entry.kind === 'dune' ? 'mars' : 'moon',
      lat: entry.lat, lon: entry.lon, metrics: {...(entry.metrics || {})},
    };
    attach(site, entry);
    sites.push(site);
  }
  return sites;
}
