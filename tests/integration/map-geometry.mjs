import assert from "node:assert/strict";
import { SITES_DATA } from "../../deliverables/demo/js/data/sites.js";
import {
  WORLD,
  REGIONS,
  project,
  unproject,
  fitBounds,
  clusterPoints,
} from "../../deliverables/demo/js/services/mapGeometry.js";

assert.deepEqual(project(-180, 90), { x: 0, y: 0 });
assert.deepEqual(project(180, -90), { x: 960, y: 480 });
assert.deepEqual(project(0, 0), { x: 480, y: 240 });
assert.deepEqual(fitBounds(REGIONS.mundo), WORLD);
for (const site of SITES_DATA) {
  const pos = project(site.lon, site.lat),
    geographic = unproject(pos.x, pos.y);
  assert.ok(Math.abs(geographic.lon - site.lon) < 1e-10);
  assert.ok(Math.abs(geographic.lat - site.lat) < 1e-10);
}
const points = SITES_DATA.map((site, index) => ({
  ...project(site.lon, site.lat),
  index,
}));
for (const scale of [3, 1, 0.3, 0.01, 0.0005]) {
  const groups = clusterPoints(points, scale);
  assert.deepEqual(
    groups
      .flat()
      .map((p) => p.index)
      .sort((a, b) => a - b),
    points.map((p) => p.index),
  );
  assert.equal(new Set(groups.flat().map((p) => p.index)).size, 24);
}
assert.ok(clusterPoints(points, 1).length < 24);
assert.equal(
  clusterPoints(points, 0.0005).length,
  24,
  "all points can be explored separately",
);
for (const bounds of Object.values(REGIONS)) {
  const view = fitBounds(bounds);
  for (const site of SITES_DATA.filter(
    (s) =>
      s.lon >= bounds[0] &&
      s.lon <= bounds[2] &&
      s.lat >= bounds[1] &&
      s.lat <= bounds[3],
  )) {
    const point = project(site.lon, site.lat);
    assert.ok(
      point.x >= view.x &&
        point.x <= view.x + view.w &&
        point.y >= view.y &&
        point.y <= view.y + view.h,
    );
  }
}
console.log(
  "PASS: complete WGS84 extent, geographic round trips, regional fits and lossless, explorable clusters.",
);
