// UI fixtures explicitly requested for the compact table. Never used for scores,
// rankings, charts, scientific reports, or to modify the inherited catalog.
export const COMPARISON_DEMO = {
  barringer: {
    lunar: {
      reference: 'Shackleton',
      rows: [
        ['Diâmetro (km)', '1,186', '21,0'],
        ['Profundidade (km)', '0,170', '4,10'],
        ['Bordas', 'Elevadas', 'Elevadas'],
        ['Declividade (°)', '34,1', '28,6'],
        ['Estrutura interna', 'Piso definido', 'Piso com elevação'],
      ],
    },
  },
  lencois: {
    martian: {
      reference: 'Região de dunas marcianas (exemplo)',
      rows: [
        ['Tipo de duna', 'Barcana', 'Barcana'],
        ['Altura média (m)', '45', '40'],
        ['Comprimento de onda (m)', '280', '310'],
        ['Orientação / azimute (°)', '75', '82'],
        ['Densidade de dunas', '—', '—'],
        ['Espaçamento médio (m)', '280', '310'],
        ['Padrão de distribuição', 'Agrupado', 'Agrupado'],
        ['Índice de aridez', '—', '—'],
      ],
    },
  },
};
