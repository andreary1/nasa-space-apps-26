import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const base = process.env.DEMO_URL || "http://127.0.0.1:8000/";
const owner = randomUUID();
const input = {
  nome: "Serra da Aratanha",
  latitude: -3.97,
  longitude: -38.63,
  raio_km: 5,
  comparar_com: ["lua", "marte"],
};
const headers = {
  "Content-Type": "application/json",
  "X-Analysis-Session": owner,
};
const post = (body, extra = {}) =>
  fetch(new URL("/api/analyze", base), {
    method: "POST",
    headers: { ...headers, ...extra },
    body: JSON.stringify(body),
  });
assert.equal((await post({ ...input, raio_km: 11 })).status, 400);
assert.equal(
  (await post(input, { "X-Analysis-Session": "invalid" })).status,
  400,
);
assert.equal(
  (await post(input, { Origin: "http://untrusted.example" })).status,
  403,
);
const health = await (await fetch(new URL("/api/health", base))).json();
assert.equal(health.ok, true);
console.log(
  "PASS: live API startup/health, strict input, session header and origin validation.",
);
if (process.env.RUN_REAL_DEM === "1") {
  const result = await post({
    ...input,
    nome: "Barringer — verificação real sem delimitação revisada",
    latitude: 35.0275,
    longitude: -111.0228,
    raio_km: 2,
  });
  assert.equal(result.status, 202);
  const { id } = await result.json();
  let job;
  const deadline = Date.now() + 380000;
  while (Date.now() < deadline) {
    job = await (
      await fetch(new URL(`/api/analyze/${id}`, base), { headers })
    ).json();
    if (job.status !== "processing") break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  assert.equal(job.status, "complete", job.error);
  assert.equal(job.result.identification.boundary_status, 'measured');
  assert.ok(Number.isFinite(job.result.comparisons.lua.score));
  assert.equal(job.result.comparisons.lua.diagnosis.outcome, 'below_threshold');
  assert.equal(job.result.pin.eligible, false);
  const output = path.join(os.tmpdir(), "paf-intelligent-qa");
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, "barringer-real.json"),
    JSON.stringify(job.result, null, 2),
  );
  console.log(
    `PASS REAL: Barringer DEM acquired; ${job.result.topography.valid_pixels} valid pixels; measured rim, lunar score ${job.result.comparisons.lua.score}, below unchanged threshold. ${output}`,
  );
}
