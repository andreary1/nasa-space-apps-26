// MOCK DATA ONLY. Scores and morphology are UI fixtures, not pipeline results.
// Replace this export with a JSON loader when the pipeline contract is available.
export const metrics = [
  'Diâmetro (km)',
  'Profundidade (km)',
  'Razão d/D',
  'Declividade média (°)',
  'Circularidade',
];

// Display schemas are independent from the legacy rows and similarity scores.
// These fixtures model crater → Moon and dune → Mars comparisons only.
export const comparisonFields = {
  lunar: [
    { key: 'diametro', label: 'Diâmetro (km)' },
    { key: 'profundidade', label: 'Profundidade (km)' },
    { key: 'bordas', label: 'Bordas' },
    { key: 'declividade', label: 'Declividade (°)' },
    { key: 'estrutura_interna', label: 'Estrutura interna' },
  ],
  martian: [
    { key: 'tipo_duna', label: 'Tipo de duna' },
    { key: 'altura_media', label: 'Altura média (m)' },
    { key: 'comprimento_onda', label: 'Comprimento de onda (m)' },
    { key: 'orientacao_azimute', label: 'Orientação / azimute (°)' },
    { key: 'densidade_dunas', label: 'Densidade de dunas' },
    { key: 'espacamento_medio', label: 'Espaçamento médio (m)' },
    { key: 'padrao_distribuicao', label: 'Padrão de distribuição' },
    { key: 'indice_aridez', label: 'Índice de aridez' },
  ],
};
const craterReferences = {
  lunar: { name: 'Shackleton', score: 0.87 },
  martian: { name: 'Orkott', score: 0.83 },
};
const craterRows = [
  ['1,186', '21,0', '22,4'],
  ['0,170', '4,10', '2,90'],
  ['0,143', '0,195', '0,129'],
  ['34,1', '28,6', '25,4'],
  ['0,96', '0,93', '0,91'],
];
export const locations = [
  {
    id: 'barringer',
    name: 'Cratera de Barringer',
    shortName: 'Barringer',
    lat: 35.0275,
    lon: -111.0228,
    region: 'Arizona, EUA',
    country: 'EUA',
    category: 'crater',
    type: 'Cratera de impacto',
    age: '~ 50.000 anos',
    references: craterReferences,
    rows: craterRows,
  },
  {
    id: 'wolfe',
    name: 'Wolfe Creek',
    shortName: 'Wolfe Creek',
    lat: -19.171,
    lon: 127.795,
    region: 'Austrália Ocidental',
    country: 'Austrália',
    category: 'crater',
    type: 'Cratera de impacto',
    age: 'Não informada nesta demo',
    references: {
      lunar: { name: 'Shackleton', score: 0.79 },
      martian: { name: 'Orkott', score: 0.75 },
    },
    rows: [
      ['0,88', '21,0', '22,4'],
      ['0,06', '4,10', '2,90'],
      ['0,068', '0,195', '0,129'],
      ['26,0', '28,6', '25,4'],
      ['0,94', '0,93', '0,91'],
    ],
  },
  {
    id: 'lonar',
    name: 'Cratera de Lonar',
    shortName: 'Lonar',
    lat: 19.9767,
    lon: 76.5083,
    region: 'Maharashtra, Índia',
    country: 'Índia',
    category: 'crater',
    type: 'Cratera de impacto',
    age: 'Não informada nesta demo',
    references: {
      lunar: { name: 'Shackleton', score: 0.81 },
      martian: { name: 'Orkott', score: 0.78 },
    },
    rows: [
      ['1,83', '21,0', '22,4'],
      ['0,15', '4,10', '2,90'],
      ['0,082', '0,195', '0,129'],
      ['29,0', '28,6', '25,4'],
      ['0,95', '0,93', '0,91'],
    ],
  },
  ...[
    [
      'lencois',
      'Lençóis Maranhenses',
      -2.485,
      -43.126,
      'Maranhão, Brasil',
      'blue',
      0.84,
      'Brasil',
    ],
    ['erg', 'Erg Chebbi', 31.15, -3.97, 'Marrocos', 'green', 0.8, 'Marrocos'],
    [
      'sossusvlei',
      'Sossusvlei',
      -24.73,
      15.34,
      'Namíbia',
      'green',
      0.88,
      'Namíbia',
    ],
  ].map(([id, name, lat, lon, region, tone, score, country]) => ({
    id,
    name,
    shortName: name,
    lat,
    lon,
    region,
    country,
    tone,
    category: 'dune',
    type: 'Campo de dunas',
    age: 'Não informada nesta demo',
    references: { lunar: null, martian: { name: 'Dunas de Bagnold', score } },
    metricLabels: [
      'Altura (m)',
      'Espaçamento (m)',
      'Razão h/L',
      'Declividade média (°)',
      'Alongamento',
    ],
    rows: [
      ['45', '—', '40'],
      ['280', '—', '310'],
      ['0,161', '—', '0,129'],
      ['29,0', '—', '28,0'],
      ['0,78', '—', '0,82'],
    ],
  })),
];

// Additional descriptions/azimuths below are the explicitly supplied UI examples.
// Unknown characteristics stay null; original scores and legacy fixture rows stay intact.
export const comparisonData = Object.fromEntries(
  locations.map((location) => {
    if (location.category === 'crater') {
      return [
        location.id,
        {
          lunar: {
            reference: 'Shackleton',
            earth: {
              diametro: location.rows[0][0],
              profundidade: location.rows[1][0],
              bordas:
                location.id === 'barringer' ? { descricao: 'Elevadas' } : {},
              declividade: location.rows[3][0],
              estrutura_interna:
                location.id === 'barringer' ? ['Piso definido'] : [],
            },
            referenceMetrics: {
              diametro: '21,0',
              profundidade: '4,10',
              bordas: { descricao: 'Elevadas' },
              declividade: '28,6',
              estrutura_interna: ['Piso com elevação'],
            },
          },
          martian: null,
        },
      ];
    }
    const isExample = location.id === 'lencois';
    return [
      location.id,
      {
        lunar: null,
        martian: {
          reference: 'Dunas de Bagnold',
          earth: {
            tipo_duna: isExample ? 'Barcana' : null,
            altura_media: '45',
            comprimento_onda: isExample ? '280' : null,
            orientacao_azimute: isExample ? '75' : null,
            densidade_dunas: null,
            espacamento_medio: '280',
            padrao_distribuicao: isExample ? 'Agrupado' : null,
            indice_aridez: null,
          },
          referenceMetrics: {
            tipo_duna: isExample ? 'Barcana' : null,
            altura_media: '40',
            comprimento_onda: isExample ? '310' : null,
            orientacao_azimute: isExample ? '82' : null,
            densidade_dunas: null,
            espacamento_medio: '310',
            padrao_distribuicao: isExample ? 'Agrupado' : null,
            indice_aridez: null,
          },
        },
      },
    ];
  }),
);
