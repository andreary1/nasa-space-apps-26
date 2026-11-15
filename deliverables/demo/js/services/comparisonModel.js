import { CRATER_WEIGHTS, DUNE_WEIGHTS, PARAM_LABELS } from '../data/constants.js';
import { MOON_CRATER_REFERENCES } from '../data/moon.js';
import { MARS_DUNE_REFERENCES } from '../data/mars.js';
import { calculateMatch } from './similarity.js';
import { scaledTarget, normalizePair } from './calculations.js';

export const numericValue = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
export const weightsFor = type => type === 'crater' ? CRATER_WEIGHTS : DUNE_WEIGHTS;

export function metricPairs(earthMetrics, targetMetrics, type) {
  return Object.entries(weightsFor(type)).map(([key, weight]) => {
    const earth = numericValue(earthMetrics?.[key]);
    const target = numericValue(targetMetrics?.[key]);
    const comparable = target === null ? null : scaledTarget(target, key, type);
    const available = earth !== null && comparable !== null;
    const [normalizedEarth, normalizedTarget] = available ? normalizePair(earth, comparable) : [null, null];
    return {
      key, label: PARAM_LABELS[key] || key, weight, earth, target, comparable,
      scaled: type === 'dune' && ['wavelength', 'mean_spacing', 'mean_height'].includes(key),
      difference: available ? ((earth - comparable) / Math.max(Math.abs(comparable), 1e-4)) * 100 : null,
      normalizedEarth, normalizedTarget,
    };
  });
}

export function buildComparison(site) {
  const targets = site.type === 'crater' ? MOON_CRATER_REFERENCES : MARS_DUNE_REFERENCES;
  const matches = targets.map(target => ({target, ...calculateMatch(site.metrics, target, site.type)}))
    .filter(match => match.score !== null).sort((a, b) => b.score - a.score);
  return {site, matches, best: matches[0] || null, rows: metricPairs(site.metrics, matches[0]?.target, site.type)};
}
