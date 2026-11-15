import { SITES_DATA } from "../../deliverables/demo/js/data/sites.js";
import { MOON_CRATER_REFERENCES } from "../../deliverables/demo/js/data/moon.js";
import { MARS_DUNE_REFERENCES } from "../../deliverables/demo/js/data/mars.js";
import {
  metricPairs,
  weightsFor,
} from "../../deliverables/demo/js/services/comparisonModel.js";

export const referencesFor = (body) =>
  body === "lua" ? MOON_CRATER_REFERENCES : MARS_DUNE_REFERENCES;
const distance = (a, b) => {
  const rad = Math.PI / 180,
    dlat = (b.lat - a.latitude) * rad,
    dlon = (b.lon - a.longitude) * rad;
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a.latitude * rad) *
      Math.cos(b.lat * rad) *
      Math.sin(dlon / 2) ** 2;
  return 6371008.8 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
};
export function catalogAudit(science) {
  const nearby = SITES_DATA.map((site) => ({
    site,
    distance_m: distance(science.localidade, site),
  }))
    .filter(
      ({ site, distance_m }) =>
        distance_m <= (site.type === "crater" ? 1200 : 2000),
    )
    .map(({ site, distance_m }) => ({
      id: site.id,
      name: site.name,
      kind: site.type,
      distance_m,
      tolerance_m: site.type === "crater" ? 1200 : 2000,
      metrics_present: Object.keys(weightsFor(site.type)).filter((k) =>
        Number.isFinite(site.metrics?.[k]),
      ),
      metrics_reused: [],
      scores_reused: false,
      reason:
        "Proximidade é indicação, não delimitação. sites.js não fornece fonte, método, resolução e área de amostragem por métrica; valores não promovidos a medições revisadas.",
    }));
  return {
    official_count: SITES_DATA.length,
    nearby,
    method:
      "Haversine em WGS84; tolerância de busca (1,2 km crateras / 2 km dunas), sem reutilização automática de scores/métricas.",
  };
}
export function comparisonDiagnosis(
  science,
  body,
  comparison,
  measurements,
  checks,
  thresholds,
) {
  const kind = body === "lua" ? "crater" : "dune",
    known = science.feature?.kind ?? science.identification?.kind;
  const keys = Object.keys(weightsFor(kind)),
    mismatch = !!known && known !== kind;
  const references = referencesFor(body).map((ref) => ({
    id: ref.id,
    name: ref.name,
    provenance:
      "Catálogo herdado do projeto; sem procedência individual por métrica em moon.js/mars.js. Índice experimental, não validação independente.",
    rows: metricPairs(measurements, ref, kind),
    missing: keys.filter((k) => !Number.isFinite(ref[k])),
    score: comparison.ranking?.find((m) => m.id === ref.id)?.score ?? null,
  }));
  let outcome, reason;
  if (mismatch) {
    outcome = "incompatible_geomorphology";
    reason = `Feição ${known === "dune" ? "eólica (dunas)" : "de impacto (cratera)"} documentada; este catálogo contém ${kind === "crater" ? "crateras lunares" : "dunas marcianas"}.`;
  } else if (!checks.evidence) {
    outcome = "insufficient_data";
    reason =
      science.identification?.boundary_status === "unavailable"
        ? science.identification.message
        : "Falta delimitação com métricas verificáveis da feição. Cobertura do DEM não representa cobertura das métricas do score.";
  } else if (comparison.missing.length) {
    outcome = "insufficient_data";
    reason = `Métricas ausentes ou inválidas: ${comparison.missing.join(", ")}.`;
  } else if (!checks.resolution || !checks.extent) {
    outcome = "invalid_geometry";
    reason =
      "Resolução ou extensão da feição incompatível com as medições; consulte as validações.";
  } else if (comparison.score === null) {
    outcome = "insufficient_data";
    reason =
      "Nenhuma referência completa e compatível disponível para o algoritmo.";
  } else if (comparison.score < thresholds.score) {
    outcome = "below_threshold";
    reason = `Score calculado (${comparison.score.toFixed(6)}), abaixo do limiar ${thresholds.score}.`;
  } else if (
    comparison.coverage < thresholds.coverage ||
    science.topography.coverage < 0.8 ||
    science.topography.valid_pixels < 100
  ) {
    outcome = "insufficient_quality";
    reason =
      "Score calculado; cobertura de métricas ou qualidade do DEM insuficiente para aprovação.";
  } else {
    outcome = "approved";
    reason =
      "Score, cobertura, resolução e qualidade atendem aos critérios experimentais do candidato.";
  }
  return {
    outcome,
    reason,
    geomorphology: known ?? "unidentified",
    references_loaded: references,
    metrics_available: keys.filter((k) => measurements[k] !== null),
    metrics_comparable: mismatch
      ? []
      : keys.filter(
          (k) =>
            measurements[k] !== null &&
            references.some((r) => !r.missing.includes(k)),
        ),
    metrics_missing: comparison.missing,
    checks,
    normalization: {
      executed: comparison.score !== null,
      reason:
        comparison.score !== null
          ? "Executada pela fórmula existente."
          : "Não executada: bloqueio anterior ao cálculo.",
      method: comparison.method,
    },
    approval: {
      score_threshold: thresholds.score,
      metric_coverage_threshold: thresholds.coverage,
      dem_coverage_threshold: 0.8,
      min_valid_pixels: 100,
    },
    next_steps:
      science.identification?.kind === "dune"
        ? [
            "Delimitar máscara de areia e rede de cristas/interdunas em ortoimagem/DEM com resolução adequada; validar proeminências, FFT, orientação e contagem na mesma área.",
            "Obter P/ET0 climatológico com período e fonte. DEM não mede aridez. Registrar medições verificadas em ANALYSIS_FEATURES_FILE.",
            "Não usar relevo máximo−mínimo como altura de duna, nem declividade da ROI como declividade de parede.",
          ]
        : [
            "Inspecionar polígono e perfis medidos; se insuficientes, configurar DEM local de maior resolução e/ou registro de medições revisadas.",
          ],
  };
}
