// Artificial provider fixtures ONLY in tests; no synthetic production discovery.
import assert from "node:assert/strict";
import {
  groundingResult,
  boundedJson,
  research,
} from "../../scripts/ai_reports/geological_discovery.mjs";
import {
  finalizeDiscovery,
  compareScience,
} from "../../scripts/ai_reports/intelligent_analysis.mjs";
import { scientificSnapshot } from "../../deliverables/demo/js/services/analysisSnapshot.js";
import {
  saveDiscoveries,
  loadDiscoveries,
} from "../../deliverables/demo/js/services/discoveryStore.js";
const input = {
  nome: "Synthetic test only",
  latitude: 0,
  longitude: 0,
  raio_km: 3,
  comparar_com: ["lua"],
};
assert.equal(
  groundingResult(
    { candidates: [{ content: { parts: [{ text: "Unverified" }] } }] },
    "test",
  ).status,
  "unavailable",
);
const payload = {
  candidates: [
    {
      content: { parts: [{ text: "Synthetic provider test, not evidence." }] },
      groundingMetadata: {
        webSearchQueries: ["synthetic"],
        groundingChunks: [
          { web: { uri: "https://example.org/synthetic", title: "Unit test" } },
        ],
        searchEntryPoint: { renderedContent: "<b>Test only</b>" },
      },
    },
  ],
};
const grounded = groundingResult(payload, "test");
assert.equal(grounded.status, "available");
assert.equal(grounded.citations[0].verification, "discovered");
await assert.rejects(boundedJson(new Response("x".repeat(100)), 10), /limite/);
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
try {
  process.env.ANALYSIS_DISCOVERY_ENABLED = "0";
  assert.equal((await research(input)).status, "disabled");
  process.env.ANALYSIS_DISCOVERY_ENABLED = "1";
  process.env.AI_PROVIDER = "gemini";
  process.env.GEMINI_SEARCH_API_KEY = "synthetic-unit-test-only";
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.ok(url.startsWith("https://generativelanguage.googleapis.com/"));
    assert.deepEqual(JSON.parse(options.body).tools, [{ google_search: {} }]);
    return new Response(JSON.stringify(payload));
  };
  assert.equal(
    (await research(input, () => {}, "unit-test-only")).status,
    "available",
  );
  assert.equal(
    (await research(input, () => {}, "unit-test-only")).cache_hit,
    true,
  );
  assert.equal(calls, 1);
  globalThis.fetch = async () =>
    new Response("Never display provider error body", { status: 429 });
  const denied = await research(
    { ...input, nome: "another fixture" },
    () => {},
    "unit-test-only",
  );
  assert.equal(denied.http_status, 429);
  assert.ok(!denied.message.includes("Never display"));
  assert.equal(
    (
      await research(
        { ...input, nome: "third fixture" },
        () => {},
        "unit-test-only",
      )
    ).cache_hit,
    true,
  );
} finally {
  globalThis.fetch = originalFetch;
  process.env = originalEnv;
}
const science = {
  localidade: input,
  topography: {
    metrics: {},
    coverage: 1,
    valid_pixels: 1000,
    source: { id: "synthetic", title: "Unit test only" },
  },
  feature: null,
  discovery: grounded,
};
let result = finalizeDiscovery(compareScience(science));
assert.equal(result.discovery_pin.eligible, false);
assert.equal(result.discovery.state, "insufficient_evidence");
assert.equal(result.comparisons.lua.score, null);
const identified = {
  ...science,
  identification: {
    id: "synthetic-entity-only",
    kind: "crater",
    status: "source_verified",
    verified_location: { latitude: 0, longitude: 0 },
    sources: [
      {
        id: "fixture",
        title: "Synthetic test only",
        url: "https://example.org/fixture",
      },
    ],
  },
};
result = finalizeDiscovery(compareScience(identified));
assert.equal(result.discovery_pin.eligible, true);
assert.equal(result.pin.eligible, false);
assert.equal(result.discovery.state, "geometry_pending");
assert.equal(scientificSnapshot(result).discovery.text, undefined);
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => storage.get(k),
  setItem: (k, v) => storage.set(k, v),
};
saveDiscoveries([
  result,
  { ...result, id: "repeat-test", localidade: { ...input, latitude: 0.00001 } },
]);
const restored = loadDiscoveries();
assert.equal(restored.length, 1);
assert.equal(restored[0].id, "repeat-test");
assert.equal(restored[0].discovery.text, undefined);
assert.equal(restored[0].discovery.citations, undefined);
assert.equal(restored[0].discovery_pin.id, result.discovery_pin.id);
delete globalThis.localStorage;
console.log(
  "PASS: grounding metadata versus assertions, official REST, bounded responses, disabled/unavailable/429 cooldown, per-session replay, independent evidence gates, snapshots and stable local deduplication without Google output.",
);
