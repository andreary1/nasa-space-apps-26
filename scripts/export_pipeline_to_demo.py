"""
scripts/export_pipeline_to_demo.py
==================================
Converte o relatório do pipeline em dados para o demo web
(`deliverables/demo/js/data/pipeline-results.js`).

O demo NÃO calcula scores: ele exibe exatamente o que o pipeline gerou
(atributos medidos, score, WED, cosseno, cobertura, escalonamento físico,
proveniência e avisos). Sítios excluídos ou não processados aparecem com o motivo.

    python scripts/export_pipeline_to_demo.py
    python scripts/export_pipeline_to_demo.py data/processed/comparisons/outro_relatorio.json
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(ROOT))

from src.shared.constants import (  # noqa: E402
    CRATER_FEATURE_WEIGHTS, DUNE_FEATURE_WEIGHTS, MARS, MARS_DUNE_REFERENCES,
    MIN_FEATURE_COVERAGE, MOON_CRATER_REFERENCES,
)

DEFAULT_REPORT = ROOT / "data" / "processed" / "comparisons" / "matching_report_v2.json"
DEST = ROOT / "deliverables" / "demo" / "js" / "data" / "pipeline-results.js"

KINDS = (
    # tipo, pesos, chave das features, chave dos resultados, chave de data_quality, refs
    ("dune", DUNE_FEATURE_WEIGHTS, "dunes", "dunes_mars", MARS_DUNE_REFERENCES),
    ("crater", CRATER_FEATURE_WEIGHTS, "craters", "craters_moon", MOON_CRATER_REFERENCES),
)


def _num(value):
    """JSON válido: NaN/inf viram null (nunca zero)."""
    if isinstance(value, float) and not math.isfinite(value):
        return None
    return value


def _match(m: dict, weights: dict, refs_by_id: dict) -> dict:
    """Um par sítio × referência, com a linha de cada atributo usada na tabela e nos gráficos."""
    ref = refs_by_id.get(m["planetary_ref_id"], {})
    used = set(m["features_used"])
    features = []
    for i, key in enumerate(weights):
        scale = m["physical_scaling_applied"].get(key, 1.0)
        features.append({
            "key": key,
            "weight": weights[key],
            "used": key in used,
            "earth": _num(m["earth_vector"][i]),
            "target": _num(ref.get(key)),
            "target_scaled": _num(m["planet_vector_scaled"][i]),
            "scale": _num(scale),
            "contribution": m["feature_contributions"].get(key),
        })
    return {
        "ref_id": m["planetary_ref_id"], "rank": m["rank"],
        "score": m["similarity_score"], "wed": m["weighted_euclidean_dist"],
        "cosine": m["cosine_similarity"], "coverage": m["coverage"],
        "missing_earth": m["features_missing_earth"],
        "missing_reference": m["features_missing_reference"],
        "features": features,
    }


def build_payload(report_path: Path) -> dict:
    rep = json.loads(report_path.read_text(encoding="utf-8"))
    dq = rep["data_quality"]
    sites: dict = {}

    for kind, weights, feat_key, res_key, refs in KINDS:
        refs_by_id = {r["id"]: r for r in refs}
        summaries = {s["earth_site_id"]: s for s in rep["results"][res_key]["site_summaries"]}
        dq_by = {r["site_id"]: r for r in dq[feat_key]}
        skipped = dq["matches_without_score"][feat_key]
        for fv in rep["earth_features"][feat_key]:
            sid = fv["site_id"]
            entry = {
                "kind": kind, "name": fv.get("name") or sid, "category": fv.get("category"),
                "lat": fv["lat"], "lon": fv["lon"],
                "metrics": {k: _num(fv.get(k)) for k in weights},
                "dq": {k: dq_by[sid][k] for k in ("source", "provenance", "issues", "features_missing")},
                "crater_class": fv.get("crater_class"), "confidence": fv.get("confidence"),
                "matches": [],
            }
            if sid in summaries:
                entry["status"] = "ok"
                entry["matches"] = [_match(m, weights, refs_by_id) for m in summaries[sid]["top_5_matches"]]
                entry["n_references_compared"] = summaries[sid]["n_references_compared"]
            else:
                why = [x["reason"] for x in skipped if x["earth_site_id"] == sid]
                entry["status"] = "no_score"
                entry["reason"] = "; ".join(why) or "sem score"
            sites[sid] = entry

    for ex in dq["craters_excluded"]:
        sites[ex["site_id"]] = {
            "kind": "crater", "status": "excluded", "reason": ex["reason"], "name": ex.get("name"),
            "category": ex.get("category"), "lat": ex.get("lat"), "lon": ex.get("lon"),
            "metrics": None, "matches": [],
        }

    beta = math.sqrt(MARS["gravity_ratio"]) / math.sqrt(MARS["atm_density_ratio"])

    def refs_out(rows, weights):
        return [{"id": r["id"], "name": r.get("name", r["id"]), **{k: r.get(k) for k in weights}} for r in rows]

    return {
        "meta": {
            "source_file": report_path.name,
            "generated_at": rep["metadata"]["generated_at"][:19].replace("T", " ") + " UTC",
            "pipeline_version": rep["metadata"].get("pipeline_version"),
            "beta": round(beta, 2), "min_coverage": MIN_FEATURE_COVERAGE,
            "feature_keys": {"dune": list(DUNE_FEATURE_WEIGHTS), "crater": list(CRATER_FEATURE_WEIGHTS)},
            "notes": dq["notes"],
        },
        "moon_refs": refs_out(MOON_CRATER_REFERENCES, CRATER_FEATURE_WEIGHTS),
        "mars_refs": refs_out(MARS_DUNE_REFERENCES, DUNE_FEATURE_WEIGHTS),
        "sites": sites,
    }


def export(report_path: Path = DEFAULT_REPORT, dest: Path = DEST) -> Path:
    payload = build_payload(Path(report_path).resolve())
    body = json.dumps(payload, ensure_ascii=False, indent=1, allow_nan=False)
    dest.write_text(
        "// GERADO por scripts/export_pipeline_to_demo.py — não edite à mão.\n"
        "// O demo só exibe estes resultados; nenhum score é calculado no navegador.\n"
        f"export const PIPELINE = {body};\n",
        encoding="utf-8",
    )
    return dest


if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_REPORT
    out = export(src)
    data = json.loads(out.read_text(encoding="utf-8").split("export const PIPELINE = ", 1)[1].rstrip().rstrip(";"))
    counts: dict = {}
    for s in data["sites"].values():
        counts[s["status"]] = counts.get(s["status"], 0) + 1
    print(f"Gerado: {out}  (a partir de {src.name}; sítios por status: {counts})")
