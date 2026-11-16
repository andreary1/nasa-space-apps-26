import { englishText, stateLabel } from "../services/analysisLanguage.js";
import { escapeHtml } from "../utils/helpers.js";
import {
  loadDiscoveries,
  saveDiscoveries,
} from "../services/discoveryStore.js";
import { scientificSnapshot } from "../services/analysisSnapshot.js";

const labels = {
  elevation_min_m: "Minimum elevation (m)",
  elevation_max_m: "Maximum elevation (m)",
  elevation_mean_m: "Mean elevation (m)",
  relief_m: "Local relief (m)",
  slope_mean_deg: "Mean slope (°)",
  slope_p90_deg: "Slope P90 (°)",
  roughness_rms_m: "RMS roughness (m)",
};
const format = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? n.toLocaleString("en-US", { maximumFractionDigits: 3 })
    : "—";
const esc = (value) => escapeHtml(englishText(value));
export function createIntelligentAnalysis(onCandidates, onOpenMap) {
  const form = document.getElementById("intelligent-form"),
    submit = document.getElementById("intelligent-submit");
  const error = document.getElementById("intelligent-error"),
    status = document.getElementById("intelligent-status");
  const history = document.getElementById("intelligent-history"),
    resultBox = document.getElementById("intelligent-result");
  const results = new Map(loadDiscoveries().map((r) => [r.id, r]));
  // Keep native constraints; only replace the browser's localized validation copy.
  form.addEventListener("invalid", (event) => {
    const field = event.target;
    const validity = field.validity;
    if (validity.valueMissing) field.setCustomValidity("Complete this field.");
    else if (validity.badInput) field.setCustomValidity("Enter a valid number.");
    else if (validity.rangeUnderflow || validity.rangeOverflow)
      field.setCustomValidity(`Enter a value between ${field.min} and ${field.max}.`);
    else if (validity.tooLong)
      field.setCustomValidity(`Use no more than ${field.maxLength} characters.`);
  }, true);
  for (const field of form.elements) {
    if (typeof field.setCustomValidity !== "function") continue;
    field.addEventListener("input", () => field.setCustomValidity(""));
    field.addEventListener("change", () => field.setCustomValidity(""));
  }
  let busy = false,
    selected,
    owner;
  try {
    owner = sessionStorage.getItem("paf-analysis-session");
    if (!owner) {
      owner = crypto.randomUUID();
      sessionStorage.setItem("paf-analysis-session", owner);
    }
  } catch {
    owner = crypto.randomUUID();
  }
  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Analysis-Session": owner,
      },
      signal: AbortSignal.timeout(20000),
    });
    let body;
    try {
      body = await response.json();
    } catch {
      throw new Error(
        "Analysis API unavailable. Run iniciar-analise-inteligente.bat and open the indicated address.",
      );
    }
    if (!response.ok)
      throw new Error(body.error || `API request failed (${response.status}).`);
    return body;
  }
  function showResult(id) {
    const result = results.get(id);
    if (!result) return;
    selected = id;
    const {
      localidade: site,
      topography: topo,
      comparisons,
      pin,
      explanation,
    } = result;
    resultBox.innerHTML = `<section class="surface intelligent-result-heading"><p class="eyebrow">${result.status === "inconclusiva" ? "Inconclusive Analysis" : "Analysis Complete"} · experimental result</p><h2>${escapeHtml(site.nome)}</h2><p>Lat: ${format(site.latitude)}° · Lon: ${format(site.longitude)}° · Radius: ${format(site.raio_km)} km</p><p>${esc(topo.source.title)} · ${format(topo.resolution_m)} m · ${esc(topo.metric_crs)} · ${format(topo.coverage * 100)}% DEM coverage</p><p>${pin.eligible ? "Candidate eligible under the experimental thresholds." : "No approved pin: " + esc(pin.reasons.join(" "))}</p>${pin.eligible ? '<button class="intelligent-open-map">View Candidate on Map</button>' : ""}</section>
    ${
      result.discovery
        ? `<section class="surface intelligent-discovery"><h2>Geological Discovery</h2><p class="eyebrow">${esc(stateLabel(result.discovery.state))} · ${esc(stateLabel(result.discovery.kind) || "Unconfirmed Type")}</p><h3>${esc(result.discovery.name)}</h3><p>${esc(result.discovery.verification_message || "")}</p><p>${result.discovery.coordinates ? `Location: ${format(result.discovery.coordinates.latitude)}° / ${format(result.discovery.coordinates.longitude)}°` : "Feature location has not yet been validated."}</p><ul>${(result.discovery.evidence || []).map((s) => `<li>${esc(s.title)} · <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Independent Source</a></li>`).join("")}</ul>
      ${result.discovery.fields ? "<h3>Published Data · Research References</h3>" : ""}
      ${Object.entries(result.discovery.fields || {})
        .map(
          ([key, f]) =>
            `<p>${esc(key)}: ${f.value === null ? "not available" : esc(stateLabel(String(f.value)))} ${esc(f.unit || "")} · ${esc(stateLabel(f.verification))} · ${esc(stateLabel(f.evidence_type))}</p>`,
        )
        .join("")}
      ${result.discovery_pin?.eligible ? '<button type="button" class="intelligent-open-discovery-map">View Discovery on Map</button>' : ""}
      <details><summary>Gemini + Google Search Research · ${esc(stateLabel(result.discovery.status))}</summary><p>${esc(result.discovery.message || "")}</p><p>${esc(result.discovery.model || "")}</p>
      ${result.discovery.text ? `<div class="intelligent-grounded-text">${esc(result.discovery.text)}</div><ol>${(result.discovery.citations || []).map((c) => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)}</a> · research claim; not a measurement</li>`).join("")}</ol>` : ""}
      ${result.discovery.search_entry_html ? '<iframe class="intelligent-search-suggestions" title="Google Search Suggestions" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe>' : ""}
      </details><p class="data-note">Documented discovery, measurement and approval are distinct states. ${esc(result.discovery.separation || "")}</p></section>`
        : ""
    }
    <div class="intelligent-grid"><section class="surface"><h2>Calculated Terrain Metrics</h2><dl class="intelligent-metrics">${Object.entries(
      topo.metrics,
    )
      .filter(([, value]) => typeof value === "number")
      .map(
        ([key, value]) =>
          `<div><dt>${esc(labels[key] || key)}</dt><dd>${format(value)}</dd></div>`,
      )
      .join(
        "",
      )}</dl><h3>Slope Distribution</h3><ul>${topo.slope_distribution.counts.map((count, i) => `<li>${topo.slope_distribution.bins_deg[i]}–${topo.slope_distribution.bins_deg[i + 1]}°: ${count.toLocaleString("en-US")} pixels</li>`).join("")}</ul><p class="data-note">${esc(topo.method)}</p><p class="data-note">${esc(topo.source.kind)} · ${topo.source.cache_hit ? "Data reused from cache" : "Data retrieved for this query"}</p></section>
    <section class="surface"><h2>Planetary Comparisons</h2>${Object.entries(
      comparisons,
    )
      .map(
        ([body, c]) =>
          `<article class="intelligent-comparison" data-body="${body}"><div class="intelligent-score" style="--score:${c.score === null ? 0 : c.score * 100}%"><strong>${c.score === null ? "N/A" : format(c.score * 100) + "%"}</strong></div><div><h3>${body === "lua" ? "Moon" : "Mars"}</h3><p>${c.reference ? esc(c.reference.name) : "N/A — comparison unavailable"}</p><p>Metric coverage: ${format(c.coverage * 100)}%</p><p>${esc(c.limitations.join(" "))}</p></div></article><details><summary>Metrics and Method · ${body === "lua" ? "Moon" : "Mars"}</summary><p>${esc(c.method)}</p><p>Used: ${esc(c.used.join(", ") || "None")}</p><p>Unavailable: ${esc(c.missing.join(", ") || "None")}</p>${Object.entries(
            c.measurements,
          )
            .map(
              ([key, m]) =>
                `<p>${esc(key)}: ${format(m.value)} ${esc(m.unit)} · ${esc(m.source || "No measurement")}</p>`,
            )
            .join("")}</details>`,
      )
      .join(
        "",
      )}<p class="data-note">Experimental thresholds: similarity ${format(pin.thresholds.score * 100)}%, coverage ${format(pin.thresholds.coverage * 100)}%. Compatibility, resolution and quality are also required. These are not validated scientific criteria.</p></section></div>
    <section class="surface"><details><summary>Technical Analysis Details</summary>
    <h3>Processing and Identification</h3><p>${esc(result.diagnostics?.identification?.message || "No identification diagnosis.")}</p>
    <p>DEM retrieved successfully. Slope and roughness calculated.</p>
    <p>Calculated Earth metrics: ${esc((result.diagnostics?.terrain_metrics_calculated || Object.keys(topo.metrics)).join(", "))}.</p>
    <p>${esc(result.diagnostics?.terrain_metrics_not_score_inputs || "")}</p>
    ${(result.identification?.limitations || []).map((t) => `<p>${esc(t)}</p>`).join("")}
    ${result.identification?.suggested_input ? `<button type="button" class="intelligent-apply-suggestion">Use Suggested Radius: ${format(result.identification.suggested_input.raio_km)} km</button>` : ""}
    <h3>Catalog Matches</h3><p>${esc(result.diagnostics?.catalog?.method || "")}</p>
    ${(result.diagnostics?.catalog?.nearby || []).map((s) => `<p>${esc(s.name)} · ${format(s.distance_m)} m · ${esc(s.reason)}</p>`).join("") || "<p>No matches within the geographic search tolerance.</p>"}
    ${Object.entries(comparisons)
      .map(
        ([
          body,
          c,
        ]) => `<h3>${body === "lua" ? "Moon" : "Mars"}</h3><p>${esc(c.diagnosis?.reason || c.limitations.join(" "))}</p>
      <p>Status: ${esc(stateLabel(c.diagnosis?.outcome || "unavailable"))} · Score: ${c.score === null ? "not calculated" : format(c.score)} · Metric coverage: ${format(c.coverage * 100)}%</p>
      <p>Compatible metrics: ${esc(c.diagnosis?.metrics_comparable?.join(", ") || "None")}.</p>
      <p>Missing/invalid metrics: ${esc(c.missing.join(", ") || "None")}.</p>
      <p>Normalization: ${esc(c.diagnosis?.normalization?.reason || "No diagnosis")}</p>
      <p>Validation checks: ${Object.entries(c.diagnosis?.checks || {})
        .map(([k, v]) => `${esc(stateLabel(k))}: ${v ? "met" : "not met"}`)
        .join(" · ")}</p>
      <details><summary>References Consulted (${c.diagnosis?.references_loaded?.length || 0})</summary>${(c.diagnosis?.references_loaded || []).map((r) => `<p>${esc(r.name)} · ${esc(r.id)} · Score: ${r.score === null ? "not calculated" : format(r.score)}<br>${esc(r.provenance)}</p>`).join("")}</details>
      <ul>${(c.diagnosis?.next_steps || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`,
      )
      .join("")}
    ${result.feature?.geometry ? '<button type="button" class="intelligent-export-geometry">Export Boundary and Measurements (GeoJSON)</button>' : ""}
    <button type="button" class="intelligent-export-diagnostic">Export Complete Diagnostics (JSON)</button>
    <h3>Higher-Resolution Data</h3><ul>${(result.identification?.acquisition || []).map((s) => `<li>${esc(s.title)} · <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Source</a></li>`).join("") || "<li>Configure a local DEM and reviewed evidence as described in the documentation.</li>"}</ul>
    </details></section>
    <section class="surface"><h2><svg aria-hidden="true"><use href="#i-intelligent"/></svg> AI Interpretation</h2>${
      explanation.status === "available"
        ? `<p class="data-note">${esc(explanation.provider)} · ${esc(explanation.model)} · AI-generated explanation, subject to review</p><p>${esc(explanation.report.resumo)}</p>${[
            ["semelhancas", "Similarities"],
            ["diferencas", "Differences"],
            ["limitacoes", "Limitations"],
          ]
            .map(
              ([key, title]) =>
                `<h3>${title}</h3><ul>${explanation.report[key].map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`,
            )
            .join(
              "",
            )}<h3>Conclusion</h3><p>${esc(explanation.report.conclusao)}</p>`
        : `<p>${esc(explanation.message)}</p>`
    }<h3>Scientific Sources and Limitations</h3><ul>${result.sources.map((s) => `<li>${esc(s.title)}${/^https:\/\//.test(s.url) ? ` · <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Source</a>` : ""}</li>`).join("")}${result.warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></section>`;
    resultBox
      .querySelector(".intelligent-open-map")
      ?.addEventListener("click", onOpenMap);
    resultBox
      .querySelector(".intelligent-open-discovery-map")
      ?.addEventListener("click", onOpenMap);
    const suggestions = resultBox.querySelector(
      ".intelligent-search-suggestions",
    );
    if (suggestions)
      suggestions.srcdoc =
        "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; img-src https: data:\">" +
        result.discovery.search_entry_html;
    const download = (value, suffix) => {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(value, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `analysis-${result.id}.${suffix}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    resultBox
      .querySelector(".intelligent-export-diagnostic")
      ?.addEventListener("click", () =>
        download(scientificSnapshot(result), "json"),
      );
    resultBox
      .querySelector(".intelligent-apply-suggestion")
      ?.addEventListener("click", () => {
        form.elements.raio_km.value =
          result.identification.suggested_input.raio_km;
        form.elements.latitude.value = site.latitude;
        form.elements.longitude.value = site.longitude;
        form.elements.nome.value = site.nome;
        form.elements.comparar_com.value =
          site.comparar_com.length === 2 ? "both" : site.comparar_com[0];
        for (const field of form.elements)
          if (typeof field.setCustomValidity === "function") field.setCustomValidity("");
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        submit.focus();
      });
    resultBox
      .querySelector(".intelligent-export-geometry")
      ?.addEventListener("click", () =>
        download(
          {
            type: "Feature",
            geometry: result.feature.geometry,
            properties: { ...result.feature, geometry: undefined },
          },
          "geojson",
        ),
      );
    renderHistory();
  }
  function renderHistory() {
    history.replaceChildren(
      ...[...results.values()].map((result) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `${result.localidade.nome} · ${result.status === "inconclusiva" ? "Inconclusive" : "Complete"}`;
        button.setAttribute("aria-pressed", String(result.id === selected));
        button.addEventListener("click", () => showResult(result.id));
        return button;
      }),
    );
    if (!results.size) history.textContent = "No analyses yet.";
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    const input = {
      nome: form.elements.nome.value.trim(),
      latitude: Number(form.elements.latitude.value),
      longitude: Number(form.elements.longitude.value),
      raio_km: Number(form.elements.raio_km.value),
      comparar_com:
        form.elements.comparar_com.value === "both"
          ? ["lua", "marte"]
          : [form.elements.comparar_com.value],
    };
    if (!input.nome) {
      error.hidden = false;
      error.textContent = "Enter a location name.";
      return;
    }
    busy = true;
    submit.disabled = true;
    error.hidden = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Submitting parameters for server validation…";
    document.getElementById("intelligent-stages").replaceChildren();
    try {
      const { id } = await api("/api/analyze", {
        method: "POST",
        body: JSON.stringify(input),
      });
      const deadline = Date.now() + 480000;
      while (Date.now() < deadline) {
        const job = await api(`/api/analyze/${id}`);
        status.textContent = englishText(job.message);
        document.getElementById("intelligent-stages").replaceChildren(
          ...job.stages.map((stage) => {
            const li = document.createElement("li");
            li.textContent = englishText(stage.message);
            return li;
          }),
        );
        if (job.status === "error")
          throw new Error(`Technical processing failure: ${job.error}`);
        if (job.status === "complete") {
          results.set(job.result.id, job.result);
          showResult(job.result.id);
          publishLayers();
          if (!saveDiscoveries(results.values()))
            status.textContent =
              "Results ready. Local storage unavailable; discoveries are preserved in this tab.";
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 900)); // Polls real milestones; no simulated progress.
      }
      throw new Error(
        "The analysis is still unavailable after eight minutes. Check the server.",
      );
    } catch (caught) {
      error.hidden = false;
      error.textContent = englishText(caught.message);
      status.textContent =
        "Analysis incomplete. Previous results are preserved.";
    } finally {
      busy = false;
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
  function publishLayers() {
    const latest = [
      ...new Map(
        [...results.values()].map((r) => [
          r.discovery_pin?.id || r.pin.stable_id || r.id,
          r,
        ]),
      ).values(),
    ];
    onCandidates(
      latest
        .filter((r) => r.pin.eligible)
        .map((r) => ({
          id: r.id,
          stable_id: r.pin.stable_id || r.id,
          name: r.localidade.nome,
          lat: r.feature?.center?.latitude ?? r.localidade.latitude,
          lon: r.feature?.center?.longitude ?? r.localidade.longitude,
          type: r.pin.type,
          score: Math.max(
            ...Object.values(r.comparisons)
              .filter((c) => c.score !== null)
              .map((c) => c.score),
          ),
          reference:
            Object.values(r.comparisons).find(
              (c) => c.score !== null && c.score >= r.pin.thresholds.score,
            )?.reference?.name || "",
        })),
      latest
        .filter((r) => r.discovery_pin?.eligible && !r.pin.eligible)
        .map((r) => ({ ...r.discovery_pin, analysis_id: r.id })),
    );
  }
  renderHistory();
  publishLayers();
  // Fail-open reveal: only animate elements when they intersect; never hide CSS content.
  const root = document.getElementById("view-intelligent"),
    seen = new Set(),
    pending = new Set();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (typeof IntersectionObserver === "function") {
    const active = new Set();
    const keyFor = (el) =>
      el.closest("#intelligent-result")
        ? `result:${selected}:${el.querySelector("h2")?.textContent}`
        : el.matches("h1")
          ? "title"
          : el.matches(".description")
            ? "description"
            : el.querySelector("h2")?.textContent;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting || root.hidden || !root.contains(target)) return;
          observer.unobserve(target);
          pending.delete(target);
          const key = keyFor(target);
          if (seen.has(key)) return;
          seen.add(key);
          if (
            reduced.matches ||
            target.contains(document.activeElement) ||
            !target.animate
          )
            return;
          const animation = target.animate(
            [
              { opacity: 0, translate: "0 16px" },
              { opacity: 1, translate: "0 0" },
            ],
            {
              duration: 460,
              delay: target.matches("h1")
                ? 0
                : target.matches(".description")
                  ? 60
                  : 120 +
                    Math.max(
                      0,
                      [...root.querySelectorAll(".surface")].indexOf(target) %
                        4,
                    ) *
                      60,
              easing: "ease-out",
              fill: "backwards",
            },
          );
          animation.id = "intelligent-reveal";
          active.add(animation);
          animation.finished
            .catch(() => {})
            .finally(() => active.delete(animation));
        }),
      { threshold: 0.08 },
    );
    const scan = () => {
      for (const el of pending)
        if (!root.contains(el)) {
          observer.unobserve(el);
          pending.delete(el);
        }
      if (root.hidden || reduced.matches) {
        active.forEach((a) => a.cancel());
        active.clear();
      }
      if (root.hidden) return;
      root
        .querySelectorAll(
          ".page-heading h1,.page-heading .description,.surface",
        )
        .forEach((el) => {
          if (!seen.has(keyFor(el)) && !pending.has(el)) {
            pending.add(el);
            observer.observe(el);
          }
        });
    };
    const mutations = new MutationObserver(scan);
    mutations.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
    });
    reduced.addEventListener("change", scan);
    window.addEventListener(
      "pagehide",
      () => {
        observer.disconnect();
        mutations.disconnect();
        active.forEach((a) => a.cancel());
      },
      { once: true },
    );
    scan();
  }
  return { showResult };
}
