import assert from "node:assert/strict";
import {
  compareScience,
  validateInput,
  validateExplanation,
  runPython,
} from "../../scripts/ai_reports/intelligent_analysis.mjs";
import { MOON_CRATER_REFERENCES } from "../../deliverables/demo/js/data/moon.js";
import { buildComparison } from "../../deliverables/demo/js/services/comparisonModel.js";
// Artificial fixtures exclusively for tests. Never added to the scientific catalog or UI.
const input = {
  nome: "Fixture de teste",
  latitude: 0,
  longitude: 0,
  raio_km: 5,
  comparar_com: ["lua", "marte"],
};
for (const extra of [
  { latitude: 91 },
  { latitude: null },
  { raio_km: 100 },
  { comparar_com: [] },
  { comparar_com: ["lua", "lua"] },
  { nome: " " },
])
  assert.throws(() => validateInput({ ...input, ...extra }));
const science = {
  localidade: input,
  feature: null,
  topography: {
    coverage: 1,
    valid_pixels: 1000,
    warnings: [],
    source: { id: "test-source", title: "Test fixture" },
  },
};
let result = compareScience(science);
assert.equal(result.comparisons.lua.score, null);
assert.equal(result.comparisons.marte.score, null);
assert.equal(result.pin.eligible, false);
assert.equal(result.comparisons.lua.diagnosis.outcome, "insufficient_data");
assert.equal(result.comparisons.lua.diagnosis.normalization.executed, false);
assert.equal(result.comparisons.lua.diagnosis.references_loaded.length, 9);
assert.equal(result.comparisons.marte.diagnosis.references_loaded.length, 7);
const ref = MOON_CRATER_REFERENCES.find((r) => r.id === "censorinus");
const feature = {
  kind: "crater",
  reviewed: true,
  extent_m: 4139,
  source: "Artificial test fixture only",
  method: "Automated numerical test",
  measurement_resolution_m: 10,
  measurements: Object.fromEntries(
    Object.entries(ref)
      .filter(([, v]) => typeof v === "number")
      .map(([key, value]) => [
        key,
        {
          value,
          unit: key.includes("slope") ? "deg" : key.endsWith("_m") ? "m" : "1",
          source: "Unit test",
        },
      ]),
  ),
};
result = compareScience({ ...science, feature });
assert.equal(
  result.comparisons.lua.score,
  buildComparison({ id: "test", type: "crater", metrics: ref }).best.score,
);
assert.ok(result.comparisons.lua.score > 0.99);
assert.equal(result.pin.eligible, true);
assert.equal(result.comparisons.marte.score, null);
assert.equal(
  result.comparisons.marte.diagnosis.outcome,
  "incompatible_geomorphology",
);
assert.equal(result.comparisons.lua.diagnosis.outcome, "approved");
const below = structuredClone(feature);
below.measurements.depth_m.value = 100000;
below.measurements.rim_height_m.value = 100000;
below.measurements.rim_variation_m.value = 100000;
below.measurements.mean_wall_slope.value = 1;
below.measurements.wall_slope_p90.value = 1;
const low = compareScience({ ...science, feature: below });
assert.ok(
  low.comparisons.lua.score !== null && low.comparisons.lua.score < 0.8,
);
assert.equal(low.comparisons.lua.diagnosis.outcome, "below_threshold");
assert.equal(low.pin.eligible, false);
assert.equal(low.comparisons.lua.diagnosis.normalization.executed, true);
const automatic = {
  ...feature,
  reviewed: false,
  validation: { passed: true, method: "radial_dem_v1" },
};
assert.equal(
  compareScience({ ...science, feature: automatic }).comparisons.lua.score,
  result.comparisons.lua.score,
);
const geographic = compareScience({
  ...science,
  localidade: {
    ...input,
    nome: "Outro nome",
    latitude: 31.1381,
    longitude: -3.9761,
  },
});
assert.equal(geographic.diagnostics.catalog.nearby[0].id, "erg_chebbi");
assert.deepEqual(geographic.diagnostics.catalog.nearby[0].metrics_reused, []);
assert.equal(geographic.comparisons.marte.score, null);
assert.equal(
  compareScience({
    ...science,
    feature,
    topography: { ...science.topography, coverage: 0.7 },
  }).pin.eligible,
  false,
);
const missing = structuredClone(feature);
missing.measurements.depth_m.value = null;
assert.equal(
  compareScience({ ...science, feature: missing }).comparisons.lua.score,
  null,
);
const wrongUnit = structuredClone(feature);
wrongUnit.measurements.diameter_m.unit = "km";
assert.equal(
  compareScience({ ...science, feature: wrongUnit }).pin.eligible,
  false,
);
const coarse = structuredClone(feature);
coarse.measurement_resolution_m = 1000;
assert.equal(
  compareScience({ ...science, feature: coarse }).pin.eligible,
  false,
);
const narrative = {
  resumo: "Sem evidência suficiente.",
  conclusao: "Comparação inconclusiva.",
  semelhancas: [],
  diferencas: [],
  limitacoes: ["Não há feição delimitada."],
  fontes: ["test-source"],
};
const configuredPython = process.env.ANALYSIS_PYTHON;
process.env.ANALYSIS_PYTHON = "nonexistent-python-intelligent-analysis-test";
try {
  await assert.rejects(runPython(input), /Python indisponível/);
} finally {
  if (configuredPython === undefined) delete process.env.ANALYSIS_PYTHON;
  else process.env.ANALYSIS_PYTHON = configuredPython;
}
assert.deepEqual(validateExplanation(narrative, ["test-source"]), narrative);
assert.throws(() =>
  validateExplanation({ ...narrative, score: 1 }, ["test-source"]),
);
assert.throws(() =>
  validateExplanation({ ...narrative, resumo: "Score de 99%" }, [
    "test-source",
  ]),
);
assert.throws(() =>
  validateExplanation({ ...narrative, fontes: ["invented"] }, ["test-source"]),
);
console.log(
  "PASS: strict inputs, existing exact matching, incompatible/missing metrics and units, quality gates and structured AI validation. Positive scores are synthetic test fixtures only.",
);
