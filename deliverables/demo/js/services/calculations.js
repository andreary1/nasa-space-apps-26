// Preserve the original Bagnold factor and pairwise max normalization.
export function scaledTarget(value, key, type) {
  return type === 'dune' && ['wavelength', 'mean_spacing', 'mean_height'].includes(key)
    ? value * 2.82 : value;
}
export function normalizePair(earth, target) {
  const max = Math.max(Math.abs(earth), Math.abs(target), 1e-4);
  return [earth / max, target / max];
}
