// Prompt, esquema de saída e montagem dos dados enviados à IA.
// Edite este arquivo para ajustar o tom, as seções ou os tipos de sugestão.

import { PARAM_LABELS } from '../../deliverables/demo/js/data/constants.js';

export const PROMPT_VERSION = '0.1.0';

// Tipos de uso que a NASA realmente faz com análogos terrestres.
// A IA só pode escolher entre estes, para não inventar programas.
export const SUGGESTION_TYPES = {
  treinamento_astronautas: 'Treinamento de astronautas em geologia de campo',
  teste_rovers_robotica: 'Teste de rovers, robótica e navegação autônoma',
  calibracao_instrumentos: 'Calibração e validação de instrumentos orbitais',
  estudo_processos: 'Estudo de processos geológicos (eólicos, impacto, erosão)',
  validacao_algoritmos: 'Validação de algoritmos de detecção e morfometria',
  educacao_divulgacao: 'Educação e divulgação científica',
};

export const CONFIDENCE_LEVELS = ['baixa', 'media', 'alta'];

export const SYSTEM_PROMPT = `Você é um geólogo planetário que analisa análogos terrestres para a NASA.
Recebe dados morfométricos de uma localidade na Terra e a comparação dela com feições de Marte (dunas) ou da Lua (crateras).

REGRAS OBRIGATÓRIAS
1. Use somente os dados recebidos. Não invente medidas, datas, idades, minerais, estudos ou missões.
2. Toda semelhança e diferença deve citar no campo "metricas" as chaves das métricas que a sustentam (ex.: "wavelength").
   Use apenas chaves presentes em "metricas_comparadas". Se a afirmação não vier de uma métrica, deixe a lista vazia e diga isso no texto.
3. As "notas_catalogo" foram escritas pela equipe e ainda não foram verificadas: trate-as como hipóteses, nunca como fatos.
4. Em dunas, as métricas de escala (altura média, comprimento de onda, espaçamento) da referência marciana já vêm multiplicadas pelo fator de Bagnold (2,82). Compare com o valor "referencia_escalada".
5. Sugestões para a NASA: escolha "tipo" apenas entre: ${Object.keys(SUGGESTION_TYPES).join(', ')}.
   Justifique cada sugestão com os dados. Não afirme que a NASA já atua no local.
6. Seja honesto sobre limitações (clima, vegetação, umidade, escala, idade, dados ausentes).
7. Escreva em português do Brasil, frases claras e curtas, sem exageros.

Responda APENAS com um objeto JSON neste formato:
{
  "resumo": "2 a 3 frases sobre o local e o seu valor como análogo",
  "analogo_principal": { "interpretacao": "o que o score e as métricas dizem sobre a semelhança com a melhor referência" },
  "semelhancas": [ { "titulo": "...", "explicacao": "...", "metricas": ["chave"] } ],
  "diferencas": [ { "titulo": "...", "explicacao": "...", "metricas": ["chave"], "impacto": "baixo|medio|alto" } ],
  "sugestoes_nasa": [ { "tipo": "um dos tipos permitidos", "titulo": "...", "descricao": "o que poderia ser feito", "justificativa": "por que este local, com base nos dados" } ],
  "limitacoes": ["..."],
  "confianca": { "nivel": "baixa|media|alta", "motivo": "..." }
}
Use de 2 a 4 itens em semelhanças, diferenças e sugestões.`;

const round = value => (typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(4)) : null);

// Monta o objeto de entrada a partir do mesmo modelo de comparação usado pela demo.
export function buildPayload(model, context) {
  const { site, matches, rows } = model;
  const body = site.type === 'crater' ? 'Lua' : 'Marte';
  return {
    localidade: {
      id: site.id,
      nome: site.name,
      regiao: site.uf,
      categoria: site.category,
      tipo_feicao: site.type === 'crater' ? 'cratera' : 'duna',
      corpo_comparado: body,
      coordenadas: { lat: site.lat, lon: site.lon },
    },
    melhor_referencia: model.best
      ? { id: model.best.target.id, nome: model.best.target.name, score_percent: round(model.best.score * 100) }
      : null,
    outras_referencias: matches.slice(1, 4).map(match => ({
      nome: match.target.name, score_percent: round(match.score * 100),
    })),
    metodo_score: 'Score 0-100%: 60% distância euclidiana ponderada (exp(-2,2·WED)) + 40% similaridade de cosseno, normalização par a par pelo máximo.',
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
      aviso: 'Texto da equipe, não verificado.',
      semelhancas: site.similarities ?? [],
      diferencas: site.differences ?? [],
    },
  };
}

export function buildMessages(payload) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Analise esta localidade:\n${JSON.stringify(payload, null, 2)}` },
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
    throw new Error('Resposta incompleta: faltou resumo, semelhanças ou sugestões válidas.');
  }
  return report;
}

// Relatório de exemplo, sem IA, para desenvolver o front sem gastar chamadas.
export function mockReport(payload) {
  const first = payload.metricas_comparadas[0];
  return {
    resumo: `[EXEMPLO] Texto de demonstração para ${payload.localidade.nome}. Rode o gerador com a chave de API para obter a análise real.`,
    analogo_principal: { interpretacao: '[EXEMPLO] Interpretação do score aparecerá aqui.' },
    semelhancas: [{ titulo: '[EXEMPLO] Semelhança', explicacao: 'Explicação baseada nas métricas.', metricas: first ? [first.chave] : [] }],
    diferencas: [{ titulo: '[EXEMPLO] Diferença', explicacao: 'Explicação baseada nas métricas.', metricas: [], impacto: 'medio' }],
    sugestoes_nasa: [{ tipo: 'estudo_processos', titulo: '[EXEMPLO] Sugestão', descricao: 'O que poderia ser feito.', justificativa: 'Por que este local.' }],
    limitacoes: ['[EXEMPLO] Limitações aparecerão aqui.'],
    confianca: { nivel: 'baixa', motivo: 'Relatório de exemplo, sem análise real.' },
  };
}
