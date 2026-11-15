export function formatMetric(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('pt-BR', {maximumFractionDigits: 3}) : '—';
}

export function panelLocation(model) {
  const {site, best, rows} = model;
  const reference = best ? {name: best.target.name, score: best.score} : null;
  return {
    ...site, category: site.type, type: site.category, region: site.uf,
    shortName: site.name, age: site.age || 'Não informada no catálogo',
    references: {lunar: site.type === 'crater' ? reference : null, martian: site.type === 'dune' ? reference : null},
    comparison: {type: site.type, earth: site.metrics, target: best?.target || null, earthDescription: site.category},
    metricLabels: rows.slice(0, 5).map(row => row.label),
    rows: rows.slice(0, 5).map(row => [formatMetric(row.earth), site.type === 'crater' ? formatMetric(row.target) : '—', site.type === 'dune' ? formatMetric(row.target) : '—']),
  };
}
