import { radarPoints, profilePaths } from '../services/chartData.js';
import { formatMetric } from '../utils/formatters.js';
import { escapeHtml } from '../utils/helpers.js';

export function createCharts(state) {
  function render(model) {
    const {site, best, rows} = model;
    const paths = profilePaths(site, best?.target);
    document.getElementById('svg-container').innerHTML = paths ? `
      <svg viewBox="0 0 680 175" role="img" aria-label="Esquema paramétrico: Terra e alvo planetário">
      <path d="M40 45H640M40 135H640" stroke="#dce3f3" stroke-dasharray="3 3"/>
      <path d="${paths[1]}" stroke="#a58ae4" stroke-width="2" stroke-dasharray="5 3"/>
      <path d="${paths[0]}" stroke="#86b69a" stroke-width="2.5"/></svg>` : '<p class="data-note">Dados insuficientes para o perfil comparativo.</p>';
    document.getElementById('topo-left-label').textContent = site.type === 'crater' ? `Diâmetro: ${formatMetric(site.metrics.diameter_m)} m` : `Altura média: ${formatMetric(site.metrics.mean_height)} m`;
    document.getElementById('topo-center-label').textContent = site.type === 'crater' ? `Profundidade: ${formatMetric(site.metrics.depth_m)} m` : `Comprimento de onda: ${formatMetric(site.metrics.wavelength)} m`;
    document.getElementById('topo-right-label').textContent = site.type === 'crater' ? `Declividade P90: ${formatMetric(site.metrics.wall_slope_p90)}°` : `Azimute: ${formatMetric(site.metrics.crest_azimuth)}°`;
    document.getElementById('feature-bars-container').innerHTML = rows.map(row => `
      <div class="feature-bar"><div><span>${escapeHtml(row.label)}</span><span>${formatMetric(row.earth)} / ${formatMetric(row.comparable)}</span></div>
      <div class="bar-track"><span style="width:${row.normalizedEarth === null ? 0 : Math.min(100, Math.max(0, row.normalizedEarth * 100))}%"></span></div>
      <div class="bar-track target"><span style="width:${row.normalizedTarget === null ? 0 : Math.min(100, Math.max(0, row.normalizedTarget * 100))}%"></span></div></div>`).join('');
    const earth = radarPoints(rows, 'normalizedEarth');
    const target = radarPoints(rows, 'normalizedTarget');
    const points = values => values.map(point => point.map(value => value.toFixed(1)).join(',')).join(' ');
    const rings = [0.25, 0.5, 0.75, 1].map(level => `<polygon points="${points(radarPoints(rows.map(row => ({...row, level})), 'level'))}" fill="none" stroke="#dce3f3" stroke-dasharray="2 2"/>`).join('');
    const axes = rows.map((row, i) => {
      const angle = i * Math.PI * 2 / rows.length - Math.PI / 2;
      const x = 200 + Math.cos(angle) * 103, y = 110 + Math.sin(angle) * 103;
      return `<text x="${x}" y="${y}" fill="#68739b" font-size="8" text-anchor="middle">${escapeHtml(row.label.split(' ')[0].slice(0, 8))}</text>`;
    }).join('');
    document.getElementById('radar-svg-container').innerHTML = earth.includes(null) || target.includes(null)
      ? '<p class="data-note">Dados insuficientes para o radar comparativo.</p>'
      : `<svg viewBox="0 0 400 230" role="img" aria-label="Radar de métricas normalizadas">${rings}${axes}<polygon points="${points(target)}" fill="#a58ae433" stroke="#a58ae4" stroke-width="1.8" stroke-dasharray="3 2"/><polygon points="${points(earth)}" fill="#86b69a33" stroke="#86b69a" stroke-width="2.2"/></svg>`;
  }

  function setStudioTab(tab) {
    if (!['profile', 'bars', 'radar'].includes(tab)) return;
    state.currentStudioTab = tab;
    for (const key of ['profile', 'bars', 'radar']) {
      const button = document.getElementById(`tab-btn-${key}`);
      button.setAttribute('aria-selected', String(key === tab));
      button.tabIndex = key === tab ? 0 : -1;
      document.getElementById(`studio-${key}-view`).hidden = key !== tab;
    }
  }
  document.querySelector('.chart-tabs').addEventListener('keydown', event => {
    const tabs = ['profile', 'bars', 'radar'];
    const index = tabs.indexOf(state.currentStudioTab);
    const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next === null) return;
    event.preventDefault(); setStudioTab(tabs[next]);
    document.getElementById(`tab-btn-${tabs[next]}`).focus();
  });
  return {render, setStudioTab};
}
