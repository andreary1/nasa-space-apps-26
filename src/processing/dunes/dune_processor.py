"""
src/processing/dunes/dune_processor.py
=======================================
Pipeline de processamento de dunas terrestres.

Regras de dados (nenhum valor é inventado):
  - Cada atributo do matching vem de UMA origem registrada em ``provenance``:
      "raster:..."    calculado do DEM (morphometrics.dune_morphometrics)
      "catalogo:..."  lido do sitios.json/sites.json (calculado fora deste repositório)
      "ausente"       indisponível -> valor None, com o motivo em ``issues``
  - Se há raster e catálogo, vale o valor calculado do raster; o do catálogo fica em
    ``extra["catalog_values"]`` e uma divergência grande vira aviso.
  - Nunca há valor padrão: o que não existe é None, e o motor de matching
    compara apenas os atributos disponíveis (reportando a cobertura).
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
from src.processing.shared.morphometrics import extract_morphometrics, dune_morphometrics
from src.shared.constants import DUNE_FEATURE_WEIGHTS
from src.processing.shared.catalog import (
    load_catalogs, catalog_metric, provenance_for, density_is_comparable, metric_value, finite_number,
)

log = logging.getLogger(__name__)

# Menor número = preferido quando o mesmo sítio tem mais de um raster.
RASTER_EXT_PRIORITY = {".tif": 0, ".tiff": 0, ".hgt": 1, ".npy": 2}

# atributo do matching -> campos aceitos no catálogo (português, inglês)
CATALOG_KEYS: dict[str, tuple[str, ...]] = {
    "mean_height": ("altura_media", "mean_height"),
    "height_p90": ("altura_p90", "height_p90"),
    "wavelength": ("comprimento_onda", "wavelength"),
    "crest_azimuth": ("orientacao_azimute", "crest_azimuth"),
    "dune_density": ("densidade_dunas", "dune_density"),
    "mean_spacing": ("espacamento_medio", "mean_spacing"),
    "aridity_index": ("indice_aridez", "aridity_index"),
}

# Atributos que não podem ser calculados de um DEM.
NOT_FROM_DEM = {"aridity_index": "índice de aridez (P/ET0) exige climatologia (ex.: NASA POWER), não um DEM"}

# Diferença relativa raster × catálogo acima da qual se emite aviso.
DIVERGENCE_WARN = 0.5


@dataclass
class DuneFeatureVector:
    """Atributos de um sítio de dunas. None = indisponível (nunca zero)."""

    site_id: str
    source: str                        # "raster" | "catalogo" | "hybrid"
    lat: Optional[float] = None
    lon: Optional[float] = None
    body: str = "earth"

    # Atributos do matching (nomes iguais a DUNE_FEATURE_WEIGHTS)
    mean_height: Optional[float] = None
    height_p90: Optional[float] = None
    wavelength: Optional[float] = None
    crest_azimuth: Optional[float] = None
    dune_density: Optional[float] = None
    mean_spacing: Optional[float] = None
    aridity_index: Optional[float] = None

    # Previous public names remain diagnostics/constructor aliases, never zeros.
    wavelength_m: Optional[float] = None
    dune_density_per_km2: Optional[float] = None

    # Diagnóstico (só existe com raster; não entra no matching)
    slope_mean_deg: Optional[float] = None
    slope_p90_deg: Optional[float] = None
    roughness_rms_m: Optional[float] = None
    tri: Optional[float] = None
    aspect_ratio: Optional[float] = None
    relief_m: Optional[float] = None
    anisotropy: Optional[float] = None
    curvature_mean: Optional[float] = None
    dem_mean_m: Optional[float] = None
    n_pixels: Optional[int] = None

    provenance: dict = field(default_factory=dict)   # atributo -> origem
    issues: list = field(default_factory=list)       # avisos legíveis
    extra: dict = field(default_factory=dict)

    def __post_init__(self):
        if self.wavelength is None:
            self.wavelength = self.wavelength_m
        self.wavelength_m = self.wavelength
        # The legacy density name alone does not establish ridge-count semantics.
        if self.dune_density_per_km2 is None:
            self.dune_density_per_km2 = self.dune_density

    def to_array(self, weights: dict[str, float] = None) -> np.ndarray:
        """Vetor do matching; atributo indisponível vira NaN (não 0)."""
        w = weights or DUNE_FEATURE_WEIGHTS
        return np.array(
            [np.nan if metric_value(f, getattr(self, f)) is None else float(getattr(self, f)) for f in w],
            dtype=np.float64,
        )

    def missing(self, weights: dict[str, float] = None) -> list[str]:
        w = weights or DUNE_FEATURE_WEIGHTS
        return [f for f in w if metric_value(f, getattr(self, f)) is None]

    def to_dict(self) -> dict:
        from src.shared.data_quality import finite_json
        return finite_json(asdict(self))


class DuneProcessor:
    """
    Processa sítios de dunas a partir de:
      1. Arquivos raster (.tif / .hgt) na pasta data/earth/dunes/
      2. Atributos já registrados em sitios.json
    """

    def __init__(
        self,
        raster_dir: str | Path = "data/earth/dunes",
        sitios_json: str | Path | list = "data/earth/sites.json",
        res_fallback_m: float | None = None,
    ):
        self.raster_dir = Path(raster_dir)
        candidates = list(sitios_json) if isinstance(sitios_json, (list, tuple)) else [sitios_json]
        if sitios_json == "data/earth/sites.json":
            candidates.insert(0, "sitios.json")
        self.catalog_paths = [Path(path) for path in candidates]
        self.sitios_json = self.catalog_paths[0]
        self.res_fallback_m = res_fallback_m  # retained API; used only if explicitly requested for bare arrays
        self.excluded: list[dict] = []

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------

    def process_all(self) -> list[DuneFeatureVector]:
        self.excluded = []
        results: list[DuneFeatureVector] = []
        raster_map = {sid: path for path, sid in self._discover_rasters().items()}
        json_map = self._load_sitios_json()

        for site_id in sorted(set(raster_map) | set(json_map)):
            warning = str(json_map.get(site_id, {}).get('dune_warning', ''))
            if 'false positive' in warning.lower() or 'falso positivo' in warning.lower():
                self.excluded.append({'site_id': site_id, 'reason': warning})
                log.warning('[dunas:%s] EXCLUÍDO — %s', site_id, warning)
                continue
            fv = self._build(site_id, json_map.get(site_id, {}), raster_map.get(site_id))
            results.append(fv)
            for msg in fv.issues:
                log.warning(f"[dunas:{site_id}] {msg}")

        log.info(f"DuneProcessor: {len(results)} sítios processados.")
        return results

    def audit_rasters(self) -> list[dict[str, Any]]:
        audits = []
        for pattern in ("*.tif", "*.tiff", "*.hgt", "*.npy"):
            for path in self.raster_dir.rglob(pattern):
                try:
                    audits.append(audit_raster(path))
                except Exception as e:
                    audits.append({"file": str(path), "error": str(e)})
        return audits

    # ------------------------------------------------------------------
    # Internos
    # ------------------------------------------------------------------

    def _discover_rasters(self) -> dict[Path, str]:
        """Mapeia raster -> site_id (um por sítio; prefere .tif a .npy)."""
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

    def _load_sitios_json(self) -> dict[str, dict]:
        """site_id -> metadados, apenas sítios de dunas."""
        sites_list = load_catalogs(self.catalog_paths).values()
        return {
            s["id"]: s
            for s in sites_list
            if s.get("dunas_detectadas") or s.get("dunes_detected")
            or s.get("categoria") == "campo_de_dunas" or s.get("category") == "dune_field"
        }

    def _build(self, site_id: str, meta: dict, raster_path: Optional[Path]) -> DuneFeatureVector:
        issues: list[str] = [f"conflito de catálogo em {item['field']}: preservada a fonte prioritária; alternativa em {item['source']}"
                             for item in meta.get('_catalog_conflicts', [])]
        prov: dict[str, str] = {}
        extra: dict[str, Any] = {"json_meta": meta}

        lat, lon = finite_number(meta.get("lat")), finite_number(meta.get("lon"))
        if lat is None or lon is None:
            issues.append("lat/lon ausentes: o sítio não está no catálogo (coordenadas desconhecidas)")

        computed: dict[str, Optional[float]] = {}
        why_not: dict[str, str] = {}
        diag: dict[str, Any] = {}
        if raster_path is not None:
            try:
                dem, rmeta = load_dem(raster_path)
                rx, ry, avisos = resolution_m(rmeta, assumed_resolution_m=self.res_fallback_m)
                issues.extend(avisos)
                computed, why_not = dune_morphometrics(dem, rx, ry)
                extra['raster_metrics'] = dict(computed)
                # Connected positive residuals count regions, not the ridges in
                # the catalog. Keep the diagnostic, do not equate the methods.
                computed['dune_density'] = None
                why_not['dune_density'] = 'densidade de segmentos de resíduo positivo não validada como densidade de cristas do catálogo'
                diag = extract_morphometrics(dem, res_m=rx, res_y_m=ry)
                if diag.get("nan_fraction", 0) > 0:
                    issues.append(f"{diag['nan_fraction']:.1%} do raster sem dados (preenchido com a média só nos diagnósticos)")
                extra.update(raster_file=str(raster_path), raster_res_m=[rx, ry])
            except Exception as e:
                issues.append(f"raster {raster_path.name} não pôde ser processado: {e}")

        values: dict[str, Optional[float]] = {}
        catalog_values: dict[str, float] = {}
        for feat, keys in CATALOG_KEYS.items():
            cv, field_name = catalog_metric(meta, keys, feature=feat)
            if feat == 'dune_density' and cv is not None and not density_is_comparable(meta, field_name):
                extra['unmapped_density'] = {'value': cv, 'field': field_name}
                issues.append('densidade_dunas: definição/unidade de cristas por km² não comprovada; excluída do matching')
                cv, field_name = None, None
            if cv is not None:
                catalog_values[feat] = cv
            rv = metric_value(feat, computed.get(feat))

            if rv is not None:
                values[feat] = float(rv)
                prov[feat] = "raster:dune_morphometrics"
                if cv is not None and cv != 0 and abs(rv - cv) / abs(cv) > DIVERGENCE_WARN:
                    issues.append(f"{feat}: raster ({rv:.4g}) difere do catálogo ({cv:.4g}) em mais de {DIVERGENCE_WARN:.0%}; usando o raster")
            elif cv is not None:
                values[feat] = cv
                prov[feat] = provenance_for(meta, field_name)
                if raster_path is not None and feat in why_not:
                    issues.append(f"{feat}: não calculável do raster ({why_not[feat]}); usando o valor do catálogo")
            else:
                values[feat] = None
                prov[feat] = "ausente"
                if feat in NOT_FROM_DEM:
                    motivo = NOT_FROM_DEM[feat]
                elif feat in why_not:
                    motivo = why_not[feat]
                elif raster_path is None:
                    motivo = "sem raster e sem valor no catálogo"
                else:
                    motivo = "não calculado"
                issues.append(f"{feat}: INDISPONÍVEL — {motivo}")
        extra["catalog_values"] = catalog_values

        origens = {p.split(":")[0] for p in prov.values() if p != "ausente"}
        source = "hybrid" if len(origens) > 1 else ("raster" if origens == {"raster"} else "catalogo")
        if not origens:
            source = 'ausente'

        return DuneFeatureVector(
            site_id=site_id, source=source, lat=lat, lon=lon,
            slope_mean_deg=diag.get("slope_mean_deg"),
            slope_p90_deg=diag.get("slope_p90_deg"),
            roughness_rms_m=diag.get("roughness_rms_m"),
            tri=diag.get("tri"),
            aspect_ratio=diag.get("aspect_ratio"),
            relief_m=diag.get("relief_m"),
            anisotropy=diag.get("anisotropy"),
            curvature_mean=diag.get("curvature_mean"),
            dem_mean_m=diag.get("dem_mean_m"),
            n_pixels=diag.get("n_pixels"),
            provenance=prov, issues=issues, extra=extra,
            **values,
        )
