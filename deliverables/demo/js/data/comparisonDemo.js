// UI fixtures explicitly requested for the compact table. Never used for scores,
// rankings, charts, scientific reports, or to modify the inherited catalog.
export const COMPARISON_DEMO = {
  barringer: {
    lunar: {
      reference: 'Shackleton',
      rows: [
        ['Diameter (km)', '1.186', '21.0'],
        ['Depth (km)', '0.170', '4.10'],
        ['Rims', 'Raised', 'Raised'],
        ['Slope (°)', '34.1', '28.6'],
        ['Internal structure', 'Defined floor', 'Uplifted floor'],
      ],
    },
  },
  lencois: {
    martian: {
      reference: 'Martian dune region (example)',
      rows: [
        ['Dune type', 'Barchan', 'Barchan'],
        ['Mean height (m)', '45', '40'],
        ['Wavelength (m)', '280', '310'],
        ['Orientation / azimuth (°)', '75', '82'],
        ['Dune density', '—', '—'],
        ['Mean spacing (m)', '280', '310'],
        ['Distribution pattern', 'Clustered', 'Clustered'],
        ['Aridity index', '—', '—'],
      ],
    },
  },
};
