"""
src/processing/craters/crater_processor.py
===========================================
Pipeline de processamento de crateras terrestres e estruturas análogas.

Contrato oficial de métricas de crateras (11 atributos):
  diameter_m, depth_m, depth_diameter_ratio, rim_height_m,
  rim_height_diameter_ratio, rim_variation_m, rim_radius_cv,
  mean_wall_slope, wall_slope_p90, circularity, rim_coherence

Regras de dados (nenhum valor é inventado):
  - Cada atributo tem uma origem em ``provenance``:
      "raster:crater_morphometrics"  calculado do DEM
      "catalogo:craters.<campo>"     lido do catálogo (calculado fora deste repositório)
      "derivado:<fórmula>"           calculado de outros atributos disponíveis
      "ausente"                      indisponível -> None + motivo em ``issues``
  - Só entram no matching sítios com cratera detectada (class "crater") ou anel
    parcial ("partial_ring", confiança baixa, com aviso). Sítios "no_crater"
    NÃO são comparados com crateras lunares: vão para ``self.excluded`` com o motivo.
  - Com raster, a classe vem da medição feita aqui; sem raster, do catálogo.
"""

from __future__ import annotations

import json
import logging
import math
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Any, Optional

import numpy as np

from src.processing.shared.raster_io import load_dem, audit_raster, site_id_from_path, resolution_m
from src.processing.shared.morphometrics import crater_morphometrics
from src.shared.constants import CRATER_FEATURE_WEIGHTS, CRATER_FIELD_ALIASES
from src.processing.shared.catalog import load_catalogs, catalog_metric, provenance_for, metric_value, finite_number
from src.shared.data_quality import finite_json

log = logging.getLogger(__name__)

# Menor número = preferido quando o mesmo sítio tem mais de um raster.
RASTER_EXT_PRIORITY = {".tif": 0, ".tiff": 0, ".hgt": 1, ".npy": 2}

CATALOG_CATEGORIES = {"impact_crater", "outcrop", "afloramento", "volcanic", "vulcanico", "crater"}

# Diferença relativa raster × catálogo acima da qual se emite aviso.
DIVERGENCE_WARN = 0.5


@dataclass
class CraterFeatureVector:
    """Os 11 atributos contratuais. None = indisponível (nunca zero/padrão)."""

    site_id: str
    source: str                       # "raster" | "catalogo" | "hybrid"
    lat: Optional[float] = None
    lon: Optional[float] = None
    body: str = "earth"
    name: str = ""
    category: str = "crater"
    crater_class: Optional[str] = None     # "crater" | "partial_ring"
    confidence: str = "alta"               # "alta" | "baixa"

    diameter_m: Optional[float] = None
    depth_m: Optional[float] = None
    depth_diameter_ratio: Optional[float] = None
    rim_height_m: Optional[float] = None
    rim_height_diameter_ratio: Optional[float] = None
    rim_variation_m: Optional[float] = None
    rim_radius_cv: Optional[float] = None
    mean_wall_slope: Optional[float] = None
    wall_slope_p90: Optional[float] = None
    circularity: Optional[float] = None
    rim_coherence: Optional[float] = None

    provenance: dict = field(default_factory=dict)
    issues: list = field(default_factory=list)
    extra: dict = field(default_factory=dict)

    def to_array(self, weights: dict[str, float] = None) -> np.ndarray:
        """Vetor do matching; atributo indisponível vira NaN (não 0)."""
        w = weights or CRATER_FEATURE_WEIGHTS
        return np.array(
            [np.nan if metric_value(f, getattr(self, f)) is None else float(getattr(self, f)) for f in w],
            dtype=np.float64,
        )

    def missing(self, weights: dict[str, float] = None) -> list[str]:
        w = weights or CRATER_FEATURE_WEIGHTS
        return [f for f in w if metric_value(f, getattr(self, f)) is None]

    def to_dict(self) -> dict:
        return finite_json(asdict(self))


def _num(v: Any) -> Optional[float]:
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) else None


class CraterProcessor:
    """
    Processa sítios análogos de crateras a partir de:
      1. Rasters em data/earth/craters/
      2. Catálogo sites.json / sitios.json (crateras de impacto, afloramentos, vulcânicos)
    """

    def __init__(
        self,
        raster_dir: str | Path = "data/earth/craters",
        sites_json: str | Path = "data/earth/sites.json",
        sitios_json: str | Path = None,
        res_fallback_m: float | None = None,
    ):
        self.raster_dir = Path(raster_dir)
        # Aceita um caminho ou uma lista de catálogos (ex.: sitios.json + sites.json).
        # Em caso de id repetido, vale o primeiro; o bloco "craters" que faltar
        # nele é completado pelos seguintes.
        alvo = sitios_json or sites_json
        candidatos = [Path(p) for p in (alvo if isinstance(alvo, (list, tuple)) else [alvo])]
        if sitios_json is None and sites_json == "data/earth/sites.json":
            candidatos.insert(0, Path('sitios.json'))
        self.catalog_paths = [p for p in candidatos if p.exists()]
        self.res_fallback_m = res_fallback_m
        self.sites_json = self.catalog_paths[0] if self.catalog_paths else candidatos[0]
        self.excluded: list[dict] = []     # sítios fora da comparação, com o motivo

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------

    def audit_rasters(self) -> list[dict]:
        audits = []
        if not self.raster_dir.exists():
            return audits
        for ext in ["*.tif", "*.tiff", "*.hgt", "*.npy"]:
            for path in self.raster_dir.rglob(ext):
                try:
                    audits.append(audit_raster(path))
                except Exception as e:
                    audits.append({"file": str(path), "error": str(e)})
        return audits

    def process_all(self) -> list[CraterFeatureVector]:
        self.excluded = []
        results: list[CraterFeatureVector] = []
        catalog = self._load_catalog_crater_sites()
        rasters = {sid: path for path, sid in self._discover_rasters().items()}

        for site_id in sorted(set(catalog) | set(rasters)):
            fv, motivo = self._build(site_id, catalog.get(site_id, {}), rasters.get(site_id))
            if fv is None:
                meta = catalog.get(site_id, {})
                self.excluded.append({
                    "site_id": site_id, "reason": motivo,
                    "name": meta.get("name") or meta.get("nome") or site_id,
                    "category": meta.get("category") or meta.get("categoria"),
                    "lat": _num(meta.get("lat")), "lon": _num(meta.get("lon")),
                })
                log.warning(f"[crateras:{site_id}] FORA da comparação — {motivo}")
                continue
            results.append(fv)
            for msg in fv.issues:
                log.warning(f"[crateras:{site_id}] {msg}")

        log.info(f"CraterProcessor: {len(results)} sítios comparáveis, {len(self.excluded)} excluídos.")
        return results

    # ------------------------------------------------------------------
    # Internos
    # ------------------------------------------------------------------

    def _discover_rasters(self) -> dict[Path, str]:
        """Um raster por sítio: se houver vários formatos, prefere .tif a .npy."""
        mapping: dict[Path, str] = {}
        if not self.raster_dir.exists():
            return mapping
        escolhidos: dict[str, Path] = {}
        for f in sorted(self.raster_dir.rglob("*")):
            if f.suffix.lower() not in RASTER_EXT_PRIORITY:
                continue
            site_id = site_id_from_path(f)
            atual = escolhidos.get(site_id)
            if atual is None or RASTER_EXT_PRIORITY[f.suffix.lower()] < RASTER_EXT_PRIORITY[atual.suffix.lower()]:
                escolhidos[site_id] = f
        for site_id, f in escolhidos.items():
            mapping[f] = site_id
        return mapping

    def _load_catalog_crater_sites(self) -> dict[str, dict]:
        res: dict[str, dict] = {}
        for site_id, site in load_catalogs(self.catalog_paths).items():
            if (site.get('categoria') or site.get('category')) in CATALOG_CATEGORIES:
                res[site_id] = site
        return res

    @staticmethod
    def _catalog_metric(meta: dict, feat: str) -> tuple[Optional[float], Optional[str]]:
        pt = [k for k, v in CRATER_FIELD_ALIASES.items() if v == feat]
        return catalog_metric(meta, [feat] + pt, block='craters', feature=feat)

    def _build(self, site_id: str, meta: dict, raster_path: Optional[Path]):
        """Retorna (vetor, None) ou (None, motivo da exclusão)."""
        issues: list[str] = [f"conflito de catálogo em {item['field']}: preservada a fonte prioritária; alternativa em {item['source']}"
                             for item in meta.get('_catalog_conflicts', [])]
        prov: dict[str, str] = {}
        extra: dict[str, Any] = {"meta": meta}
        block = meta.get("craters") if isinstance(meta.get("craters"), dict) else {}

        computed: dict[str, Any] = {}
        why_not: dict[str, str] = {}
        if raster_path is not None:
            try:
                dem, rmeta = load_dem(raster_path)
                rx, ry, avisos = resolution_m(rmeta, assumed_resolution_m=self.res_fallback_m)
                issues.extend(avisos)
                computed, why_not = crater_morphometrics(dem, rx, ry)
                extra.update(raster_file=str(raster_path), raster_res_m=[rx, ry])
            except Exception as e:
                issues.append(f"raster {raster_path.name} não pôde ser processado: {e}")
                computed, why_not = {}, {}

        # --- a feição é mesmo uma cratera? ---
        # Com duas fontes (raster medido aqui + catálogo) vale a MAIS CONSERVADORA:
        # um falso análogo no ranking é pior que um análogo a menos.
        ordem = {"no_crater": 0, "partial_ring": 1, "crater": 2}
        medida = computed.get("crater_class") if computed else None
        catalogo = block.get("class") if block else None
        if medida is None and catalogo is None:
            if not computed and not block:
                return None, "sem raster e sem métricas de cratera no catálogo"
            cls, cls_src = None, "indisponível"
        else:
            candidatos = [(c, o) for c, o in ((medida, "medido no raster"), (catalogo, "catálogo")) if c]
            cls, cls_src = min(candidatos, key=lambda t: ordem.get(t[0], 1))
            if medida and catalogo and medida != catalogo:
                issues.append(f"classe medida no raster ({medida}) difere do catálogo ({catalogo}); vale a mais conservadora ({cls})")

        if cls == "no_crater":
            coh = computed.get("rim_coherence") if computed else block.get("rim_coherence")
            return None, f"sem cratera detectada ({cls_src}: class=no_crater, rim_coherence={coh})"
        confidence = "alta"
        if cls == "partial_ring":
            confidence = "baixa"
            issues.append("anel de borda parcial: confiança baixa na comparação com crateras")
        elif cls is None:
            confidence = "baixa"
            issues.append("classe da feição desconhecida (catálogo sem 'class'): confiança baixa")
        if block.get("diameter_at_search_range_limit"):
            issues.append("diâmetro no limite da faixa de busca do catálogo: pode estar subestimado")

        # --- valores: raster > catálogo > derivado > ausente ---
        values: dict[str, Optional[float]] = {}
        catalog_values: dict[str, float] = {}
        for feat in CRATER_FEATURE_WEIGHTS:
            rv = metric_value(feat, computed.get(feat)) if computed else None
            cv, cfield = self._catalog_metric(meta, feat)
            if cv is not None:
                catalog_values[feat] = cv
            if rv is not None:
                values[feat], prov[feat] = rv, "raster:crater_morphometrics"
                if cv not in (None, 0) and abs(rv - cv) / abs(cv) > DIVERGENCE_WARN:
                    issues.append(f"{feat}: raster ({rv:.4g}) difere do catálogo ({cv:.4g}) em mais de {DIVERGENCE_WARN:.0%}; usando o raster")
            elif cv is not None:
                values[feat], prov[feat] = cv, provenance_for(meta, cfield)
                if computed and feat in why_not:
                    issues.append(f"{feat}: não calculável do raster ({why_not[feat]}); usando o catálogo")
            else:
                values[feat], prov[feat] = None, "ausente"

        # razões podem ser derivadas quando os termos existem
        for feat, num, formula in (("depth_diameter_ratio", "depth_m", "depth_m/diameter_m"),
                                   ("rim_height_diameter_ratio", "rim_height_m", "rim_height_m/diameter_m")):
            if values[feat] is None and values[num] is not None and values["diameter_m"]:
                values[feat] = values[num] / values["diameter_m"]
                prov[feat] = f"derivado:{formula}"
        for feat in CRATER_FEATURE_WEIGHTS:
            if values[feat] is None:
                motivo = why_not.get(feat) or ("sem raster e sem valor no catálogo" if raster_path is None
                                                else "não calculado")
                issues.append(f"{feat}: INDISPONÍVEL — {motivo}")
        extra["catalog_values"] = catalog_values

        origens = {p.split(":")[0] for p in prov.values() if p != "ausente"}
        source = "hybrid" if len(origens) > 1 else ("raster" if origens == {"raster"} else "catalogo")
        if not origens:
            source = 'ausente'
        if "derivado" in origens and len(origens) == 1:
            source = "catalogo"

        if meta.get("lat") is None or meta.get("lon") is None:
            issues.append("lat/lon ausentes: o sítio não está no catálogo (coordenadas desconhecidas)")

        fv = CraterFeatureVector(
            site_id=site_id, source=source,
            lat=_num(meta.get("lat")), lon=_num(meta.get("lon")),
            name=meta.get("name") or meta.get("nome") or site_id,
            category=meta.get("category") or meta.get("categoria") or "crater",
            crater_class=cls, confidence=confidence,
            provenance=prov, issues=issues, extra=extra, **values,
        )
        return fv, None
