import { CRATER_WEIGHTS, DUNE_WEIGHTS } from '../data/constants.js';
import { scaledTarget, normalizePair } from './calculations.js';
export function calculateMatch(earthMetrics, targetMetrics, type) {
  const weights = type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS;
  // Missing measurements cannot represent zero. Complete numeric inputs keep
  // the original formula, coefficients and weights without modification.
  if (Object.keys(weights).some(key =>
    typeof earthMetrics?.[key] !== 'number' || !Number.isFinite(earthMetrics[key]) ||
    typeof targetMetrics?.[key] !== 'number' || !Number.isFinite(targetMetrics[key]))) {
    return {score: null, wed: null, cosine: null};
  }
  let weightedSqSum = 0;
  let dotProd = 0, normA = 0, normB = 0;

  for (const [key, weight] of Object.entries(weights)) {
    let valEarth = Number(earthMetrics[key]) || 0;
    let valPlanet = Number(targetMetrics[key]) || 0;

    valPlanet = scaledTarget(valPlanet, key, type);

    const [normEarth, normTarget] = normalizePair(valEarth, valPlanet);
    const diff = normEarth - normTarget;
    weightedSqSum += weight * diff * diff;
    dotProd += (weight * normEarth) * (weight * normTarget);
    normA += Math.pow(weight * normEarth, 2);
    normB += Math.pow(weight * normTarget, 2);
  }

  const wed = Math.sqrt(weightedSqSum);
  const cosineSim = (normA > 0 && normB > 0) ? Math.max(0, Math.min(1, dotProd / (Math.sqrt(normA) * Math.sqrt(normB)))) : 0;

  const k = 2.2;
  const eucScore = Math.exp(-k * wed);
  const finalScore = 0.6 * eucScore + 0.4 * cosineSim;

  return { score: finalScore, wed: wed, cosine: cosineSim };
}
