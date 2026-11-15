import { SITES_DATA } from './data/sites.js';
import './components/analysisReveal.js';
import { MOON_CRATER_REFERENCES } from './data/moon.js';
import { MARS_DUNE_REFERENCES } from './data/mars.js';
import { createWorldMap } from './components/worldMap.js';
import { createSiteSelector } from './components/siteSelector.js';
import { renderComparison } from './components/comparison.js';
import { createCharts } from './components/charts.js';
import { createSiteForm } from './components/siteForm.js';
import { createGlobeController } from './components/globeController.js';
import { Panels } from './components/panels.js';
import { showToast } from './components/toast.js';
import { createNavigation } from './navigation.js';
import { initSidebar } from './components/sidebar.js';
import { buildComparison } from './services/comparisonModel.js';
import { panelLocation } from './utils/formatters.js';
import { createAiReport } from './components/aiReport.js';
import { createIntelligentAnalysis } from './components/intelligentAnalysis.js';

const state = {
  activePage: 'globe', currentSiteIndex: 0, hasSelection: false,
  currentMapFilter: 'all', currentViewMode: 'mundo', analysisType: 'dune',
  currentStudioTab: 'profile', activeFormType: 'crater',
};
const panels = new Panels(matchMedia('(prefers-reduced-motion: reduce)'));
const charts = createCharts(state);
const renderSelectors = createSiteSelector(state);
const aiReport = createAiReport();
const map = createWorldMap(state, selectSite, candidate => {
  intelligent.showResult(candidate.id);
  navigation.show('intelligent');
});
const intelligent = createIntelligentAnalysis(candidates => map.setCandidates(candidates), () => navigation.show('map'));
let globe;
const navigation = createNavigation(state, () => {
  renderSelectors();
  updateSelectionViews();
  requestAnimationFrame(() => globe?.resize());
});

function locations() {
  return SITES_DATA.map(site => ({...site, category: site.type}));
}

function updateSelectionViews() {
  const site = SITES_DATA[state.currentSiteIndex];
  document.getElementById('overview-selection').textContent = `${site.name} · ${site.category} · ${site.uf}`;
  document.getElementById('report-site-name').textContent = site.name;
  document.getElementById('report-json').textContent = JSON.stringify(site, null, 2);
  aiReport.render(buildComparison(site));
  const compatible = site.type === state.analysisType;
  document.getElementById('analysis-empty').hidden = compatible;
  document.getElementById('analysis-empty').textContent = `Selecione ${state.analysisType === 'dune' ? 'uma duna' : 'uma cratera'} no catálogo para iniciar a análise. A seleção atual foi preservada.`;
  document.getElementById('analysis-results').hidden = !compatible;
}

function selectSite(index, fromGlobe = false) {
  if (!SITES_DATA[index]) return;
  state.currentSiteIndex = index;
  state.hasSelection = true;
  const model = buildComparison(SITES_DATA[index]);
  renderComparison(model, charts);
  panels.prepare(panelLocation(model));
  renderSelectors();
  map.renderMapPins();
  updateSelectionViews();
  if (!fromGlobe) globe?.select(model.site.id);
}

function setMapFilter(filter) {
  map.setMapFilter(filter);
  globe?.filter(filter);
}

function updateCounts() {
  const counts = {earth: SITES_DATA.length, moon: MOON_CRATER_REFERENCES.length, mars: MARS_DUNE_REFERENCES.length};
  document.querySelectorAll('[data-count]').forEach(element => { element.textContent = counts[element.dataset.count]; });
  for (const [type, label] of [['all', 'Todos'], ['dune', 'Dunas'], ['crater', 'Crateras']]) {
    const count = SITES_DATA.filter(site => type === 'all' || site.type === type).length;
    document.getElementById(`filter-${type}`).textContent = `${label} (${count})`;
  }
}

const form = createSiteForm(state, () => {
  globe?.refresh(locations());
  map.setMapViewMode('mundo');
  setMapFilter('all');
  updateCounts();
  selectSite(0);
  navigation.show('comparisons');
});
const actions = {
  selectSite: value => selectSite(Number(value)),
  setMapViewMode: map.setMapViewMode, setMapFilter, setStudioTab: charts.setStudioTab,
  navigate: page => navigation.show(page),
  setAnalysisType: type => {
    if (!['dune', 'crater'].includes(type)) return;
    state.analysisType = type;
    document.querySelectorAll('[data-action="setAnalysisType"]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === type)));
    renderSelectors(); updateSelectionViews();
  },
  ...form,
};

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (button && actions[button.dataset.action]) actions[button.dataset.action](button.dataset.value);
});
document.querySelectorAll('[data-input-action]').forEach(input => input.addEventListener('input', form.autoCalcCraterRatios));
document.getElementById('site-select').addEventListener('change', event => selectSite(Number(event.target.value)));
document.getElementById('world-map-svg').addEventListener('mousemove', map.handleMapHover);

try {
  renderComparison(buildComparison(SITES_DATA[state.currentSiteIndex]), charts);
  map.setMapViewMode(state.currentViewMode);
  map.setMapFilter(state.currentMapFilter);
  updateCounts();
  initSidebar(navigation);
  navigation.start();
  globe = createGlobeController(locations(), id => {
    const index = SITES_DATA.findIndex(site => site.id === id);
    if (index !== state.currentSiteIndex || !state.hasSelection) selectSite(index, true);
  }, panels, () => { state.hasSelection = false; });
} catch (error) {
  showToast('Não foi possível inicializar a interface.', 'error');
  console.error(error);
}
