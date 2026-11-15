"""
src/matching/dunes/dune_matcher.py
====================================
Matching especializado para dunas: Terra ↔ Marte.
"""

from __future__ import annotations

import logging
from typing import Any

from src.matching.engine import MatchingEngine, MatchResult
from src.processing.dunes.dune_processor import DuneFeatureVector
from src.shared.constants import (
    DUNE_AREAL_DENSITY_FEATURES, DUNE_CIRCULAR_FEATURES, DUNE_FEATURE_WEIGHTS,
    DUNE_GEOMETRIC_FEATURES, MARS_DUNE_REFERENCES,
)

log = logging.getLogger(__name__)


class DuneMatcher:
    """
    Compara sítios de dunas terrestres (Nordeste do Brasil) com
    campos de dunas marcianos de referência.
    """

    def __init__(
        self,
        feature_weights: dict[str, float] = None,
        physical_scaling: bool = True,
        mars_refs: list[dict] = None,
    ):
        weights = feature_weights or DUNE_FEATURE_WEIGHTS
        self.refs = MARS_DUNE_REFERENCES if mars_refs is None else mars_refs
        self.engine = MatchingEngine(
            feature_weights=weights,
            physical_scaling=physical_scaling,
            geometric_features=tuple(name for name in DUNE_GEOMETRIC_FEATURES if name in weights),
            areal_features=tuple(name for name in DUNE_AREAL_DENSITY_FEATURES if name in weights),
            circular_features={name: period for name, period in DUNE_CIRCULAR_FEATURES.items() if name in weights},
        )
        self.skipped: list[dict] = []

    def run(self, earth_sites: list[DuneFeatureVector]) -> list[MatchResult]:
        """
        Executa o matching de todos os sítios terrestres contra todas as
        referências marcianas.

        Retorna lista de MatchResult ordenada por site_id e rank.
        """
        if not earth_sites:
            self.skipped = []
            log.warning("DuneMatcher: nenhum sítio terrestre para comparar.")
            return []

        # Monta vetores terrestres
        earth_vectors = []
        for fv in earth_sites:
            vec = fv.to_array(dict(zip(self.engine.feature_names, self.engine.weights)))
            earth_vectors.append((fv.site_id, vec))

        # Fit + matching
        results = self.engine.match_many(
            earth_vectors=earth_vectors,
            planet_refs=self.refs,
            target_body="mars",
            feature_type="dune",
        )
        self.skipped = self.engine.skipped

        log.info(
            f"DuneMatcher: {len(earth_sites)} sítios × {len(self.refs)} refs "
            f"= {len(results)} comparações."
        )
        return results

    def top_matches(
        self,
        results: list[MatchResult],
        n: int = 3,
    ) -> dict[str, list[MatchResult]]:
        """
        Retorna os top-N matches por sítio terrestre.
        """
        from collections import defaultdict
        grouped: dict[str, list[MatchResult]] = defaultdict(list)
        for r in results:
            grouped[r.earth_site_id].append(r)
        return {
            site_id: sorted(matches, key=lambda x: x.similarity_score, reverse=True)[:n]
            for site_id, matches in grouped.items()
        }
