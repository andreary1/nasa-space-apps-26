export const PAGES = {
  overview: 'Overview', globe: 'Globe exploration', map: 'World map',
  comparisons: 'Comparisons', analysis: 'Dunes and craters', reports: 'Reports',
};
const SHARED = {catalog: 'catalog-section', comparison: 'comparison-card-section', charts: 'general-comparisons-section'};

export function createNavigation(state, onChange) {
  const views = [...document.querySelectorAll('[data-page-view]')];
  const workspace = document.getElementById('workspace');
  function show(page, {history = true, focus = true} = {}) {
    if (page === 'dunes') page = 'analysis'; // Preserve previous bookmarks.
    if (!PAGES[page]) page = 'globe';
    state.activePage = page;
    const view = views.find(element => element.dataset.pageView === page);
    for (const [slot, id] of Object.entries(SHARED)) {
      const host = view.querySelector(`[data-slot="${slot}"]`);
      if (host) host.append(document.getElementById(id));
    }
    views.forEach(element => { element.hidden = element !== view; });
    workspace.classList.toggle('content-mode', page !== 'globe');
    document.title = `${PAGES[page]} · GeoEcos`;
    document.querySelectorAll('[data-page]').forEach(button => {
      const active = button.dataset.page === page;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    const hash = `#/${page}`;
    if (location.hash !== hash) window.history[history ? 'pushState' : 'replaceState'](null, '', hash);
    onChange(page);
    view.scrollTop = 0;
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    if (focus) view.querySelector('[data-view-title]').focus({preventScroll: true});
  }
  const fromHash = () => show(location.hash.replace(/^#\/?/, ''), {history: false});
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);
  return {show, start: () => show(location.hash.replace(/^#\/?/, '') || 'globe', {history: false, focus: false})};
}
