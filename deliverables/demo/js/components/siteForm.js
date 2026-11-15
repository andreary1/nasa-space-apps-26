import { SITES_DATA } from '../data/sites.js';
import { PRESETS } from '../data/presets.js';
import { showToast } from './toast.js';
export function createSiteForm(state, onCatalogChange) {
function setFormType(type) {
  state.activeFormType = type;
  const btnC = document.getElementById("btn-form-crater");
  const btnD = document.getElementById("btn-form-dune");
  const fieldsC = document.getElementById("crater-form-fields");
  const fieldsD = document.getElementById("dune-form-fields");

  btnC.setAttribute('aria-pressed', String(type === 'crater'));
  btnD.setAttribute('aria-pressed', String(type === 'dune'));
  fieldsC.hidden = type !== 'crater';
  fieldsD.hidden = type !== 'dune';
}

function autoCalcCraterRatios() {
  const diam = parseFloat(document.getElementById("c-diametro_m").value);
  const depth = parseFloat(document.getElementById("c-profundidade_m").value);
  const rim = parseFloat(document.getElementById("c-altura_borda_m").value);

  if (diam > 0) {
    if (Number.isFinite(depth)) document.getElementById("c-razao_dD").value = (depth / diam).toFixed(4);
    if (Number.isFinite(rim)) document.getElementById("c-razao_borda_D").value = (rim / diam).toFixed(4);
  }
}

function fillPreset(key) {
  const p = PRESETS[key];
  if (!p) return;

  document.getElementById("input-name").value = p.name;
  document.getElementById("input-uf").value = p.uf;
  document.getElementById("input-lat").value = p.lat;
  document.getElementById("input-lon").value = p.lon;

  setFormType(p.type);

  if (p.type === "crater") {
    document.getElementById("c-diametro_m").value = p.metrics.diameter_m;
    document.getElementById("c-profundidade_m").value = p.metrics.depth_m;
    document.getElementById("c-razao_dD").value = p.metrics.depth_diameter_ratio;
    document.getElementById("c-altura_borda_m").value = p.metrics.rim_height_m;
    document.getElementById("c-razao_borda_D").value = p.metrics.rim_height_diameter_ratio;
    document.getElementById("c-borda_variacao_m").value = p.metrics.rim_variation_m;
    document.getElementById("c-borda_raio_cv").value = p.metrics.rim_radius_cv;
    document.getElementById("c-declividade_parede_media").value = p.metrics.mean_wall_slope;
    document.getElementById("c-declividade_parede_p90").value = p.metrics.wall_slope_p90;
    document.getElementById("c-circularidade").value = p.metrics.circularity;
    document.getElementById("c-coerencia_borda").value = p.metrics.rim_coherence;
  } else {
    document.getElementById("d-altura_media").value = p.metrics.mean_height;
    document.getElementById("d-altura_p90").value = p.metrics.height_p90;
    document.getElementById("d-comprimento_onda").value = p.metrics.wavelength;
    document.getElementById("d-orientacao_azimute").value = p.metrics.crest_azimuth;
    document.getElementById("d-densidade_dunas").value = p.metrics.dune_density;
    document.getElementById("d-espacamento_medio").value = p.metrics.mean_spacing;
    document.getElementById("d-indice_aridez").value = p.metrics.aridity_index;
  }

  showToast(`Preset "${p.name}" carregado com sucesso!`);
}

function addNewSiteFromForm() {
  const name = document.getElementById("input-name").value.trim();
  const uf = document.getElementById("input-uf").value.trim() || "Global";
  const lat = parseFloat(document.getElementById("input-lat").value);
  const lon = parseFloat(document.getElementById("input-lon").value);

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    showToast("Preencha Nome, Latitude e Longitude da localidade.", "error");
    return;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  let metrics = {};

  if (state.activeFormType === "crater") {
    metrics = {
      diameter_m: parseFloat(document.getElementById("c-diametro_m").value),
      depth_m: parseFloat(document.getElementById("c-profundidade_m").value),
      depth_diameter_ratio: parseFloat(document.getElementById("c-razao_dD").value),
      rim_height_m: parseFloat(document.getElementById("c-altura_borda_m").value),
      rim_height_diameter_ratio: parseFloat(document.getElementById("c-razao_borda_D").value),
      rim_variation_m: parseFloat(document.getElementById("c-borda_variacao_m").value),
      rim_radius_cv: parseFloat(document.getElementById("c-borda_raio_cv").value),
      mean_wall_slope: parseFloat(document.getElementById("c-declividade_parede_media").value),
      wall_slope_p90: parseFloat(document.getElementById("c-declividade_parede_p90").value),
      circularity: parseFloat(document.getElementById("c-circularidade").value),
      rim_coherence: parseFloat(document.getElementById("c-coerencia_borda").value)
    };
  } else {
    metrics = {
      mean_height: parseFloat(document.getElementById("d-altura_media").value),
      height_p90: parseFloat(document.getElementById("d-altura_p90").value),
      wavelength: parseFloat(document.getElementById("d-comprimento_onda").value),
      crest_azimuth: parseFloat(document.getElementById("d-orientacao_azimute").value),
      dune_density: parseFloat(document.getElementById("d-densidade_dunas").value),
      mean_spacing: parseFloat(document.getElementById("d-espacamento_medio").value),
      aridity_index: parseFloat(document.getElementById("d-indice_aridez").value)
    };
  }

  if (Object.values(metrics).some(value => !Number.isFinite(value) || value < 0) || (state.activeFormType === 'crater' && metrics.diameter_m <= 0)) {
    showToast('Preencha todas as métricas com valores válidos; zero é permitido, exceto no diâmetro.', 'error');
    return;
  }
  const newSite = {
    id: `${id}_${Date.now()}`,
    name: name,
    uf: uf,
    category: state.activeFormType === "crater" ? "Cratera de Impacto" : "Campo de Dunas",
    type: state.activeFormType,
    body: state.activeFormType === "crater" ? "moon" : "mars",
    lat: lat,
    lon: lon,
    metrics: metrics,
    similarities: [
      "Dados informados pelo usuário; sem validação independente."
    ],
    differences: [
      "Intemperismo superficial terrestre ativo.",
      "Ambiente deposicional condicionado pela atmosfera local."
    ]
  };

  SITES_DATA.unshift(newSite);
  state.currentSiteIndex = 0;

  onCatalogChange();
  showToast(`Localidade "${name}" adicionada ao catálogo mundial!`);
}

function exportCurrentSiteJson() {
  const site = SITES_DATA[state.currentSiteIndex];
  const jsonStr = JSON.stringify(site, null, 2);
  Promise.resolve().then(() => navigator.clipboard.writeText(jsonStr)).then(() => {
    showToast("JSON do sítio copiado para a área de transferência!");
  }).catch(() => {
    prompt("Copie o JSON do sítio:", jsonStr);
  });
}
return {setFormType, autoCalcCraterRatios, fillPreset, addNewSiteFromForm, exportCurrentSiteJson};
}
