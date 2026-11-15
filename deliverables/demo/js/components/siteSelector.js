import { SITES_DATA } from '../data/sites.js';
import { escapeHtml } from '../utils/helpers.js';

export function createSiteSelector(state) {
  return function renderSelectors() {
    const sites = SITES_DATA.map((site, index) => ({site, index}))
      .filter(({site}) => state.activePage !== 'analysis' || site.type === state.analysisType);
    document.getElementById('catalog-title').textContent = state.activePage === 'analysis'
      ? `${state.analysisType === 'dune' ? 'Dunas' : 'Crateras'} (${sites.length})` : `Localidades terrestres (${sites.length})`;
    document.getElementById('site-selector').innerHTML = sites.map(({site, index}) => `
      <button class="site-option" data-action="selectSite" data-value="${index}" aria-pressed="${index === state.currentSiteIndex}">
      <span>${site.type === 'dune' ? 'Duna' : 'Cratera'} · ${escapeHtml(site.uf)}</span>${escapeHtml(site.name)}</button>`).join('');
    const select = document.getElementById('site-select');
    select.replaceChildren(...sites.map(({site, index}) => new Option(site.name, index, false, index === state.currentSiteIndex)));
    if (!sites.some(({index}) => index === state.currentSiteIndex)) select.selectedIndex = -1;
  };
}
