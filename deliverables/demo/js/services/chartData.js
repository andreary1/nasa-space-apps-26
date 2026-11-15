import { numericValue } from './comparisonModel.js';
import { scaledTarget } from './calculations.js';

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

// Parametric diagrams, explicitly not sampled DEM profiles. Their extents now
// depend on the supplied dimensions, unlike the fixed paths in the old HTML.
export function profilePaths(site, target) {
  if (!target) return null;
  if (site.type === 'crater') {
    const pairs = [site.metrics, target].map(metrics => ['diameter_m', 'depth_m', 'rim_height_m'].map(key => numericValue(metrics[key])));
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
  const pairs = [site.metrics, target].map((metrics, index) => ['mean_height', 'wavelength'].map(key => {
    const value = numericValue(metrics[key]);
    return value === null ? null : index ? scaledTarget(value, key, 'dune') : value;
  }));
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
