"""
tests/processing/test_provenance_and_metrics.py
================================================
Proveniência dos atributos, ausência explícita (nada de padrão silencioso) e
métricas calculadas do DEM (sintético sempre; raster real se existir).

    python tests/processing/test_provenance_and_metrics.py
"""

from __future__ import annotations

import json
import logging
import shutil
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent.resolve()
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import numpy as np

from src.processing.craters.crater_processor import CraterProcessor
from src.processing.dunes.dune_processor import DuneProcessor
from src.processing.shared.morphometrics import crater_morphometrics, dune_morphometrics
from src.processing.shared.raster_io import load_dem, resolution_m


def _catalogo(sitios: list[dict]) -> tuple[Path, Path]:
    d = Path(tempfile.mkdtemp())
    (d / "c.json").write_text(json.dumps({"sitios": sitios}), encoding="utf-8")
    return d, d / "c.json"


# ---------------------------------------------------------------- dunas

def test_dunas_catalogo_registra_origem_e_nao_inventa_nada():
    d, cat = _catalogo([{"id": "a", "categoria": "campo_de_dunas", "lat": -2.0, "lon": -43.0,
                         "altura_media": 6.3, "comprimento_onda": 312, "orientacao_azimute": 161}])
    try:
        fv = DuneProcessor(raster_dir=d / "nada", sitios_json=cat).process_all()[0]
        assert fv.mean_height == 6.3 and fv.wavelength == 312 and fv.crest_azimuth == 161
        assert fv.provenance["wavelength"].startswith("catalogo:comprimento_onda")
        # o que faltava continua None, com aviso — antes virava 0.0 / 1.0 / fórmulas
        for f in ("height_p90", "dune_density", "mean_spacing", "aridity_index"):
            assert getattr(fv, f) is None and fv.provenance[f] == "ausente", f
        assert any("aridity_index" in m and "INDISPONÍVEL" in m and "NASA POWER" in m for m in fv.issues)
        # e não há mais estimativas por fórmula arbitrária
        assert fv.slope_mean_deg is None and fv.relief_m is None and fv.roughness_rms_m is None
    finally:
        shutil.rmtree(d)


def test_dunas_valor_zero_do_catalogo_e_valor_real_nao_ausente():
    d, cat = _catalogo([{"id": "a", "categoria": "campo_de_dunas", "indice_aridez": 0.0}])
    try:
        fv = DuneProcessor(raster_dir=d / "nada", sitios_json=cat).process_all()[0]
        assert fv.aridity_index == 0.0 and fv.provenance["aridity_index"].startswith("catalogo")
    finally:
        shutil.rmtree(d)


def test_dunas_sitio_sem_latlon_avisa():
    d, cat = _catalogo([{"id": "a", "categoria": "campo_de_dunas", "altura_media": 5}])
    try:
        fv = DuneProcessor(raster_dir=d / "nada", sitios_json=cat).process_all()[0]
        assert fv.lat is None and any("lat/lon" in m for m in fv.issues)
    finally:
        shutil.rmtree(d)


# -------------------------------------------------------------- crateras

BLOCO = {"diameter_m": 5000, "depth_m": 200, "rim_height_m": 50, "rim_variation_m": 10,
         "rim_radius_cv": 0.05, "mean_wall_slope": 20, "wall_slope_p90": 30,
         "circularity": 0.9, "rim_coherence": 0.8}


def test_crateras_no_crater_e_excluida_com_motivo():
    d, cat = _catalogo([
        {"id": "ok", "categoria": "afloramento", "craters": {**BLOCO, "class": "crater"}},
        {"id": "anel", "categoria": "afloramento", "craters": {**BLOCO, "class": "partial_ring"}},
        {"id": "nada", "categoria": "afloramento", "craters": {**BLOCO, "class": "no_crater"}},
        {"id": "vazio", "categoria": "afloramento"},
    ])
    try:
        proc = CraterProcessor(raster_dir=d / "nada", sitios_json=cat)
        fvs = {fv.site_id: fv for fv in proc.process_all()}
        assert set(fvs) == {"ok", "anel"}
        assert fvs["ok"].confidence == "alta" and fvs["anel"].confidence == "baixa"
        assert any("confiança baixa" in m for m in fvs["anel"].issues)
        ex = {e["site_id"]: e["reason"] for e in proc.excluded}
        assert "no_crater" in ex["nada"] and "sem raster e sem métricas" in ex["vazio"]
    finally:
        shutil.rmtree(d)


def test_crateras_razao_e_derivada_e_o_que_falta_fica_none():
    bloco = {"diameter_m": 4000, "depth_m": 400, "class": "crater"}          # só 2 de 11
    d, cat = _catalogo([{"id": "p", "categoria": "afloramento", "craters": bloco}])
    try:
        fv = CraterProcessor(raster_dir=d / "nada", sitios_json=cat).process_all()[0]
        assert fv.depth_diameter_ratio == 0.1 and fv.provenance["depth_diameter_ratio"].startswith("derivado:")
        assert fv.circularity is None and fv.rim_coherence is None and fv.mean_wall_slope is None
        assert len(fv.missing()) == 8
        assert sum("INDISPONÍVEL" in m for m in fv.issues) == 8
        assert not np.isnan(fv.to_array()).all() and np.isnan(fv.to_array()).sum() == 8
    finally:
        shutil.rmtree(d)


# ---------------------------------------------------------- métricas (DEM)

def _malha(n=300, res=30.0):
    yy, xx = np.mgrid[0:n, 0:n] * res
    return xx, yy


def test_dunas_sinteticas_recuperam_comprimento_azimute_altura():
    rng = np.random.default_rng(1)
    xx, yy = _malha()
    ux, un = np.sin(np.radians(60)), np.cos(np.radians(60))
    dem = 5 * np.sin(2 * np.pi * (xx * ux - yy * un) / 300) + 0.3 * rng.standard_normal(xx.shape) + 0.002 * xx
    m, notas = dune_morphometrics(dem, 30.0, 30.0)
    assert abs(m["wavelength"] - 300) < 15
    assert abs(m["crest_azimuth"] - 150) < 5
    assert abs(m["mean_height"] - 10) < 1.5            # pico a vale de 2 × 5 m
    assert abs(m["mean_spacing"] - 300) < 20 and not notas


def test_dunas_ruido_e_janela_pequena_retornam_none_com_motivo():
    rng = np.random.default_rng(2)
    m, n = dune_morphometrics(rng.standard_normal((300, 300)) * 2, 30.0, 30.0)
    assert all(v is None for v in m.values()) and "periodicidade" in n["wavelength"]
    m, n = dune_morphometrics(rng.standard_normal((20, 20)), 30.0, 30.0)
    assert all(v is None for v in m.values()) and "pequena demais" in n["wavelength"]


def test_cratera_sintetica_e_terreno_inclinado():
    rng = np.random.default_rng(3)
    xx, yy = _malha()
    r = np.hypot(xx - 4500, yy - 4500)
    R = 750.0
    crat = np.where(r < R, -150 * (1 - (r / R) ** 2), 20 * np.exp(-((r - R) / 250) ** 2)) + 0.3 * rng.standard_normal(xx.shape)
    m, _ = crater_morphometrics(crat, 30.0, 30.0)
    assert m["crater_class"] == "crater" and abs(m["diameter_m"] - 1500) / 1500 < 0.15
    assert abs(m["depth_m"] - 150) < 30 and m["rim_coherence"] > 0.9
    plano = 0.05 * xx + 0.5 * rng.standard_normal(xx.shape)
    m2, _ = crater_morphometrics(plano, 30.0, 30.0)
    assert m2["crater_class"] == "no_crater"


def test_crateras_reais_conhecidas_se_o_raster_existir():
    """Barringer (D≈1,2 km, ~170 m) e Wolfe Creek (D≈0,9 km, ~50 m): valores de literatura."""
    casos = [("dados/terra/crateras/barringer.tif", 1186, 0.1, 170, 0.15),
             ("dados/terra/crateras/wolfe_creek.tif", 900, 0.1, 55, 0.3)]
    achou = False
    for f, d_ref, d_tol, prof_ref, prof_tol in casos:
        p = ROOT / f
        if not p.exists():
            continue
        achou = True
        dem, meta = load_dem(p)
        rx, ry, _ = resolution_m(meta)
        m, _ = crater_morphometrics(dem, rx, ry)
        assert m["crater_class"] == "crater", f
        assert abs(m["diameter_m"] - d_ref) / d_ref < d_tol + 0.05, (f, m["diameter_m"])
        assert abs(m["depth_m"] - prof_ref) / prof_ref < prof_tol + 0.05, (f, m["depth_m"])
    if not achou:
        print("   (rasters reais ausentes: teste ignorado)")


def test_resolucao_em_metros_usa_cosseno_da_latitude():
    class B:  # bounds estilo rasterio
        bottom, top = 34.0, 36.0
    rx, ry, av = resolution_m({"res": (0.0002777, 0.0002777), "crs": "EPSG:4326", "bounds": B})
    assert abs(rx - 0.0002777 * 111320 * np.cos(np.radians(35))) < 1e-6 and ry > rx and not av
    rx, ry, av = resolution_m({"res": (30.0, 30.0), "res_assumed": True})
    assert (rx, ry) == (30.0, 30.0) and av and "assumida" in av[0]


if __name__ == "__main__":
    logging.disable(logging.CRITICAL)
    falhas = 0
    for nome, fn in sorted(globals().items()):
        if nome.startswith("test_") and callable(fn):
            try:
                fn(); print(f"PASS  {nome}")
            except Exception as erro:  # noqa: BLE001
                falhas += 1; print(f"FAIL  {nome}: {type(erro).__name__}: {erro}")
    sys.exit(1 if falhas else 0)
