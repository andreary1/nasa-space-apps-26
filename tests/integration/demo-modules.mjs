import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SITES_DATA } from '../../deliverables/demo/js/data/sites.js';
import { PIPELINE, MOON_REFS, MARS_REFS } from '../../deliverables/demo/js/services/pipeline.js';
import { buildComparison } from '../../deliverables/demo/js/services/comparisonModel.js';
import { panelLocation } from '../../deliverables/demo/js/utils/formatters.js';
import { profilePaths, radarPoints } from '../../deliverables/demo/js/services/chartData.js';
import { compactTable } from '../../deliverables/demo/js/components/compactComparison.js';

// Oracle: the pipeline report itself. The demo must show exactly its numbers.
const report = JSON.parse(readFileSync(new URL(`../../data/processed/comparisons/${PIPELINE.meta.source_file}`, import.meta.url), 'utf8'));
const summaries = Object.fromEntries(['dunes_mars', 'craters_moon']
  .flatMap(key => report.results[key].site_summaries.map(s => [s.earth_site_id, s])));

// 1) Scores shown are the pipeline's scores, untouched.
let checked = 0;
for (const site of SITES_DATA) {
  const model = buildComparison(site);
  const summary = summaries[site.id];
  if (!summary) { assert.equal(model.best, null, `${site.id}: no pipeline score, none may be shown`); continue; }
  assert.equal(model.status, 'ok');
  assert.deepEqual(model.matches.map(m => m.target.id), summary.top_5_matches.map(m => m.planetary_ref_id));
  for (const [i, match] of model.matches.entries()) {
    const expected = summary.top_5_matches[i];
    assert.equal(match.score, expected.similarity_score, `${site.id}: score`);
    assert.equal(match.wed, expected.weighted_euclidean_dist);
    assert.equal(match.cosine, expected.cosine_similarity);
    assert.equal(match.coverage, expected.coverage);
    checked++;
  }
  const adapter = panelLocation(model);
  assert.equal(adapter.references[site.type === 'crater' ? 'lunar' : 'martian'].score, model.best.score);
  assert.equal(adapter.references[site.type === 'crater' ? 'martian' : 'lunar'], null);
  // Rows: measured value, pipeline scaling, nothing invented.
  const best = summary.best_match;
  for (const row of model.rows) {
    const i = model.rows.indexOf(row);
    assert.equal(row.earth, best.earth_vector[i]);
    assert.equal(row.comparable, best.planet_vector_scaled[i]);
    assert.equal(row.used, best.features_used.includes(row.key));
  }
  assert.equal(radarPoints(model.rows, 'normalizedEarth').length, model.rows.length);
}
console.log(`PASS: ${checked} matches show the exact pipeline score, WED, cosine and coverage.`);

// 2) Site attributes come from the pipeline, and never default to zero.
for (const site of SITES_DATA) {
  const entry = PIPELINE.sites[site.id];
  if (!entry?.metrics) { assert.equal(site.catalogOnly, true, `${site.id}: catalog values are informational only`); continue; }
  for (const [key, value] of Object.entries(entry.metrics)) assert.equal(site.metrics[key], value);
}
const missingAridity = SITES_DATA.find(s => s.id === 'erg_chebbi');
assert.equal(missingAridity.metrics.aridity_index, null, 'a missing attribute stays null, not 0');
console.log('PASS: site attributes are the pipeline ones; missing stays null.');

// 3) Excluded or unprocessed sites explain why instead of showing numbers.
const excluded = report.data_quality.craters_excluded.map(e => e.site_id).filter(id => SITES_DATA.some(s => s.id === id));
assert.ok(excluded.length > 0);
for (const id of excluded) {
  const model = buildComparison(SITES_DATA.find(s => s.id === id));
  assert.equal(model.status, 'excluded');
  assert.ok(model.reason.length > 0);
  assert.equal(model.best, null);
}
const unprocessed = SITES_DATA.filter(s => !PIPELINE.sites[s.id]);
for (const site of unprocessed) {
  const model = buildComparison(site);
  assert.equal(model.status, 'not_processed');
  assert.equal(model.best, null);
}
console.log(`PASS: ${excluded.length} excluded and ${unprocessed.length} unprocessed sites show a reason and no score.`);

// 4) Pipeline sites missing from the front catalog are added; references use pipeline values.
for (const id of Object.keys(PIPELINE.sites)) assert.ok(SITES_DATA.some(s => s.id === id), `${id} missing from the front`);
for (const ref of PIPELINE.moon_refs) assert.equal(MOON_REFS.find(r => r.id === ref.id).diameter_m, ref.diameter_m);
for (const ref of PIPELINE.mars_refs) assert.equal(MARS_REFS.find(r => r.id === ref.id).wavelength, ref.wavelength);
assert.equal(JSON.stringify(SITES_DATA[0]).includes('"matches"'), false, 'pipeline payload stays out of the site JSON');
console.log('PASS: pipeline-only sites added; references carry the pipeline values.');

// 5) Charts and compact tables work for every site, including those without a score.
const dune = SITES_DATA.find(s => buildComparison(s).best && s.type === 'dune');
const model = buildComparison(dune);
const base = profilePaths(dune, model.best.target, model.rows);
const doubled = profilePaths(dune, model.best.target, model.rows.map(r => r.key === 'wavelength' ? {...r, earth: r.earth * 2} : r));
assert.notDeepEqual(base, doubled);
for (const site of SITES_DATA) {
  const m = buildComparison(site);
  assert.equal(profilePaths(site, m.best?.target, m.rows) === null, !m.best || profilePaths(site, m.best.target, m.rows) === null);
  const location = panelLocation(m);
  const target = site.type === 'crater' ? 'lunar' : 'martian';
  assert.equal(compactTable(location, target === 'lunar' ? 'martian' : 'lunar'), null);
  assert.ok(compactTable(location, target).rows.length >= 5);
}
const barringer = panelLocation(buildComparison(SITES_DATA.find(s => s.id === 'barringer')));
assert.equal(compactTable(barringer, 'lunar').demo, true);
console.log('PASS: charts, panel adapters and compact tables for all sites.');
