"""
src/matching/ranking/ranker.py
================================
Módulo de ranking e sumarização de resultados de matching.

Produz:
  - Ranking global por score de similaridade
  - Relatório JSON estruturado para data/processed/
  - Sumário em texto para apresentação
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from src.matching.engine import MatchResult

log = logging.getLogger(__name__)


def _non_finite_to_none(obj):
    """Troca NaN/Infinity por None, recursivamente."""
    import math
    if isinstance(obj, float):
        return obj if math.isfinite(obj) else None
    if isinstance(obj, dict):
        return {k: _non_finite_to_none(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_non_finite_to_none(v) for v in obj]
    return obj


class MatchingRanker:
    """
    Agrega resultados de DuneMatcher e CraterMatcher,
    gera ranking final e persiste relatório JSON.
    """

    def __init__(self, output_dir: str | Path = "data/processed/comparisons"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # Relatório completo
    # ------------------------------------------------------------------

    def generate_report(
        self,
        dune_results: list[MatchResult],
        crater_results: list[MatchResult],
        audit_meta: list[dict] = None,
        earth_features_dunes: list[dict] = None,
        earth_features_craters: list[dict] = None,
        data_quality: dict[str, Any] = None,
    ) -> dict[str, Any]:
        """
        Gera relatório JSON com:
          - metadados da execução
          - auditoria dos rasters
          - features terrestres extraídas
          - top matches de dunas (Terra ↔ Marte)
          - top matches de crateras (Terra ↔ Lua)
          - ranking global combinado
        """
        report = {
            "metadata": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "pipeline_version": "1.0.0",
                "description": (
                    "Cruzamento de análogos terrestres (Nordeste do Brasil) "
                    "com feições planetárias (Dunas de Marte / Crateras da Lua). "
                    "NASA Space Apps Hackathon 2026."
                ),
                "methodology": {
                    "distance_metric": "Weighted Euclidean Distance + Cosine Similarity",
                    "physical_scaling": "Bagnold (1941): comprimentos de dunas ÷ β e densidade × β² (ver data_quality.notes)",
                    "missing_data": "atributo ausente é excluído do par (pesos renormalizados); cobertura mínima exigida; nada é preenchido com valor padrão",
                    "circular_features": "azimute de crista usa a menor diferença angular (período 180°)",
                    "normalization": "MinMaxScaler on combined Earth + Planetary feature space",
                    "similarity_score": "0.6 × exp(-k × WED) + 0.4 × Cosine",
                },
            },
            "data_audit": audit_meta or [],
            "earth_features": {
                "dunes": earth_features_dunes or [],
                "craters": earth_features_craters or [],
            },
            "results": {
                "dunes_mars": self._summarize(dune_results, "dune"),
                "craters_moon": self._summarize(crater_results, "crater"),
            },
            "data_quality": data_quality or {},
            "global_ranking": self._global_ranking(dune_results + crater_results),
        }

        return report

    def save_report(self, report: dict[str, Any], filename: str = "matching_report.json") -> Path:
        """Persiste o relatório em data/processed/comparisons/."""
        out_path = self.output_dir / filename
        with open(out_path, "w", encoding="utf-8") as fh:
            # NaN/Infinity não são JSON válido: viram null (e allow_nan=False garante)
            json.dump(_non_finite_to_none(report), fh, indent=2, ensure_ascii=False, allow_nan=False)
        log.info(f"Relatório salvo em: {out_path}")
        return out_path

    # ------------------------------------------------------------------
    # Utilitários internos
    # ------------------------------------------------------------------

    def _summarize(self, results: list[MatchResult], feature_type: str) -> dict[str, Any]:
        """Sumariza resultados agrupados por sítio terrestre."""
        from collections import defaultdict

        grouped: dict[str, list[MatchResult]] = defaultdict(list)
        for r in results:
            grouped[r.earth_site_id].append(r)

        site_summaries = []
        for site_id, matches in sorted(grouped.items()):
            top = sorted(matches, key=lambda x: x.similarity_score, reverse=True)[:5]
            best = top[0] if top else None
            site_summaries.append({
                "earth_site_id": site_id,
                "best_match": best.to_dict() if best else None,
                "top_5_matches": [m.to_dict() for m in top],
                "n_references_compared": len(matches),
            })

        return {
            "feature_type": feature_type,
            "n_earth_sites": len(grouped),
            "site_summaries": site_summaries,
        }

    def _global_ranking(self, all_results: list[MatchResult]) -> list[dict]:
        """
        Ranking global das melhores correspondências (best-per-site).
        """
        from collections import defaultdict

        # Melhor resultado por (site, body, type)
        best: dict[tuple, MatchResult] = {}
        for r in all_results:
            key = (r.earth_site_id, r.target_body, r.feature_type)
            if key not in best or r.similarity_score > best[key].similarity_score:
                best[key] = r

        ranked = sorted(best.values(), key=lambda x: x.similarity_score, reverse=True)
        return [
            {
                "global_rank": i + 1,
                "earth_site_id": r.earth_site_id,
                "target_body": r.target_body,
                "feature_type": r.feature_type,
                "best_planetary_ref": r.planetary_ref_id,
                "similarity_score": round(r.similarity_score, 4),
                "cosine_similarity": round(r.cosine_similarity, 4),
                "weighted_euclidean_dist": round(r.weighted_euclidean_dist, 4),
            }
            for i, r in enumerate(ranked)
        ]

    def print_data_quality(self, report: dict[str, Any]) -> None:
        """Imprime os avisos de qualidade de dados (ausentes, excluídos, sem score)."""
        dq = report.get("data_quality") or {}
        print("── QUALIDADE DOS DADOS ──────────────────────────────────────────")
        for kind in ("dunes", "craters"):
            for s in dq.get(kind, []):
                for msg in s["issues"]:
                    print(f"  [{kind}:{s['site_id']}] {msg}")
        for ex in dq.get("craters_excluded", []):
            print(f"  [craters:{ex['site_id']}] EXCLUÍDO — {ex['reason']}")
        for kind, lst in (dq.get("matches_without_score") or {}).items():
            for sk in lst:
                print(f"  [{kind}] sem score: {sk['earth_site_id']} × {sk['planetary_ref_id']} — {sk['reason']}")
        print("  Notas:")
        for n in dq.get("notes", []):
            print(f"   - {n}")
        print("=" * 70 + "\n")

    def print_summary(self, report: dict[str, Any]) -> None:
        """Imprime sumário no console."""
        print("\n" + "=" * 70)
        print("  PLANETARY ANALOG FINDER — RELATÓRIO DE MATCHING")
        print("=" * 70)
        print(f"  Gerado em: {report['metadata']['generated_at']}")
        print()

        print("── DUNAS: TERRA (Nordeste) ↔ MARTE ─────────────────────────────────")
        for s in report["results"]["dunes_mars"]["site_summaries"]:
            best = s["best_match"]
            if best:
                print(
                    f"  {s['earth_site_id']:25} → {best['planetary_ref_id']:25} "
                    f"score={best['similarity_score']:.3f}"
                )

        print()
        print("── CRATERAS: TERRA ↔ LUA ────────────────────────────────────────────")
        for s in report["results"]["craters_moon"]["site_summaries"]:
            best = s["best_match"]
            if best:
                print(
                    f"  {s['earth_site_id']:25} → {best['planetary_ref_id']:25} "
                    f"score={best['similarity_score']:.3f}"
                )

        print()
        print("── TOP 5 GLOBAL ─────────────────────────────────────────────────────")
        for entry in report["global_ranking"][:5]:
            print(
                f"  #{entry['global_rank']:2}  {entry['earth_site_id']:22} "
                f"↔ {entry['target_body']:4} / {entry['feature_type']:6}  "
                f"ref={entry['best_planetary_ref']:22}  "
                f"score={entry['similarity_score']:.4f}"
            )
        print("=" * 70 + "\n")
