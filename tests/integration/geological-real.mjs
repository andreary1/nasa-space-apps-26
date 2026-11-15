// Live local API + real sources/DEM/Gemini availability; no production mocks.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scientificSnapshot } from "../../deliverables/demo/js/services/analysisSnapshot.js";
import { SITES_DATA } from "../../deliverables/demo/js/data/sites.js";
const base = process.env.DEMO_URL || "http://127.0.0.1:8000/";
const headers = {
  "Content-Type": "application/json",
  "X-Analysis-Session": randomUUID(),
};
const dir = path.join(os.tmpdir(), "paf-geological-qa");
fs.mkdirSync(dir, { recursive: true });
const summary = [];
for (const [id, nome, latitude, longitude, raio_km, comparar_com] of [
  ["wolfe", "Cratera de Wolfe Creek", -19.17167, 127.79556, 3, ["lua"]],
  ["barringer", "Cratera de Barringer", 35.0333, -111.0167, 3, ["lua"]],
  ["erg-chebbi", "Erg Chebbi", 31.1381, -3.9761, 5, ["marte"]],
  ["aratanha", "Serra da Aratanha", -3.97, -38.63, 5, ["lua", "marte"]],
]) {
  const response = await fetch(new URL("/api/analyze", base), {
    method: "POST",
    headers,
    body: JSON.stringify({ nome, latitude, longitude, raio_km, comparar_com }),
  });
  assert.equal(response.status, 202);
  const { id: jobId } = await response.json();
  let job;
  const deadline = Date.now() + 480000;
  while (Date.now() < deadline) {
    job = await (
      await fetch(new URL("/api/analyze/" + jobId, base), { headers })
    ).json();
    if (job.status !== "processing") break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.equal(job.status, "complete", job.error);
  const r = job.result;
  assert.ok(r.topography.valid_pixels >= 100);
  if (r.discovery.status === "available") {
    assert.ok(r.discovery.citations.length && r.discovery.queries.length);
  } else assert.ok(r.discovery.message);
  if (id === "wolfe") {
    assert.ok(!SITES_DATA.some((s) => /wolfe/i.test(s.id + " " + s.name)));
    assert.equal(r.identification.status, "source_verified");
    assert.equal(r.identification.boundary_status, "measured");
    assert.equal(r.discovery_pin.eligible, true);
    assert.equal(r.pin.eligible, false);
    assert.equal(r.comparisons.lua.diagnosis.outcome, "below_threshold");
    assert.ok(r.topography.source.inputs.length);
    assert.equal(Object.keys(r.feature.measurements).length, 11);
  }
  if (id === "barringer") {
    assert.ok(Math.abs(r.comparisons.lua.score - 0.48561747862006044) < 1e-10);
    assert.equal(r.discovery_pin.eligible, true);
  }
  if (id === "erg-chebbi") {
    assert.equal(r.identification.kind, "dune");
    assert.equal(r.comparisons.marte.score, null);
    assert.equal(r.comparisons.marte.missing.length, 7);
    assert.equal(r.discovery_pin.eligible, true);
  }
  if (id === "aratanha") {
    assert.equal(r.feature, null);
    assert.equal(r.discovery_pin.eligible, false);
    assert.equal(r.pin.eligible, false);
  }
  const snapshot = scientificSnapshot(r);
  fs.writeFileSync(
    path.join(dir, id + "-api.json"),
    JSON.stringify(
      {
        executed_at: new Date().toISOString(),
        stages: job.stages,
        ...snapshot,
      },
      null,
      2,
    ),
  );
  const item = {
    id,
    input: r.localidade,
    discovery_status: r.discovery.status,
    discovery_message: r.discovery.message,
    search_model: r.discovery.model,
    state: r.discovery.state,
    identification: r.identification,
    dem: r.topography,
    feature: r.feature,
    comparisons: Object.fromEntries(
      Object.entries(r.comparisons).map(([body, c]) => [
        body,
        {
          score: c.score,
          reference: c.reference,
          coverage: c.coverage,
          missing: c.missing,
          diagnosis: c.diagnosis.outcome,
          reason: c.diagnosis.reason,
        },
      ]),
    ),
    discovery_pin: r.discovery_pin,
    candidate_pin: r.pin,
    explanation_status: r.explanation.status,
  };
  summary.push(item);
  console.log(
    "PASS REAL",
    id,
    JSON.stringify({
      research: r.discovery.status,
      model: r.discovery.model,
      state: r.discovery.state,
      coverage: r.topography.coverage,
      score: r.comparisons.lua?.score ?? r.comparisons.marte?.score,
      discovery_pin: r.discovery_pin.eligible,
      candidate: r.pin.eligible,
      explanation: r.explanation.status,
    }),
  );
}
fs.writeFileSync(
  path.join(dir, "summary.json"),
  JSON.stringify(summary, null, 2),
);
console.log("Real records:", dir);
