"""
tests/ingestion/test_opentopography.py
======================================
Testes offline do downloader OpenTopography (a API é simulada).

    python tests/ingestion/test_opentopography.py
    pytest tests/ingestion -v
"""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).parent.parent.parent.resolve()
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import numpy as np
import rasterio
from rasterio.io import MemoryFile
from rasterio.transform import from_bounds

from src.ingestion.earth import opentopography as ot
from src.processing.shared.raster_io import site_id_from_path


def _geotiff_bytes(bounds=(0, 0, 1, 1)) -> bytes:
    dem = np.random.default_rng(0).random((20, 20)).astype("float32") * 100
    with MemoryFile() as mem:
        with mem.open(driver="GTiff", height=20, width=20, count=1, dtype="float32",
                      crs="EPSG:4326", transform=from_bounds(*bounds, 20, 20)) as dst:
            dst.write(dem, 1)
        return mem.read()


class _Resposta:
    def __init__(self, conteudo: bytes):
        self.content = conteudo

    def raise_for_status(self):
        pass


def _api_response(url, *, params, timeout):
    return _Resposta(_geotiff_bytes((params['west'], params['south'], params['east'], params['north'])))


def _projeto_falso() -> Path:
    root = Path(tempfile.mkdtemp())
    (root / "sitios.json").write_text(
        json.dumps({"sitios": [
            {"id": "canion_apertados", "categoria": "afloramento",
             "lat": -6.34, "lon": -36.50, "lado_km": 5},
        ]}), encoding="utf-8")
    return root


def test_site_id_from_path():
    assert site_id_from_path("x/canion_apertados_dem.tif") == "canion_apertados"
    assert site_id_from_path("jericoacoara_dem.tif") == "jericoacoara"
    assert site_id_from_path("Meu_Local.tif") == "meu_local"


def test_ids():
    assert ot.slug("Lençóis Maranhenses") == "lencois_maranhenses"
    assert ot.id_de_coordenadas(-19.1719, 127.7956) == "ponto_s19p1719_e127p7956"
    assert ot.id_de_coordenadas(35.0275, -111.0228) == "ponto_n35p0275_w111p0228"


def test_limites():
    b = ot.calcular_limites(0.0, 0.0, 111.32)
    assert abs((b["north"] - b["south"]) - 1.0) < 1e-6
    assert abs((b["east"] - b["west"]) - 1.0) < 1e-6
    # em latitude alta a caixa alarga em graus de longitude
    b60 = ot.calcular_limites(60.0, 0.0, 111.32)
    assert abs((b60["east"] - b60["west"]) - 2.0) < 1e-6


def test_cadastro_e_validacao():
    cat = {"sitios": []}
    site, criado = ot.cadastrar_local(cat, -19.17, 127.79, "cratera", diametro_km=0.875)
    assert criado and site["lado_km"] == 6 and site["categoria"] == "crater"
    assert site["craters"]["diameter_m"] == 875.0
    # mesmo id e mesmas coordenadas: reaproveita
    _, criado = ot.cadastrar_local(cat, -19.17, 127.79, "cratera", diametro_km=0.875)
    assert not criado and len(cat["sitios"]) == 1
    # mesmo id, outras coordenadas: recusa
    try:
        ot.cadastrar_local(cat, 10, 10, id_=site["id"])
        assert False, "deveria recusar"
    except ValueError:
        pass
    for args in [(95, 0), (0, 200)]:
        try:
            ot.cadastrar_local({"sitios": []}, *args)
            assert False
        except ValueError:
            pass


def test_download_novo_local_so_com_coordenadas():
    root = _projeto_falso()
    try:
        with mock.patch("requests.get", side_effect=_api_response) as get, \
             mock.patch.dict("os.environ", {"OPENTOPOGRAPHY_API_KEY": "chave_falsa"}):
            assert ot.main(["-19.1719", "127.7956", "--root", str(root)]) == 0
        params = get.call_args.kwargs["params"]
        assert params["demtype"] == "COP30" and params["south"] < -19.1719 < params["north"]

        tif = root / "data/earth/craters/ponto_s19p1719_e127p7956_dem.tif"
        assert tif.exists() and not list(tif.parent.glob("*.tmp"))
        with rasterio.open(tif):
            pass
        cat = json.loads((root / "sitios.json").read_text(encoding="utf-8"))
        assert {s["id"] for s in cat["sitios"]} == {"canion_apertados", "ponto_s19p1719_e127p7956"}
        assert site_id_from_path(tif) == "ponto_s19p1719_e127p7956"
        assert (root / "data/earth/manifesto_opentopography.json").exists()
    finally:
        shutil.rmtree(root)


def test_dunas_vao_para_pasta_de_dunas_e_todos_baixa_pendentes():
    root = _projeto_falso()
    try:
        with mock.patch("requests.get", side_effect=_api_response), \
             mock.patch.dict("os.environ", {"OPENTOPOGRAPHY_API_KEY": "x"}):
            assert ot.main(["-2.6", "-43.0", "--tipo", "dunas", "--id", "lencois",
                            "--root", str(root)]) == 0
            assert (root / "data/earth/dunes/lencois_dem.tif").exists()
            assert ot.main(["--todos", "--root", str(root)]) == 0
        assert (root / "data/earth/craters/canion_apertados_dem.tif").exists()
    finally:
        shutil.rmtree(root)


def test_resposta_invalida_nao_cadastra_nem_deixa_lixo():
    root = _projeto_falso()
    try:
        antes = (root / "sitios.json").read_text(encoding="utf-8")
        with mock.patch("requests.get", return_value=_Resposta(b"<html>erro</html>")), \
             mock.patch.dict("os.environ", {"OPENTOPOGRAPHY_API_KEY": "x"}):
            assert ot.main(["10", "10", "--root", str(root)]) == 1
        assert (root / "sitios.json").read_text(encoding="utf-8") == antes
        assert not list(root.rglob("*.tmp")) and not list(root.rglob("*.tif"))
    finally:
        shutil.rmtree(root)


def test_geotiff_de_outro_local_nao_e_associado_ao_sitio():
    root = _projeto_falso()
    try:
        before = (root / 'sitios.json').read_bytes()
        with mock.patch('requests.get', return_value=_Resposta(_geotiff_bytes())), \
             mock.patch.dict('os.environ', {'OPENTOPOGRAPHY_API_KEY': 'fake'}):
            assert ot.main(['10', '10', '--root', str(root)]) == 1
        assert (root / 'sitios.json').read_bytes() == before
        assert not list(root.rglob('*.tif')) and not list(root.rglob('*.tmp'))
    finally:
        shutil.rmtree(root)


if __name__ == "__main__":
    falhas = 0
    for nome, fn in sorted(globals().items()):
        if nome.startswith("test_") and callable(fn):
            try:
                fn()
                print(f"PASS  {nome}")
            except Exception as erro:  # noqa: BLE001
                falhas += 1
                print(f"FAIL  {nome}: {type(erro).__name__}: {erro}")
    sys.exit(1 if falhas else 0)
