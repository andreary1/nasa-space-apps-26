import { applyPipeline } from '../services/pipeline.js';
// Catalog preserved from main; source annotations remain on the records.
export const SITES_DATA = [
  {
    id: "jericoacoara",
    name: "Jericoacoara",
    uf: "CE, Brasil",
    category: "Campo de Dunas Barcanas",
    type: "dune",
    body: "mars",
    lat: -2.825,
    lon: -40.490,
    metrics: { mean_height: 6.0, height_p90: 10.7, wavelength: 297, crest_azimuth: 173, dune_density: 3.99, mean_spacing: 392, aridity_index: 0.468 },
    similarities: [
      "Morfologia clássica de dunas barcanas em crescente com face de deslizamento nítida (slip face).",
      "Comprimento de onda médio (297m) converge perfeitamente para as dunas de Gale (~100m) aplicando a escala de Bagnold β ≈ 2.82×.",
      "Migração ativa induzida por regime eólico unidirecional constante (ventos alísios)."
    ],
    differences: [
      "Gravidade terrestre (1.0g) limita a altura das dunas a ~10m, enquanto em Marte (0.38g) atingem mais de 25m.",
      "Presença de lagoas interdunares e umidade freática, inexistentes na superfície atual de Marte.",
      "Areia quartzosa limpa com alta reflexão solar vs grãos basálticos escuros ricos em piroxênio/olivinass em Marte."
    ]
  },
  {
    id: "lencois",
    name: "Lençóis Maranhenses",
    uf: "MA, Brasil",
    category: "Campo de Dunas Barcanoides",
    type: "dune",
    body: "mars",
    lat: -2.600,
    lon: -43.000,
    metrics: { mean_height: 6.3, height_p90: 11.0, wavelength: 312, crest_azimuth: 161, dune_density: 6.58, mean_spacing: 367, aridity_index: 0.764 },
    similarities: [
      "Padrão regular de cristas contínuas barcanoides transversais semelhante a Nili Patera.",
      "Densidade espacial de cristas de ~6.5/km², alta periodicidade geométrica.",
      "Razão de aspecto crista/espaçamento altamente convergente após escalonamento gravitacional."
    ],
    differences: [
      "Regime hidrológico com precipitação pluviométrica sazonal superior a 1500mm/ano.",
      "Estabilização pontual por biofilmes e vegetação de restinga nas margens do campo.",
      "Atmosfera terrestre densa (1013 mbar) com transporte saliente muito mais contínuo que em Marte (6 mbar)."
    ]
  },
  {
    id: "rosado",
    name: "Dunas do Rosado",
    uf: "RN, Brasil",
    category: "Campo de Dunas Transversais",
    type: "dune",
    body: "mars",
    lat: -5.030,
    lon: -36.845,
    metrics: { mean_height: 6.3, height_p90: 11.7, wavelength: 335, crest_azimuth: 167, dune_density: 4.79, mean_spacing: 377, aridity_index: 0.322 },
    similarities: [
      "Coloração avermelhada/rosada marcante decorrente de recobrimento por óxidos de ferro (hematita/goethita), idêntica ao espectro de areias marcianas.",
      "Azimute de cristas coerente (167°) com cristas transversais de Gale Crater.",
      "Baixo índice de umidade e alta mobilidade eólica em semiárido costeiro."
    ],
    differences: [
      "Matriz mineralógica de quartzo recoberto por argilas ferruginosas vs areia máfica basáltica marciana.",
      "Ventos costeiros de brisa marítima diária vs tempestades planetárias sazonais de poeira em Marte.",
      "Camada limite atmosférica mais espessa na Terra."
    ]
  },
  {
    id: "ibiraba",
    name: "Dunas de Ibiraba (S. Francisco)",
    uf: "BA, Brasil",
    category: "Campo de Dunas Fósseis",
    type: "dune",
    body: "mars",
    lat: -10.710,
    lon: -42.800,
    metrics: { mean_height: 6.7, height_p90: 13.1, wavelength: 345, crest_azimuth: 115, dune_density: 4.56, mean_spacing: 488, aridity_index: 0.237 },
    similarities: [
      "Dunas paleoeólicas com cristas degradadas, análogas aos campos de dunas fósseis e litificados em crateras antigas de Marte.",
      "Índice de aridez baixo (0.237), em pleno sertão semiárido da Caatinga.",
      "Espaçamento amplo entre cristas de quase 500m."
    ],
    differences: [
      "Cobertura esparsa de vegetação xerofítica (Caatinga) que retém o avanço ativo da areia.",
      "Interação fluvial antiga com o paleocanal do Rio São Francisco.",
      "Ausência de gelo sazonal de CO2 que atua nas dunas marcianas de altas latitudes."
    ]
  },
  {
    id: "erg_chebbi",
    name: "Erg Chebbi (Saara)",
    uf: "Marrocos",
    category: "Mega-Erg de Dunas Estrela",
    type: "dune",
    body: "mars",
    lat: 31.150,
    lon: -3.983,
    metrics: { mean_height: 28.0, height_p90: 45.0, wavelength: 420, crest_azimuth: 145, dune_density: 2.10, mean_spacing: 520, aridity_index: 0.040 },
    similarities: [
      "Hiperaridez extrema e altura monumental (até 45m), compatível com as megadunas de Proctor e Kaiser em Marte.",
      "Ausência quase total de vegetação e substrato rochoso desértico circundante.",
      "Rupturas de crista multidirecionais associadas a ventos sazonais variáveis."
    ],
    differences: [
      "Pressão atmosférica terrestre sustenta saltamento contínuo em velocidades de vento moderadas (15 km/h) vs >80 km/h necessários em Marte.",
      "Temperatura superficial diurna atinge +45°C vs temperaturas médias negativas marcianas (-60°C).",
      "Origem sedimentar em bacia intracontinental terrestre."
    ]
  },
  {
    id: "sossusvlei",
    name: "Sossusvlei (Deserto do Namibe)",
    uf: "Namíbia",
    category: "Megadunas Lineares e Barcanoides",
    type: "dune",
    body: "mars",
    lat: -24.727,
    lon: 15.340,
    metrics: { mean_height: 35.0, height_p90: 58.0, wavelength: 510, crest_azimuth: 155, dune_density: 1.80, mean_spacing: 620, aridity_index: 0.020 },
    similarities: [
      "Uma das maiores altitudes de dunas da Terra, convergente com as megadunas basálticas de Marte.",
      "Intensa oxidação ferrosa com coloração vermelho-tijolo profunda idêntica ao regolito marciano.",
      "Superfície plana interdunar de sal e argila (vlei) semelhante aos leitos evaporíticos de Marte."
    ],
    differences: [
      "Nevoeiro costeiro matinal frequente (neblina de advecção do Atlântico).",
      "Idade geológica extremamente antiga com estabilização estrutural profunda.",
      "Gravidade 1.0g impede a formação de ondulações de vento de escala métrica (TARs)."
    ]
  },
  {
    id: "rub_al_khali",
    name: "Rub' al Khali (Quarto Vazio)",
    uf: "Arábia Saudita",
    category: "Mar Contínuo de Areia (Erg Global)",
    type: "dune",
    body: "mars",
    lat: 20.000,
    lon: 50.000,
    metrics: { mean_height: 22.0, height_p90: 36.0, wavelength: 380, crest_azimuth: 80, dune_density: 3.20, mean_spacing: 410, aridity_index: 0.015 },
    similarities: [
      "Maior mar de areia contínuo da Terra, melhor análogo para Olympia Undae (o mar circumpolar de Marte).",
      "Uniformidade estatística e periodicidade geométrica de alta coerência espacial.",
      "Condições hiperáridas sem interferência biogênica superficial."
    ],
    differences: [
      "Em Olympia Undae (Marte), as dunas interagem sazonalmente com calotas de gelo seco (dióxido de carbono).",
      "Ventos terrestres contínuos monçônicos vs tempestades de poeira globais em Marte.",
      "Inexistência de sublimação criogênica no deserto arábico."
    ]
  },
  {
    id: "white_sands",
    name: "White Sands",
    uf: "Novo México, EUA",
    category: "Campo de Dunas de Gesso Ativo",
    type: "dune",
    body: "mars",
    lat: 32.780,
    lon: -106.320,
    metrics: { mean_height: 8.5, height_p90: 14.0, wavelength: 260, crest_azimuth: 65, dune_density: 5.80, mean_spacing: 310, aridity_index: 0.180 },
    similarities: [
      "Composição mineralógica rara de gesso hidratado (sulfato de cálcio), idêntica aos depósitos de sulfatos descobertos pelo rover Opportunity e OMEGA em Marte.",
      "Morfometria de dunas barcanas ativas que migram sobre leito evaporítico plano.",
      "Análogo preferencial da NASA para calibração de espectrometria mineral de sulfatos."
    ],
    differences: [
      "Presença de água líquida freática a menos de 1 metro de profundidade que cimenta a base das dunas.",
      "Albedo óptico extremamente alto (branco puro) contrastando com as dunas escuras basálticas marcianas.",
      "Ciclos de dissolução e recristalização por orvalho diário."
    ]
  },
  {
    id: "canion_apertados",
    name: "Cânion dos Apertados (Currais Novos)",
    uf: "RN, Brasil",
    category: "Garganta e Afloramento Íngreme",
    type: "crater",
    body: "moon",
    lat: -6.342,
    lon: -36.502,
    metrics: { diameter_m: 2548, depth_m: 185.0, depth_diameter_ratio: 0.0726, rim_height_m: 65.0, rim_height_diameter_ratio: 0.0255, rim_variation_m: 82.0, rim_radius_cv: 0.042, mean_wall_slope: 16.8, wall_slope_p90: 28.4, circularity: 0.880, rim_coherence: 0.850 },
    similarities: [
      "Declividade de parede acentuada (P90 = 28.4°), muito próxima da inclinação das paredes internas de Censorinus e Shackleton.",
      "Afloramentos rochosos graníticos e quartzíticos expostos com fraturamento em bloco.",
      "Perfil topográfico transversal em 'V' íngreme análogo a bordas de crateras jovens."
    ],
    differences: [
      "Origem erosiva fluvial (escavado pelo Rio Picuí) e não impacto meteorítico hiperveloz.",
      "Morfologia longitudinal alongada e não circular.",
      "Intensa fragmentação mecânica associada ao clima semiárido terrestre."
    ]
  },
  {
    id: "vale_vulcanico",
    name: "Vale Vulcânico (Cerro Corá)",
    uf: "RN, Brasil",
    category: "Estrutura Vulcânica Circular",
    type: "crater",
    body: "moon",
    lat: -6.081,
    lon: -36.403,
    metrics: { diameter_m: 2585, depth_m: 210.0, depth_diameter_ratio: 0.0812, rim_height_m: 78.0, rim_height_diameter_ratio: 0.0301, rim_variation_m: 95.0, rim_radius_cv: 0.035, mean_wall_slope: 18.2, wall_slope_p90: 31.0, circularity: 0.895, rim_coherence: 0.880 },
    similarities: [
      "Geometria semicircular bem definida com soerguimento perimetral de borda.",
      "Declividade de parede alta (31° no P90) análoga a crateras de transição simples-complexa.",
      "Litologia basáltica correlacionada aos basaltos dos mares lunares (Mare Serenitatis)."
    ],
    differences: [
      "Gênese magmática vulcanotectônica terciária (Formação Macau) e não colisão cinética de asteroides.",
      "Inexistência de brechas de impacto (impactitos) ou minerais de choque (stishovita/coesita).",
      "Erosão diferencial intempérica pronunciada."
    ]
  },
  {
    id: "pico_cabugi",
    name: "Pico do Cabugi",
    uf: "RN, Brasil",
    category: "Plug Vulcânico Cônico",
    type: "crater",
    body: "moon",
    lat: -5.710,
    lon: -36.320,
    metrics: { diameter_m: 1250, depth_m: 195.0, depth_diameter_ratio: 0.1560, rim_height_m: 140.0, rim_height_diameter_ratio: 0.1120, rim_variation_m: 62.0, rim_radius_cv: 0.029, mean_wall_slope: 24.5, wall_slope_p90: 38.2, circularity: 0.925, rim_coherence: 0.910 },
    similarities: [
      "Declividade extrema (P90 = 38.2°), compatível com as paredes mais íngremes da cratera Shackleton (36-41°).",
      "Geometria circular cônica com contraste topográfico agudo em relação ao terreno circundante.",
      "Constituído por álcali-basaltos de afinidade mantle-derived semelhantes ao regolito lunar."
    ],
    differences: [
      "Topografia positiva (elevação em relevo residual) vs cratera de impacto que é uma depressão escavada.",
      "Depósito de talus de encosta terrestre com deslizamento gravitacional ativo.",
      "Estrutura de conduto vulcânico desmantelado pela erosão."
    ]
  },
  {
    id: "pedra_cariri",
    name: "Pedra Cariri (Geopark Araripe)",
    uf: "CE, Brasil",
    category: "Depressão e Afloramento Estrutural",
    type: "crater",
    body: "moon",
    lat: -7.090,
    lon: -39.700,
    metrics: { diameter_m: 3120, depth_m: 140.0, depth_diameter_ratio: 0.0448, rim_height_m: 55.0, rim_height_diameter_ratio: 0.0176, rim_variation_m: 70.0, rim_radius_cv: 0.048, mean_wall_slope: 14.1, wall_slope_p90: 23.5, circularity: 0.875, rim_coherence: 0.840 },
    similarities: [
      "Presença de escarpamentos íngremes com quebra de declive súbita típica de bordas de colapso.",
      "Razão de aspecto e circularidade aproximada correlata a crateras lunares erodidas.",
      "Sedimentologia estratificada comparável a camadas de ejeção em crateras da Lua."
    ],
    differences: [
      "Origem sedimentar lacustre e marinha em bacia do rifte cretáceo do Araripe.",
      "Riquíssimo conteúdo fóssil fóssil terrestre (ictiofauna e pterossauros), ausente no espaço.",
      "Erosão laminar por águas superficiais."
    ]
  },
  {
    id: "morro_chapeu",
    name: "Morro do Chapéu (Tanque / Pedreira)",
    uf: "BA, Brasil",
    category: "Platô Sedimentar Circular",
    type: "crater",
    body: "moon",
    lat: -11.550,
    lon: -41.200,
    metrics: { diameter_m: 4800, depth_m: 175.0, depth_diameter_ratio: 0.0365, rim_height_m: 90.0, rim_height_diameter_ratio: 0.0187, rim_variation_m: 85.0, rim_radius_cv: 0.052, mean_wall_slope: 15.3, wall_slope_p90: 25.1, circularity: 0.890, rim_coherence: 0.860 },
    similarities: [
      "Estrutura circular de grande diâmetro com piso interno aplainado e bordas tabulares.",
      "Morfometria de diâmetro (4.8 km) análoga a crateras de transição como Censorinus.",
      "Afloramentos quartzíticos de alta dureza resistentes à intempérie."
    ],
    differences: [
      "Relevo do tipo mesa/inselberg residual cárstico e sedimentar da Chapada Diamantina.",
      "Inexistência de cones de estilhaçamento (shatter cones) ou feições de choque.",
      "Idade proterozoica de sedimentação sem choque meteórico comprovado."
    ]
  },
  {
    id: "serra_cangalha",
    name: "Serra da Cangalha",
    uf: "TO/MA, Brasil",
    category: "Cratera de Impacto Complexa",
    type: "crater",
    body: "moon",
    lat: -8.083,
    lon: -46.867,
    metrics: { diameter_m: 14337, depth_m: 250.0, depth_diameter_ratio: 0.0174, rim_height_m: 180.0, rim_height_diameter_ratio: 0.0125, rim_variation_m: 140.5, rim_radius_cv: 0.038, mean_wall_slope: 12.4, wall_slope_p90: 22.0, circularity: 0.942, rim_coherence: 0.910 },
    similarities: [
      "Cratera de impacto meteorítico comprovada com soerguimento central (central peak) e anel interno idêntico a crateras complexas lunares como Tycho e Copernicus.",
      "Presença confirmada de cones de estilhaçamento (shatter cones) e quartzo com deformação planar (PDFs).",
      "Alta circularidade (0.942) preservada na estrutura estrutural subterrânea."
    ],
    differences: [
      "Bordas erodidas por centenas de milhões de anos de chuvas tropicais na Bacia do Parnaíba.",
      "Profundidade original significativamente assoreada por sedimentos cenozóicos.",
      "Revestimento por cobertura vegetal de Cerrado."
    ]
  },
  {
    id: "riachao",
    name: "Anel de Riachão",
    uf: "MA, Brasil",
    category: "Cratera de Impacto Simples",
    type: "crater",
    body: "moon",
    lat: -7.717,
    lon: -46.650,
    metrics: { diameter_m: 4100, depth_m: 120.0, depth_diameter_ratio: 0.0293, rim_height_m: 60.0, rim_height_diameter_ratio: 0.0146, rim_variation_m: 65.0, rim_radius_cv: 0.030, mean_wall_slope: 11.8, wall_slope_p90: 19.5, circularity: 0.955, rim_coherence: 0.920 },
    similarities: [
      "Estrutura de impacto comprovada de morfologia circular quase perfeita (circularidade = 0.955).",
      "Diâmetro de 4.1 km perfeitamente comparável a crateras lunares simples como Censorinus (4.13 km).",
      "Brechas de impacto e arenitos deformados expostos na crista."
    ],
    differences: [
      "Piso preenchido por sedimentos coluviais e aluviais com perda da bacia profunda original.",
      "Ausência de raios de ejecta brilhantes externos (destruídos pela erosão eólica/hídrica na Terra).",
      "Menor contraste de elevação em relação ao terreno circundante."
    ]
  },
  {
    id: "araguainha",
    name: "Domo de Araguainha",
    uf: "GO/MT, Brasil",
    category: "Cratera de Impacto Multianelar",
    type: "crater",
    body: "moon",
    lat: -16.783,
    lon: -52.983,
    metrics: { diameter_m: 41277, depth_m: 160.2, depth_diameter_ratio: 0.0039, rim_height_m: 49.1, rim_height_diameter_ratio: 0.0012, rim_variation_m: 292.3, rim_radius_cv: 0.076, mean_wall_slope: 4.5, wall_slope_p90: 8.7, circularity: 0.866, rim_coherence: 0.828 },
    similarities: [
      "Maior estrutura de impacto da América do Sul (41.3 km), análogo de crateras de grande porte e bacias de impacto lunares como Aristarchus e Cabeus.",
      "Núcleo central soerguido granítico com feições extremas de metamorfismo de choque (impact melts).",
      "Padrão multianelar concêntrico com falhas normais periféricas idêntico ao colapso de bacias lunares."
    ],
    differences: [
      "O Rio Araguaia e seus afluentes cortam transversalmente a cratera, erodindo o relevo original.",
      "Idade de ~254 milhões de anos com histórico severo de intemperismo químico úmido.",
      "A profundidade topográfica atual é modesta (~160m) devido ao arrasamento erosivo regional."
    ]
  },
  {
    id: "vargeao",
    name: "Domo de Vargeão",
    uf: "SC, Brasil",
    category: "Cratera de Impacto em Basalto",
    type: "crater",
    body: "moon",
    lat: -26.833,
    lon: -52.117,
    metrics: { diameter_m: 12400, depth_m: 220.0, depth_diameter_ratio: 0.0177, rim_height_m: 150.0, rim_height_diameter_ratio: 0.0121, rim_variation_m: 110.0, rim_radius_cv: 0.041, mean_wall_slope: 13.5, wall_slope_p90: 24.2, circularity: 0.938, rim_coherence: 0.905 },
    similarities: [
      "Impacto em derrames basálticos da Formação Serra Geral, análogo direto para impactos nos mares basálticos da Lua (Mare Serenitatis/Imbrium).",
      "Estrutura complexa com anel de colapso circular bem preservado no relevo de Santa Catarina.",
      "Presença de pseudotaquilitos e vidro de impacto (impact glass)."
    ],
    differences: [
      "Clima subtropical úmido com densa Mata Atlântica e solos agrícolas sobrepostos.",
      "Fracionamento em espinha de peixe decorrente de juntas de resfriamento do basalto terrestre.",
      "Erosão de encosta vigorosa."
    ]
  },
  {
    id: "vista_alegre",
    name: "Cratera de Vista Alegre",
    uf: "PR, Brasil",
    category: "Cratera de Impacto Circular",
    type: "crater",
    body: "moon",
    lat: -25.950,
    lon: -52.683,
    metrics: { diameter_m: 9500, depth_m: 190.0, depth_diameter_ratio: 0.0200, rim_height_m: 120.0, rim_height_diameter_ratio: 0.0126, rim_variation_m: 98.0, rim_radius_cv: 0.035, mean_wall_slope: 14.8, wall_slope_p90: 25.0, circularity: 0.945, rim_coherence: 0.915 },
    similarities: [
      "Outra estrutura de impacto formada diretamente em alvo basáltico, com alta circularidade (0.945).",
      "Declividade de parede média de ~15°, consistente com crateras lunares de médio porte.",
      "Bordas elevadas distintas que se destacam na topografia do planalto paranaense."
    ],
    differences: [
      "Assoreamento sedimentar no interior da depressão circular.",
      "Rápida meteorização química dos minerais de ferro-magnésio basálticos no clima quente e úmido.",
      "Drenagem radial centrípeta interna inexistente na Lua."
    ]
  },
  {
    id: "santa_marta",
    name: "Cratera de Santa Marta",
    uf: "PI, Brasil",
    category: "Cratera com Pico Central",
    type: "crater",
    body: "moon",
    lat: -10.167,
    lon: -45.250,
    metrics: { diameter_m: 9949, depth_m: 179.8, depth_diameter_ratio: 0.0181, rim_height_m: 56.6, rim_height_diameter_ratio: 0.0057, rim_variation_m: 142.5, rim_radius_cv: 0.038, mean_wall_slope: 6.7, wall_slope_p90: 18.2, circularity: 0.942, rim_coherence: 0.472 },
    similarities: [
      "Cratera de impacto complexa com pico central soerguido e terraços evidentes na geologia do Piauí.",
      "Diâmetro de ~10 km perfeitamente análogo à transição morfométrica lunar simples-complexa.",
      "Brechas de impacto e deformação por ondas de choque atestadas em laboratório."
    ],
    differences: [
      "Borda oriental fortemente erodida com perda da continuidade circular perimetral (coerência de 0.472).",
      "Sedimentação interior pós-impacto que nivelou parte da calha anular.",
      "Vegetação do Cerrado e solos latossólicos sobre o anel."
    ]
  },
  {
    id: "barringer",
    name: "Barringer Meteor Crater",
    uf: "Arizona, EUA",
    category: "Cratera de Impacto Simples Canônica",
    type: "crater",
    body: "moon",
    lat: 35.027,
    lon: -111.022,
    metrics: { diameter_m: 1186, depth_m: 170.0, depth_diameter_ratio: 0.1433, rim_height_m: 45.0, rim_height_diameter_ratio: 0.0379, rim_variation_m: 22.0, rim_radius_cv: 0.014, mean_wall_slope: 32.0, wall_slope_p90: 38.5, circularity: 0.985, rim_coherence: 0.990 },
    similarities: [
      "O análogo de impacto simples mais perfeito do planeta Terra. Morfometria em tigela (bowl-shaped) praticamente idêntica a Censorinus e Shackleton.",
      "Razão profundidade/diâmetro (0.143) de alta fidelidade com crateras lunares jovens não colapsadas.",
      "Bordas afiadas elevadas 45m acima da planície do deserto do Colorado com manto de ejeção invertido preservado."
    ],
    differences: [
      "Formada pelo impacto de um meteorito metálico ferro-níquel há apenas 50.000 anos (extremamente recente em termos geológicos).",
      "Atmosfera terrestre desacelerou e vaporizou parte do bólido original antes do solo.",
      "Fundo plano gerado por sedimentação lacustre durante o Pleistoceno tardio."
    ]
  },
  {
    id: "vredefort",
    name: "Vredefort Dome",
    uf: "África do Sul",
    category: "Maior Estrutura de Impacto da Terra",
    type: "crater",
    body: "moon",
    lat: -27.000,
    lon: 27.500,
    metrics: { diameter_m: 160000, depth_m: 450.0, depth_diameter_ratio: 0.0028, rim_height_m: 120.0, rim_height_diameter_ratio: 0.0008, rim_variation_m: 380.0, rim_radius_cv: 0.080, mean_wall_slope: 6.0, wall_slope_p90: 12.0, circularity: 0.840, rim_coherence: 0.760 },
    similarities: [
      "Melhor análogo terrestre para bacias de impacto multianelares gigantes da Lua (como Mare Orientale e Imbrium Basin).",
      "Exibe soerguimento crustal colossal com granitos do manto superior expostos no domo central.",
      "Geração de megabrechas e fundidos por impacto em escala quilométrica."
    ],
    differences: [
      "Idade superior a 2 bilhões de anos (Paleoproterozoico), com quilômetros de relevo superficial removidos por erosão tectônica global.",
      "A topografia de borda externa desapareceu quase por completo, restando apenas a cicatriz estrutural profunda (raiz do impacto).",
      "Deformações tectônicas continentais posteriores sobrepostas."
    ]
  },
  {
    id: "chicxulub",
    name: "Chicxulub Crater",
    uf: "Yucatán, México",
    category: "Cratera com Anel de Picos (K-Pg)",
    type: "crater",
    body: "moon",
    lat: 21.400,
    lon: -89.517,
    metrics: { diameter_m: 180000, depth_m: 350.0, depth_diameter_ratio: 0.0019, rim_height_m: 80.0, rim_height_diameter_ratio: 0.0004, rim_variation_m: 410.0, rim_radius_cv: 0.085, mean_wall_slope: 4.0, wall_slope_p90: 8.5, circularity: 0.820, rim_coherence: 0.720 },
    similarities: [
      "Análogo principal de crateras lunares complexas com anel de picos (peak ring) como Schrödinger Basin.",
      "Energia cinética equivalente ao evento de extinção massiva dos dinossauros (K-Pg há 66 Ma).",
      "Morfologia de colapso gravitacional dinâmico de alta energia identificada em imageamento geofísico sísmico 3D."
    ],
    differences: [
      "Cratera completamente soterrada por quase 1 km de rochas carbonáticas pós-impacto e pelo Golfo do México.",
      "Expressão topográfica superficial invisível a olho nu, detectável apenas por anéis de cenotes (dolinas cársticas) e gravimetria.",
      "Impacto ocorrido em plataforma marinha rasa com geração de megatsunamis."
    ]
  },
  {
    id: "pingualuit",
    name: "Pingualuit Crater",
    uf: "Quebec, Canadá",
    category: "Cratera Circular em Escudo Cristalino",
    type: "crater",
    body: "moon",
    lat: 61.278,
    lon: -73.667,
    metrics: { diameter_m: 3440, depth_m: 400.0, depth_diameter_ratio: 0.1163, rim_height_m: 160.0, rim_height_diameter_ratio: 0.0465, rim_variation_m: 35.0, rim_radius_cv: 0.015, mean_wall_slope: 28.0, wall_slope_p90: 36.5, circularity: 0.988, rim_coherence: 0.980 },
    similarities: [
      "Circularidade quase perfeita (0.988) com borda proeminente elevada 160m sobre a tundra ártica canadense.",
      "Paredes íngremes de até 36.5° em granito sólido, idênticas à inclinação de crateras simples da Lua.",
      "Preservação excepcional devido à resistência do escudo cristalino pré-cambriano."
    ],
    differences: [
      "Abrigou lagos glaciais e atualmente contém um dos lagos de água doce mais puros e profundos (267m) da Terra.",
      "Passou por ciclos de glaciações continentais que limparam os depósitos externos de ejecta.",
      "Solo congelado (permafrost) circundante."
    ]
  },
  {
    id: "lonar",
    name: "Lonar Crater",
    uf: "Maharashtra, Índia",
    category: "Cratera de Impacto em Basalto",
    type: "crater",
    body: "moon",
    lat: 19.976,
    lon: 76.508,
    metrics: { diameter_m: 1830, depth_m: 150.0, depth_diameter_ratio: 0.0820, rim_height_m: 30.0, rim_height_diameter_ratio: 0.0164, rim_variation_m: 28.0, rim_radius_cv: 0.018, mean_wall_slope: 26.5, wall_slope_p90: 34.0, circularity: 0.980, rim_coherence: 0.960 },
    similarities: [
      "Uma das únicas crateras de impacto simples da Terra preservada diretamente nos basaltos dos Trapps do Decã, tornando-se o melhor análogo mineralógico para os mares basálticos da Lua.",
      "Minerais de choque preservados: plagioclásio transformado em maskelyneíte idêntico às amostras das missões Apollo.",
      "Perfil em tigela com borda contínua preservada e declividade de parede de até 34°."
    ],
    differences: [
      "Fundo ocupado por um lago salino alcalino hipersalino com ecossistema de extremófilos.",
      "Intemperismo subtropical com alteração de basaltos para esmectitas e cloritas na Terra.",
      "Idade pleistocênica recente com erosão hídrica em curso nas paredes."
    ]
  }
];

// Atributos e scores vêm do pipeline; sem resultado, o sítio fica sem números.
applyPipeline(SITES_DATA);
