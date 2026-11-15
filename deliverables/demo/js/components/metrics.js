import { escapeHtml } from '../utils/helpers.js';
import { formatMetric } from '../utils/formatters.js';

export function renderMetrics(model) {
  document.getElementById('metrics-table-body').innerHTML = model.rows.map(row => `
    <tr><th scope="row">${escapeHtml(row.label)}</th><td>${formatMetric(row.earth)}</td>
    <td>${formatMetric(row.target)}${row.scaled ? ' <small>β × 2,82</small>' : ''}</td>
    <td>${row.difference === null ? '—' : `${row.difference > 0 ? '+' : ''}${row.difference.toFixed(1)}%`}</td>
    <td>${(row.weight * 100).toFixed(0)}%</td></tr>`).join('');
}
