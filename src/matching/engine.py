"""
src/matching/engine.py
=======================
Motor de Matching Ponderado — Distância Euclidiana Ponderada com
normalização física para comparação Terra ↔ Marte/Lua.

Fundamento físico
-----------------
A teoria de Bagnold (1941) mostra que o comprimento de onda de dunas
eólicas escala com:

    λ ∝ (ρ_p / ρ_a)^(1/2) × (u* / g)

onde:
  ρ_p = densidade do grão (similar Terra/Marte para areia de silicato)
  ρ_a = densidade atmosférica
  u*  = velocidade de atrito
  g   = gravidade

Portanto, para comparar dunas terrestres com marcianas, escalonamos as
métricas geométricas (λ, H) pelo fator de Bagnold:

    β = (ρ_a_earth / ρ_a_planet)^0.5 × (g_planet / g_earth)^0.5

E para rugosidade/TRI, usamos razões de gravidade diretamente.

Referências
-----------
- Bagnold 1941; Greeley & Iversen 1985 (Wind as a Geological Process)
- Lorenz et al. 2010 (aeolian scaling laws)
- Rubin & Hesp 2009
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from typing import Any, Optional

import numpy as np
from sklearn.preprocessing import MinMaxScaler

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Dataclasses de resultado
# ---------------------------------------------------------------------------


@dataclass
class MatchResult:
    """Resultado de uma comparação Earth ↔ Planetary."""

    earth_site_id: str
    planetary_ref_id: str
    target_body: str              # "mars" | "moon"
    feature_type: str             # "dune" | "crater"

    # Scores (menores = mais similares)
    weighted_euclidean_dist: float
    cosine_similarity: float      # 0–1, maior = mais similar
    similarity_score: float       # score final 0–1 (1 = idêntico)
    rank: int = 0                 # posição no ranking

    # Detalhamento por feature
    feature_contributions: dict[str, float] = field(default_factory=dict)
    physical_scaling_applied: dict[str, float] = field(default_factory=dict)

    # Vetores brutos (para diagnóstico)
    earth_vector: list[float] = field(default_factory=list)
    planet_vector_scaled: list[float] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "earth_site_id": self.earth_site_id,
            "planetary_ref_id": self.planetary_ref_id,
            "target_body": self.target_body,
            "feature_type": self.feature_type,
            "weighted_euclidean_dist": round(self.weighted_euclidean_dist, 6),
            "cosine_similarity": round(self.cosine_similarity, 6),
            "similarity_score": round(self.similarity_score, 6),
            "rank": self.rank,
            "feature_contributions": {k: round(v, 6) for k, v in self.feature_contributions.items()},
            "physical_scaling_applied": self.physical_scaling_applied,
            "earth_vector": [round(v, 4) for v in self.earth_vector],
            "planet_vector_scaled": [round(v, 4) for v in self.planet_vector_scaled],
        }


# ---------------------------------------------------------------------------
# Motor de matching
# ---------------------------------------------------------------------------


class MatchingEngine:
    """
    Compara features terrestres contra referências planetárias.

    Algoritmo
    ---------
    1. Aplica escalonamento físico (Bagnold) no vetor planetário para
       "traduzir" as métricas ao frame de referência terrestre.
    2. Normaliza ambos os vetores com MinMaxScaler ajustado no conjunto
       completo de referências.
    3. Calcula distância Euclidiana ponderada e similaridade de cosseno.
    4. Converte distância em score 0–1 via função sigmoide decrescente.
    5. Score final = média ponderada (60% Euclidiana + 40% Cosseno).
    """

    def __init__(
        self,
        feature_weights: dict[str, float],
        feature_names: list[str] = None,
        physical_scaling: bool = True,
    ):
        """
        Parâmetros
        ----------
        feature_weights : dict  nome_feature → peso (serão normalizados para soma=1)
        feature_names   : lista ordenada de nomes (opcional; infere de weights se None)
        physical_scaling: se True, aplica correções Bagnold/gravidade
        """
        self.feature_names = feature_names or list(feature_weights.keys())
        raw_w = np.array([feature_weights.get(n, 0.0) for n in self.feature_names])
        self.weights = raw_w / raw_w.sum() if raw_w.sum() > 0 else raw_w
        self.physical_scaling = physical_scaling
        self._scaler: Optional[MinMaxScaler] = None

    # ------------------------------------------------------------------
    # Ajuste do scaler
    # ------------------------------------------------------------------

    def fit(self, all_vectors: list[np.ndarray]) -> "MatchingEngine":
        """
        Ajusta MinMaxScaler no conjunto de todos os vetores (Terra + Planeta).
        Deve ser chamado antes de match().
        """
        if not all_vectors:
            return self
        X = np.vstack(all_vectors)
        self._scaler = MinMaxScaler()
        self._scaler.fit(X)
        return self

    # ------------------------------------------------------------------
    # Matching
    # ------------------------------------------------------------------

    def match_one(
        self,
        earth_vec: np.ndarray,
        planet_vec: np.ndarray,
        earth_site_id: str,
        planet_ref_id: str,
        target_body: str,
        feature_type: str,
        gravity_ratio: float = 1.0,
        atm_density_ratio: float = 1.0,
    ) -> MatchResult:
        """
        Compara um par (sítio terrestre, referência planetária).
        """
        # 1. Escalonamento físico
        scaled_planet, scaling_map = self._apply_physical_scaling(
            planet_vec, gravity_ratio, atm_density_ratio
        )

        # 2. Normalização
        e_norm, p_norm = self._normalize_pair(earth_vec, scaled_planet)

        # 3. Distância Euclidiana ponderada
        diff = e_norm - p_norm
        weighted_sq = self.weights * diff**2
        wed = float(np.sqrt(weighted_sq.sum()))

        # 4. Similaridade de cosseno ponderada
        cos_sim = self._cosine_weighted(e_norm, p_norm)

        # 5. Score final
        # Distância Euclidiana → score (1 = idêntico, 0 = máximo diferente)
        # Usamos exp(-k * d) com k calibrado para d_max ≈ sqrt(n_features)
        n = len(self.feature_names)
        d_max = math.sqrt(n)
        k = 3.0 / d_max  # d_max → score ≈ 0.05
        euc_score = math.exp(-k * wed)

        similarity_score = 0.6 * euc_score + 0.4 * cos_sim

        # 6. Contribuições por feature
        contributions = {
            self.feature_names[i]: float(weighted_sq[i])
            for i in range(len(self.feature_names))
        }

        return MatchResult(
            earth_site_id=earth_site_id,
            planetary_ref_id=planet_ref_id,
            target_body=target_body,
            feature_type=feature_type,
            weighted_euclidean_dist=wed,
            cosine_similarity=cos_sim,
            similarity_score=similarity_score,
            feature_contributions=contributions,
            physical_scaling_applied=scaling_map,
            earth_vector=earth_vec.tolist(),
            planet_vector_scaled=scaled_planet.tolist(),
        )

    def match_many(
        self,
        earth_vectors: list[tuple[str, np.ndarray]],
        planet_refs: list[dict],
        target_body: str,
        feature_type: str,
    ) -> list[MatchResult]:
        """
        Compara todos os sítios terrestres contra todas as referências planetárias.

        earth_vectors : lista de (site_id, vetor_numpy)
        planet_refs   : lista de dicts com chaves: id, gravity_ratio, atm_density_ratio
                        + features (floats)
        """
        # Fit scaler se ainda não feito
        if self._scaler is None:
            all_vecs = [v for _, v in earth_vectors]
            all_vecs += [
                self._ref_to_array(r)
                for r in planet_refs
            ]
            self.fit(all_vecs)

        results: list[MatchResult] = []
        for site_id, e_vec in earth_vectors:
            site_results: list[MatchResult] = []
            for ref in planet_refs:
                p_vec = self._ref_to_array(ref)
                mr = self.match_one(
                    earth_vec=e_vec,
                    planet_vec=p_vec,
                    earth_site_id=site_id,
                    planet_ref_id=ref["id"],
                    target_body=target_body,
                    feature_type=feature_type,
                    gravity_ratio=ref.get("gravity_ratio", 1.0),
                    atm_density_ratio=ref.get("atm_density_ratio", 1.0),
                )
                site_results.append(mr)

            # Ranking por site
            site_results.sort(key=lambda x: x.similarity_score, reverse=True)
            for rank, mr in enumerate(site_results, start=1):
                mr.rank = rank
            results.extend(site_results)

        return results

    # ------------------------------------------------------------------
    # Escalonamento físico (Bagnold scaling)
    # ------------------------------------------------------------------

    def _apply_physical_scaling(
        self,
        planet_vec: np.ndarray,
        gravity_ratio: float,
        atm_density_ratio: float,
    ) -> tuple[np.ndarray, dict[str, float]]:
        """
        Projeta o vetor planetário no espaço de referência terrestre.

        Fator de Bagnold para comprimento de onda e amplitude:
            β_geom = (atm_density_ratio)^(-0.5) × (gravity_ratio)^(0.5)

        Quanto maior a gravidade e menor a densidade atmosférica (Marte),
        maior β_geom → dunas de Marte seriam maiores para o mesmo vento.
        Dividindo, "colapsamos" para o equivalente terrestre.

        Para roughness/TRI: escala com gravity_ratio (peso relativo do grão).
        Slope/aspect_ratio: adimensionais, não escalam.
        """
        if not self.physical_scaling:
            return planet_vec.copy(), {}

        # Fator geométrico
        beta_geom = math.sqrt(abs(gravity_ratio)) / math.sqrt(max(abs(atm_density_ratio), 1e-10))

        scaled = planet_vec.copy().astype(np.float64)
        scaling_map: dict[str, float] = {}

        geometric_features = {"wavelength_m", "roughness_rms_m", "relief_m"}
        gravity_features = {"tri", "curvature_mean"}

        for i, name in enumerate(self.feature_names):
            if name in geometric_features:
                # Divide pelo fator: "quanto deveria medir na Terra"
                scaled[i] = planet_vec[i] / beta_geom
                scaling_map[name] = 1.0 / beta_geom
            elif name in gravity_features:
                scaled[i] = planet_vec[i] * gravity_ratio
                scaling_map[name] = gravity_ratio
            else:
                scaling_map[name] = 1.0

        return scaled, scaling_map

    # ------------------------------------------------------------------
    # Normalização e distâncias
    # ------------------------------------------------------------------

    def _normalize_pair(
        self, e: np.ndarray, p: np.ndarray
    ) -> tuple[np.ndarray, np.ndarray]:
        """Normaliza com scaler ajustado; fallback para Z-score."""
        if self._scaler is not None:
            X = np.vstack([e.reshape(1, -1), p.reshape(1, -1)])
            X_norm = self._scaler.transform(X)
            return X_norm[0], X_norm[1]
        # Fallback: normaliza pelo máximo de cada par
        eps = 1e-10
        mx = np.maximum(np.abs(e), np.abs(p)) + eps
        return e / mx, p / mx

    def _cosine_weighted(self, a: np.ndarray, b: np.ndarray) -> float:
        """Similaridade de cosseno ponderada pelos pesos das features."""
        wa = a * self.weights
        wb = b * self.weights
        num = float(np.dot(wa, wb))
        den = float(np.linalg.norm(wa) * np.linalg.norm(wb))
        if den < 1e-12:
            return 0.0
        return max(0.0, min(1.0, num / den))

    def _ref_to_array(self, ref: dict) -> np.ndarray:
        """Converte dicionário de referência para array numpy."""
        return np.array(
            [float(ref.get(n, 0.0) or 0.0) for n in self.feature_names],
            dtype=np.float64,
        )
