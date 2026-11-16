// Catalog preserved from main; source annotations remain on the records.
export const SITES_DATA = [
  {
    id: "jericoacoara",
    name: "Jericoacoara",
    uf: "CE, Brasil",
    category: "Barchan Dune Field",
    type: "dune",
    body: "mars",
    lat: -2.825,
    lon: -40.490,
    metrics: { mean_height: 6.0, height_p90: 10.7, wavelength: 297, crest_azimuth: 173, dune_density: 3.99, mean_spacing: 392, aridity_index: 0.468 },
    similarities: [
      "Classic crescent-shaped barchan dune morphology with a distinct slip face.",
      "Mean wavelength (297 m) closely matches Gale dunes (~100 m) when applying Bagnold scaling β ≈ 2.82×.",
      "Active migration driven by a steady unidirectional wind regime (trade winds)."
    ],
    differences: [
      "Earth\'s gravity (1.0g) limits dune height to ~10 m, whereas on Mars (0.38g) dunes exceed 25 m.",
      "Interdune lagoons and groundwater moisture are present, unlike on the present-day surface of Mars.",
      "Clean quartz sand with high solar reflectance versus dark basaltic grains rich in pyroxene/olivine on Mars."
    ]
  },
  {
    id: "lencois",
    name: "Lençóis Maranhenses",
    uf: "MA, Brasil",
    category: "Barchanoid Dune Field",
    type: "dune",
    body: "mars",
    lat: -2.600,
    lon: -43.000,
    metrics: { mean_height: 6.3, height_p90: 11.0, wavelength: 312, crest_azimuth: 161, dune_density: 6.58, mean_spacing: 367, aridity_index: 0.764 },
    similarities: [
      "Regular pattern of continuous transverse barchanoid ridges similar to Nili Patera.",
      "Spatial ridge density of ~6.5/km² with high geometric periodicity.",
      "Strongly convergent ridge/spacing aspect ratio after gravitational scaling."
    ],
    differences: [
      "Hydrological regime with seasonal precipitation exceeding 1500 mm/year.",
      "Localized stabilization by biofilms and coastal vegetation along the field margins.",
      "Earth\'s dense atmosphere (1013 mbar) supports much more continuous sand transport than Mars (6 mbar)."
    ]
  },
  {
    id: "rosado",
    name: "Dunas do Rosado",
    uf: "RN, Brasil",
    category: "Transverse Dune Field",
    type: "dune",
    body: "mars",
    lat: -5.030,
    lon: -36.845,
    metrics: { mean_height: 6.3, height_p90: 11.7, wavelength: 335, crest_azimuth: 167, dune_density: 4.79, mean_spacing: 377, aridity_index: 0.322 },
    similarities: [
      "Distinctive reddish/pink coloration from iron oxide coatings (hematite/goethite), identical to the spectrum of Martian sands.",
      "Consistent ridge azimuth (167°) matching transverse ridges in Gale Crater.",
      "Low moisture index and high aeolian mobility in a coastal semiarid environment."
    ],
    differences: [
      "Quartz coated with iron-rich clays versus Martian mafic basaltic sand.",
      "Daily coastal sea breezes versus seasonal planetary dust storms on Mars.",
      "Thicker atmospheric boundary layer on Earth."
    ]
  },
  {
    id: "ibiraba",
    name: "Dunas de Ibiraba (S. Francisco)",
    uf: "BA, Brasil",
    category: "Fossil Dune Field",
    type: "dune",
    body: "mars",
    lat: -10.710,
    lon: -42.800,
    metrics: { mean_height: 6.7, height_p90: 13.1, wavelength: 345, crest_azimuth: 115, dune_density: 4.56, mean_spacing: 488, aridity_index: 0.237 },
    similarities: [
      "Paleo-aeolian dunes with degraded ridges, analogous to fossil and lithified dune fields in ancient Martian craters.",
      "Low aridity index (0.237), within the semiarid Caatinga interior.",
      "Wide ridge spacing of nearly 500 m."
    ],
    differences: [
      "Sparse xerophytic vegetation (Caatinga) restrains active sand migration.",
      "Ancient fluvial interaction with the paleochannel of Rio São Francisco.",
      "No seasonal CO2 ice, which affects high-latitude Martian dunes."
    ]
  },
  {
    id: "erg_chebbi",
    name: "Erg Chebbi (Saara)",
    uf: "Marrocos",
    category: "Star Dune Mega-Erg",
    type: "dune",
    body: "mars",
    lat: 31.150,
    lon: -3.983,
    metrics: { mean_height: 28.0, height_p90: 45.0, wavelength: 420, crest_azimuth: 145, dune_density: 2.10, mean_spacing: 520, aridity_index: 0.040 },
    similarities: [
      "Extreme hyperaridity and monumental height (up to 45 m), compatible with Proctor and Kaiser megadunes on Mars.",
      "Almost no vegetation and a surrounding desert bedrock substrate.",
      "Multidirectional ridge breaks associated with variable seasonal winds."
    ],
    differences: [
      "Earth\'s atmospheric pressure sustains continuous saltation at moderate wind speeds (15 km/h), versus >80 km/h required on Mars.",
      "Daytime surface temperatures reach +45°C, versus average subzero Martian temperatures (-60°C).",
      "Origem sedimentar em bacia intracontinental terrestre."
    ]
  },
  {
    id: "sossusvlei",
    name: "Sossusvlei (Deserto do Namibe)",
    uf: "Namíbia",
    category: "Linear and Barchanoid Megadunes",
    type: "dune",
    body: "mars",
    lat: -24.727,
    lon: 15.340,
    metrics: { mean_height: 35.0, height_p90: 58.0, wavelength: 510, crest_azimuth: 155, dune_density: 1.80, mean_spacing: 620, aridity_index: 0.020 },
    similarities: [
      "Among Earth\'s tallest dunes, comparable to basaltic megadunes on Mars.",
      "Intense iron oxidation with a deep brick-red color identical to Martian regolith.",
      "Flat interdune salt and clay surfaces (vlei) similar to Martian evaporite beds."
    ],
    differences: [
      "Frequent morning coastal fog (Atlantic advection fog).",
      "Extremely old geological age with deep structural stabilization.",
      "Gravity of 1.0g prevents the formation of meter-scale wind ripples (TARs)."
    ]
  },
  {
    id: "rub_al_khali",
    name: "Rub' al Khali (Quarto Vazio)",
    uf: "Arábia Saudita",
    category: "Continuous Sand Sea (Global Erg)",
    type: "dune",
    body: "mars",
    lat: 20.000,
    lon: 50.000,
    metrics: { mean_height: 22.0, height_p90: 36.0, wavelength: 380, crest_azimuth: 80, dune_density: 3.20, mean_spacing: 410, aridity_index: 0.015 },
    similarities: [
      "Earth\'s largest continuous sand sea, the closest analog for Olympia Undae (the Martian circumpolar sand sea).",
      "Statistical uniformity and geometric periodicity with high spatial coherence.",
      "Hyperarid conditions without surface biogenic interference."
    ],
    differences: [
      "In Olympia Undae (Mars), dunes interact seasonally with dry-ice caps (carbon dioxide).",
      "Continuous terrestrial monsoon winds versus global dust storms on Mars.",
      "No cryogenic sublimation in the Arabian desert."
    ]
  },
  {
    id: "white_sands",
    name: "White Sands",
    uf: "Novo México, EUA",
    category: "Active Gypsum Dune Field",
    type: "dune",
    body: "mars",
    lat: 32.780,
    lon: -106.320,
    metrics: { mean_height: 8.5, height_p90: 14.0, wavelength: 260, crest_azimuth: 65, dune_density: 5.80, mean_spacing: 310, aridity_index: 0.180 },
    similarities: [
      "Rare mineral composition of hydrated gypsum (calcium sulfate), identical to sulfate deposits discovered by the Opportunity rover and OMEGA on Mars.",
      "Morphometry of active barchan dunes migrating across a flat evaporite bed.",
      "Preferred NASA analog for sulfate mineral spectroscopy calibration."
    ],
    differences: [
      "Liquid groundwater less than 1 meter deep cements the base of the dunes.",
      "Extremely high optical albedo (pure white), contrasting with dark basaltic Martian dunes.",
      "Dissolution and recrystallization cycles driven by daily dew."
    ]
  },
  {
    id: "canion_apertados",
    name: "Cânion dos Apertados (Currais Novos)",
    uf: "RN, Brasil",
    category: "Gorge and Steep Outcrop",
    type: "crater",
    body: "moon",
    lat: -6.342,
    lon: -36.502,
    metrics: { diameter_m: 2548, depth_m: 185.0, depth_diameter_ratio: 0.0726, rim_height_m: 65.0, rim_height_diameter_ratio: 0.0255, rim_variation_m: 82.0, rim_radius_cv: 0.042, mean_wall_slope: 16.8, wall_slope_p90: 28.4, circularity: 0.880, rim_coherence: 0.850 },
    similarities: [
      "Steep wall slope (P90 = 28.4°), very close to the inner wall slopes of Censorinus and Shackleton.",
      "Exposed granitic and quartzitic outcrops with block fracturing.",
      "Steep V-shaped topographic cross-section analogous to young crater rims."
    ],
    differences: [
      "Fluvial erosional origin (carved by Rio Picuí), rather than hypervelocity meteorite impact.",
      "Elongated longitudinal rather than circular morphology.",
      "Intense mechanical fragmentation associated with Earth\'s semiarid climate."
    ]
  },
  {
    id: "vale_vulcanico",
    name: "Vale Vulcânico (Cerro Corá)",
    uf: "RN, Brasil",
    category: "Circular Volcanic Structure",
    type: "crater",
    body: "moon",
    lat: -6.081,
    lon: -36.403,
    metrics: { diameter_m: 2585, depth_m: 210.0, depth_diameter_ratio: 0.0812, rim_height_m: 78.0, rim_height_diameter_ratio: 0.0301, rim_variation_m: 95.0, rim_radius_cv: 0.035, mean_wall_slope: 18.2, wall_slope_p90: 31.0, circularity: 0.895, rim_coherence: 0.880 },
    similarities: [
      "Well-defined semicircular geometry with perimeter rim uplift.",
      "High wall slope (31° at P90), analogous to simple-to-complex transitional craters.",
      "Basaltic lithology related to lunar mare basalts (Mare Serenitatis)."
    ],
    differences: [
      "Tertiary volcanic-tectonic magmatic origin (Formação Macau), rather than kinetic asteroid collision.",
      "No impact breccias (impactites) or shock minerals (stishovite/coesite).",
      "Pronounced differential weathering erosion."
    ]
  },
  {
    id: "pico_cabugi",
    name: "Pico do Cabugi",
    uf: "RN, Brasil",
    category: "Conical Volcanic Plug",
    type: "crater",
    body: "moon",
    lat: -5.710,
    lon: -36.320,
    metrics: { diameter_m: 1250, depth_m: 195.0, depth_diameter_ratio: 0.1560, rim_height_m: 140.0, rim_height_diameter_ratio: 0.1120, rim_variation_m: 62.0, rim_radius_cv: 0.029, mean_wall_slope: 24.5, wall_slope_p90: 38.2, circularity: 0.925, rim_coherence: 0.910 },
    similarities: [
      "Extreme slope (P90 = 38.2°), compatible with the steepest walls of Shackleton crater (36–41°).",
      "Circular conical geometry with a sharp topographic contrast against the surrounding terrain.",
      "Composed of mantle-derived alkali basalts similar to lunar regolith."
    ],
    differences: [
      "Positive topography (residual relief), versus an impact crater\'s excavated depression.",
      "Terrestrial slope talus deposits with active gravitational sliding.",
      "Volcanic conduit structure exposed by erosion."
    ]
  },
  {
    id: "pedra_cariri",
    name: "Pedra Cariri (Geopark Araripe)",
    uf: "CE, Brasil",
    category: "Structural Depression and Outcrop",
    type: "crater",
    body: "moon",
    lat: -7.090,
    lon: -39.700,
    metrics: { diameter_m: 3120, depth_m: 140.0, depth_diameter_ratio: 0.0448, rim_height_m: 55.0, rim_height_diameter_ratio: 0.0176, rim_variation_m: 70.0, rim_radius_cv: 0.048, mean_wall_slope: 14.1, wall_slope_p90: 23.5, circularity: 0.875, rim_coherence: 0.840 },
    similarities: [
      "Steep escarpments with abrupt slope breaks typical of collapse rims.",
      "Approximate aspect ratio and circularity comparable to eroded lunar craters.",
      "Layered sedimentology comparable to ejecta layers in lunar craters."
    ],
    differences: [
      "Lacustrine and marine sedimentary origin in the Cretaceous Araripe rift basin.",
      "Extremely rich terrestrial fossil content (fish fauna and pterosaurs), absent in space.",
      "Sheet erosion by surface water."
    ]
  },
  {
    id: "morro_chapeu",
    name: "Morro do Chapéu (Tanque / Pedreira)",
    uf: "BA, Brasil",
    category: "Circular Sedimentary Plateau",
    type: "crater",
    body: "moon",
    lat: -11.550,
    lon: -41.200,
    metrics: { diameter_m: 4800, depth_m: 175.0, depth_diameter_ratio: 0.0365, rim_height_m: 90.0, rim_height_diameter_ratio: 0.0187, rim_variation_m: 85.0, rim_radius_cv: 0.052, mean_wall_slope: 15.3, wall_slope_p90: 25.1, circularity: 0.890, rim_coherence: 0.860 },
    similarities: [
      "Large-diameter circular structure with a flattened inner floor and tabular rims.",
      "Diameter morphometry (4.8 km) analogous to transitional craters such as Censorinus.",
      "Highly resistant quartzitic outcrops."
    ],
    differences: [
      "Residual karstic and sedimentary mesa/inselberg relief in Chapada Diamantina.",
      "No shatter cones or shock features.",
      "Proterozoic sedimentation age without confirmed meteoritic shock."
    ]
  },
  {
    id: "serra_cangalha",
    name: "Serra da Cangalha",
    uf: "TO/MA, Brasil",
    category: "Complex Impact Crater",
    type: "crater",
    body: "moon",
    lat: -8.083,
    lon: -46.867,
    metrics: { diameter_m: 14337, depth_m: 250.0, depth_diameter_ratio: 0.0174, rim_height_m: 180.0, rim_height_diameter_ratio: 0.0125, rim_variation_m: 140.5, rim_radius_cv: 0.038, mean_wall_slope: 12.4, wall_slope_p90: 22.0, circularity: 0.942, rim_coherence: 0.910 },
    similarities: [
      "Confirmed meteorite impact crater with a central peak and inner ring identical to complex lunar craters such as Tycho and Copernicus.",
      "Confirmed shatter cones and quartz with planar deformation features (PDFs).",
      "High circularity (0.942) preserved in the subsurface structure."
    ],
    differences: [
      "Rims eroded by hundreds of millions of years of tropical rainfall in Bacia do Parnaíba.",
      "Original depth substantially filled by Cenozoic sediments.",
      "Covered by Cerrado vegetation."
    ]
  },
  {
    id: "riachao",
    name: "Anel de Riachão",
    uf: "MA, Brasil",
    category: "Simple Impact Crater",
    type: "crater",
    body: "moon",
    lat: -7.717,
    lon: -46.650,
    metrics: { diameter_m: 4100, depth_m: 120.0, depth_diameter_ratio: 0.0293, rim_height_m: 60.0, rim_height_diameter_ratio: 0.0146, rim_variation_m: 65.0, rim_radius_cv: 0.030, mean_wall_slope: 11.8, wall_slope_p90: 19.5, circularity: 0.955, rim_coherence: 0.920 },
    similarities: [
      "Confirmed impact structure with nearly perfect circular morphology (circularity = 0.955).",
      "Diameter of 4.1 km directly comparable to simple lunar craters such as Censorinus (4.13 km).",
      "Impact breccias and deformed sandstones exposed along the ridge."
    ],
    differences: [
      "Floor filled by colluvial and alluvial sediments, with loss of the original deep basin.",
      "No bright external ejecta rays (destroyed by wind/water erosion on Earth).",
      "Lower elevation contrast relative to the surrounding terrain."
    ]
  },
  {
    id: "araguainha",
    name: "Domo de Araguainha",
    uf: "GO/MT, Brasil",
    category: "Multi-ring Impact Crater",
    type: "crater",
    body: "moon",
    lat: -16.783,
    lon: -52.983,
    metrics: { diameter_m: 41277, depth_m: 160.2, depth_diameter_ratio: 0.0039, rim_height_m: 49.1, rim_height_diameter_ratio: 0.0012, rim_variation_m: 292.3, rim_radius_cv: 0.076, mean_wall_slope: 4.5, wall_slope_p90: 8.7, circularity: 0.866, rim_coherence: 0.828 },
    similarities: [
      "South America\'s largest impact structure (41.3 km), an analog for large lunar craters and impact basins such as Aristarchus and Cabeus.",
      "Uplifted granitic central core with extreme shock metamorphism features (impact melts).",
      "Concentric multi-ring pattern with peripheral normal faults identical to lunar basin collapse."
    ],
    differences: [
      "O Rio Araguaia e seus afluentes cortam transversalmente a cratera, erodindo o relevo original.",
      "Age of ~254 million years with a long history of humid chemical weathering.",
      "Current topographic depth is modest (~160 m) due to regional erosional leveling."
    ]
  },
  {
    id: "vargeao",
    name: "Domo de Vargeão",
    uf: "SC, Brasil",
    category: "Impact Crater in Basalt",
    type: "crater",
    body: "moon",
    lat: -26.833,
    lon: -52.117,
    metrics: { diameter_m: 12400, depth_m: 220.0, depth_diameter_ratio: 0.0177, rim_height_m: 150.0, rim_height_diameter_ratio: 0.0121, rim_variation_m: 110.0, rim_radius_cv: 0.041, mean_wall_slope: 13.5, wall_slope_p90: 24.2, circularity: 0.938, rim_coherence: 0.905 },
    similarities: [
      "Impact into basalt flows of Formação Serra Geral, a direct analog for impacts in the Moon\'s basaltic maria (Mare Serenitatis/Imbrium).",
      "Complex structure with a circular collapse ring well preserved in the terrain of Santa Catarina.",
      "Presence of pseudotachylites and impact glass."
    ],
    differences: [
      "Humid subtropical climate with dense Mata Atlântica and overlying agricultural soils.",
      "Herringbone fracturing caused by cooling joints in terrestrial basalt.",
      "Vigorous slope erosion."
    ]
  },
  {
    id: "vista_alegre",
    name: "Cratera de Vista Alegre",
    uf: "PR, Brasil",
    category: "Circular Impact Crater",
    type: "crater",
    body: "moon",
    lat: -25.950,
    lon: -52.683,
    metrics: { diameter_m: 9500, depth_m: 190.0, depth_diameter_ratio: 0.0200, rim_height_m: 120.0, rim_height_diameter_ratio: 0.0126, rim_variation_m: 98.0, rim_radius_cv: 0.035, mean_wall_slope: 14.8, wall_slope_p90: 25.0, circularity: 0.945, rim_coherence: 0.915 },
    similarities: [
      "Another impact structure formed directly in a basaltic target, with high circularity (0.945).",
      "Mean wall slope of ~15°, consistent with medium-sized lunar craters.",
      "Distinct elevated rims stand out in the topography of the Paraná plateau."
    ],
    differences: [
      "Sediment infilling within the circular depression.",
      "Rapid chemical weathering of basaltic iron-magnesium minerals in a warm, humid climate.",
      "Internal centripetal radial drainage, absent on the Moon."
    ]
  },
  {
    id: "santa_marta",
    name: "Cratera de Santa Marta",
    uf: "PI, Brasil",
    category: "Central-Peak Crater",
    type: "crater",
    body: "moon",
    lat: -10.167,
    lon: -45.250,
    metrics: { diameter_m: 9949, depth_m: 179.8, depth_diameter_ratio: 0.0181, rim_height_m: 56.6, rim_height_diameter_ratio: 0.0057, rim_variation_m: 142.5, rim_radius_cv: 0.038, mean_wall_slope: 6.7, wall_slope_p90: 18.2, circularity: 0.942, rim_coherence: 0.472 },
    similarities: [
      "Complex impact crater with an uplifted central peak and terraces evident in the geology of Piauí.",
      "Diameter of ~10 km directly analogous to the lunar simple-to-complex morphometric transition.",
      "Impact breccias and shock-wave deformation confirmed in the laboratory."
    ],
    differences: [
      "Strongly eroded eastern rim with loss of circular perimeter continuity (coherence of 0.472).",
      "Post-impact interior sedimentation leveled part of the annular trough.",
      "Cerrado vegetation and latosol soils over the ring."
    ]
  },
  {
    id: "barringer",
    name: "Barringer Meteor Crater",
    uf: "Arizona, EUA",
    category: "Canonical Simple Impact Crater",
    type: "crater",
    body: "moon",
    lat: 35.027,
    lon: -111.022,
    metrics: { diameter_m: 1186, depth_m: 170.0, depth_diameter_ratio: 0.1433, rim_height_m: 45.0, rim_height_diameter_ratio: 0.0379, rim_variation_m: 22.0, rim_radius_cv: 0.014, mean_wall_slope: 32.0, wall_slope_p90: 38.5, circularity: 0.985, rim_coherence: 0.990 },
    similarities: [
      "Earth\'s most complete simple-impact analog. Bowl-shaped morphometry nearly identical to Censorinus and Shackleton.",
      "Depth/diameter ratio (0.143) closely matching young, uncollapsed lunar craters.",
      "Sharp rims elevated 45 m above the Colorado desert plain, with a preserved inverted ejecta blanket."
    ],
    differences: [
      "Formed by an iron-nickel meteorite impact only 50.000 years ago (extremely recent geologically).",
      "Earth\'s atmosphere slowed and vaporized part of the original bolide before it reached the ground.",
      "Flat floor formed by lacustrine sedimentation during the late Pleistocene."
    ]
  },
  {
    id: "vredefort",
    name: "Vredefort Dome",
    uf: "África do Sul",
    category: "Earth\'s Largest Impact Structure",
    type: "crater",
    body: "moon",
    lat: -27.000,
    lon: 27.500,
    metrics: { diameter_m: 160000, depth_m: 450.0, depth_diameter_ratio: 0.0028, rim_height_m: 120.0, rim_height_diameter_ratio: 0.0008, rim_variation_m: 380.0, rim_radius_cv: 0.080, mean_wall_slope: 6.0, wall_slope_p90: 12.0, circularity: 0.840, rim_coherence: 0.760 },
    similarities: [
      "The best terrestrial analog for giant multi-ring lunar impact basins (such as Mare Orientale and Imbrium Basin).",
      "Colossal crustal uplift with upper-mantle granites exposed in the central dome.",
      "Kilometer-scale generation of megabreccias and impact melts."
    ],
    differences: [
      "Over 2 billion years old (Paleoproterozoic), with kilometers of surface relief removed by global tectonic erosion.",
      "Outer rim topography has almost completely disappeared, leaving only the deep structural scar (impact root).",
      "Superimposed later continental tectonic deformation."
    ]
  },
  {
    id: "chicxulub",
    name: "Chicxulub Crater",
    uf: "Yucatán, México",
    category: "Peak-Ring Crater (K-Pg)",
    type: "crater",
    body: "moon",
    lat: 21.400,
    lon: -89.517,
    metrics: { diameter_m: 180000, depth_m: 350.0, depth_diameter_ratio: 0.0019, rim_height_m: 80.0, rim_height_diameter_ratio: 0.0004, rim_variation_m: 410.0, rim_radius_cv: 0.085, mean_wall_slope: 4.0, wall_slope_p90: 8.5, circularity: 0.820, rim_coherence: 0.720 },
    similarities: [
      "Main analog for complex lunar peak-ring craters such as Schrödinger Basin.",
      "Kinetic energy corresponding to the dinosaur mass-extinction event (K-Pg, 66 Ma ago).",
      "High-energy dynamic gravitational collapse morphology identified through 3D seismic geophysical imaging."
    ],
    differences: [
      "Crater completely buried beneath almost 1 km of post-impact carbonate rocks and Golfo do México.",
      "Surface topographic expression invisible to the naked eye, detectable only through cenote rings (karst sinkholes) and gravimetry.",
      "Impact occurred on a shallow marine shelf, generating megatsunamis."
    ]
  },
  {
    id: "pingualuit",
    name: "Pingualuit Crater",
    uf: "Quebec, Canadá",
    category: "Circular Crater in Crystalline Shield",
    type: "crater",
    body: "moon",
    lat: 61.278,
    lon: -73.667,
    metrics: { diameter_m: 3440, depth_m: 400.0, depth_diameter_ratio: 0.1163, rim_height_m: 160.0, rim_height_diameter_ratio: 0.0465, rim_variation_m: 35.0, rim_radius_cv: 0.015, mean_wall_slope: 28.0, wall_slope_p90: 36.5, circularity: 0.988, rim_coherence: 0.980 },
    similarities: [
      "Nearly perfect circularity (0.988), with a prominent rim rising 160 m above the Canadian Arctic tundra.",
      "Steep walls of up to 36.5° in solid granite, identical to simple lunar crater slopes.",
      "Exceptional preservation due to the resistance of the Precambrian crystalline shield."
    ],
    differences: [
      "Hosted glacial lakes and now contains one of Earth\'s purest and deepest freshwater lakes (267 m).",
      "Underwent continental glaciation cycles that removed external ejecta deposits.",
      "Solo congelado (permafrost) circundante."
    ]
  },
  {
    id: "lonar",
    name: "Lonar Crater",
    uf: "Maharashtra, Índia",
    category: "Impact Crater in Basalt",
    type: "crater",
    body: "moon",
    lat: 19.976,
    lon: 76.508,
    metrics: { diameter_m: 1830, depth_m: 150.0, depth_diameter_ratio: 0.0820, rim_height_m: 30.0, rim_height_diameter_ratio: 0.0164, rim_variation_m: 28.0, rim_radius_cv: 0.018, mean_wall_slope: 26.5, wall_slope_p90: 34.0, circularity: 0.980, rim_coherence: 0.960 },
    similarities: [
      "One of Earth\'s few simple impact craters preserved directly in the basalts of Trapps do Decã, making it the closest mineralogical analog for the Moon\'s basaltic maria.",
      "Preserved shock minerals: plagioclase transformed into maskelynite, identical to Apollo mission samples.",
      "Bowl-shaped profile with a preserved continuous rim and wall slopes up to 34°."
    ],
    differences: [
      "Floor occupied by a hypersaline alkaline lake with an extremophile ecosystem.",
      "Subtropical weathering alters basalts into smectites and chlorites on Earth.",
      "Recent Pleistocene age with ongoing water erosion on the walls."
    ]
  }
];
