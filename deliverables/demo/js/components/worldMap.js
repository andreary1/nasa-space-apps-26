import { SITES_DATA } from '../data/sites.js';
import { escapeHtml } from '../utils/helpers.js';
const BOUNDS = {
  mundo:    { minLon: -180.0, maxLon: 180.0, minLat: -65.0, maxLat: 75.0, w: 960, h: 480 },
  brasil:   { minLon: -85.0,  maxLon: -30.0, minLat: -35.0, maxLat: 10.0, w: 960, h: 480 },
  nordeste: { minLon: -48.5,  maxLon: -34.0, minLat: -16.0, maxLat: -1.8, w: 960, h: 480 }
};
export function createWorldMap(state, onSelect) {
function projectCoords(lon, lat) {
  const b = BOUNDS[state.currentViewMode];
  const x = ((lon - b.minLon) / (b.maxLon - b.minLon)) * (b.w - 80) + 40;
  const y = ((b.maxLat - lat) / (b.maxLat - b.minLat)) * (b.h - 60) + 30;
  return { x: Math.max(15, Math.min(b.w - 15, x)), y: Math.max(15, Math.min(b.h - 15, y)) };
}

function renderBaseMap() {
  const basemap = document.getElementById("map-basemap-layer");
  const grid = document.getElementById("map-grid-layer");
  const labels = document.getElementById("map-labels-layer");
  const b = BOUNDS[state.currentViewMode];

  if (state.currentViewMode === "nordeste") {
    const coastPoints = [
      [-44.3, -2.5], [-43.0, -2.6], [-41.8, -2.85], [-40.85, -2.9], [-40.49, -2.825],
      [-39.0, -3.4], [-38.5, -3.72], [-37.7, -4.5], [-37.25, -4.85], [-36.845, -5.03],
      [-36.63, -5.11], [-35.46, -5.19], [-35.2, -5.79], [-34.8, -7.15], [-34.9, -8.1],
      [-35.7, -9.66], [-37.05, -10.9], [-38.5, -12.97], [-39.05, -14.8], [-39.2, -15.8],
      [-43.5, -15.8], [-46.5, -14.5], [-47.8, -10.0], [-47.5, -5.5], [-45.5, -3.0]
    ];

    const ptsStr = coastPoints.map(p => {
      const pt = projectCoords(p[0], p[1]);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }).join(" ");

    basemap.innerHTML = `
      <polygon points="${ptsStr}" fill="#d9e3f1" fill-opacity="0.9" stroke="#9daccc" stroke-opacity="0.8" stroke-width="1.5" />
    `;

    labels.innerHTML = `
      <text x="${projectCoords(-39.5, -5.2).x}" y="${projectCoords(-39.5, -5.2).y}" fill="#68739b" opacity="0.45" font-size="12" font-weight="bold" text-anchor="middle">CEARÁ</text>
      <text x="${projectCoords(-36.5, -5.8).x}" y="${projectCoords(-36.5, -5.8).y}" fill="#68739b" opacity="0.45" font-size="10" font-weight="bold" text-anchor="middle">RIO G. NORTE</text>
      <text x="${projectCoords(-45.0, -5.0).x}" y="${projectCoords(-45.0, -5.0).y}" fill="#68739b" opacity="0.45" font-size="11" font-weight="bold" text-anchor="middle">MARANHÃO</text>
      <text x="${projectCoords(-42.5, -7.2).x}" y="${projectCoords(-42.5, -7.2).y}" fill="#68739b" opacity="0.45" font-size="11" font-weight="bold" text-anchor="middle">PIAUÍ</text>
      <text x="${projectCoords(-41.5, -12.5).x}" y="${projectCoords(-41.5, -12.5).y}" fill="#68739b" opacity="0.45" font-size="13" font-weight="bold" text-anchor="middle">BAHIA</text>
    `;

    grid.innerHTML = [-46, -42, -38, -35].map(lon => {
      const pt = projectCoords(lon, -1.8);
      const pb = projectCoords(lon, -16.0);
      return `<line x1="${pt.x}" y1="20" x2="${pb.x}" y2="460" stroke="#c7d3e6" stroke-dasharray="3 3"/>
              <text x="${pt.x}" y="472" fill="#475569" font-size="9" font-mono text-anchor="middle">${Math.abs(lon)}°W</text>`;
    }).concat([-3, -6, -9, -12, -15].map(lat => {
      const pl = projectCoords(-48.5, lat);
      return `<line x1="30" y1="${pl.y}" x2="930" y2="${pl.y}" stroke="#c7d3e6" stroke-dasharray="3 3"/>
              <text x="25" y="${pl.y + 3}" fill="#475569" font-size="9" font-mono text-anchor="end">${Math.abs(lat)}°S</text>`;
    })).join("");

  } else if (state.currentViewMode === "brasil") {
    const saPoints = [
      [-78, 10], [-73, 11], [-60, 8], [-50, -1], [-35, -5], [-35, -9], [-39, -15],
      [-44, -23], [-48, -28], [-53, -33], [-65, -45], [-68, -55], [-75, -50], [-73, -40],
      [-71, -30], [-77, -10], [-80, -2], [-77, 8]
    ];

    const ptsStr = saPoints.map(p => {
      const pt = projectCoords(p[0], p[1]);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }).join(" ");

    basemap.innerHTML = `
      <polygon points="${ptsStr}" fill="#d9e3f1" fill-opacity="0.85" stroke="#9daccc" stroke-opacity="0.75" stroke-width="1.5" />
    `;

    labels.innerHTML = `
      <text x="${projectCoords(-42.0, -7.0).x}" y="${projectCoords(-42.0, -7.0).y}" fill="#68739b" opacity="0.45" font-size="12" font-weight="bold">NORDESTE</text>
      <text x="${projectCoords(-52.0, -15.0).x}" y="${projectCoords(-52.0, -15.0).y}" fill="#68739b" opacity="0.45" font-size="12" font-weight="bold">CENTRO-OESTE</text>
      <text x="${projectCoords(-48.0, -24.0).x}" y="${projectCoords(-48.0, -24.0).y}" fill="#68739b" opacity="0.45" font-size="12" font-weight="bold">SUDESTE / SUL</text>
    `;

    grid.innerHTML = [-70, -55, -40].map(lon => {
      const pt = projectCoords(lon, 10.0);
      return `<line x1="${pt.x}" y1="20" x2="${pt.x}" y2="460" stroke="#c7d3e6" stroke-dasharray="3 3"/>
              <text x="${pt.x}" y="472" fill="#475569" font-size="9" font-mono text-anchor="middle">${Math.abs(lon)}°W</text>`;
    }).concat([0, -12, -24].map(lat => {
      const pl = projectCoords(-85.0, lat);
      return `<line x1="30" y1="${pl.y}" x2="930" y2="${pl.y}" stroke="#c7d3e6" stroke-dasharray="3 3"/>
              <text x="25" y="${pl.y + 3}" fill="#475569" font-size="9" font-mono text-anchor="end">${Math.abs(lat)}°S</text>`;
    })).join("");

  } else {
    // MODO MUNDO INTEIRO (WORLD GLOBE RECTANGULAR)
    const worldPolys = [
      // América do Norte
      [[-165, 65], [-140, 70], [-120, 75], [-90, 75], [-80, 60], [-60, 50], [-70, 42], [-75, 35], [-80, 25], [-97, 20], [-105, 23], [-115, 32], [-124, 40], [-125, 50], [-135, 58], [-160, 58]],
      // América do Sul
      [[-78, 10], [-73, 11], [-60, 8], [-50, -1], [-35, -5], [-35, -9], [-39, -15], [-44, -23], [-48, -28], [-53, -33], [-65, -45], [-68, -55], [-75, -50], [-73, -40], [-71, -30], [-77, -10], [-80, -2], [-77, 8]],
      // África
      [[-17, 30], [-10, 36], [10, 37], [25, 32], [32, 31], [43, 12], [51, 10], [40, -5], [35, -20], [30, -32], [20, -35], [17, -33], [12, -18], [9, 4], [-5, 5], [-15, 12]],
      // Europa + Ásia (Eurásia)
      [[-9, 38], [-9, 43], [2, 51], [10, 54], [25, 71], [40, 68], [60, 73], [100, 77], [140, 72], [170, 66], [160, 55], [140, 50], [130, 42], [120, 32], [105, 20], [80, 15], [70, 22], [55, 25], [35, 32], [28, 41], [15, 40]],
      // Austrália
      [[114, -22], [123, -15], [135, -12], [142, -11], [153, -28], [150, -37], [138, -35], [115, -34], [113, -25]]
    ];

    basemap.innerHTML = worldPolys.map(poly => {
      const ptsStr = poly.map(p => {
        const pt = projectCoords(p[0], p[1]);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      }).join(" ");
      return `<polygon points="${ptsStr}" fill="#d9e3f1" fill-opacity="0.85" stroke="#9daccc" stroke-opacity="0.65" stroke-width="1.2" />`;
    }).join("");

    labels.innerHTML = `
      <text x="${projectCoords(-100, 45).x}" y="${projectCoords(-100, 45).y}" fill="#68739b" opacity="0.35" font-size="11" font-weight="bold">AMÉRICA DO NORTE</text>
      <text x="${projectCoords(-55, -15).x}" y="${projectCoords(-55, -15).y}" fill="#68739b" opacity="0.45" font-size="12" font-weight="bold">AMÉRICA DO SUL</text>
      <text x="${projectCoords(20, 10).x}" y="${projectCoords(20, 10).y}" fill="#68739b" opacity="0.45" font-size="12" font-weight="bold">ÁFRICA</text>
      <text x="${projectCoords(80, 45).x}" y="${projectCoords(80, 45).y}" fill="#68739b" opacity="0.45" font-size="12" font-weight="bold">EURÁSIA</text>
      <text x="${projectCoords(135, -25).x}" y="${projectCoords(135, -25).y}" fill="#68739b" opacity="0.35" font-size="10" font-weight="bold">AUSTRÁLIA</text>
    `;

    grid.innerHTML = [-120, -60, 0, 60, 120].map(lon => {
      const pt = projectCoords(lon, 75.0);
      return `<line x1="${pt.x}" y1="20" x2="${pt.x}" y2="460" stroke="#c7d3e6" stroke-dasharray="3 3"/>
              <text x="${pt.x}" y="472" fill="#475569" font-size="9" font-mono text-anchor="middle">${lon}°</text>`;
    }).concat([60, 30, 0, -30, -60].map(lat => {
      const pl = projectCoords(-180.0, lat);
      return `<line x1="30" y1="${pl.y}" x2="930" y2="${pl.y}" stroke="#c7d3e6" stroke-dasharray="3 3"/>
              <text x="25" y="${pl.y + 3}" fill="#475569" font-size="9" font-mono text-anchor="end">${lat}°</text>`;
    })).join("");
  }
}

function renderMapPins() {
  const g = document.getElementById("map-pins-layer");
  const reticleLayer = document.getElementById("map-reticle-layer");
  g.innerHTML = "";
  reticleLayer.innerHTML = "";
  const b = BOUNDS[state.currentViewMode];

  SITES_DATA.forEach((s, idx) => {
    if (state.currentMapFilter !== "all" && s.type !== state.currentMapFilter) return;

    if (state.currentViewMode !== "mundo") {
      if (s.lon < b.minLon || s.lon > b.maxLon || s.lat < b.minLat || s.lat > b.maxLat) {
        return;
      }
    }

    const pos = projectCoords(s.lon, s.lat);
    const isSelected = idx === state.currentSiteIndex;
    const color = s.type === "dune" ? "#2e91c6" : "#8655e0";
    const filterId = s.type === "dune" ? "url(#glowDune)" : "url(#glowCrater)";

    // Targeting reticle for selected pin
    if (isSelected) {
      reticleLayer.innerHTML = `
        <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="22" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="4 2">
          <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x.toFixed(1)} ${pos.y.toFixed(1)}" to="360 ${pos.x.toFixed(1)} ${pos.y.toFixed(1)}" dur="10s" repeatCount="indefinite"/>
        </circle>
        <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="14" fill="${color}" fill-opacity="0.18">
          <animate attributeName="r" values="8;22;8" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <line x1="${(pos.x - 26).toFixed(1)}" y1="${pos.y.toFixed(1)}" x2="${(pos.x - 16).toFixed(1)}" y2="${pos.y.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
        <line x1="${(pos.x + 16).toFixed(1)}" y1="${pos.y.toFixed(1)}" x2="${(pos.x + 26).toFixed(1)}" y2="${pos.y.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
        <line x1="${pos.x.toFixed(1)}" y1="${(pos.y - 26).toFixed(1)}" x2="${pos.x.toFixed(1)}" y2="${(pos.y - 16).toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
        <line x1="${pos.x.toFixed(1)}" y1="${(pos.y + 16).toFixed(1)}" x2="${pos.x.toFixed(1)}" y2="${(pos.y + 26).toFixed(1)}" stroke="${color}" stroke-width="1.5"/>
      `;
    }

    const pinGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pinGroup.setAttribute("class", "map-pin");
    pinGroup.addEventListener("click", () => onSelect(idx));
        pinGroup.setAttribute("tabindex", "0");
        pinGroup.setAttribute("role", "button");
        pinGroup.setAttribute("aria-label", `Selecionar ${s.name}`);
        pinGroup.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(idx); } });
    pinGroup.addEventListener("mouseenter", e => showPinTooltip(e, idx));
    pinGroup.addEventListener("mouseleave", hidePinTooltip);
    pinGroup.addEventListener("focus", e => showPinTooltip(e, idx));
    pinGroup.addEventListener("blur", hidePinTooltip);

    pinGroup.innerHTML = `
      <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="${isSelected ? 7 : 5}" fill="${color}" stroke="#ffffff" stroke-width="${isSelected ? 2.5 : 1.5}" filter="${filterId}"  />
      <text x="${(pos.x + 9).toFixed(1)}" y="${(pos.y + 3.5).toFixed(1)}" fill="#34466f" font-size="${isSelected ? '11' : '9.5'}" font-weight="${isSelected ? '700' : '500'}" 
            >${escapeHtml(s.name)}</text>
    `;

    g.appendChild(pinGroup);
  });
}

function showPinTooltip(e, idx) {
  const site = SITES_DATA[idx];
  const tooltip = document.getElementById("map-pin-tooltip");
  document.getElementById("tooltip-title").textContent = `${site.name} (${site.uf})`;
  document.getElementById("tooltip-sub").textContent = `${site.type === 'dune' ? '🏜️ DUNA' : '🌑 CRATERA'} | Lat: ${site.lat.toFixed(2)}°, Lon: ${site.lon.toFixed(2)}°`;

  const mapBox = document.getElementById("world-map-svg").getBoundingClientRect();
  const pos = projectCoords(site.lon, site.lat);
  const svgW = 960, svgH = 480;

  const screenX = (pos.x / svgW) * mapBox.width;
  const screenY = (pos.y / svgH) * mapBox.height;

  tooltip.style.left = `${screenX + 15}px`;
  tooltip.style.top = `${screenY - 10}px`;
  tooltip.hidden = false;
}

function hidePinTooltip() {
  document.getElementById("map-pin-tooltip").hidden = true;
}

function handleMapHover(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 960;
  const y = ((e.clientY - rect.top) / rect.height) * 480;
  const b = BOUNDS[state.currentViewMode];

  const lon = b.minLon + ((x - 40) / (b.w - 80)) * (b.maxLon - b.minLon);
  const lat = b.maxLat - ((y - 30) / (b.h - 60)) * (b.maxLat - b.minLat);

  document.getElementById("map-coord-display").textContent = `Lat: ${lat.toFixed(2)}° | Lon: ${lon.toFixed(2)}° (WGS84)`;
}

function setMapViewMode(mode) {
  if (!BOUNDS[mode]) return;
  hidePinTooltip();
  state.currentViewMode = mode;
  ["mundo", "brasil", "nordeste"].forEach(m => {
    const btn = document.getElementById(`btn-view-${m === 'brasil' ? 'br' : (m === 'nordeste' ? 'ne' : 'mundo')}`);
    if (btn) {
      btn.setAttribute('aria-pressed', String(m === mode));
    }
  });

  renderBaseMap();
  renderMapPins();
}

function setMapFilter(filter) {
  if (!['all', 'dune', 'crater'].includes(filter)) return;
  state.currentMapFilter = filter;
  ["all", "dune", "crater"].forEach(f => {
    const btn = document.getElementById(`filter-${f}`);
    if (btn) {
      btn.setAttribute('aria-pressed', String(f === filter));
    }
  });
  document.querySelectorAll('[data-action="setMapFilter"]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.value === filter));
    button.classList.toggle('active', button.dataset.value === filter);
  });
  hidePinTooltip();
  renderMapPins();
}
return { renderBaseMap, renderMapPins, handleMapHover, setMapViewMode, setMapFilter };
}
