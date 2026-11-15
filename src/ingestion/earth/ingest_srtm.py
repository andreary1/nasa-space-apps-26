"""
src/ingestion/earth/ingest_srtm.py
=====================================
Ingestion do arquivo HGT SRTM1 (S07W037.hgt) e dos TIFs ASTER:
recorta regiões de interesse baseadas em sitios.json e as salva
nas pastas corretas (data/earth/dunes/ ou data/earth/craters/).

Uso
---
    python -m src.ingestion.earth.ingest_srtm [--root PATH]
"""

from __future__ import annotations

import json
import logging
import shutil
from pathlib import Path

import numpy as np

log = logging.getLogger(__name__)


def ingest_srtm(root: Path, srtm_hgt: Path, sitios_json: Path) -> dict[str, list[Path]]:
    """
    Para cada sítio em sitios.json cuja cobertura geográfica cai dentro
    do tile HGT, recorta a janela e salva como .npy (compatível com
    o pipeline sem rasterio, mas também como GeoTIFF se rasterio disponível).

    Retorna dict: {site_id: [path_salvo]}
    """
    if not srtm_hgt.exists():
        log.error(f"HGT não encontrado: {srtm_hgt}")
        return {}

    # Carrega HGT completo
    size = srtm_hgt.stat().st_size
    n = 1201 if size == 2 * 1201 * 1201 else 3601
    dem = np.frombuffer(srtm_hgt.read_bytes(), dtype=">i2").reshape(n, n).astype(np.float32)
    dem[dem == -32768] = np.nan

    # Cobertura do tile: S07W037 → lat [-7, -6], lon [-37, -36]
    lat_min, lat_max = -7.0, -6.0
    lon_min, lon_max = -37.0, -36.0
    res_deg = 1.0 / (n - 1)

    with open(sitios_json, encoding="utf-8") as fh:
        sitios_data = json.load(fh)

    sites_list = sitios_data.get("sites") or sitios_data.get("sitios") or []
    outputs: dict[str, list[Path]] = {}

    for s in sites_list:
        site_lat = s["lat"]
        site_lon = s["lon"]
        lado_km = s.get("lado_km", 5)

        # Verifica se o sítio está dentro do tile
        if not (lat_min <= site_lat <= lat_max and lon_min <= site_lon <= lon_max):
            continue

        # Converte km → graus (aproximado)
        half_deg = (lado_km / 2) / 111.32  # 1 grau ≈ 111.32 km

        # Índices no array HGT
        # Linha 0 = topo (lat_max), linha n-1 = base (lat_min)
        row_center = int((lat_max - site_lat) / res_deg)
        col_center = int((site_lon - lon_min) / res_deg)
        half_px = max(1, int(half_deg / res_deg))

        r0 = max(0, row_center - half_px)
        r1 = min(n, row_center + half_px)
        c0 = max(0, col_center - half_px)
        c1 = min(n, col_center + half_px)

        patch = dem[r0:r1, c0:c1]

        if patch.size == 0:
            log.warning(f"  {s['id']}: patch vazio para tile {srtm_hgt.name}")
            continue

        # Define pasta de destino
        cat = s.get("categoria", "afloramento")
        if cat == "campo_de_dunas":
            dest_dir = root / "data" / "earth" / "dunes"
        else:
            dest_dir = root / "data" / "earth" / "craters"
        dest_dir.mkdir(parents=True, exist_ok=True)

        # Salva como NPY (nativo) e tenta salvar como GeoTIFF
        npy_path = dest_dir / f"{s['id']}_dem.npy"
        np.save(npy_path, patch)
        log.info(f"  {s['id']:20} → {npy_path} shape={patch.shape}")

        # GeoTIFF via rasterio (se disponível)
        tif_path = _save_geotiff(patch, dest_dir, s["id"], site_lat, site_lon, half_deg, res_deg)

        saved = [npy_path]
        if tif_path:
            saved.append(tif_path)
        outputs[s["id"]] = saved

    return outputs


def _save_geotiff(
    patch: np.ndarray,
    dest_dir: Path,
    site_id: str,
    lat: float,
    lon: float,
    half_deg: float,
    res_deg: float,
) -> Path | None:
    """Salva patch como GeoTIFF usando rasterio."""
    try:
        import rasterio
        from rasterio.transform import from_bounds
        from rasterio.crs import CRS

        tif_path = dest_dir / f"{site_id}_dem.tif"
        height, width = patch.shape
        west = lon - half_deg
        east = lon + half_deg
        south = lat - half_deg
        north = lat + half_deg
        transform = from_bounds(west, south, east, north, width, height)

        with rasterio.open(
            tif_path,
            "w",
            driver="GTiff",
            height=height,
            width=width,
            count=1,
            dtype="float32",
            crs=CRS.from_epsg(4326),
            transform=transform,
            nodata=np.nan,
        ) as dst:
            dst.write(patch, 1)

        log.info(f"  {site_id:20} → GeoTIFF: {tif_path}")
        return tif_path
    except Exception as e:
        log.debug(f"Não foi possível salvar GeoTIFF para {site_id}: {e}")
        return None


if __name__ == "__main__":
    import argparse

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    parser = argparse.ArgumentParser(description="Ingestion SRTM HGT → data/earth/")
    parser.add_argument("--root", default=".", help="Diretório raiz do projeto")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    srtm = root / "S07W037.hgt"
    sitios = root / "sitios.json"

    log.info(f"Ingestão SRTM: {srtm}")
    outputs = ingest_srtm(root, srtm, sitios)
    log.info(f"Concluído: {len(outputs)} sítios recortados.")
