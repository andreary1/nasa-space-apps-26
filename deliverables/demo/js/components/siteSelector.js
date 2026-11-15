import { SITES_DATA } from '../data/sites.js';
import { escapeHtml } from '../utils/helpers.js';

export function createSiteSelector(state) {
  return function renderSelectors() {
    const sites = SITES_DATA.map((site, index) => ({site, index}))
      .filter(({site}) => state.activePage !== 'analysis' || site.type === state.analysisType);
    document.getElementById('catalog-title').textContent = state.activePage === 'analysis'
      ? `${state.analysisType === 'dune' ? 'Dunas' : 'Crateras'} (${sites.length})` : `Localidades terrestres (${sites.length})`;
    const mapDesign = state.activePage === 'map';
    const comparisonsDesign = state.activePage === 'comparisons';
    const analysisDesign = state.activePage === 'analysis';
    const decoratedDesign = mapDesign || comparisonsDesign || analysisDesign;
    document.getElementById('catalog-section').classList.toggle('map-catalog', mapDesign || comparisonsDesign);
    if (decoratedDesign) {
      const icon = analysisDesign ? state.analysisType === 'dune' ? 'dune' : 'crater' : 'layers';
      document.getElementById('catalog-title').insertAdjacentHTML('afterbegin', `<svg class="catalog-heading-icon" aria-hidden="true"><use href="#i-${icon}"/></svg>`);
    }
    const grid = document.getElementById('site-selector');
    const signature = sites.map(({site}) => site.id).join('|');
    const design = (mapDesign || comparisonsDesign) ? 'map' : analysisDesign ? 'analysis' : 'default';
    const reuseCards = decoratedDesign && grid.dataset.design === design && grid.dataset.sites === signature;
    if (!reuseCards) grid.innerHTML = sites.map(({site, index}) => `
      <button class="site-option" data-action="selectSite" data-value="${index}" aria-pressed="${index === state.currentSiteIndex}">
      ${decoratedDesign ? `<svg class="catalog-site-icon" data-type="${site.type}" aria-hidden="true"><use href="#i-${site.type === 'dune' ? 'dune' : 'crater'}"/></svg><span class="catalog-site-copy"><span>${site.type === 'dune' ? 'Duna' : 'Cratera'} · ${escapeHtml(site.uf)}</span><strong>${escapeHtml(site.name)}</strong></span>` : `<span>${site.type === 'dune' ? 'Duna' : 'Cratera'} · ${escapeHtml(site.uf)}</span>${escapeHtml(site.name)}`}</button>`).join('');
    grid.dataset.design = design;
    grid.dataset.sites = signature;
    if (reuseCards) grid.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.value) === state.currentSiteIndex));
    });
    const select = document.getElementById('site-select');
    select.replaceChildren(...sites.map(({site, index}) => new Option(site.name, index, false, index === state.currentSiteIndex)));
    if (!sites.some(({index}) => index === state.currentSiteIndex)) select.selectedIndex = -1;
  };
}
