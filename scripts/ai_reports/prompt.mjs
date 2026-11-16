// Prompt, esquema de saída e montagem dos dados enviados à IA.
// Edite este arquivo para ajustar o tom, as seções ou os tipos de sugestão.

import { PARAM_LABELS } from '../../deliverables/demo/js/data/constants.js';

export const PROMPT_VERSION = '0.2.0-en';

// Tipos de uso que a NASA realmente faz com análogos terrestres.
// A IA só pode escolher entre estes, para não inventar programas.
export const SUGGESTION_TYPES = {
  treinamento_astronautas: 'Astronaut training in field geology',
  teste_rovers_robotica: 'Rover, robotics and autonomous navigation testing',
  calibracao_instrumentos: 'Calibration and validation of orbital instruments',
  estudo_processos: 'Study of geological processes (aeolian, impact, erosion)',
  validacao_algoritmos: 'Validation of detection and morphometry algorithms',
  educacao_divulgacao: 'Education and science outreach',
};

export const CONFIDENCE_LEVELS = ['baixa', 'media', 'alta'];

export const SYSTEM_PROMPT = `You are a planetary geologist analyzing terrestrial analogs for NASA.
You receive morphometric data for an Earth site and comparisons with Martian dunes or lunar craters.

MANDATORY RULES
1. Use only the supplied data. Do not invent measurements, dates, ages, minerals, studies or missions.
2. Every similarity and difference must cite the supporting metric keys in "metricas" (e.g. "wavelength").
   Use only keys present in "metricas_comparadas". If a claim is not supported by a metric, leave the list empty and say so in the text.
3. The team-written "notas_catalogo" have not been verified: treat them as hypotheses, never as facts.
4. For dunes, the Martian reference's dimensional metrics (mean height, wavelength, spacing) are already multiplied by the Bagnold factor (2.82). Compare against "referencia_escalada".
5. For NASA suggestions, select "tipo" only from: ${Object.keys(SUGGESTION_TYPES).join(', ')}.
   Justify every suggestion using the data. Do not claim NASA already operates at the site.
6. Be honest about limitations (climate, vegetation, moisture, scale, age, missing data).
7. Write ALL human-readable text in English, using clear, short sentences without exaggeration. Preserve proper names exactly as provided.
8. Keep the JSON field names and enum values below unchanged; they are internal API identifiers, not display text.

Respond ONLY with a JSON object in this format:
{
  "resumo": "2 to 3 sentences about the site and its value as an analog",
  "analogo_principal": { "interpretacao": "what the score and metrics indicate about similarity to the best reference" },
  "semelhancas": [ { "titulo": "...", "explicacao": "...", "metricas": ["metric_key"] } ],
  "diferencas": [ { "titulo": "...", "explicacao": "...", "metricas": ["metric_key"], "impacto": "baixo|medio|alto" } ],
  "sugestoes_nasa": [ { "tipo": "one of the allowed types", "titulo": "...", "descricao": "what could be done", "justificativa": "why this site, based on the data" } ],
  "limitacoes": ["..."],
  "confianca": { "nivel": "baixa|media|alta", "motivo": "..." }
}
Use 2 to 4 items for similarities, differences and suggestions.`;

const round = value => (typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(4)) : null);

// Monta o objeto de entrada a partir do mesmo modelo de comparação usado pela demo.
export function buildPayload(model, context) {
  const { site, matches, rows } = model;
  const body = site.type === 'crater' ? 'Moon' : 'Mars';
  return {
    localidade: {
      id: site.id,
      nome: site.name,
      regiao: site.uf,
      categoria: site.category,
      tipo_feicao: site.type === 'crater' ? 'crater' : 'dune',
      corpo_comparado: body,
      coordenadas: { lat: site.lat, lon: site.lon },
    },
    melhor_referencia: model.best
      ? { id: model.best.target.id, nome: model.best.target.name, score_percent: round(model.best.score * 100) }
      : null,
    outras_referencias: matches.slice(1, 4).map(match => ({
      nome: match.target.name, score_percent: round(match.score * 100),
    })),
    metodo_score: 'Score 0–100%: 60% weighted Euclidean distance (exp(-2.2·WED)) + 40% cosine similarity, normalized per pair by its maximum.',
    metricas_comparadas: rows.map(row => ({
      chave: row.key,
      rotulo: PARAM_LABELS[row.key] || row.key,
      peso: row.weight,
      terra: round(row.earth),
      referencia_original: round(row.target),
      referencia_escalada: round(row.comparable),
      escalada_bagnold: row.scaled,
      diferenca_percent: round(row.difference),
    })),
    contexto_geografico: context ? {
      clima: context.climate ?? null,
      vegetacao: context.vegetation ?? null,
      bioma: context.biome ?? null,
      localidade_proxima: context.nearby_locality ?? null,
      status_revisao: context.review_status ?? null,
    } : null,
    notas_catalogo: {
      aviso: 'Team-written text, unverified.',
      semelhancas: site.similarities ?? [],
      diferencas: site.differences ?? [],
    },
  };
}

export function buildMessages(payload) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Analyze this site:\n${JSON.stringify(payload, null, 2)}` },
  ];
}

// Limpa e valida a resposta: remove métricas e tipos que não existem,
// garante listas e corta tamanhos. Lança erro se faltar o essencial.
export function validateReport(raw, payload) {
  const allowedMetrics = new Set(payload.metricas_comparadas.map(metric => metric.chave));
  const text = value => (typeof value === 'string' ? value.trim() : '');
  const list = value => (Array.isArray(value) ? value : []);
  const metrics = value => list(value).filter(key => allowedMetrics.has(key));
  const level = (value, options, fallback) => (options.includes(value) ? value : fallback);

  const report = {
    resumo: text(raw?.resumo),
    analogo_principal: { interpretacao: text(raw?.analogo_principal?.interpretacao) },
    semelhancas: list(raw?.semelhancas).slice(0, 5).map(item => ({
      titulo: text(item?.titulo), explicacao: text(item?.explicacao), metricas: metrics(item?.metricas),
    })).filter(item => item.titulo && item.explicacao),
    diferencas: list(raw?.diferencas).slice(0, 5).map(item => ({
      titulo: text(item?.titulo), explicacao: text(item?.explicacao), metricas: metrics(item?.metricas),
      impacto: level(item?.impacto, ['baixo', 'medio', 'alto'], 'medio'),
    })).filter(item => item.titulo && item.explicacao),
    sugestoes_nasa: list(raw?.sugestoes_nasa).slice(0, 5).map(item => ({
      tipo: item?.tipo, titulo: text(item?.titulo), descricao: text(item?.descricao), justificativa: text(item?.justificativa),
    })).filter(item => SUGGESTION_TYPES[item.tipo] && item.titulo && item.descricao),
    limitacoes: list(raw?.limitacoes).map(text).filter(Boolean).slice(0, 6),
    confianca: {
      nivel: level(raw?.confianca?.nivel, CONFIDENCE_LEVELS, 'baixa'),
      motivo: text(raw?.confianca?.motivo),
    },
  };

  if (!report.resumo || !report.semelhancas.length || !report.sugestoes_nasa.length) {
    throw new Error('Incomplete response: missing summary, similarities or valid suggestions.');
  }
  return report;
}

// Relatório de exemplo, sem IA, para desenvolver o front sem gastar chamadas.
export function mockReport(payload) {
  const first = payload.metricas_comparadas[0];
  return {
    resumo: `[EXAMPLE] Demonstration text for ${payload.localidade.nome}. Run the generator with an API key for a real analysis.`,
    analogo_principal: { interpretacao: '[EXAMPLE] Score interpretation will appear here.' },
    semelhancas: [{ titulo: '[EXAMPLE] Similarity', explicacao: 'Explanation based on the metrics.', metricas: first ? [first.chave] : [] }],
    diferencas: [{ titulo: '[EXAMPLE] Difference', explicacao: 'Explanation based on the metrics.', metricas: [], impacto: 'medio' }],
    sugestoes_nasa: [{ tipo: 'estudo_processos', titulo: '[EXAMPLE] Suggestion', descricao: 'O que poderia ser feito.', justificativa: 'Por que este local.' }],
    limitacoes: ['[EXAMPLE] Limitations will appear here.'],
    confianca: { nivel: 'baixa', motivo: 'Example report without real analysis.' },
  };
}
