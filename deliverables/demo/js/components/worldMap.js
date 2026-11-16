import { SITES_DATA } from "../data/sites.js";
import { mapTexture } from "./mapTexture.js";
import {
  WORLD,
  REGIONS,
  project,
  unproject,
  fitBounds,
  constrain,
  clusterPoints,
} from "../services/mapGeometry.js";

export function createWorldMap(state, onSelect) {
  const svg = document.getElementById("world-map-svg");
  const layer = document.getElementById("map-pins-layer");
  const tooltip = document.getElementById("map-pin-tooltip");
  const status = document.getElementById("map-status");
  const image = document.getElementById("map-earth-texture");
  let view = { ...WORLD },
    drag,
    frame,
    loaded = false,
    loading = false,
    suppressClick = false;
  const hidePinTooltip = () => {
    tooltip.hidden = true;
  };
  const pixelScale = () => view.w / (svg.getBoundingClientRect().width || 960);
  const setView = (next) => {
    view = constrain(next);
    svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
    document.getElementById("map-zoom-out").disabled = view.w >= 960;
    document.getElementById("map-zoom-in").disabled = view.w <= 960 / 2048;
    document.getElementById("map-zoom-level").textContent =
      `${(960 / view.w).toLocaleString("en-US", { maximumFractionDigits: 1 })}×`;
    hidePinTooltip();
    renderMapPins();
  };
  function showPinTooltip(element, members) {
    const selected = members.find(
      ({ index }) => index === state.currentSiteIndex,
    );
    const site = SITES_DATA[members[0].index];
    document.getElementById("tooltip-title").textContent =
      members.length === 1
        ? `${site.name} (${site.uf})`
        : `${members.length} nearby sites`;
    document.getElementById("tooltip-sub").textContent =
      members.length === 1
        ? `${site.type === "dune" ? "Dune" : "Crater"} · Lat: ${site.lat.toFixed(3)}° | Lon: ${site.lon.toFixed(3)}°`
        : `${selected ? `Selected: ${SITES_DATA[selected.index].name}. ` : ""}Click or press Enter to zoom in and explore the sites.`;
    tooltip.hidden = false;
    const box = svg.getBoundingClientRect(),
      anchor = element.getBoundingClientRect();
    tooltip.style.left = `${Math.max(8, Math.min(box.width - tooltip.offsetWidth - 8, anchor.x - box.x + anchor.width + 10))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(box.height - tooltip.offsetHeight - 8, anchor.y - box.y - 10))}px`;
  }
  function renderMapPins() {
    const focusKey = layer.contains(document.activeElement)
      ? document.activeElement.dataset.members
      : null;
    hidePinTooltip();
    const region = REGIONS[state.currentViewMode];
    const scale =
      pixelScale() * (svg.getBoundingClientRect().width < 600 ? 0.8 : 1);
    const points = SITES_DATA.flatMap((site, index) => {
      if (
        state.currentMapFilter !== "all" &&
        site.type !== state.currentMapFilter
      )
        return [];
      if (
        site.lon < region[0] ||
        site.lon > region[2] ||
        site.lat < region[1] ||
        site.lat > region[3]
      )
        return [];
      const pos = project(site.lon, site.lat);
      if (
        pos.x < view.x ||
        pos.x > view.x + view.w ||
        pos.y < view.y ||
        pos.y > view.y + view.h
      )
        return [];
      return [{ ...pos, index }];
    });
    layer.replaceChildren();
    document.getElementById("map-reticle-layer").replaceChildren();
    for (const members of clusterPoints(points, scale)) {
      const selected = members.some(
        ({ index }) => index === state.currentSiteIndex,
      );
      const types = new Set(members.map(({ index }) => SITES_DATA[index].type));
      const type = types.size > 1 ? "mixed" : types.values().next().value;
      const pos = {
        x: members.reduce((sum, p) => sum + p.x, 0) / members.length,
        y: members.reduce((sum, p) => sum + p.y, 0) / members.length,
      };
      const pin = document.createElementNS("http://www.w3.org/2000/svg", "g");
      pin.setAttribute(
        "class",
        `map-pin${members.length > 1 ? " map-cluster" : ""}`,
      );
      pin.dataset.members = members.map((p) => p.index).join(",");
      pin.dataset.type = type;
      if (members.length === 1)
        pin.dataset.site = SITES_DATA[members[0].index].id;
      pin.setAttribute(
        "transform",
        `translate(${pos.x} ${pos.y}) scale(${scale})`,
      );
      pin.setAttribute("tabindex", "0");
      pin.setAttribute("role", "button");
      pin.setAttribute("aria-pressed", String(selected));
      pin.setAttribute(
        "aria-label",
        members.length > 1
          ? `Zoom into a cluster of ${members.length} sites${selected ? ", includes the selected site" : ""}`
          : `Selecionar ${SITES_DATA[members[0].index].name}`,
      );
      // Keep the geographic dot fixed; place the badge below it near the top edge.
      const badgeY = pos.y - view.y < 78 * scale ? 24 : -66;
      const countY = badgeY + 6;
      pin.innerHTML = `<circle class="map-pin-selection" r="13"/><path class="map-pin-stem" d="${badgeY > 0 ? "M0 6V24" : "M0-24V-6"}"/><circle class="map-pin-dot" r="6"/><rect class="map-pin-badge" x="-21" y="${badgeY}" width="42" height="42" rx="12"/><svg class="map-pin-icon" x="-16" y="${badgeY + 5}" width="32" height="32" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${type === "mixed" ? "layers" : type}"/></svg>${members.length > 1 ? `<circle class="map-cluster-count" cx="17" cy="${countY}" r="11"/><text class="map-cluster-number" x="17" y="${countY}">${members.length}</text>` : ""}`;
      const activate = () => {
        if (suppressClick) return;
        if (members.length === 1) onSelect(members[0].index);
        else {
          const extent = Math.max(
            ...members.map((p) => Math.abs(p.x - pos.x) * 2.8),
            ...members.map((p) => Math.abs(p.y - pos.y) * 5.6),
            960 / 2048,
          );
          const w = Math.min(view.w / 2, extent);
          setView({ x: pos.x - w / 2, y: pos.y - w / 4, w });
          layer.querySelector(".map-pin")?.focus({ preventScroll: true });
        }
      };
      pin.addEventListener("click", activate);
      pin.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          activate();
        }
      });
      pin.addEventListener("mouseenter", () => showPinTooltip(pin, members));
      pin.addEventListener("mouseleave", hidePinTooltip);
      pin.addEventListener("focus", () => showPinTooltip(pin, members));
      pin.addEventListener("blur", hidePinTooltip);
      layer.append(pin);
    }
    if (focusKey)
      [...layer.children]
        .find((pin) => pin.dataset.members === focusKey)
        ?.focus({ preventScroll: true });
    document.getElementById("map-visible-count").textContent =
      `${points.length} ${points.length === 1 ? "site" : "sites"} in view`;
  }
  async function renderBaseMap() {
    if (loaded || loading || !svg.getBoundingClientRect().width) return;
    loading = true;
    status.hidden = false;
    status.textContent = "Loading map texture…";
    try {
      image.setAttribute("href", await mapTexture());
      loaded = true;
      status.hidden = true;
      svg.dataset.textureReady = "true";
    } catch (error) {
      status.textContent =
        "Texture unavailable. Sites remain accessible. ";
      const retry = document.createElement("button");
      retry.textContent = "Try again";
      retry.addEventListener("click", () => renderBaseMap(), { once: true });
      status.append(retry);
    } finally {
      loading = false;
    }
  }
  function handleMapHover(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(svg.getScreenCTM().inverse());
    const { lon, lat } = unproject(local.x, local.y);
    document.getElementById("map-coord-display").textContent =
      `Lat: ${lat.toFixed(2)}° | Lon: ${lon.toFixed(2)}° (WGS84)`;
  }
  function setMapViewMode(mode) {
    if (!REGIONS[mode]) return;
    state.currentViewMode = mode;
    for (const [key, suffix] of [
      ["mundo", "mundo"],
      ["brasil", "br"],
      ["nordeste", "ne"],
    ]) {
      document
        .getElementById(`btn-view-${suffix}`)
        .setAttribute("aria-pressed", String(mode === key));
    }
    setView(fitBounds(REGIONS[mode]));
    renderBaseMap();
  }
  function setMapFilter(filter) {
    if (!["all", "dune", "crater"].includes(filter)) return;
    state.currentMapFilter = filter;
    document
      .querySelectorAll('[data-action="setMapFilter"]')
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.value === filter),
        );
        button.classList.toggle("active", button.dataset.value === filter);
      });
    hidePinTooltip();
    renderMapPins();
  }
  function zoom(
    factor,
    anchor = { x: view.x + view.w / 2, y: view.y + view.h / 2 },
  ) {
    const w = Math.max(960 / 2048, Math.min(960, view.w * factor));
    const ratio = w / view.w;
    setView({
      x: anchor.x - (anchor.x - view.x) * ratio,
      y: anchor.y - (anchor.y - view.y) * ratio,
      w,
    });
  }
  document
    .getElementById("map-zoom-in")
    .addEventListener("click", () => zoom(0.5));
  document
    .getElementById("map-zoom-out")
    .addEventListener("click", () => zoom(2));
  document
    .getElementById("map-zoom-reset")
    .addEventListener("click", () => setMapViewMode(state.currentViewMode));
  svg.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const box = svg.getBoundingClientRect();
      zoom(event.deltaY < 0 ? 0.8 : 1.25, {
        x: view.x + ((event.clientX - box.x) / box.width) * view.w,
        y: view.y + ((event.clientY - box.y) / box.height) * view.h,
      });
    },
    { passive: false },
  );
  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(".map-pin")) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      view: { ...view },
    };
    suppressClick = false;
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) < 4 && !suppressClick) return;
    suppressClick = true;
    svg.classList.add("is-dragging");
    setView({
      ...drag.view,
      x: drag.view.x - dx * pixelScale(),
      y: drag.view.y - dy * pixelScale(),
    });
  });
  const endDrag = () => {
    drag = null;
    svg.classList.remove("is-dragging");
    setTimeout(() => {
      suppressClick = false;
    }, 0);
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("lostpointercapture", endDrag);
  svg.addEventListener("keydown", (event) => {
    if (event.target !== svg) return;
    const pans = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (pans[event.key]) {
      event.preventDefault();
      const [dx, dy] = pans[event.key];
      setView({
        ...view,
        x: view.x + dx * view.w * 0.1,
        y: view.y + dy * view.h * 0.1,
      });
    } else if (["+", "=", "-", "Home"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "Home") setMapViewMode(state.currentViewMode);
      else zoom(event.key === "-" ? 2 : 0.5);
    }
  });
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (svg.getBoundingClientRect().width) {
        renderBaseMap();
        renderMapPins();
      }
    });
  });
  observer.observe(svg);
  window.addEventListener("pagehide", () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
  });
  return {
    renderBaseMap,
    renderMapPins,
    handleMapHover,
    setMapViewMode,
    setMapFilter,
  };
}
