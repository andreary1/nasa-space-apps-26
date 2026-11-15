// Apresentação apenas: normalização por máximo usada nas barras e no radar.
// O escalonamento físico (Bagnold) e os scores vêm do pipeline.
export function normalizePair(earth, target) {
  const max = Math.max(Math.abs(earth), Math.abs(target), 1e-4);
  return [earth / max, target / max];
}
