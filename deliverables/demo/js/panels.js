import { metrics } from './data.js';

const formatScore = (value) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const coordinate = (value, positive, negative) =>
  `${Math.abs(value).toLocaleString('pt-BR', { maximumFractionDigits: 4 })}° ${value >= 0 ? positive : negative}`;

export class Panels {
  constructor(reducedMotion) {
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
  }

  prepare(location) {
    this.location = location;
    this.started = null;
    document.getElementById('comparison-location').textContent =
      `Local: ${location.name} (Terra)`;
    document.getElementById('similarity-subtitle').textContent =
      `${location.shortName} × Referências`;
    const tbody = document.getElementById('metrics');
    tbody.replaceChildren(
      ...location.rows.map((row, index) => {
        const tr = document.createElement('tr');
        const heading = document.createElement('th');
        heading.scope = 'row';
        heading.textContent = (location.metricLabels || metrics)[index];
        tr.append(heading);
        row.forEach((value) => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.append(td);
        });
        return tr;
      }),
    );
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
}
