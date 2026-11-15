"""
tests/matching/test_missing_data_and_scaling.py
================================================
O motor não pode preencher dado ausente com zero/padrão, deve avisar, e o
escalonamento de Bagnold e o azimute circular precisam realmente funcionar.

    python tests/matching/test_missing_data_and_scaling.py
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent.resolve()
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import numpy as np

from src.matching.dunes.dune_matcher import DuneMatcher
from src.matching.engine import MatchingEngine
from src.processing.dunes.dune_processor import DuneFeatureVector
from src.shared.constants import (
    DUNE_AREAL_DENSITY_FEATURES, DUNE_CIRCULAR_FEATURES, DUNE_FEATURE_WEIGHTS,
    DUNE_GEOMETRIC_FEATURES, MARS, MARS_DUNE_REFERENCES,
)

NAMES = list(DUNE_FEATURE_WEIGHTS)
EARTH = np.array([6.0, 10.7, 297.0, 173.0, 3.99, 392.0, 0.468])
REF = {"id": "ref", "mean_height": 5.0, "height_p90": 8.0, "wavelength": 85.0, "crest_azimuth": 170.0,
       "dune_density": 8.5, "mean_spacing": 90.0, "aridity_index": 0.0,
       "gravity_ratio": MARS["gravity_ratio"], "atm_density_ratio": MARS["atm_density_ratio"]}


def _engine(**kw):
    return MatchingEngine(
        DUNE_FEATURE_WEIGHTS,
        geometric_features=DUNE_GEOMETRIC_FEATURES,
        areal_features=DUNE_AREAL_DENSITY_FEATURES,
        circular_features=DUNE_CIRCULAR_FEATURES, **kw)


def test_vetor_terrestre_de_dunas_usa_os_7_atributos():
    """Regressão: antes só a aridez era lida (os outros 6 viravam 0 por nome errado)."""
    fv = DuneFeatureVector(site_id="x", source="catalogo", mean_height=6.0, height_p90=10.0,
                           wavelength=300.0, crest_azimuth=160.0, dune_density=5.0,
                           mean_spacing=380.0, aridity_index=0.4)
    assert fv.to_array().tolist() == [6.0, 10.0, 300.0, 160.0, 5.0, 380.0, 0.4]


def test_ausente_vira_nan_nunca_zero_e_nome_errado_estoura():
    fv = DuneFeatureVector(site_id="x", source="catalogo", wavelength=300.0)
    arr = fv.to_array()
    assert np.isnan(arr).sum() == 6 and arr[2] == 300.0
    assert fv.missing() == [n for n in NAMES if n != "wavelength"]
    try:
        fv.to_array({"atributo_inexistente": 1.0})
        assert False, "nome inexistente deveria levantar erro, não virar 0"
    except AttributeError:
        pass


def test_par_com_atributo_ausente_exclui_so_ele_e_informa():
    eng = _engine()
    rf = eng._ref_to_array(REF)
    eng.fit([EARTH, rf])
    cheio = eng.match_one(EARTH, rf, "s", "r", "mars", "dune", MARS["gravity_ratio"], MARS["atm_density_ratio"])
    e2 = EARTH.copy()
    e2[4] = np.nan                                   # sem densidade
    parcial = eng.match_one(e2, rf, "s", "r", "mars", "dune", MARS["gravity_ratio"], MARS["atm_density_ratio"])
    assert parcial.features_missing_earth == ["dune_density"]
    assert "dune_density" not in parcial.features_used and len(parcial.features_used) == 6
    assert abs(parcial.coverage - (1 - DUNE_FEATURE_WEIGHTS["dune_density"])) < 1e-9
    assert "dune_density" not in parcial.feature_contributions
    # preencher com 0 daria outro resultado: confirma que não é isso que acontece
    e0 = EARTH.copy(); e0[4] = 0.0
    zero = eng.match_one(e0, rf, "s", "r", "mars", "dune", MARS["gravity_ratio"], MARS["atm_density_ratio"])
    assert abs(zero.similarity_score - parcial.similarity_score) > 1e-6
    assert cheio.coverage == 1.0


def test_cobertura_insuficiente_nao_pontua_e_registra(caplog=None):
    eng = _engine(min_coverage=0.6)
    rf = eng._ref_to_array(REF)
    pobre = np.full(7, np.nan); pobre[2] = 300.0     # só o comprimento de onda (peso 0,20)
    logging.disable(logging.NOTSET)
    out = eng.match_many([("pobre", pobre), ("ok", EARTH)], [REF], "mars", "dune")
    assert [r.earth_site_id for r in out] == ["ok"]
    assert len(eng.skipped) == 1 and eng.skipped[0]["earth_site_id"] == "pobre"
    assert "cobertura" in eng.skipped[0]["reason"] and "dune_density" in eng.skipped[0]["missing_earth"]


def test_referencia_sem_atributo_vira_nan_nao_zero():
    eng = _engine()
    ref = {k: v for k, v in REF.items() if k != "wavelength"}
    assert np.isnan(eng._ref_to_array(ref)[2])


def test_bagnold_realmente_escalona_e_mapa_diz_o_fator():
    eng = _engine()
    rf = eng._ref_to_array(REF)
    scaled, mp = eng._apply_physical_scaling(rf, MARS["gravity_ratio"], MARS["atm_density_ratio"])
    beta = np.sqrt(MARS["gravity_ratio"]) / np.sqrt(MARS["atm_density_ratio"])
    assert abs(beta - 4.82) < 0.01
    assert abs(scaled[2] - 85.0 / beta) < 1e-9                    # comprimento de onda ÷ β
    assert abs(scaled[4] - 8.5 * beta**2) < 1e-9                  # densidade × β²
    assert scaled[3] == 170.0 and scaled[6] == 0.0                # azimute e aridez intactos
    assert abs(mp["wavelength"] - 1 / beta) < 1e-12 and mp["crest_azimuth"] == 1.0


def test_bagnold_sem_razoes_levanta_erro_em_vez_de_assumir_1():
    eng = _engine()
    try:
        eng._apply_physical_scaling(eng._ref_to_array(REF), None, None)
        assert False
    except ValueError:
        pass


def test_azimute_circular_170_e_5_estao_a_15_graus():
    eng = _engine()
    a = np.full(7, np.nan); a[3] = 170.0
    b = np.full(7, np.nan); b[3] = 5.0
    # isola o azimute: cobertura mínima 0 só para este teste unitário
    e = MatchingEngine(DUNE_FEATURE_WEIGHTS, circular_features=DUNE_CIRCULAR_FEATURES, min_coverage=0.0)
    e.fit([a, b])
    perto = e.match_one(a, b, "s", "r", "mars", "dune")
    longe_b = np.full(7, np.nan); longe_b[3] = 80.0
    longe = e.match_one(a, longe_b, "s", "r", "mars", "dune")
    assert perto.weighted_euclidean_dist < longe.weighted_euclidean_dist
    assert abs(perto.weighted_euclidean_dist - np.sqrt(1.0) * 15 / 90.0) < 1e-9   # 15° de 90° (=período/2)


def test_matcher_de_dunas_completo_sem_nan_no_relatorio():
    sites = [DuneFeatureVector(site_id="a", source="catalogo", mean_height=6.0, height_p90=10.0,
                               wavelength=300.0, crest_azimuth=160.0, dune_density=5.0,
                               mean_spacing=380.0, aridity_index=0.4),
             DuneFeatureVector(site_id="b", source="catalogo", wavelength=300.0)]
    m = DuneMatcher()
    res = m.run(sites)
    assert {r.earth_site_id for r in res} == {"a"}
    assert {s["earth_site_id"] for s in m.skipped} == {"b"}
    d = res[0].to_dict()
    assert all(v is not None for v in d["earth_vector"])
    import json; json.dumps(m.skipped); json.dumps(d, allow_nan=False)


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
