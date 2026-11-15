"""
tests/processing/test_raster_discovery.py
=========================================
Um raster por sítio (.tif preferido a .npy) e catálogo combinado.

    python tests/processing/test_raster_discovery.py
"""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent.resolve()
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.processing.craters.crater_processor import CraterProcessor
from src.processing.dunes.dune_processor import DuneProcessor


def _pasta_com(*nomes: str) -> Path:
    d = Path(tempfile.mkdtemp())
    for n in nomes:
        (d / n).write_bytes(b"x")
    return d


def test_tif_vence_npy_nas_crateras_e_dunas():
    d = _pasta_com("canion_apertados_dem.npy", "canion_apertados_dem.tif", "outro_dem.npy")
    try:
        for proc in (CraterProcessor(raster_dir=d, sitios_json=d / "x.json"),
                     DuneProcessor(raster_dir=d, sitios_json=d / "x.json")):
            achados = {p.name: i for p, i in proc._discover_rasters().items()}
            assert achados == {"canion_apertados_dem.tif": "canion_apertados",
                               "outro_dem.npy": "outro"}, achados
    finally:
        shutil.rmtree(d)


def test_catalogos_combinados_primeiro_manda_e_craters_e_completado():
    d = Path(tempfile.mkdtemp())
    try:
        (d / "a.json").write_text(json.dumps({"sitios": [
            {"id": "x", "categoria": "afloramento", "lat": 1, "lon": 2},
            {"id": "d", "categoria": "campo_de_dunas"},
        ]}), encoding="utf-8")
        (d / "b.json").write_text(json.dumps({"sites": [
            {"id": "x", "category": "outcrop", "lat": 9, "lon": 9, "craters": {"diameter_m": 500}},
            {"id": "y", "category": "impact_crater", "lat": 3, "lon": 4},
        ]}), encoding="utf-8")
        proc = CraterProcessor(raster_dir=d, sitios_json=[d / "a.json", d / "b.json"])
        cat = proc._load_catalog_crater_sites()
        assert set(cat) == {"x", "y"}                        # dunas ficam de fora
        assert cat["x"]["lat"] == 1                          # primeiro catálogo manda
        assert cat["x"]["craters"] == {"diameter_m": 500}    # bloco que faltava é completado
        ids = [fv.site_id for fv in proc.process_all()]
        # "x" entra (bloco sem 'class': confiança baixa e aviso); "y" não tem métricas
        # nem raster, então sai da comparação COM motivo, em vez de ganhar valores padrão.
        assert ids == ["x"]
        assert [e["site_id"] for e in proc.excluded] == ["y"]
    finally:
        shutil.rmtree(d)


if __name__ == "__main__":
    falhas = 0
    for nome, fn in sorted(globals().items()):
        if nome.startswith("test_") and callable(fn):
            try:
                fn(); print(f"PASS  {nome}")
            except Exception as erro:  # noqa: BLE001
                falhas += 1; print(f"FAIL  {nome}: {type(erro).__name__}: {erro}")
    sys.exit(1 if falhas else 0)
