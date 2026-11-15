"""
tests/integration/test_pipeline_e2e.py
========================================
Teste End-to-End do pipeline completo.

Executa:
  1. Ingestion do SRTM HGT (recorte de sítios dentro do tile S07W037)
  2. Pipeline completo (processamento + matching + relatório)
  3. Valida estrutura do relatório JSON
  4. Imprime resumo

Uso
---
    # Da raiz do projeto:
    python tests/integration/test_pipeline_e2e.py
    
    # Ou via pytest:
    pytest tests/integration/test_pipeline_e2e.py -v -s
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

# Garante que a raiz do projeto está no path
ROOT = Path(__file__).parent.parent.parent.resolve()
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("test_e2e")


def test_ingestion():
    """Testa ingestão do SRTM HGT."""
    from src.ingestion.earth.ingest_srtm import ingest_srtm

    srtm = ROOT / "data" / "earth" / "dem" / "srtm" / "S07W037.hgt"
    if not srtm.exists():
        srtm = ROOT / "S07W037.hgt"
    sitios = ROOT / "data" / "earth" / "sites.json"
    if not sitios.exists():
        sitios = ROOT / "sitios.json"

    if not srtm.exists():
        log.warning(f"HGT não encontrado em {srtm} — pulando ingestion de raster.")
        return {}

    log.info("Executando ingestion SRTM...")
    outputs = ingest_srtm(ROOT, srtm, sitios)
    log.info(f"Ingestion: {len(outputs)} sítios recortados do tile S07W037")
    for site_id, paths in outputs.items():
        for p in paths:
            assert Path(p).exists(), f"Arquivo não foi criado: {p}"
            log.info(f"  ✓ {site_id} → {Path(p).name}")
    return outputs


def test_morphometrics():
    """Testa extração de métricas morfométricas em array sintético."""
    import numpy as np
    from src.processing.shared.morphometrics import extract_morphometrics

    log.info("Testando morfometria com DEM sintético (ondas senoidais)...")
    # DEM sintético: campo de dunas 2D com λ ≈ 300m
    ny, nx = 200, 200
    res_m = 30.0
    xx, yy = np.meshgrid(np.arange(nx), np.arange(ny))
    wavelength_px = 300 / res_m  # ~10 pixels
    dem = 5 * np.sin(2 * np.pi * xx / wavelength_px) + \
          3 * np.sin(2 * np.pi * yy / (wavelength_px * 1.5)) + \
          0.5 * np.random.default_rng(42).standard_normal((ny, nx))

    metrics = extract_morphometrics(dem.astype(np.float32), res_m=res_m)
    log.info(f"  slope_mean={metrics['slope_mean_deg']:.2f}°")
    log.info(f"  slope_p90 ={metrics['slope_p90_deg']:.2f}°")
    log.info(f"  roughness ={metrics['roughness_rms_m']:.3f}m")
    log.info(f"  TRI       ={metrics['tri']:.4f}")
    log.info(f"  wavelength={metrics['wavelength_m']:.1f}m (esperado ~{wavelength_px*res_m:.0f}m)")
    log.info(f"  anisotropy={metrics['anisotropy']:.3f}")

    assert metrics["slope_mean_deg"] > 0, "Slope deve ser > 0"
    assert metrics["roughness_rms_m"] >= 0, "Roughness deve ser ≥ 0"
    assert metrics["tri"] >= 0, "TRI deve ser ≥ 0"
    log.info("  ✓ Métricas morfométricas OK")
    return metrics


def test_matching_engine():
    """Testa o motor de matching com vetores sintéticos."""
    import numpy as np
    from src.matching.engine import MatchingEngine
    from src.shared.constants import DUNE_FEATURE_WEIGHTS, MARS

    log.info("Testando MatchingEngine com vetores sintéticos...")
    engine = MatchingEngine(
        feature_weights=DUNE_FEATURE_WEIGHTS,
        physical_scaling=True,
    )

    # Vetor terrestre: Jericoacoara (7 features contratuais)
    earth_vec = np.array([6.0, 10.7, 297.0, 173.0, 3.99, 392.0, 0.468])
    # Vetor marciano: Namib Dune (7 features)
    mars_vec = np.array([5.0, 8.0, 85.0, 170.0, 8.5, 90.0, 0.0])

    engine.fit([earth_vec, mars_vec])
    result = engine.match_one(
        earth_vec=earth_vec,
        planet_vec=mars_vec,
        earth_site_id="jericoacoara",
        planet_ref_id="bagnold_dunes_gale",
        target_body="mars",
        feature_type="dune",
        gravity_ratio=MARS["gravity_ratio"],
        atm_density_ratio=MARS["atm_density_ratio"],
    )

    log.info(f"  Resultado matching:")
    log.info(f"    WED            = {result.weighted_euclidean_dist:.4f}")
    log.info(f"    cosine_sim     = {result.cosine_similarity:.4f}")
    log.info(f"    similarity_score = {result.similarity_score:.4f}")

    assert 0 <= result.similarity_score <= 1, "Score fora do intervalo [0,1]"
    log.info("  ✓ MatchingEngine OK")
    return result


def test_full_pipeline():
    """Executa o pipeline completo end-to-end."""
    log.info("=" * 60)
    log.info("TESTE: Pipeline End-to-End Completo")
    log.info("=" * 60)

    from src.application.pipeline import run_pipeline

    report = run_pipeline(
        root=ROOT,
        output_dir="data/processed/comparisons",
        report_filename="matching_report_test.json",
        physical_scaling=True,
        verbose=True,
    )

    # Validações
    assert "metadata" in report
    assert "results" in report
    assert "global_ranking" in report
    assert "dunes_mars" in report["results"]
    assert "craters_moon" in report["results"]

    n_dune_sites = report["results"]["dunes_mars"]["n_earth_sites"]
    n_crater_sites = report["results"]["craters_moon"]["n_earth_sites"]
    n_global = len(report["global_ranking"])

    log.info(f"  ✓ Sítios de dunas comparados: {n_dune_sites}")
    log.info(f"  ✓ Análogos de crateras comparados: {n_crater_sites}")
    log.info(f"  ✓ Entradas no ranking global: {n_global}")

    # Verifica arquivo
    out_path = ROOT / "data" / "processed" / "comparisons" / "matching_report_test.json"
    assert out_path.exists(), f"Relatório não encontrado: {out_path}"
    log.info(f"  ✓ Relatório JSON salvo: {out_path}")

    return report


def run_all_tests():
    """Executa todos os testes em sequência."""
    print("\n" + "=" * 70)
    print("  PLANETARY ANALOG FINDER — TESTES E2E")
    print("=" * 70 + "\n")

    results = {}

    # Teste 1: Morfometria
    print("→ [1/4] Teste Morfométrico...")
    try:
        results["morphometrics"] = test_morphometrics()
        print("  PASS ✓\n")
    except Exception as e:
        print(f"  FAIL ✗ — {e}\n")

    # Teste 2: Matching Engine
    print("→ [2/4] Teste Matching Engine...")
    try:
        results["matching"] = test_matching_engine()
        print("  PASS ✓\n")
    except Exception as e:
        print(f"  FAIL ✗ — {e}\n")

    # Teste 3: Ingestion SRTM
    print("→ [3/4] Teste Ingestion SRTM...")
    try:
        results["ingestion"] = test_ingestion()
        print("  PASS ✓\n")
    except Exception as e:
        print(f"  FAIL ✗ — {e}\n")

    # Teste 4: Pipeline completo
    print("→ [4/4] Teste Pipeline Completo...")
    try:
        results["pipeline"] = test_full_pipeline()
        print("  PASS ✓\n")
    except Exception as e:
        print(f"  FAIL ✗ — {e}\n")
        import traceback
        traceback.print_exc()

    return results


if __name__ == "__main__":
    raise SystemExit(0 if len(run_all_tests()) == 4 else 1)
