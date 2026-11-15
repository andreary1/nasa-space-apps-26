    // =========================================================================
    // RESULTADOS DO PIPELINE (injetado por scripts/build_world_demo.py)
    // -------------------------------------------------------------------------
    // Este demo NÃO calcula matching: ele exibe o que o pipeline Python gerou
    // (data/processed/comparisons/matching_report_v2.json). Sítios que o
    // pipeline não processou, ou excluiu, aparecem COM o motivo, nunca com
    // números estimados. Valor ausente aparece como "—".
    // =========================================================================

    function refList(type) {
      return type === "crater" ? MOON_CRATER_REFERENCES : MARS_DUNE_REFERENCES;
    }

    function refById(type, id) {
      return refList(type).find(r => r.id === id) || { id: id, name: id };
    }

    function isNum(v) {
      return typeof v === "number" && Number.isFinite(v);
    }

    function fmt(v, d = 3) {
      if (!isNum(v)) return "—";
      return Number.isInteger(v) ? String(v) : v.toFixed(d);
    }

    function esc(t) {
      return String(t).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    }

    function applyPipeline() {
      SITES_DATA.forEach(s => {
        const p = PIPELINE.sites[s.id] || null;
        s.pipeline = p;
        s.metrics = p && p.metrics ? p.metrics : null;
      });
      Object.entries(PIPELINE.sites).forEach(([id, p]) => {
        if (SITES_DATA.some(s => s.id === id)) return;
        if (!isNum(p.lat) || !isNum(p.lon)) {
          console.warn(`Sítio ${id} do pipeline sem coordenadas: não aparece no mapa.`);
          return;
        }
        SITES_DATA.push({
          id: id, name: p.name || id, uf: "Brasil",
          category: p.category || (p.kind === "dune" ? "Campo de dunas" : "Estrutura circular"),
          type: p.kind, body: p.kind === "dune" ? "mars" : "moon",
          lat: p.lat, lon: p.lon, metrics: p.metrics || null, pipeline: p,
        });
      });
    }

    function pipelineBanner() {
      let el = document.getElementById("pipeline-banner");
      if (!el) {
        el = document.createElement("div");
        el.id = "pipeline-banner";
        el.className = "text-[10px] font-mono text-slate-400 leading-relaxed border border-white/5 rounded-lg bg-space-950/60 px-3 py-2 mt-2";
        document.getElementById("pair-title").parentElement.insertAdjacentElement("afterend", el);
      }
      const m = PIPELINE.meta;
      el.innerHTML = `
        <div>Fonte: <span class="text-emerald-400">${esc(m.source_file)}</span> · gerado em ${esc(m.generated_at)}
          · β Bagnold = ${esc(m.beta)} · cobertura mínima ${(m.min_coverage * 100).toFixed(0)}%</div>
        <div class="text-slate-500">O demo só exibe resultados do pipeline. O perfil desenhado é um esquema ilustrativo: só os rótulos usam valores reais.</div>
        <details class="mt-1"><summary class="cursor-pointer text-slate-300">Notas metodológicas (${m.notes.length})</summary>
          <ul class="list-disc pl-4 mt-1 space-y-0.5">${m.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
        </details>`;
    }

    function bullets(container, items, color) {
      container.innerHTML = items.map(txt => `
        <div class="flex items-start gap-2">
          <span class="${color} font-bold">•</span>
          <span>${txt}</span>
        </div>`).join("");
    }

    function clearStudios() {
      ["top-matches-list", "metrics-table-body", "feature-bars-container", "radar-svg-container", "svg-container"]
        .forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ""; });
      ["topo-left-label", "topo-center-label", "topo-right-label"]
        .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = "—"; });
    }

    function renderNoResult(site, p) {
      let title, why, extra = [];
      if (p && p.status === "excluded") {
        title = "fora da comparação";
        why = `Excluído do matching: ${esc(p.reason)}.`;
        extra = ["Sítios sem cratera detectada não são comparados com crateras lunares (evita um falso análogo no ranking)."];
      } else if (p && p.status === "no_score") {
        title = "sem score";
        why = `Dados insuficientes para pontuar: ${esc(p.reason)}.`;
      } else if (site.custom) {
        title = "sem resultado";
        why = "Sítio cadastrado nesta tela: o demo não calcula matching.";
        extra = ["Para obter o resultado, baixe o DEM e rode o pipeline:",
                 "python -m src.ingestion.earth.opentopography " + site.lat + " " + site.lon + " --tipo " + (site.type === "dune" ? "dunas" : "cratera"),
                 "python -m src.application.pipeline --filename matching_report_v2.json"];
      } else {
        title = "não processado";
        why = "Este sítio não está nos catálogos usados pelo pipeline (sitios.json / sites.json); não há resultado.";
      }
      document.getElementById("pair-title").textContent = `${site.name} — ${title}`;
      document.getElementById("score-display").textContent = "—";
      previousScore = 0;
      document.getElementById("distance-display").textContent = title;
      bullets(document.getElementById("similarities-content"), [why].concat(extra.map(esc)), "text-amber-400");
      bullets(document.getElementById("differences-content"), ["Sem comparação, não há diferenças a listar."], "text-slate-500");
      clearStudios();
    }

    // =========================================================================
    // DETALHES DO MATCHING (dados do relatório do pipeline)
    // =========================================================================
    function renderDetail() {
      const site = SITES_DATA[currentSiteIndex];
      const p = site.pipeline;

      document.getElementById("badge-body").textContent = site.body === "mars" ? "Terra ↔ Marte (Duna)" : "Terra ↔ Lua (Cratera)";
      document.getElementById("badge-body").className = `px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
        site.body === "mars" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
      }`;
      document.getElementById("badge-cat").textContent = site.category;
      document.getElementById("badge-region").textContent = site.uf;
      document.getElementById("site-coords").textContent =
        `📍 Lat: ${fmt(site.lat)}°, Lon: ${fmt(site.lon)}° (${site.uf})`;
      pipelineBanner();
      const bb = document.getElementById("beta-badge");
      if (bb) bb.textContent = `Bagnold Scaling β = ${PIPELINE.meta.beta} (÷ comprimentos, × β² na densidade)`;

      if (!p || p.status !== "ok") { renderNoResult(site, p); return; }

      const matches = p.summary.top_5_matches;
      const best = matches[0];
      const ref = refById(site.type, best.planetary_ref_id);
      const weights = site.type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS;
      const keys = Object.keys(weights);

      document.getElementById("pair-title").textContent = `${site.name} ↔ ${ref.name}`;
      animateValue("score-display", previousScore, best.similarity_score, 600, 4);
      previousScore = best.similarity_score;
      document.getElementById("distance-display").textContent =
        `WED: ${fmt(best.weighted_euclidean_dist)} | Cos: ${fmt(best.cosine_similarity)} | Cobertura: ${(best.coverage * 100).toFixed(0)}%`;

      // Parecido / diferente: contribuição de cada atributo para a distância
      const contrib = Object.entries(best.feature_contributions).sort((a, b) => a[1] - b[1]);
      const line = k => {
        const i = keys.indexOf(k);
        return `<b>${esc(PARAM_LABELS[k] || k)}</b>: Terra ${fmt(best.earth_vector[i])} · alvo ${fmt(best.planet_vector_scaled[i])}`;
      };
      const sims = contrib.slice(0, 3).map(([k]) => line(k));
      const diffs = contrib.slice(-3).reverse().map(([k, v]) => `${line(k)} (contribuição ${v.toFixed(4)})`);
      if (best.features_missing_earth.length)
        diffs.push(`⚠ Atributos ausentes no sítio, fora da comparação: ${best.features_missing_earth.map(k => esc(PARAM_LABELS[k] || k)).join(", ")}.`);
      if (best.features_missing_reference.length)
        diffs.push(`⚠ Atributos ausentes na referência: ${best.features_missing_reference.map(k => esc(PARAM_LABELS[k] || k)).join(", ")}.`);
      (p.dq.issues || []).forEach(m => diffs.push("⚠ " + esc(m)));
      if (p.crater_class) diffs.push(`Classe da feição: ${esc(p.crater_class)} · confiança ${esc(p.confidence)}.`);
      bullets(document.getElementById("similarities-content"), sims.length ? sims : ["Sem atributos comparáveis."], "text-emerald-400");
      bullets(document.getElementById("differences-content"), diffs, "text-rose-400");

      const thPlanet = document.getElementById("th-planet-name");
      if (thPlanet) {
        thPlanet.className = `p-3 font-semibold ${site.body === "mars" ? "text-amber-400" : "text-sky-400"}`;
        thPlanet.textContent = `Alvo Planetário (${String(ref.name).split(" ")[0]})`;
      }
      const planetDot = document.getElementById("legend-planet-dot");
      if (planetDot) planetDot.className = `w-2.5 h-2.5 rounded-full ${site.body === "mars" ? "bg-amber-500" : "bg-sky-400"}`;
      document.getElementById("metrics-type-label").textContent = site.type === "crater" ? "11 métricas contratuais" : "7 métricas de dunas";

      renderDynamicFigureSafe(site, ref);
      renderFeatureBars(site, best);
      renderRadarChart(best, site.type);

      document.getElementById("top-matches-list").innerHTML = matches.map((m, rank) => `
        <div class="spotlight-card p-3 rounded-xl border border-white/5 bg-space-950/70 hover:border-white/15 transition-all">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="font-bold font-mono ${rank === 0 ? "text-emerald-400" : "text-slate-300"}">#${rank + 1} ${esc(refById(site.type, m.planetary_ref_id).name)}</span>
            <span class="font-mono text-[10px] ${m.similarity_score > 0.6 ? "text-emerald-400 font-bold" : "text-slate-400"}">${m.similarity_score.toFixed(4)}</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
            <div class="h-1.5 rounded-full ${rank === 0 ? "bg-emerald-400" : "bg-sky-500"}" style="width: ${(m.similarity_score * 100).toFixed(1)}%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>WED: ${fmt(m.weighted_euclidean_dist)}</span>
            <span>Cos: ${fmt(m.cosine_similarity)}</span>
            <span>Cob: ${(m.coverage * 100).toFixed(0)}%</span>
          </div>
        </div>`).join("");

      // Tabela: valor da Terra (com origem), valor do alvo (já escalonado) e diferença
      document.getElementById("metrics-table-body").innerHTML = keys.map((key, i) => {
        const e = best.earth_vector[i], t = best.planet_vector_scaled[i];
        const factor = best.physical_scaling_applied[key];
        const origin = (p.dq.provenance || {})[key] || "—";
        let diffStr = "—";
        if (isNum(e) && isNum(t)) {
          if (key === "crest_azimuth") {
            const d = Math.abs(e - t) % 180;
            diffStr = `${Math.min(d, 180 - d).toFixed(0)}° (circular)`;
          } else {
            const pct = ((e - t) / Math.max(Math.abs(t), 1e-4)) * 100;
            diffStr = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
          }
        }
        const scaled = isNum(factor) && Math.abs(factor - 1) > 1e-9
          ? `<span class="text-[9px] text-amber-500/80 font-mono ml-1" title="valor original: ${fmt(ref[key])}">(×${factor.toPrecision(3)} Bagnold)</span>` : "";
        return `
          <tr class="hover:bg-white/[0.02] transition-colors">
            <td class="p-3 text-slate-300 font-medium">${esc(PARAM_LABELS[key] || key)}</td>
            <td class="p-3 ${isNum(e) ? "text-emerald-400" : "text-rose-400"} font-semibold" title="${esc(origin)}">${fmt(e)}
              <div class="text-[9px] font-normal text-slate-500 font-mono">${esc(origin.split(":")[0])}</div></td>
            <td class="p-3 ${site.body === "mars" ? "text-amber-400" : "text-sky-400"}">${fmt(t)}${scaled}</td>
            <td class="p-3 text-slate-400 font-mono text-[10px]">${diffStr}</td>
            <td class="p-3 text-right text-slate-400">${(weights[key] * 100).toFixed(0)}%</td>
          </tr>`;
      }).join("");
    }

    // O perfil desenhado é fixo (esquema); só os rótulos usam valores. Sem o
    // valor, o rótulo mostra "—" em vez de um número inventado.
    function renderDynamicFigureSafe(site, ref) {
      const need = site.type === "crater"
        ? ["rim_height_m", "depth_m", "diameter_m", "wall_slope_p90"]
        : ["mean_height", "wavelength", "crest_azimuth", "mean_spacing"];
      const faltam = need.filter(k => !isNum(site.metrics && site.metrics[k]));
      if (faltam.length) {
        document.getElementById("svg-container").innerHTML =
          `<div class="p-4 text-xs font-mono text-rose-300">Esquema indisponível: atributo(s) ausente(s): ${faltam.join(", ")}.</div>`;
        ["topo-left-label", "topo-center-label", "topo-right-label"].forEach(id => { document.getElementById(id).textContent = "—"; });
        return;
      }
      renderDynamicFigure(site, ref);
    }

    // =========================================================================
    // ESTÚDIO 2: BARRAS (valor da Terra × valor do alvo já escalonado)
    // =========================================================================
    function renderFeatureBars(site, best) {
      const keys = Object.keys(site.type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS);
      const planetColor = site.body === "mars" ? "bg-amber-500" : "bg-sky-400";
      document.getElementById("feature-bars-container").innerHTML = keys.map((key, i) => {
        const e = best.earth_vector[i], t = best.planet_vector_scaled[i];
        const have = isNum(e) && isNum(t);
        const maxVal = have ? Math.max(Math.abs(e), Math.abs(t), 1e-4) : 1;
        const nE = have ? Math.min(100, Math.max(0, (e / maxVal) * 100)) : 0;
        const nP = have ? Math.min(100, Math.max(0, (t / maxVal) * 100)) : 0;
        return `
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono">
              <span class="text-slate-300">${esc(PARAM_LABELS[key] || key)}</span>
              <div class="flex gap-3">
                <span class="text-emerald-400">${fmt(e, 2)}</span>
                <span class="${site.body === "mars" ? "text-amber-400" : "text-sky-400"}">${fmt(t, 2)}</span>
              </div>
            </div>
            ${have ? `<div class="space-y-0.5">
              <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden"><div class="h-1.5 rounded-full bg-emerald-500" style="width: ${nE.toFixed(1)}%"></div></div>
              <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden"><div class="h-1.5 rounded-full ${planetColor}" style="width: ${nP.toFixed(1)}%"></div></div>
            </div>` : `<div class="text-[10px] text-rose-400 font-mono">ausente: fora da comparação</div>`}
          </div>`;
      }).join("");
    }

    // =========================================================================
    // ESTÚDIO 3: RADAR (eixos ausentes são omitidos e rotulados "n/d")
    // =========================================================================
    function renderRadarChart(best, type) {
      const keys = Object.keys(type === "crater" ? CRATER_WEIGHTS : DUNE_WEIGHTS);
      const n = keys.length, cx = 200, cy = 110, r = 85, step = (Math.PI * 2) / n;
      const pt = (i, lvl) => {
        const a = i * step - Math.PI / 2;
        return [cx + Math.cos(a) * r * lvl, cy + Math.sin(a) * r * lvl];
      };
      const rings = [0.25, 0.5, 0.75, 1].map(l =>
        `<polygon points="${keys.map((_, i) => pt(i, l).map(v => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="#1e293b" stroke-dasharray="2 2" stroke-width="1"/>`).join("");

      const ptsE = [], ptsP = [];
      const axes = keys.map((key, i) => {
        const e = best.earth_vector[i], t = best.planet_vector_scaled[i];
        const have = isNum(e) && isNum(t);
        if (have) {
          const mx = Math.max(Math.abs(e), Math.abs(t), 1e-4);
          ptsE.push(pt(i, Math.min(1, Math.max(0.05, e / mx))).map(v => v.toFixed(1)).join(","));
          ptsP.push(pt(i, Math.min(1, Math.max(0.05, t / mx))).map(v => v.toFixed(1)).join(","));
        }
        const [x2, y2] = pt(i, 1), [lx, ly] = pt(i, 1.21);
        const label = (PARAM_LABELS[key] || key).split(" ")[0].slice(0, 8) + (have ? "" : " n/d");
        return `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#334155" stroke-opacity="0.5"/>
          <text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" fill="${have ? "#64748b" : "#fb7185"}" font-size="8" font-family="monospace" text-anchor="middle">${esc(label)}</text>`;
      }).join("");

      const stroke = type === "crater" ? "#38bdf8" : "#fb923c";
      const fill = type === "crater" ? "rgba(56, 189, 248, 0.2)" : "rgba(251, 146, 60, 0.2)";
      document.getElementById("radar-svg-container").innerHTML = `
        <svg viewBox="0 0 400 220" class="w-full h-full">
          ${rings}${axes}
          <polygon points="${ptsP.join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-dasharray="3 2" />
          <polygon points="${ptsE.join(" ")}" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2.2" />
          <circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff" />
        </svg>`;
    }

    // =========================================================================
    // CADASTRO DE LOCALIDADE NA TELA (sem valores padrão; sem cálculo)
    // =========================================================================
    function addNewSiteFromForm() {
      const name = document.getElementById("input-name").value.trim();
      const uf = document.getElementById("input-uf").value.trim() || "Global";
      const lat = parseFloat(document.getElementById("input-lat").value);
      const lon = parseFloat(document.getElementById("input-lon").value);

      if (!name || isNaN(lat) || isNaN(lon)) {
        showToast("Preencha Nome, Latitude e Longitude da localidade.", "error");
        return;
      }
      const num = id => { const v = parseFloat(document.getElementById(id).value); return Number.isFinite(v) ? v : null; };
      const metrics = activeFormType === "crater" ? {
        diameter_m: num("c-diametro_m"), depth_m: num("c-profundidade_m"), depth_diameter_ratio: num("c-razao_dD"),
        rim_height_m: num("c-altura_borda_m"), rim_height_diameter_ratio: num("c-razao_borda_D"),
        rim_variation_m: num("c-borda_variacao_m"), rim_radius_cv: num("c-borda_raio_cv"),
        mean_wall_slope: num("c-declividade_parede_media"), wall_slope_p90: num("c-declividade_parede_p90"),
        circularity: num("c-circularidade"), rim_coherence: num("c-coerencia_borda"),
      } : {
        mean_height: num("d-altura_media"), height_p90: num("d-altura_p90"), wavelength: num("d-comprimento_onda"),
        crest_azimuth: num("d-orientacao_azimute"), dune_density: num("d-densidade_dunas"),
        mean_spacing: num("d-espacamento_medio"), aridity_index: num("d-indice_aridez"),
      };

      SITES_DATA.unshift({
        id: name.toLowerCase().replace(/[^a-z0-9]/g, "_"), name: name, uf: uf,
        category: activeFormType === "crater" ? "Cratera de Impacto" : "Campo de Dunas",
        type: activeFormType, body: activeFormType === "crater" ? "moon" : "mars",
        lat: lat, lon: lon, metrics: metrics, pipeline: null, custom: true,
      });
      currentSiteIndex = 0;
      setMapViewMode("mundo");
      renderSelectors();
      renderDetail();
      renderMapPins();
      showToast(`Localidade "${name}" adicionada. Sem resultado até rodar o pipeline.`);
      scrollToComparison();
    }
