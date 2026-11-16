import { renderMetrics } from './metrics.js';
import { escapeHtml } from '../utils/helpers.js';

export function renderComparison(model, charts) {
  const {site, best, matches} = model;
  document.getElementById('badge-body').textContent = site.type === 'dune' ? 'Earth ↔ Mars' : 'Earth ↔ Moon';
  document.getElementById('badge-cat').textContent = site.category;
  document.getElementById('badge-region').textContent = site.uf;
  document.getElementById('pair-title').textContent = `${site.name} ↔ ${best?.target.name || 'No comparable reference'}`;
  document.getElementById('site-coords').textContent = `Lat: ${site.lat.toFixed(3)}° · Lon: ${site.lon.toFixed(3)}° · ${site.uf}`;
  document.getElementById('score-display').textContent = best ? best.score.toFixed(4) : '—';
  document.getElementById('distance-display').textContent = best ? `WED: ${best.wed.toFixed(3)} · Cos: ${best.cosine.toFixed(3)}` : 'Index unavailable';
  document.getElementById('comparison-status').textContent = best ? '' : 'Some metrics are missing. Comparison requires all weighted parameters; missing values are not treated as zero.';
  for (const [id, values] of [['similarities-content', site.similarities], ['differences-content', site.differences]]) {
    const list = document.getElementById(id);
    list.replaceChildren(...(values || ['Information not available in the catalog.']).map(value => {
      const li = document.createElement('li'); li.textContent = value; return li;
    }));
  }
  document.getElementById('metrics-type-label').textContent = `${model.rows.length} metrics · ${site.type === 'dune' ? 'Dunes' : 'Craters'}`;
  document.getElementById('th-planet-name').textContent = best?.target.name || 'Target';
  document.getElementById('top-matches-list').innerHTML = matches.slice(0, 5).map((match, index) => `
    <div class="rank-row"><strong>#${index + 1} ${escapeHtml(match.target.name)}</strong>
    <div class="bar-track target"><span style="width:${match.score * 100}%"></span></div>
    <p><span>${match.score.toFixed(4)}</span><small>WED ${match.wed.toFixed(3)} · Cos ${match.cosine.toFixed(3)}</small></p></div>`).join('') || '<p>No results with the available data.</p>';
  renderMetrics(model);
  charts.render(model);
}
