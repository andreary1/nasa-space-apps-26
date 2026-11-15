import { COMPARISON_DEMO } from '../data/comparisonDemo.js';

const value = (number) =>
  typeof number === 'number' && Number.isFinite(number)
    ? number.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
    : '—';
const km = (number) =>
  typeof number === 'number' && Number.isFinite(number)
    ? value(number / 1000)
    : '—';
const description = (data) =>
  typeof data === 'string' && data.trim() ? data : '—';

export function compactTable(location, target) {
  const data = location.comparison;
  const compatible = data?.type === (target === 'lunar' ? 'crater' : 'dune');
  if (!compatible) return null;
  const fixture = COMPARISON_DEMO[location.id]?.[target];
  if (fixture) return { ...fixture, demo: true };
  const earth = data.earth || {},
    reference = data.target || {};
  const rows =
    target === 'lunar'
      ? [
          ['Diâmetro (km)', km(earth.diameter_m), km(reference.diameter_m)],
          ['Profundidade (km)', km(earth.depth_m), km(reference.depth_m)],
          [
            'Bordas',
            description(earth.bordas?.descricao),
            description(reference.bordas?.descricao),
          ],
          [
            'Declividade (°)',
            value(earth.mean_wall_slope),
            value(reference.mean_wall_slope),
          ],
          [
            'Estrutura interna',
            description(earth.estrutura_interna?.join('; ')),
            description(reference.estrutura_interna?.join('; ')),
          ],
        ]
      : [
          [
            'Tipo de duna',
            description(earth.tipo_duna || data.earthDescription),
            description(reference.tipo_duna),
          ],
          [
            'Altura média (m)',
            value(earth.mean_height),
            value(reference.mean_height),
          ],
          [
            'Comprimento de onda (m)',
            value(earth.wavelength),
            value(reference.wavelength),
          ],
          [
            'Orientação / azimute (°)',
            value(earth.crest_azimuth),
            value(reference.crest_azimuth),
          ],
          [
            'Densidade de dunas (cristas/km²)',
            value(earth.dune_density),
            value(reference.dune_density),
          ],
          [
            'Espaçamento médio (m)',
            value(earth.mean_spacing),
            value(reference.mean_spacing),
          ],
          [
            'Padrão de distribuição',
            description(earth.padrao_distribuicao),
            description(reference.padrao_distribuicao),
          ],
          [
            'Índice de aridez',
            value(earth.aridity_index),
            value(reference.aridity_index),
          ],
        ];
  return { rows, reference: reference.name || 'Não disponível', demo: false };
}

export class CompactComparison {
  constructor(reducedMotion) {
    this.reducedMotion = reducedMotion;
    this.content = document.getElementById('compact-table-content');
    this.buttons = [...document.querySelectorAll('[data-comparison-target]')];
    this.listeners = new AbortController();
    this.animations = [];
    this.request = 0;
    this.buttons.forEach((button) =>
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

  prepare(location) {
    this.location = location;
    this.setTarget('lunar', false);
  }

  render(target) {
    const name = target === 'lunar' ? 'Lua' : 'Marte';
    const model = compactTable(this.location, target);
    document.getElementById('compact-target-name').textContent = name;
    const tbody = document.getElementById('metrics');
    document.getElementById('compact-reference').textContent = model
      ? `${model.demo ? 'Referência ilustrativa' : 'Referência do catálogo'}: ${model.reference}`
      : `Sem dados comparáveis para esta localidade e ${name}.`;
    document.getElementById('compact-data-note').textContent = model?.demo
      ? 'Dados demonstrativos · sem validação científica. Independentes dos scores do painel direito.'
      : 'Catálogo herdado · campos ausentes indicados por —. Sem novas medições.';
    if (!model) {
      const tr = document.createElement('tr'),
        td = document.createElement('td');
      td.colSpan = 3;
      td.className = 'compact-empty';
      td.textContent = `Não existem dados comparáveis para esta combinação. Selecione ${target === 'lunar' ? 'Marte para métricas de dunas' : 'Lua para métricas de crateras'}.`;
      tr.append(td);
      tbody.replaceChildren(tr);
      return;
    }
    tbody.replaceChildren(
      ...model.rows.map(([label, ...values]) => {
        const tr = document.createElement('tr'),
          th = document.createElement('th');
        th.scope = 'row';
        th.textContent = label;
        tr.append(th);
        values.forEach((text) => {
          const td = document.createElement('td');
          td.textContent = text;
          tr.append(td);
        });
        return tr;
      }),
    );
  }

  cancel() {
    this.request++;
    this.animations.forEach((animation) => animation.cancel());
    this.animations = [];
    this.content.style.removeProperty('height');
    this.content.removeAttribute('aria-busy');
  }

  async setTarget(target, animate = true) {
    const height = this.content.getBoundingClientRect().height;
    this.cancel();
    const request = this.request;
    this.target = target;
    this.buttons.forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.comparisonTarget === target),
      ),
    );
    const motion = animate && !this.reducedMotion.matches;
    const play = (frames, duration) => {
      const animation = this.content.animate(frames, {
        duration,
        easing: 'ease-in-out',
      });
      this.animations.push(animation);
      return animation.finished.catch(() => {});
    };
    this.content.setAttribute('aria-busy', 'true');
    if (motion) {
      this.content.style.height = `${height}px`;
      await play([{ opacity: 1 }, { opacity: 0 }], 110);
    }
    if (request !== this.request) return;
    this.content.style.removeProperty('height');
    this.render(target);
    const next = this.content.getBoundingClientRect().height;
    if (motion) {
      this.content.style.height = `${next}px`;
      await Promise.all([
        play([{ height: `${height}px` }, { height: `${next}px` }], 220),
        play([{ opacity: 0 }, { opacity: 1 }], 220),
      ]);
    }
    if (request !== this.request) return;
    this.content.style.removeProperty('height');
    this.content.removeAttribute('aria-busy');
    this.animations = [];
  }

  dispose() {
    this.cancel();
    this.listeners.abort();
  }
}
