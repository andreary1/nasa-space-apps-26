// Opt-in real acquisitions. No synthetic data and no AI call: isolate science.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  runPython,
  compareScience,
} from "../../scripts/ai_reports/intelligent_analysis.mjs";
const dir =
  process.env.ANALYSIS_QA_DIR || path.join(os.tmpdir(), "paf-diagnostic-qa");
fs.mkdirSync(dir, { recursive: true });
const summary = [];
for (const [id, nome, latitude, longitude, raio_km] of [
  ["erg-chebbi", "Erg Chebbi", 31.1381, -3.9761, 5],
  ["barringer", "Cratera de Barringer", 35.0333, -111.0167, 2],
  [
    "barringer-contexto",
    "Cratera de Barringer (entorno completo)",
    35.0333,
    -111.0167,
    3,
  ],
  ["aratanha", "Serra da Aratanha", -3.97, -38.63, 5],
]) {
  const stages = [];
  try {
    const science = await runPython(
      { nome, latitude, longitude, raio_km, comparar_com: ["lua", "marte"] },
      (stage, message) => {
        stages.push({ stage, message });
        console.log(id, stage, message);
      },
    );
    const result = compareScience(science);
    fs.writeFileSync(
      path.join(dir, id + "-science.json"),
      JSON.stringify(science, null, 2),
    );
    fs.writeFileSync(
      path.join(dir, id + "-result.json"),
      JSON.stringify(
        { executed_at: new Date().toISOString(), stages, ...result },
        null,
        2,
      ),
    );
    fs.rmSync(path.join(dir, id + "-failure.json"), { force: true });
    summary.push({
      id,
      executed_at: new Date().toISOString(),
      input: result.localidade,
      topography: result.topography,
      identification: result.identification,
      feature: result.feature,
      catalog: result.diagnostics.catalog,
      comparisons: Object.fromEntries(
        Object.entries(result.comparisons).map(([body, c]) => [
          body,
          {
            outcome: c.diagnosis.outcome,
            reason: c.diagnosis.reason,
            score: c.score,
            coverage: c.coverage,
            metrics_comparable: c.diagnosis.metrics_comparable,
            missing: c.missing,
            normalization: c.diagnosis.normalization,
            checks: c.diagnosis.checks,
            reference: c.reference,
            ranking: c.ranking,
            references_loaded: c.diagnosis.references_loaded.map(
              ({ rows, ...reference }) => reference,
            ),
            rows: c.rows,
            measurement_validation: c.diagnosis.measurement_validation,
          },
        ]),
      ),
      pin: result.pin,
      stages,
    });
    assert.ok(result.topography.valid_pixels >= 100);
    assert.equal(result.diagnostics.technical_processing, "success");
    assert.equal(result.comparisons.lua.diagnosis.references_loaded.length, 9);
    assert.equal(
      result.comparisons.marte.diagnosis.references_loaded.length,
      7,
    );
    if (id === "erg-chebbi") {
      assert.equal(result.identification.kind, "dune");
      assert.equal(
        result.comparisons.lua.diagnosis.outcome,
        "incompatible_geomorphology",
      );
      assert.equal(
        result.comparisons.marte.diagnosis.outcome,
        "insufficient_data",
      );
      assert.equal(result.comparisons.marte.score, null);
    }
    if (id === "barringer") {
      assert.equal(result.identification.kind, "crater");
      assert.equal(
        result.comparisons.marte.diagnosis.outcome,
        "incompatible_geomorphology",
      );
      assert.equal(result.identification.boundary_status, "unavailable");
      assert.ok(result.identification.suggested_input.raio_km > 2);
      assert.equal(result.comparisons.lua.score, null);
    }
    if (id === "barringer-contexto") {
      assert.equal(
        result.identification.boundary_status,
        "measured",
        result.identification.message,
      );
      assert.ok(Number.isFinite(result.comparisons.lua.score));
      assert.equal(result.comparisons.lua.used.length, 11);
    }
    if (id === "aratanha") assert.equal(result.feature, null);
    console.log(
      id,
      JSON.stringify({
        coverage: result.topography.coverage,
        metrics: result.topography.metrics,
        feature: result.feature?.measurements,
        comparisons: Object.fromEntries(
          Object.entries(result.comparisons).map(([k, c]) => [
            k,
            {
              score: c.score,
              outcome: c.diagnosis.outcome,
              reason: c.diagnosis.reason,
            },
          ]),
        ),
        pin: result.pin,
      }),
    );
  } catch (error) {
    fs.writeFileSync(
      path.join(dir, id + "-failure.json"),
      JSON.stringify(
        { outcome: "technical_failure", message: error.message, stages },
        null,
        2,
      ),
    );
    console.error(id, error.message);
    process.exitCode = 1;
  }
}
console.log("Real diagnostics:", dir);
fs.writeFileSync(
  path.join(dir, "summary.json"),
  JSON.stringify(summary, null, 2),
);
