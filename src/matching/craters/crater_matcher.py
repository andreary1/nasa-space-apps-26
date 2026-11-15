"""
src/matching/craters/crater_matcher.py
========================================
Matching especializado para crateras: Terra ↔ Lua.
"""

from __future__ import annotations

import logging

from src.matching.engine import MatchingEngine, MatchResult
from src.processing.craters.crater_processor import CraterFeatureVector
from src.shared.constants import CRATER_FEATURE_WEIGHTS, MOON_CRATER_REFERENCES

log = logging.getLogger(__name__)


class CraterMatcher:
    """
    Compara sítios terrestres (afloramentos, estruturas vulcânicas)
    com crateras lunares de referência.
    """

    def __init__(
        self,
        feature_weights: dict[str, float] = None,
        physical_scaling: bool = True,
        moon_refs: list[dict] = None,
    ):
        weights = feature_weights or CRATER_FEATURE_WEIGHTS
        self.refs = moon_refs or MOON_CRATER_REFERENCES
        self.engine = MatchingEngine(
            feature_weights=weights,
            physical_scaling=physical_scaling,
        )

    def run(self, earth_sites: list[CraterFeatureVector]) -> list[MatchResult]:
        if not earth_sites:
            log.warning("CraterMatcher: nenhum sítio terrestre para comparar.")
            return []

        earth_vectors = [(fv.site_id, fv.to_array(CRATER_FEATURE_WEIGHTS)) for fv in earth_sites]

        results = self.engine.match_many(
            earth_vectors=earth_vectors,
            planet_refs=self.refs,
            target_body="moon",
            feature_type="crater",
        )

        log.info(
            f"CraterMatcher: {len(earth_sites)} sítios × {len(self.refs)} refs "
            f"= {len(results)} comparações."
        )
        return results

    def top_matches(
        self,
        results: list[MatchResult],
        n: int = 3,
    ) -> dict[str, list[MatchResult]]:
        from collections import defaultdict
        grouped: dict[str, list[MatchResult]] = defaultdict(list)
        for r in results:
            grouped[r.earth_site_id].append(r)
        return {
            sid: sorted(ms, key=lambda x: x.similarity_score, reverse=True)[:n]
            for sid, ms in grouped.items()
        }
