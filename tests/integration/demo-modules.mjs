import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { SITES_DATA } from '../../deliverables/demo/js/data/sites.js';
import { MOON_CRATER_REFERENCES } from '../../deliverables/demo/js/data/moon.js';
import { MARS_DUNE_REFERENCES } from '../../deliverables/demo/js/data/mars.js';
import { calculateMatch } from '../../deliverables/demo/js/services/similarity.js';
import { buildComparison, metricPairs } from '../../deliverables/demo/js/services/comparisonModel.js';
import { panelLocation } from '../../deliverables/demo/js/utils/formatters.js';
import { profilePaths, radarPoints } from '../../deliverables/demo/js/services/chartData.js';
import { PRESETS } from '../../deliverables/demo/js/data/presets.js';

// Independent oracle: execute the complete original script up to UI initialization.
const html = execFileSync('git', ['show', 'f0ddeec:deliverables/demo/index.html'], {encoding: 'utf8'});
const original = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const context = vm.createContext({});
vm.runInContext(original.slice(0, original.indexOf('// Spotlight cursor tracking')) + '\nthis.originalMatch = calculateMatch; this.sites = SITES_DATA;', context);
assert.equal(SITES_DATA.length, context.sites.length);
let pairs = 0;
for (const [i, site] of SITES_DATA.entries()) {
  assert.equal(JSON.stringify(site), JSON.stringify(context.sites[i]));
  for (const target of site.type === 'crater' ? MOON_CRATER_REFERENCES : MARS_DUNE_REFERENCES) {
    const before = context.originalMatch(site.metrics, target, site.type);
    const after = calculateMatch(site.metrics, target, site.type);
    for (const key of ['score', 'wed', 'cosine']) assert.ok(Math.abs(before[key] - after[key]) < 1e-14, `${site.id}: ${key}`);
    pairs++;
  }
}
console.log(`PASS: ${SITES_DATA.length} unchanged records; ${pairs} matches equal original scores, WED and cosine.`);

// Preserve all references and their annotations, not just terrestrial records.
vm.runInContext('this.moon = MOON_CRATER_REFERENCES; this.mars = MARS_DUNE_REFERENCES; this.presets = PRESETS;', context);
assert.equal(JSON.stringify(MOON_CRATER_REFERENCES), JSON.stringify(context.moon));
assert.equal(JSON.stringify(MARS_DUNE_REFERENCES), JSON.stringify(context.mars));
assert.equal(JSON.stringify(PRESETS), JSON.stringify(context.presets));
for (const site of SITES_DATA) {
  const model = buildComparison(site);
  assert.ok(model.best);
  const adapter = panelLocation(model);
  assert.equal(adapter.references[site.type === 'crater' ? 'lunar' : 'martian'].score, model.best.score);
  assert.equal(adapter.references[site.type === 'crater' ? 'martian' : 'lunar'], null);
  const originalOrder = (site.type === 'crater' ? context.moon : context.mars)
    .map(target => ({target, ...context.originalMatch(site.metrics, target, site.type)})).sort((a, b) => b.score - a.score);
  assert.deepEqual(model.matches.map(match => match.target.id), Array.from(originalOrder, match => match.target.id));
  for (const row of model.rows) {
    const target = model.best.target[row.key];
    const expected = site.type === 'dune' && ['wavelength', 'mean_spacing', 'mean_height'].includes(row.key) ? target * 2.82 : target;
    const max = Math.max(Math.abs(site.metrics[row.key]), Math.abs(expected), 1e-4);
    assert.equal(row.comparable, expected);
    assert.equal(row.normalizedEarth, site.metrics[row.key] / max);
    assert.equal(row.normalizedTarget, expected / max);
  }
  assert.equal(radarPoints(model.rows, 'normalizedEarth').length, model.rows.length);
}
const dune = SITES_DATA.find(site => site.type === 'dune');
const incomplete = {...dune, metrics: {...dune.metrics, mean_height: null}};
assert.equal(buildComparison(incomplete).best, null);
assert.equal(metricPairs(incomplete.metrics, MARS_DUNE_REFERENCES[0], 'dune')[0].earth, null);
assert.equal(panelLocation(buildComparison(incomplete)).rows[0][0], '—');
assert.equal(calculateMatch({...dune.metrics, mean_height: undefined}, MARS_DUNE_REFERENCES[0], 'dune').score, null);
assert.equal(calculateMatch({...dune.metrics, mean_height: NaN}, MARS_DUNE_REFERENCES[0], 'dune').score, null);
assert.equal(calculateMatch({...dune.metrics, mean_height: Infinity}, MARS_DUNE_REFERENCES[0], 'dune').score, null);
assert.notEqual(calculateMatch({...dune.metrics, mean_height: 0}, MARS_DUNE_REFERENCES[0], 'dune').score, null);
const beforeProfile = profilePaths(dune, MARS_DUNE_REFERENCES[0]);
const afterProfile = profilePaths({...dune, metrics: {...dune.metrics, wavelength: dune.metrics.wavelength * 2}}, MARS_DUNE_REFERENCES[0]);
assert.notDeepEqual(beforeProfile, afterProfile);
console.log('PASS: reference catalogs, rankings, panel adapters, chart normalization, null/undefined/NaN, legitimate zero and data-dependent profiles.');
