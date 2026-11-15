"""
src/processing/shared/raster_io.py
===================================
Leitura e auditoria de arquivos raster (GeoTIFF, HGT/SRTM).

Suporta:
  - rasterio (preferencial)
  - fallback numpy puro para HGT SRTM1/SRTM3
"""

from __future__ import annotations

import os
import struct
from pathlib import Path
from typing import Any

import numpy as np

# ---------------------------------------------------------------------------
# Auditoria de metadados
# ---------------------------------------------------------------------------


def audit_raster(path: str | Path) -> dict[str, Any]:
    """
    Retorna um dicionário com metadados do raster.

    Tenta usar rasterio; se não disponível, usa fallback para .hgt.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {path}")

    try:
        import rasterio

        with rasterio.open(path) as src:
            data = src.read(1, masked=True)
            valid = data.compressed()
            meta = {
                "file": str(path),
                "driver": src.driver,
                "crs": str(src.crs),
                "width": src.width,
                "height": src.height,
                "bands": src.count,
                "dtype": str(src.dtypes[0]),
                "resolution_m": _res_to_meters(src.res, src.crs),
                "bounds": {
                    "left": src.bounds.left,
                    "bottom": src.bounds.bottom,
                    "right": src.bounds.right,
                    "top": src.bounds.top,
                },
                "nodata": src.nodata,
                "stats": {
                    "min": float(np.nanmin(valid)) if len(valid) else None,
                    "max": float(np.nanmax(valid)) if len(valid) else None,
                    "mean": float(np.nanmean(valid)) if len(valid) else None,
                    "std": float(np.nanstd(valid)) if len(valid) else None,
                    "valid_pixels": int(len(valid)),
                    "total_pixels": int(src.width * src.height),
                },
            }
            return meta

    except ImportError:
        return _audit_hgt_fallback(path)


def _res_to_meters(res: tuple[float, float], crs) -> dict[str, float]:
    """Converte resolução para metros (aproximado em graus)."""
    try:
        import rasterio.crs

        if crs and crs.is_geographic:
            # ~111 km por grau de latitude
            x_m = abs(res[0]) * 111_320
            y_m = abs(res[1]) * 111_320
        else:
            x_m, y_m = abs(res[0]), abs(res[1])
    except Exception:
        x_m, y_m = abs(res[0]), abs(res[1])
    return {"x": round(x_m, 2), "y": round(y_m, 2)}


def _audit_hgt_fallback(path: Path) -> dict[str, Any]:
    """Leitura direta de HGT SRTM sem rasterio."""
    size = path.stat().st_size
    if size == 2 * 1201 * 1201:
        n = 1201
        res_arcsec = 3
    elif size == 2 * 3601 * 3601:
        n = 3601
        res_arcsec = 1
    else:
        raise ValueError(f"Tamanho HGT inesperado: {size} bytes")

    arr = np.frombuffer(path.read_bytes(), dtype=">i2").reshape(n, n).astype(np.float32)
    arr[arr == -32768] = np.nan
    valid = arr[~np.isnan(arr)]

    # Parse lat/lon do nome do arquivo (ex.: S07W037)
    stem = path.stem.upper()
    lat_sign = -1 if stem[0] == "S" else 1
    lon_sign = -1 if "W" in stem else 1
    lat = lat_sign * int(stem[1:3])
    lon = lon_sign * int(stem[stem.index("W" if "W" in stem else "E") + 1:])

    res_m = res_arcsec * 30.87  # 1 arcsec ≈ 30.87 m

    return {
        "file": str(path),
        "driver": "HGT_SRTM_fallback",
        "crs": "EPSG:4326",
        "width": n,
        "height": n,
        "bands": 1,
        "dtype": "int16",
        "resolution_m": {"x": res_m, "y": res_m},
        "bounds": {
            "left": float(lon),
            "bottom": float(lat),
            "right": float(lon + 1),
            "top": float(lat + 1),
        },
        "nodata": -32768,
        "stats": {
            "min": float(np.nanmin(valid)),
            "max": float(np.nanmax(valid)),
            "mean": float(np.nanmean(valid)),
            "std": float(np.nanstd(valid)),
            "valid_pixels": int(len(valid)),
            "total_pixels": int(n * n),
        },
    }


# ---------------------------------------------------------------------------
# Carregamento de arrays
# ---------------------------------------------------------------------------


def load_dem(path: str | Path, band: int = 1) -> tuple[np.ndarray, dict]:
    """
    Carrega DEM como array numpy float32.

    Retorna:
        (array 2D, metadados com transform e crs)
    """
    path = Path(path)
    suffix = path.suffix.lower()

    if suffix == ".hgt":
        return _load_hgt(path)

    if suffix == ".npy":
        arr = np.load(path).astype(np.float32)
        meta = {"transform": None, "crs": "EPSG:4326", "res": (30.0, 30.0), "nodata": np.nan, "bounds": None}
        return arr, meta

    # GeoTIFF via rasterio
    import rasterio

    with rasterio.open(path) as src:
        arr = src.read(band, masked=True).astype(np.float32)
        arr = np.where(arr.mask, np.nan, arr.data) if hasattr(arr, "mask") else arr.astype(np.float32)
        meta = {
            "transform": src.transform,
            "crs": src.crs,
            "res": src.res,
            "nodata": src.nodata,
            "bounds": src.bounds,
        }
    return arr, meta


def _load_hgt(path: Path) -> tuple[np.ndarray, dict]:
    """Carrega HGT SRTM sem rasterio."""
    size = path.stat().st_size
    n = 1201 if size == 2 * 1201 * 1201 else 3601
    arr = np.frombuffer(path.read_bytes(), dtype=">i2").reshape(n, n).astype(np.float32)
    arr[arr == -32768] = np.nan

    stem = path.stem.upper()
    lat_sign = -1 if stem[0] == "S" else 1
    lon_sign = -1 if "W" in stem else 1
    lat = lat_sign * int(stem[1:3])
    lon = lon_sign * int(stem[stem.index("W" if "W" in stem else "E") + 1:])
    res_deg = 1.0 / (n - 1)

    meta = {
        "transform": None,  # sem affine object aqui
        "crs": "EPSG:4326",
        "res": (res_deg, res_deg),
        "nodata": -32768,
        "bounds": {"left": lon, "bottom": lat, "right": lon + 1, "top": lat + 1},
        "lat_origin": lat + 1,   # HGT: linha 0 = topo
        "lon_origin": lon,
        "res_deg": res_deg,
    }
    return arr, meta
