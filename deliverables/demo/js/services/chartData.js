import { numericValue } from './comparisonModel.js';

// Presentation geometry only. The normalization clamps are those in main.
export function radarPoints(rows, side, cx = 200, cy = 110, radius = 85) {
  return rows.map((row, index) => {
    const value = row[side];
    if (value === null) return null;
    const normalized = Math.min(1, Math.max(0.05, value));
    const angle = index * Math.PI * 2 / rows.length - Math.PI / 2;
    return [cx + Math.cos(angle) * radius * normalized, cy + Math.sin(angle) * radius * normalized];
  });
}

// Parametric diagrams, explicitly not sampled DEM profiles. Extents depend on the
// pipeline's values (earth metric vs. reference already scaled by the pipeline).
export function profilePaths(site, target, rows) {
  if (!target || !rows?.length) return null;
  const pick = key => rows.find(row => row.key === key);
  const sides = ['earth', 'comparable'];
  if (site.type === 'crater') {
    const keys = ['diameter_m', 'depth_m', 'rim_height_m'];
    const pairs = sides.map(side => keys.map(key => numericValue(pick(key)?.[side])));
    if (pairs.flat().some(value => value === null)) return null;
    const horizontal = Math.max(...pairs.map(pair => pair[0]), 1e-4);
    const vertical = Math.max(...pairs.map(pair => pair[1] + pair[2]), 1e-4);
    return pairs.map(([diameter, depth, rim]) => {
      const half = diameter / horizontal * 260;
      const left = 340 - half, right = 340 + half;
      const top = 45 - rim / vertical * 30, bottom = 45 + depth / vertical * 95;
      return `M40,45 L${left},45 L${left},${top} Q340,${2 * bottom - top} ${right},${top} L${right},45 L640,45`;
    });
  }
  const keys = ['mean_height', 'wavelength'];
  const pairs = sides.map(side => keys.map(key => numericValue(pick(key)?.[side])));
  if (pairs.flat().some(value => value === null || value < 0) || pairs.some(pair => pair[1] === 0)) return null;
  const height = Math.max(...pairs.map(pair => pair[0]), 1e-4);
  const wavelength = Math.max(...pairs.map(pair => pair[1]), 1e-4);
  return pairs.map(([h, wave]) => {
    const length = wave / wavelength * 270;
    const points = Array.from({length: 181}, (_, i) => {
      const x = 40 + i * 600 / 180;
      const y = 135 - (1 - Math.cos((x - 40) / length * Math.PI * 2)) / 2 * h / height * 95;
      return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return points.join(' ');
  });
}
