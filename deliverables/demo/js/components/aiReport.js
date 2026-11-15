// Mostra, na página Relatórios, a análise gerada por IA para a localidade selecionada.
// Os relatórios salvos ficam em js/data/ai-reports.json. O botão "Gerar relatório"
// chama o servidor local (scripts/ai_reports/server.mjs), que guarda a chave de API:
// nenhuma chave fica no navegador.
import { PARAM_LABELS } from '../data/constants.js';

const reportsUrl = new URL('../data/ai-reports.json', import.meta.url);
const SERVER_COMMAND = 'node scripts/ai_reports/server.mjs';

const SUGGESTION_LABELS = {
  treinamento_astronautas: 'Treinamento de astronautas',
  teste_rovers_robotica: 'Rovers e robótica',
  calibracao_instrumentos: 'Calibração de instrumentos',
  estudo_processos: 'Estudo de processos',
  validacao_algoritmos: 'Validação de algoritmos',
  educacao_divulgacao: 'Educação e divulgação',
};
const LEVEL_LABELS = { baixa: 'Baixa', media: 'Média', alta: 'Alta', baixo: 'Baixo', medio: 'Médio', alto: 'Alto' };

function el(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.text !== undefined) element.textContent = options.text;
  if (options.className) element.className = options.className;
  for (const child of [].concat(children)) if (child) element.append(child);
  return element;
}

function metricChips(keys) {
  if (!keys?.length) return null;
  return el('div', { className: 'ai-chips' }, keys.map(key => el('span', { className: 'ai-chip', text: PARAM_LABELS[key] || key })));
}

function itemList(items, renderExtra) {
  return el('ul', { className: 'ai-list' }, items.map(item => el('li', {}, [
    el('strong', { text: item.titulo }),
    el('p', { text: item.explicacao }),
    renderExtra?.(item),
    metricChips(item.metricas),
  ])));
}

function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function isStale(entry, model) {
  const sameMetrics = JSON.stringify(entry.input?.metrics) === JSON.stringify(model.site.metrics);
  const sameBest = (entry.input?.best_reference_id ?? null) === (model.best?.target.id ?? null);
  return !(sameMetrics && sameBest);
}

export function createAiReport() {
  const container = document.getElementById('ai-report');
  const sessionEntries = new Map(); // relatórios de cadastros da sessão (não salvos em arquivo)
  let catalog = null;
  let server = null;
  let request = null;
  let currentModel = null;
  let generating = null; // { id, started, timer }

  function loadCatalog() {
    catalog ||= fetch(reportsUrl, { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }).catch(error => { catalog = null; throw error; });
    return catalog;
  }

  // Verifica se a página foi aberta pelo servidor local com IA configurada.
  function checkServer() {
    server ||= fetch('/api/health', { cache: 'no-store' })
      .then(response => (response.ok ? response.json() : { ok: false }))
      .catch(() => ({ ok: false }));
    return server;
  }

  function actionBar(entry, status) {
    const busy = generating?.id === currentModel.site.id;
    const button = el('button', {
      className: 'primary-button ai-generate',
      text: busy ? 'Gerando…' : entry ? 'Gerar novamente' : 'Gerar relatório',
    });
    button.disabled = busy || !status.configured;
    button.addEventListener('click', generate);
    const note = !status.ok
      ? `Para gerar pela página, abra a demo com: ${SERVER_COMMAND}`
      : !status.configured ? 'Servidor sem chave de API. Confira o arquivo .env e reinicie o servidor.'
      : busy ? 'Consultando a IA. Pode levar até 1 minuto.'
      : status.hosted ? `Modelo: ${status.model} · relatórios novos valem só nesta aba`
      : `Modelo: ${status.model}`;
    const elapsed = el('span', { className: 'ai-elapsed' });
    if (busy) elapsed.dataset.started = generating.started;
    return el('div', { className: 'ai-actions' }, [button, el('span', { className: 'ai-action-note', text: note }), elapsed]);
  }

  function renderEmpty(site) {
    return [el('p', { text: `Ainda não há análise de IA para ${site.name}.` })];
  }

  function renderReport(entry, model) {
    const { report } = entry;
    const best = model.best;
    const confidence = report.confianca?.nivel || 'baixa';
    const parts = [el('div', { className: 'ai-meta' }, [
      el('span', { className: `ai-badge ai-confidence-${confidence}`, text: `Confiança ${LEVEL_LABELS[confidence] || confidence}` }),
      best ? el('span', { className: 'ai-badge', text: `${best.target.name} · ${(best.score * 100).toFixed(1)}%` }) : null,
      el('span', { className: 'ai-meta-text', text: `${entry.model} · ${formatDate(entry.generated_at)}` }),
    ])];

    if (entry.mock) parts.push(el('p', { className: 'ai-warning', text: 'Relatório de exemplo, sem análise real. Gere novamente com a chave de API.' }));
    if (isStale(entry, model)) parts.push(el('p', { className: 'ai-warning', text: 'Os dados desta localidade mudaram depois que a análise foi gerada. Gere novamente para atualizar.' }));
    if (sessionEntries.has(model.site.id)) parts.push(el('p', { className: 'ai-warning', text: 'Localidade cadastrada nesta sessão: o relatório não foi salvo em arquivo.' }));

    parts.push(
      el('div', { className: 'ai-summary' }, [
        el('p', { text: report.resumo }),
        report.analogo_principal?.interpretacao ? el('p', { className: 'ai-interpretation', text: report.analogo_principal.interpretacao }) : null,
      ]),
      el('div', { className: 'ai-columns' }, [
        el('section', {}, [el('h3', { text: 'Semelhanças' }), itemList(report.semelhancas || [])]),
        el('section', {}, [el('h3', { text: 'Diferenças' }), itemList(report.diferencas || [], item =>
          el('span', { className: `ai-impact ai-impact-${item.impacto}`, text: `Impacto ${LEVEL_LABELS[item.impacto] || item.impacto}` }))]),
      ]),
      el('h3', { text: 'O que a NASA poderia fazer aqui' }),
      el('div', { className: 'ai-suggestions' }, (report.sugestoes_nasa || []).map(item => el('article', { className: 'ai-suggestion' }, [
        el('span', { className: 'ai-chip ai-chip-type', text: SUGGESTION_LABELS[item.tipo] || item.tipo }),
        el('strong', { text: item.titulo }),
        el('p', { text: item.descricao }),
        el('p', { className: 'ai-justification', text: item.justificativa }),
      ]))),
    );
    if (report.limitacoes?.length) {
      parts.push(el('h3', { text: 'Limitações' }), el('ul', { className: 'ai-limitations' }, report.limitacoes.map(text => el('li', { text }))));
    }
    if (report.confianca?.motivo) parts.push(el('p', { className: 'data-note', text: `Confiança: ${report.confianca.motivo}` }));
    parts.push(el('p', { className: 'data-note', text: 'Texto gerado por IA a partir das métricas do catálogo. Revise antes de citar.' }));
    return parts;
  }

  function show(entry, status, extra = []) {
    const body = entry?.report ? renderReport(entry, currentModel) : renderEmpty(currentModel.site);
    container.replaceChildren(actionBar(entry, status), ...extra, ...body);
  }

  async function render(model) {
    currentModel = model;
    const token = request = Symbol();
    container.replaceChildren(el('p', { text: 'Carregando análise…' }));
    const status = await checkServer();
    if (token !== request) return;
    try {
      const data = await loadCatalog();
      if (token !== request) return;
      show(sessionEntries.get(model.site.id) || data.reports?.[model.site.id], status);
    } catch (error) {
      if (token !== request) return;
      console.error(error);
      show(sessionEntries.get(model.site.id), status, [el('p', { className: 'ai-warning', text: 'Não foi possível carregar as análises salvas.' })]);
    }
  }

  async function generate() {
    const model = currentModel;
    const site = model.site;
    if (generating) return;
    generating = { id: site.id, started: Date.now() };
    generating.timer = setInterval(() => {
      const label = container.querySelector('.ai-elapsed[data-started]');
      if (label) label.textContent = `${Math.round((Date.now() - generating.started) / 1000)}s`;
    }, 1000);
    render(model);

    let error = null;
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site }),
        signal: AbortSignal.timeout(80000),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      // persisted: salvo em ai-reports.json (servidor local).
      // hosted: gerado na Vercel, sem disco; fica na página enquanto a aba estiver aberta.
      if (body.persisted || body.hosted) {
        const data = await loadCatalog().catch(() => ({ reports: {} }));
        data.reports ||= {};
        data.reports[site.id] = body.entry;
        catalog = Promise.resolve(data);
      } else {
        sessionEntries.set(site.id, body.entry);
      }
    } catch (failure) {
      error = failure.name === "TimeoutError" ? new Error("O servidor excedeu o tempo de espera. Verifique o terminal e tente novamente.") : failure;
      console.error(failure);
    } finally {
      clearInterval(generating.timer);
      generating = null;
    }

    if (currentModel.site.id !== site.id) return; // usuário trocou de localidade
    await render(currentModel);
    if (error) {
      container.insertBefore(
        el('p', { className: 'ai-warning', text: `Não foi possível gerar: ${error.message}` }),
        container.children[1] || null,
      );
    }
  }

  return { render };
}
