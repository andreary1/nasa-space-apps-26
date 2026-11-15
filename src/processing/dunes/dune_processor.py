"""
src/processing/dunes/dune_processor.py
=======================================
Pipeline de processamento de dunas terrestres.

Integra:
  - Leitura de DEM (raster_io)
  - Extração de métricas morfométricas (morphometrics)
  - Leitura de metadados pre-calculados de sitios.json
  - Produz um FeatureVector padronizado para o matching engine
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
from src.shared.constants import DUNE_FEATURE_WEIGHTS

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Dataclass: vetor de features de duna
# ---------------------------------------------------------------------------


@dataclass
class DuneFeatureVector:
    """Vetor de features morfométricas de um sítio de dunas."""

    site_id: str
    source: str                        # "raster" | "sitios_json" | "hybrid"
    lat: float
    lon: float
    body: str = "earth"                # corpo celeste

    # Métricas primárias (do DEM)
    slope_mean_deg: Optional[float] = None
    slope_p90_deg: Optional[float] = None
    roughness_rms_m: Optional[float] = None
    tri: Optional[float] = None
    aspect_ratio: Optional[float] = None
    wavelength_m: Optional[float] = None
    dune_density_per_km2: Optional[float] = None
    aridity_index: Optional[float] = None

    # Métricas secundárias / diagnóstico
    relief_m: Optional[float] = None
    anisotropy: Optional[float] = None
    curvature_mean: Optional[float] = None
    dem_mean_m: Optional[float] = None
    n_pixels: Optional[int] = None

    # Metadados originais (passthrough)
    extra: dict = field(default_factory=dict)

    def to_array(self, weights: dict[str, float] = None) -> np.ndarray:
        """
        Converte para array numpy com as features do vetor de matching.
        Retorna apenas features definidas em DUNE_FEATURE_WEIGHTS (ou weights).
        """
        w = weights or DUNE_FEATURE_WEIGHTS
        vec = []
        for feat in w:
            val = getattr(self, feat, None)
            vec.append(float(val) if val is not None else 0.0)
        return np.array(vec, dtype=np.float64)

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Processador de dunas
# ---------------------------------------------------------------------------


class DuneProcessor:
    """
    Processa sítios de dunas a partir de:
      1. Arquivos raster (.tif / .hgt) na pasta data/earth/dunes/
      2. Metadados pre-calculados em sitios.json
    """

    def __init__(
        self,
        raster_dir: str | Path = "data/earth/dunes",
        sitios_json: str | Path = "data/earth/sites.json",
        res_fallback_m: float = 30.0,
    ):
        self.raster_dir = Path(raster_dir)
        self.sitios_json = Path(sitios_json)
        if not self.sitios_json.exists():
            for alt in [Path("sites.json"), Path("data/earth/sitios.json"), Path("sitios.json")]:
                if alt.exists():
                    self.sitios_json = alt
                    break
        self.res_fallback_m = res_fallback_m

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------

    def process_all(self) -> list[DuneFeatureVector]:
        """
        Processa todos os sítios disponíveis e retorna lista de DuneFeatureVector.

        Lógica de prioridade:
          1. Se há raster na pasta de dunas → extrai métricas via DEM
          2. Se há entrada em sitios.json (dunas_detectadas=True) → usa pre-calc
          3. Combina ("hybrid") se ambos disponíveis
        """
        results: list[DuneFeatureVector] = []

        # Rasters na pasta de dunas
        raster_map = self._discover_rasters()
        # Sítios com dunas no JSON
        json_map = self._load_sitios_json()

        processed_ids: set[str] = set()

        # Prioridade 1: rasters
        for raster_path, site_id in raster_map.items():
            json_meta = json_map.get(site_id, {})
            fv = self._process_raster(raster_path, site_id, json_meta)
            if fv:
                results.append(fv)
                processed_ids.add(site_id)

        # Prioridade 2: apenas JSON (sem raster correspondente)
        for site_id, meta in json_map.items():
            if site_id not in processed_ids:
                fv = self._process_json_only(site_id, meta)
                if fv:
                    results.append(fv)

        log.info(f"DuneProcessor: {len(results)} sítios processados.")
        return results

    def audit_rasters(self) -> list[dict[str, Any]]:
        """Audita todos os rasters disponíveis e retorna metadados."""
        audits = []
        for path in self.raster_dir.rglob("*.tif"):
            try:
                audits.append(audit_raster(path))
            except Exception as e:
                audits.append({"file": str(path), "error": str(e)})
        for path in self.raster_dir.rglob("*.hgt"):
            try:
                audits.append(audit_raster(path))
            except Exception as e:
                audits.append({"file": str(path), "error": str(e)})
        return audits

    # ------------------------------------------------------------------
    # Métodos internos
    # ------------------------------------------------------------------

    def _discover_rasters(self) -> dict[Path, str]:
        """
        Mapeia rasters → site_id (inferido do nome do arquivo).
        Ex.: jericoacoara_dem.tif → "jericoacoara"
        """
        mapping: dict[Path, str] = {}
        if not self.raster_dir.exists():
            return mapping
        for ext in ["*.tif", "*.tiff", "*.hgt", "*.npy"]:
            for f in self.raster_dir.rglob(ext):
                stem = f.stem.lower().split("_")[0]
                mapping[f] = stem
        return mapping

    def _load_sitios_json(self) -> dict[str, dict]:
        """Retorna dict site_id → metadados, apenas sítios com dunas."""
        if not self.sitios_json.exists():
            return {}
        with open(self.sitios_json, encoding="utf-8") as fh:
            data = json.load(fh)
        sites_list = data.get("sites") or data.get("sitios") or []
        return {
            s["id"]: s
            for s in sites_list
            if s.get("dunas_detectadas") or s.get("dunes_detected") or s.get("categoria") == "campo_de_dunas" or s.get("category") == "dune_field"
        }

    def _process_raster(
        self,
        path: Path,
        site_id: str,
        json_meta: dict,
    ) -> Optional[DuneFeatureVector]:
        """Extrai métricas morfométricas do raster."""
        try:
            dem, raster_meta = load_dem(path)
            res_m = _res_to_m(raster_meta)

            log.info(f"Processando raster: {path.name}  res={res_m:.1f}m  shape={dem.shape}")
            morph = extract_morphometrics(dem, res_m=res_m)

            # Mescla com JSON se disponível
            source = "hybrid" if json_meta else "raster"
            return DuneFeatureVector(
                site_id=site_id,
                source=source,
                lat=json_meta.get("lat", 0.0),
                lon=json_meta.get("lon", 0.0),
                slope_mean_deg=morph["slope_mean_deg"],
                slope_p90_deg=morph["slope_p90_deg"],
                roughness_rms_m=morph["roughness_rms_m"],
                tri=morph["tri"],
                aspect_ratio=morph["aspect_ratio"],
                wavelength_m=json_meta.get("comprimento_onda") or morph["wavelength_m"],
                dune_density_per_km2=json_meta.get("densidade_dunas"),
                aridity_index=json_meta.get("indice_aridez"),
                relief_m=morph["relief_m"],
                anisotropy=morph["anisotropy"],
                curvature_mean=morph["curvature_mean"],
                dem_mean_m=morph["dem_mean_m"],
                n_pixels=morph["n_pixels"],
                extra={
                    "raster_file": str(path),
                    "raster_res_m": res_m,
                    "json_meta": json_meta,
                },
            )
        except Exception as e:
            log.warning(f"Falha ao processar raster {path}: {e}")
            return None

    def _process_json_only(self, site_id: str, meta: dict) -> Optional[DuneFeatureVector]:
        """
        Constrói DuneFeatureVector apenas com dados de sitios.json.
        As métricas do DEM são estimadas a partir de relações morfométricas
        quando possível.
        """
        h = meta.get("altura_media") or 0.0
        h90 = meta.get("altura_p90") or 0.0
        lam = meta.get("comprimento_onda") or 1.0
        diag = meta.get("diagnostico", {})

        # Estimativas derivadas
        slope_mean = float(np.degrees(np.arctan(h / (lam * 0.5)))) if lam > 0 else None
        slope_p90 = float(np.degrees(np.arctan(h90 / (lam * 0.3)))) if lam > 0 else None
        rough = diag.get("amplitude_desvio_m", h * 0.4)
        aspect_ratio = h / lam if lam > 0 else None
        anisotropy = diag.get("anisotropia")

        return DuneFeatureVector(
            site_id=site_id,
            source="sitios_json",
            lat=meta.get("lat", 0.0),
            lon=meta.get("lon", 0.0),
            slope_mean_deg=slope_mean,
            slope_p90_deg=slope_p90,
            roughness_rms_m=float(rough) if rough else None,
            tri=None,  # não disponível sem DEM
            aspect_ratio=float(aspect_ratio) if aspect_ratio else None,
            wavelength_m=float(lam) if lam else None,
            dune_density_per_km2=meta.get("densidade_dunas"),
            aridity_index=meta.get("indice_aridez"),
            relief_m=float(h90),
            anisotropy=float(anisotropy) if anisotropy else None,
            extra={"json_meta": meta},
        )


# ---------------------------------------------------------------------------
# Utilitários
# ---------------------------------------------------------------------------


def _res_to_m(raster_meta: dict) -> float:
    """Extrai resolução em metros do metadado de raster."""
    res = raster_meta.get("res")
    if res is None:
        return 30.0
    res_deg = max(abs(res[0]), abs(res[1]))
    if res_deg > 0.001:  # provavelmente em graus
        return res_deg * 111_320
    return res_deg  # provavelmente já em metros
