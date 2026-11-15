import { PARAM_LABELS } from '../data/constants.js';
import { PIPELINE, MOON_REFS, MARS_REFS } from './pipeline.js';
import { normalizePair } from './calculations.js';

export const numericValue = value => typeof value === 'number' && Number.isFinite(value) ? value : null;

function rowFromFeature(feature) {
  const earth = numericValue(feature.earth);
  const target = numericValue(feature.target);
  const comparable = numericValue(feature.target_scaled);
  const available = earth !== null && comparable !== null;
  const [normalizedEarth, normalizedTarget] = available ? normalizePair(earth, comparable) : [null, null];
  return {
    key: feature.key, label: PARAM_LABELS[feature.key] || feature.key, weight: feature.weight,
    earth, target, comparable, used: feature.used,
    scale: numericValue(feature.scale),
    scaled: numericValue(feature.scale) !== null && feature.scale !== 1,
    difference: available ? ((earth - comparable) / Math.max(Math.abs(comparable), 1e-4)) * 100 : null,
    normalizedEarth, normalizedTarget,
  };
}

// Linhas sem alvo (sítio sem score): só o valor medido do lado da Terra.
function earthOnlyRows(site) {
  return (PIPELINE.meta.feature_keys[site.type] || []).map(key => ({
    key, label: PARAM_LABELS[key] || key, weight: null, earth: numericValue(site.metrics?.[key]),
    target: null, comparable: null, used: false, scale: null, scaled: false,
    difference: null, normalizedEarth: null, normalizedTarget: null,
  }));
}

const NOT_PROCESSED = 'Este sítio não foi processado pelo pipeline. Rode o pipeline e exporte o relatório (scripts/export_pipeline_to_demo.py) para ver o score.';

// Monta o modelo exibido na interface a partir do resultado do pipeline.
export function buildComparison(site) {
  const entry = site.pipeline || null;
  const refs = site.type === 'crater' ? MOON_REFS : MARS_REFS;
  const matches = (entry?.matches || []).map(match => ({
    target: refs.find(ref => ref.id === match.ref_id) || {id: match.ref_id, name: match.ref_id},
    score: match.score, wed: match.wed, cosine: match.cosine, coverage: match.coverage,
    features: match.features, missingEarth: match.missing_earth, missingReference: match.missing_reference,
  }));
  const best = matches[0] || null;
  return {
    site, matches, best,
    rows: best ? best.features.map(rowFromFeature) : earthOnlyRows(site),
    status: entry?.status || 'not_processed',
    reason: entry ? (entry.reason || '') : NOT_PROCESSED,
    quality: entry?.dq || null,
  };
}
