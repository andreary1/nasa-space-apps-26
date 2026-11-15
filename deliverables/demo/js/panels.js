import { comparisonData, comparisonFields } from './data.js';

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join('; ') : '—';
  if (typeof value === 'object') return value.descricao || '—';
  return typeof value === 'number'
    ? value.toLocaleString('pt-BR')
    : String(value);
}

const formatScore = (value) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const coordinate = (value, positive, negative) =>
  `${Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 4 })}° ${value >= 0 ? positive : negative}`;

export class Panels {
  constructor(reducedMotion, state) {
    this.state = state;
    this.reducedMotion = reducedMotion;
    this.elements = [...document.querySelectorAll('.panel')];
    this.scoreElements = ['lunar', 'martian'].map((name) => ({
      value: document.getElementById(`${name}-score`),
      arc: document.querySelector(
        `.${name === 'lunar' ? 'lunar' : 'martian'} .ring-value`,
      ),
    }));
    this.started = null;
    this.visible = false;
    this.tableAnimations = [];
    this.tableRequest = 0;
    this.targetButtons = [
      ...document.querySelectorAll('[data-comparison-target]'),
    ];
    this.listeners = new AbortController();
    this.targetButtons.forEach((button) =>
      button.addEventListener(
        'click',
        () => {
          if (this.target !== button.dataset.comparisonTarget)
            this.setTarget(button.dataset.comparisonTarget);
        },
        { signal: this.listeners.signal },
      ),
    );
  }

  get visible() {
    return this.state.panelsVisible;
  }
  set visible(value) {
    this.state.panelsVisible = value;
  }
  get target() {
    return this.state.comparison;
  }
  set target(value) {
    this.state.comparison = value;
  }

  prepare(location) {
    this.location = location;
    this.started = null;
    document.getElementById('comparison-location').textContent =
      `Local: ${location.name} (Terra)`;
    document.getElementById('similarity-subtitle').textContent =
      `${location.shortName} × Referências`;
    this.setTarget('lunar', false);
    const details = [
      ['pin', 'Localização', location.region],
      [
        'target',
        'Coordenadas',
        `${coordinate(location.lat, 'N', 'S')}, ${coordinate(location.lon, 'L', 'O')}`,
      ],
      [
        location.category === 'crater' ? 'crater' : 'dune',
        'Tipo',
        location.type,
      ],
      ['calendar', 'Idade aproximada', location.age],
    ];
    document.getElementById('location-details').replaceChildren(
      ...details.map(([icon, label, value]) => {
        const row = document.createElement('div');
        row.className = 'detail-row';
        // All icon identifiers and labels come from the fixed list above.
        row.innerHTML = `<dt><svg aria-hidden="true"><use href="#i-${icon}"/></svg><span class="sr-only">${label}</span></dt>`;
        const dd = document.createElement('dd');
        dd.textContent = value;
        row.append(dd);
        return row;
      }),
    );
    ['lunar', 'martian'].forEach((key, index) => {
      document.getElementById(`${key}-reference`).textContent = location
        .references[key]
        ? `(${location.references[key].name})`
        : 'Sem referência';
      this.scoreElements[index].value.textContent = location.references[key]
        ? '0,00'
        : '—';
      this.scoreElements[index].arc.style.strokeDashoffset = '1';
    });
    if (this.visible) this.show();
  }

  show() {
    this.visible = true;
    this.started = performance.now();
    this.elements.forEach((element) => {
      element.inert = false;
      element.setAttribute('aria-hidden', 'false');
      element.classList.add('is-visible');
    });
    document.getElementById('selection-announcement').textContent =
      `${this.location.name} selecionada. Comparações demonstrativas disponíveis. Pressione Escape para retomar a exploração.`;
  }

  hide() {
    this.visible = false;
    this.started = null;
    this.cancelTableTransition();
    this.elements.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
      element.classList.remove('is-visible');
    });
    document.getElementById('selection-announcement').textContent =
      'Seleção fechada. Exploração do planeta retomada.';
  }

  update(now) {
    if (this.started === null) return;
    const progress = this.reducedMotion.matches
      ? 1
      : Math.min((now - this.started) / 900, 1);
    const eased = 1 - (1 - progress) ** 3;
    ['lunar', 'martian'].forEach((key, index) => {
      const reference = this.location.references[key];
      if (!reference) return;
      const value = reference.score * eased;
      this.scoreElements[index].value.textContent = formatScore(value);
      this.scoreElements[index].arc.style.strokeDashoffset = String(1 - value);
    });
    if (progress === 1) this.started = null;
  }

  renderTable(target) {
    const name = target === 'lunar' ? 'Lua' : 'Marte';
    const comparison = comparisonData[this.location.id]?.[target];
    const tbody = document.getElementById('metrics');
    document.getElementById('comparison-target-heading').textContent = name;
    const description = comparison
      ? `${this.location.name} × ${comparison.reference}. Dados demonstrativos.`
      : `Não existem dados comparáveis entre ${this.location.name} e ${name} nesta demonstração. ${target === 'lunar' ? 'Selecione Marte para consultar métricas de dunas.' : 'Selecione Lua para consultar métricas de crateras.'}`;
    document.getElementById('comparison-caption').textContent = description;
    document.getElementById('comparison-status').textContent = description;
    if (!comparison) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3;
      td.className = 'comparison-empty';
      td.textContent = description;
      tr.append(td);
      tbody.replaceChildren(tr);
      return;
    }
    tbody.replaceChildren(
      ...comparisonFields[target].map(({ key, label }) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = label;
        tr.append(th);
        [comparison.earth, comparison.referenceMetrics].forEach((values) => {
          const td = document.createElement('td');
          td.textContent = displayValue(values[key]);
          tr.append(td);
        });
        return tr;
      }),
    );
  }

  cancelTableTransition() {
    this.tableRequest++;
    this.tableAnimations.forEach((animation) => animation.cancel());
    this.tableAnimations = [];
    const content = document.getElementById('comparison-content');
    content.style.removeProperty('height');
    content.inert = false;
    content.removeAttribute('aria-busy');
  }

  async setTarget(target, animate = true) {
    const content = document.getElementById('comparison-content');
    const currentHeight = content.getBoundingClientRect().height;
    this.cancelTableTransition();
    const request = this.tableRequest;
    this.target = target;
    this.targetButtons.forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.comparisonTarget === target),
      ),
    );
    const shouldAnimate =
      animate && this.visible && !this.reducedMotion.matches;
    if (shouldAnimate) content.style.height = `${currentHeight}px`;
    const play = (frames, duration) => {
      const animation = content.animate(frames, {
        duration,
        easing: 'ease-in-out',
      });
      this.tableAnimations.push(animation);
      return animation.finished.catch(() => {});
    };
    content.inert = true;
    content.setAttribute('aria-busy', 'true');
    if (shouldAnimate) await play([{ opacity: 1 }, { opacity: 0 }], 110);
    if (request !== this.tableRequest) return;
    const previousHeight = content.getBoundingClientRect().height;
    content.style.removeProperty('height');
    this.renderTable(target);
    const nextHeight = content.getBoundingClientRect().height;
    if (shouldAnimate) {
      content.style.height = `${nextHeight}px`;
      await Promise.all([
        play(
          [{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }],
          220,
        ),
        play([{ opacity: 0 }, { opacity: 1 }], 220),
      ]);
    }
    if (request !== this.tableRequest) return;
    content.style.removeProperty('height');
    content.inert = false;
    content.removeAttribute('aria-busy');
    this.tableAnimations = [];
  }

  dispose() {
    this.cancelTableTransition();
    this.listeners.abort();
  }
}
