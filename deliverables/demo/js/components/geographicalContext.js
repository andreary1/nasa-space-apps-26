const catalogUrl = new URL('../data/geographical-context.json', import.meta.url);

function node(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function sourceLink(source) {
  if (!source?.url || !/^https?:\/\//i.test(source.url)) return null;
  const link = node('a', source.title || 'Consultar fonte');
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

export class GeographicalContext {
  constructor() {
    this.container = document.getElementById('geographical-context');
    this.tabs = ['comparison', 'context'];
    this.tabs.forEach((key, index) => {
      const button = document.getElementById(`${key}-tab`);
      button.addEventListener('click', () => this.activate(key));
      button.addEventListener('keydown', event => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
        this.activate(this.tabs[target]);
        document.getElementById(`${this.tabs[target]}-tab`).focus();
      });
    });
    this.activate('context');
  }

  activate(selected) {
    this.tabs.forEach(key => {
      const active = key === selected;
      const button = document.getElementById(`${key}-tab`);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      document.getElementById(`${key}-tabpanel`).hidden = !active;
    });
  }

  async prepare(location) {
    const request = this.request = Symbol();
    this.container.replaceChildren(node('p', 'Carregando contexto…'));
    try {
      this.catalog ||= fetch(catalogUrl).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      }).catch(error => { this.catalog = null; throw error; });
      const catalog = await this.catalog;
      if (request !== this.request) return;
      this.render(catalog.sites[location.id], location);
    } catch {
      if (request !== this.request) return;
      const retry = node('button', 'Tentar novamente');
      retry.type = 'button';
      retry.addEventListener('click', () => this.prepare(location));
      this.container.replaceChildren(node('p', 'Não foi possível carregar o contexto.'), retry);
    }
  }

  render(context, location) {
    this.container.replaceChildren(node('p', location.region, 'context-region'));
    if (!context) {
      this.container.append(node('p', 'Ainda não há contexto cadastrado para esta localidade.'));
      return;
    }
    if (context.summary) this.container.append(node('p', context.summary, 'context-summary'));
    for (const [key, label] of [['climate', 'Clima · NASA POWER'], ['geology', 'Geologia'], ['biome', 'Bioma'], ['vegetation', 'Vegetação'], ['nearby_locality', 'Localidades de referência']]) {
      if (typeof context[key] !== 'string' || !context[key].trim()) continue;
      const section = document.createElement('section');
      section.className = 'context-fact';
      section.append(node('h3', label), node('p', context[key]));
      const evidence = context.field_sources?.[key];
      if (evidence?.scope) section.append(node('p', evidence.scope, 'context-note'));
      const link = sourceLink(evidence);
      if (link) section.append(link);
      if (key === 'climate' && context.climatology) {
        const c = context.climatology;
        section.append(node('p', `${c.period} · ${c.scope}`, 'context-note'));
      }
      this.container.append(section);
    }
    const sources = document.createElement('details');
    sources.className = 'context-sources';
    sources.append(node('summary', 'Fontes consultadas'));
    for (const source of context.sources || []) {
      const link = sourceLink(source);
      if (link) sources.append(link);
    }
    if (sources.children.length > 1) this.container.append(sources);
    if (context.review_status !== 'reviewed') {
      this.container.append(node('p', 'Ficha pendente de revisão editorial.', 'context-note'));
    }
  }
}
