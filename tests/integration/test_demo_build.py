"""
tests/integration/test_demo_build.py
=====================================
O demo (index.html) deve exibir exatamente o que o pipeline gerou: nada de
matching próprio no navegador, nada de valor padrão, scores iguais aos do relatório.

    python tests/integration/test_demo_build.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "scripts"))

REPORT = ROOT / "data" / "processed" / "comparisons" / "matching_report_v2.json"


def _html() -> str:
    import build_world_demo
    return build_world_demo.render_html(str(REPORT))


def test_html_sem_matching_proprio_e_sem_placeholders():
    html = _html()
    assert "calculateMatch" not in html, "o navegador não pode ter matching próprio"
    assert not re.search(r"/\*__[A-Z_]+__\*/", html), "placeholder não substituído"
    assert "applyPipeline();" in html and "function renderDetail()" in html


def test_dados_embutidos_batem_com_o_relatorio():
    html = _html()
    m = re.search(r"const PIPELINE = (\{.*?\});\n", html, re.S)
    data = json.loads(m.group(1))
    rep = json.loads(REPORT.read_text(encoding="utf-8"))
    for key, bloco in (("dunes_mars", "dune"), ("craters_moon", "crater")):
        for s in rep["results"][key]["site_summaries"]:
            e = data["sites"][s["earth_site_id"]]
            assert e["status"] == "ok" and e["kind"] == bloco
            assert e["summary"]["best_match"]["similarity_score"] == s["best_match"]["similarity_score"]
    excluidos = {x["site_id"] for x in rep["data_quality"]["craters_excluded"]}
    assert excluidos and all(data["sites"][i]["status"] == "excluded" for i in excluidos)
    assert data["meta"]["beta"] == 4.82 and data["meta"]["notes"]


def test_referencias_do_demo_sao_as_mesmas_do_pipeline():
    from src.shared.constants import MARS_DUNE_REFERENCES, MOON_CRATER_REFERENCES
    html = _html()
    moon = json.loads(re.search(r"const MOON_CRATER_REFERENCES = (\[.*?\]);\n", html, re.S).group(1))
    mars = json.loads(re.search(r"const MARS_DUNE_REFERENCES = (\[.*?\]);\n", html, re.S).group(1))
    assert [r["id"] for r in moon] == [r["id"] for r in MOON_CRATER_REFERENCES]
    assert [r["id"] for r in mars] == [r["id"] for r in MARS_DUNE_REFERENCES]


if __name__ == "__main__":
    falhas = 0
    for nome, fn in sorted(globals().items()):
        if nome.startswith("test_") and callable(fn):
            try:
                fn(); print(f"PASS  {nome}")
            except Exception as erro:  # noqa: BLE001
                falhas += 1; print(f"FAIL  {nome}: {type(erro).__name__}: {erro}")
    sys.exit(1 if falhas else 0)
