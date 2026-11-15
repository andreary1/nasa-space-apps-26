"""
src/processing/craters/crater_processor.py
===========================================
Pipeline de processamento de crateras terrestres e estruturas análogas.

Contrato oficial de métricas de crateras:
  - diametro_m / diameter_m
  - profundidade_m / depth_m
  - razao_dD / depth_diameter_ratio
  - altura_borda_m / rim_height_m
  - razao_borda_D / rim_height_diameter_ratio
  - borda_variacao_m / rim_variation_m
  - borda_raio_cv / rim_radius_cv
  - declividade_parede_media / mean_wall_slope
  - declividade_parede_p90 / wall_slope_p90
  - circularidade / circularity
  - coerencia_borda / rim_coherence
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Any, Optional

import numpy as np

from src.processing.shared.raster_io import load_dem, audit_raster
from src.processing.shared.morphometrics import extract_morphometrics
from src.shared.constants import CRATER_FEATURE_WEIGHTS, CRATER_FIELD_ALIASES

log = logging.getLogger(__name__)


@dataclass
class CraterFeatureVector:
    """Vetor de features com as 11 métricas oficiais de crateras."""

    site_id: str
    source: str
    lat: float
    lon: float
    body: str = "earth"
    name: str = ""
    category: str = "crater"

    # As 11 métricas contratuais
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

    # Metadados complementares
    extra: dict = field(default_factory=dict)

    def to_array(self, weights: dict[str, float] = None) -> np.ndarray:
        w = weights or CRATER_FEATURE_WEIGHTS
        vec = []
        for feat in w:
            val = getattr(self, feat, None)
            vec.append(float(val) if val is not None else 0.0)
        return np.array(vec, dtype=np.float64)

    def to_dict(self) -> dict:
        return asdict(self)


class CraterProcessor:
    """
    Processa sítios análogos de crateras a partir de:
      1. Rasters em data/earth/craters/
      2. Catálogo sites.json / sitios.json (impact craters, outcrops, vulcânicos)
    """

    def __init__(
        self,
        raster_dir: str | Path = "data/earth/craters",
        sites_json: str | Path = "data/earth/sites.json",
        sitios_json: str | Path = None,
        res_fallback_m: float = 30.0,
    ):
        self.raster_dir = Path(raster_dir)
        target_json = sitios_json or sites_json
        self.sites_json = Path(target_json)
        if not self.sites_json.exists():
            # Fallback para caminhos alternativos
            alt_paths = [Path("data/earth/sites.json"), Path("sites.json"), Path("data/earth/sitios.json"), Path("sitios.json")]
            for alt in alt_paths:
                if alt.exists():
                    self.sites_json = alt
                    break
        self.res_fallback_m = res_fallback_m

    def audit_rasters(self) -> list[dict]:
        """Audita todos os rasters na pasta de crateras."""
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
        results: list[CraterFeatureVector] = []
        catalog_sites = self._load_catalog_crater_sites()
        raster_map = self._discover_rasters()

        processed_ids: set[str] = set()

        # Prioridade 1: Rasters recortados
        for rpath, site_id in raster_map.items():
            meta = catalog_sites.get(site_id, {})
            fv = self._process_raster(rpath, site_id, meta)
            if fv:
                results.append(fv)
                processed_ids.add(site_id)

        # Prioridade 2: Sítios do catálogo (crateras de impacto e afloramentos)
        for site_id, meta in catalog_sites.items():
            if site_id not in processed_ids:
                fv = self._process_catalog_site(site_id, meta)
                if fv:
                    results.append(fv)

        log.info(f"CraterProcessor: {len(results)} sítios processados.")
        return results

    def _discover_rasters(self) -> dict[Path, str]:
        mapping: dict[Path, str] = {}
        if not self.raster_dir.exists():
            return mapping
        for ext in ["*.tif", "*.tiff", "*.hgt", "*.npy"]:
            for f in self.raster_dir.rglob(ext):
                stem = f.stem.lower().split("_")[0]
                mapping[f] = stem
        return mapping

    def _load_catalog_crater_sites(self) -> dict[str, dict]:
        if not self.sites_json.exists():
            return {}
        with open(self.sites_json, encoding="utf-8") as fh:
            data = json.load(fh)
        
        sites_list = data.get("sites") or data.get("sitios") or []
        res = {}
        for s in sites_list:
            cat = s.get("category") or s.get("categoria", "")
            # Inclui crateras de impacto, afloramentos e vulcânicos
            if cat in {"impact_crater", "outcrop", "afloramento", "volcanic", "vulcanico", "crater"}:
                res[s["id"]] = s
        return res

    def _process_raster(self, path: Path, site_id: str, meta: dict) -> Optional[CraterFeatureVector]:
        try:
            dem, raster_meta = load_dem(path)
            res_m = _res_to_m(raster_meta)
            morph = extract_morphometrics(dem, res_m=res_m)
            
            # Se tem métricas no catálogo, usa-as combinadas
            c_meta = meta.get("craters", {}) if isinstance(meta.get("craters"), dict) else {}
            
            diam = c_meta.get("diameter_m") or morph.get("wavelength_m", 2500.0)
            depth = c_meta.get("depth_m") or morph.get("relief_m", 150.0)
            d_ratio = depth / diam if diam > 0 else 0.05
            
            return CraterFeatureVector(
                site_id=site_id,
                source="hybrid" if meta else "raster",
                name=meta.get("name") or meta.get("nome", site_id),
                category=meta.get("category") or meta.get("categoria", "crater"),
                lat=float(meta.get("lat", 0.0)),
                lon=float(meta.get("lon", 0.0)),
                diameter_m=float(diam),
                depth_m=float(depth),
                depth_diameter_ratio=float(d_ratio),
                rim_height_m=float(c_meta.get("rim_height_m") or (depth * 0.25)),
                rim_height_diameter_ratio=float(c_meta.get("rim_height_diameter_ratio") or (depth * 0.25 / diam)),
                rim_variation_m=float(c_meta.get("rim_variation_m") or morph.get("roughness_rms_m", 50.0)),
                rim_radius_cv=float(c_meta.get("rim_radius_cv", 0.05)),
                mean_wall_slope=float(morph["slope_mean_deg"]),
                wall_slope_p90=float(morph["slope_p90_deg"]),
                circularity=float(c_meta.get("circularity", 0.90)),
                rim_coherence=float(c_meta.get("rim_coherence", 0.85)),
                extra={"raster_file": str(path), "morph": morph, "meta": meta},
            )
        except Exception as e:
            log.warning(f"Falha ao processar raster {path}: {e}")
            return None

    def _process_catalog_site(self, site_id: str, meta: dict) -> Optional[CraterFeatureVector]:
        c = meta.get("craters", {}) if isinstance(meta.get("craters"), dict) else {}
        
        # Lê em inglês ou com alias português
        def get_val(en_key: str):
            pt_key = [k for k, v in CRATER_FIELD_ALIASES.items() if v == en_key]
            val = c.get(en_key)
            if val is None and pt_key:
                val = c.get(pt_key[0])
            if val is None:
                val = meta.get(en_key)
            if val is None and pt_key:
                val = meta.get(pt_key[0])
            return float(val) if val is not None else None

        diam = get_val("diameter_m") or 3000.0
        depth = get_val("depth_m") or 200.0
        dD = get_val("depth_diameter_ratio") or (depth / diam if diam > 0 else 0.05)
        rim_h = get_val("rim_height_m") or (depth * 0.2)
        rim_h_D = get_val("rim_height_diameter_ratio") or (rim_h / diam if diam > 0 else 0.01)

        return CraterFeatureVector(
            site_id=site_id,
            source="catalog",
            name=meta.get("name") or meta.get("nome", site_id),
            category=meta.get("category") or meta.get("categoria", "crater"),
            lat=float(meta.get("lat", 0.0)),
            lon=float(meta.get("lon", 0.0)),
            diameter_m=diam,
            depth_m=depth,
            depth_diameter_ratio=dD,
            rim_height_m=rim_h,
            rim_height_diameter_ratio=rim_h_D,
            rim_variation_m=get_val("rim_variation_m") or 150.0,
            rim_radius_cv=get_val("rim_radius_cv") or 0.03,
            mean_wall_slope=get_val("mean_wall_slope") or 15.0,
            wall_slope_p90=get_val("wall_slope_p90") or 25.0,
            circularity=get_val("circularity") or 0.92,
            rim_coherence=get_val("rim_coherence") or 0.80,
            extra={"meta": meta},
        )


def _res_to_m(raster_meta: dict) -> float:
    res = raster_meta.get("res")
    if res is None:
        return 30.0
    res_val = max(abs(res[0]), abs(res[1]))
    return res_val * 111_320 if res_val > 0.001 else res_val
