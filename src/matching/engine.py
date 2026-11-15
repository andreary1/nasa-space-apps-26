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
métricas geométricas (λ, H, espaçamento) pelo fator de Bagnold:

    β = (ρ_a_earth / ρ_a_planet)^0.5 × (g_planet / g_earth)^0.5

Comprimentos dividem por β; densidade por área multiplica por β².

Dados ausentes
--------------
Nada é preenchido com zero ou valor padrão. Um atributo ausente (NaN) no sítio
terrestre OU na referência é simplesmente excluído da comparação daquele par: os
pesos dos atributos restantes são renormalizados e o resultado informa quais
atributos foram usados, quais faltaram e a cobertura (fração do peso total usada).
Abaixo de ``min_coverage`` o par não recebe score.

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

from src.shared.constants import MIN_FEATURE_COVERAGE

log = logging.getLogger(__name__)


def _clean(values, ndigits: int = 4) -> list[Optional[float]]:
    """NaN -> None (JSON válido)."""
    return [None if not math.isfinite(v) else round(float(v), ndigits) for v in values]


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
    cosine_similarity: Optional[float]   # 0–1; None se só havia atributos circulares
    similarity_score: float       # score final 0–1 (1 = idêntico)
    rank: int = 0                 # posição no ranking

    # Qualidade dos dados desta comparação
    features_used: list[str] = field(default_factory=list)
    features_missing_earth: list[str] = field(default_factory=list)
    features_missing_reference: list[str] = field(default_factory=list)
    coverage: float = 1.0         # fração do peso total efetivamente usada

    # Detalhamento por feature
    feature_contributions: dict[str, float] = field(default_factory=dict)
    physical_scaling_applied: dict[str, float] = field(default_factory=dict)
    effective_weights: dict[str, float] = field(default_factory=dict)

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
            "cosine_similarity": None if self.cosine_similarity is None else round(self.cosine_similarity, 6),
            "similarity_score": round(self.similarity_score, 6),
            "rank": self.rank,
            "coverage": round(self.coverage, 4),
            "features_used": self.features_used,
            "features_missing_earth": self.features_missing_earth,
            "features_missing_reference": self.features_missing_reference,
            "feature_contributions": {k: round(v, 6) for k, v in self.feature_contributions.items()},
            "physical_scaling_applied": self.physical_scaling_applied,
            "effective_weights": self.effective_weights,
            "earth_vector": _clean(self.earth_vector),
            "planet_vector_scaled": _clean(self.planet_vector_scaled),
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
       completo (Terra + referências já escalonadas).
    3. Considera só os atributos presentes nos dois lados e renormaliza os pesos.
    4. Distância Euclidiana ponderada (diferença angular mínima para atributos
       circulares) e similaridade de cosseno (atributos não circulares).
    5. Score final = 60% exp(-k·d) + 40% cosseno.
    """

    def __init__(
        self,
        feature_weights: dict[str, float],
        feature_names: list[str] = None,
        physical_scaling: bool = True,
        geometric_features: tuple[str, ...] = (),
        areal_features: tuple[str, ...] = (),
        circular_features: dict[str, float] | None = None,
        min_coverage: float = MIN_FEATURE_COVERAGE,
    ):
        """
        feature_weights   : nome_feature → peso (normalizados para soma=1)
        feature_names     : ordem das features (padrão: a de feature_weights)
        physical_scaling  : se True, aplica Bagnold às features abaixo
        geometric_features: comprimentos (m): dividem por β
        areal_features    : densidades por área: multiplicam por β²
        circular_features : nome → período em graus (ex.: azimute axial = 180)
        min_coverage      : cobertura mínima de peso para pontuar um par
        """
        self.feature_names = feature_names or list(feature_weights.keys())
        raw_w = np.array([feature_weights.get(n, 0.0) for n in self.feature_names])
        if (not len(raw_w) or len(set(self.feature_names)) != len(self.feature_names)
                or not np.isfinite(raw_w).all() or (raw_w < 0).any() or raw_w.sum() <= 0):
            raise ValueError('pesos devem ser finitos, não negativos, com soma positiva e nomes únicos')
        if not math.isfinite(min_coverage) or not 0 <= min_coverage <= 1:
            raise ValueError('min_coverage deve estar entre 0 e 1')
        self.weights = raw_w / raw_w.sum() if raw_w.sum() > 0 else raw_w
        self.physical_scaling = physical_scaling
        self.geometric_features = set(geometric_features)
        self.areal_features = set(areal_features)
        self.circular_features = dict(circular_features or {})
        self.min_coverage = min_coverage
        self._scaler: Optional[MinMaxScaler] = None
        self.skipped: list[dict] = []       # pares não pontuados, com o motivo

        unknown = (self.geometric_features | self.areal_features | set(self.circular_features)) - set(self.feature_names)
        if unknown:
            raise ValueError(f"features desconhecidas na configuração do motor: {sorted(unknown)}")
        if self.geometric_features & self.areal_features:
            raise ValueError('uma feature não pode ser comprimento e densidade por área ao mesmo tempo')
        if any(not math.isfinite(period) or period <= 0 for period in self.circular_features.values()):
            raise ValueError('períodos circulares devem ser positivos e finitos')

    def _array(self, values):
        from numbers import Real
        raw = np.asarray(values, dtype=object)
        if raw.shape != (len(self.feature_names),):
            raise ValueError('vetor incompatível com a ordem/tamanho das features')
        return np.array([float(value) if isinstance(value, Real) and not isinstance(value, (bool, np.bool_))
                         and math.isfinite(value) else np.nan for value in raw], dtype=np.float64)

    # ------------------------------------------------------------------
    # Ajuste do scaler
    # ------------------------------------------------------------------

    def fit(self, all_vectors: list[np.ndarray]) -> "MatchingEngine":
        """Ajusta MinMaxScaler (NaN é ignorado no ajuste e preservado na transformação)."""
        if not all_vectors:
            return self
        import warnings
        data = np.vstack([self._array(vector) for vector in all_vectors])
        with warnings.catch_warnings():
            warnings.filterwarnings('ignore', message='All-NaN slice encountered', category=RuntimeWarning)
            self._scaler = MinMaxScaler().fit(data)
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
        gravity_ratio: Optional[float] = None,
        atm_density_ratio: Optional[float] = None,
    ) -> Optional[MatchResult]:
        """
        Compara um par. Retorna None se a cobertura de atributos disponíveis
        for menor que ``min_coverage`` (não há dado suficiente para pontuar).
        """
        earth_vec, planet_vec = self._array(earth_vec), self._array(planet_vec)
        # 1. Escalonamento físico
        scaled_planet, scaling_map = self._apply_physical_scaling(
            planet_vec, gravity_ratio, atm_density_ratio
        )

        # 2. Quais atributos existem nos dois lados?
        ok_e, ok_p = np.isfinite(earth_vec), np.isfinite(scaled_planet)
        e_norm, p_norm = self._normalize_pair(earth_vec, scaled_planet)
        circular = np.array([name in self.circular_features for name in self.feature_names])
        mask = ok_e & ok_p & (circular | (np.isfinite(e_norm) & np.isfinite(p_norm)))
        coverage = float(self.weights[mask].sum())
        if coverage <= 0 or coverage + 1e-12 < self.min_coverage:
            return None
        w = self.weights[mask] / coverage

        # 3. Normalização e diferenças por atributo
        diff = e_norm - p_norm
        circ = np.zeros(len(self.feature_names), dtype=bool)
        for i, name in enumerate(self.feature_names):
            period = self.circular_features.get(name)
            if period is None or not mask[i]:
                continue
            circ[i] = True
            d = abs(earth_vec[i] - scaled_planet[i]) % period
            diff[i] = min(d, period - d) / (period / 2.0)       # 0 (igual) a 1 (oposto)
        diff = np.where(mask, diff, 0.0)

        # 4. Distância Euclidiana ponderada (só atributos presentes)
        weighted_sq = np.zeros(len(self.feature_names))
        weighted_sq[mask] = w * diff[mask] ** 2
        wed = float(np.sqrt(weighted_sq.sum()))

        # 5. Cosseno nos atributos não circulares presentes
        lin = mask & ~circ
        cos_sim: Optional[float] = None
        if lin.any():
            cos_sim = self._cosine_weighted(np.where(lin, e_norm, 0.0), np.where(lin, p_norm, 0.0), lin)

        # 6. Score final. k usa o nº TOTAL de features, para que a escala do
        #    score não dependa de quantas estavam disponíveis.
        n = len(self.feature_names)
        k = 3.0 / math.sqrt(n)
        euc_score = math.exp(-k * wed)
        similarity_score = euc_score if cos_sim is None else 0.6 * euc_score + 0.4 * cos_sim

        names = self.feature_names
        return MatchResult(
            earth_site_id=earth_site_id,
            planetary_ref_id=planet_ref_id,
            target_body=target_body,
            feature_type=feature_type,
            weighted_euclidean_dist=wed,
            cosine_similarity=cos_sim,
            similarity_score=similarity_score,
            coverage=coverage,
            features_used=[names[i] for i in range(n) if mask[i]],
            features_missing_earth=[names[i] for i in range(n) if not ok_e[i]],
            features_missing_reference=[names[i] for i in range(n) if not ok_p[i]],
            feature_contributions={names[i]: float(weighted_sq[i]) for i in range(n) if mask[i]},
            physical_scaling_applied=scaling_map,
            effective_weights={names[i]: float(self.weights[i] / coverage) for i in range(n) if mask[i]},
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
        Compara todos os sítios terrestres contra todas as referências.

        Pares sem dado suficiente não entram nos resultados: ficam em ``self.skipped``.
        """
        self.skipped = []
        earth_vectors = [(site_id, self._array(vector)) for site_id, vector in earth_vectors]
        ref_arrays = {r["id"]: self._ref_to_array(r) for r in planet_refs}

        if earth_vectors or planet_refs:
            scaled_refs = [
                self._apply_physical_scaling(ref_arrays[r["id"]], r.get("gravity_ratio"), r.get("atm_density_ratio"))[0]
                for r in planet_refs
            ]
            self.fit([v for _, v in earth_vectors] + scaled_refs)

        results: list[MatchResult] = []
        for site_id, e_vec in earth_vectors:
            site_results: list[MatchResult] = []
            for ref in planet_refs:
                p_vec = ref_arrays[ref["id"]]
                mr = self.match_one(
                    earth_vec=e_vec, planet_vec=p_vec,
                    earth_site_id=site_id, planet_ref_id=ref["id"],
                    target_body=target_body, feature_type=feature_type,
                    gravity_ratio=ref.get("gravity_ratio"),
                    atm_density_ratio=ref.get("atm_density_ratio"),
                )
                if mr is None:
                    cov = float(self.weights[np.isfinite(e_vec) & np.isfinite(p_vec)].sum())
                    self.skipped.append({
                        "earth_site_id": site_id, "planetary_ref_id": ref["id"],
                        "coverage": round(cov, 4),
                        "reason": f"cobertura {cov:.0%} < mínimo {self.min_coverage:.0%}",
                        "missing_earth": [self.feature_names[i] for i in np.where(~np.isfinite(e_vec))[0]],
                        "missing_reference": [self.feature_names[i] for i in np.where(~np.isfinite(p_vec))[0]],
                    })
                    log.warning(
                        f"[{feature_type}] {site_id} × {ref['id']}: SEM SCORE — "
                        f"cobertura {cov:.0%} < mínimo {self.min_coverage:.0%}"
                    )
                    continue
                site_results.append(mr)

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
        gravity_ratio: Optional[float],
        atm_density_ratio: Optional[float],
    ) -> tuple[np.ndarray, dict[str, float]]:
        """
        Projeta o vetor planetário no espaço de referência terrestre.

            β = sqrt(g_ratio) / sqrt(atm_density_ratio)

        - features geométricas (comprimentos): valor / β
        - densidade por área: valor × β²
        - demais (azimute, aridez, razões, declividades): inalteradas.
        O mapa retornado tem o fator realmente aplicado a cada feature.
        """
        scaled = planet_vec.copy().astype(np.float64)
        scaling_map = {name: 1.0 for name in self.feature_names}
        if not self.physical_scaling or not (self.geometric_features or self.areal_features):
            return scaled, scaling_map

        if (gravity_ratio is None or atm_density_ratio is None
                or not math.isfinite(gravity_ratio) or not math.isfinite(atm_density_ratio)
                or gravity_ratio <= 0 or atm_density_ratio <= 0):
            raise ValueError(
                "referência sem gravity_ratio/atm_density_ratio: o escalonamento de Bagnold "
                "não pode ser aplicado (e não será substituído por 1.0 em silêncio)"
            )
        beta = math.sqrt(gravity_ratio) / math.sqrt(atm_density_ratio)
        for i, name in enumerate(self.feature_names):
            if name in self.geometric_features:
                scaled[i] = planet_vec[i] / beta
                scaling_map[name] = 1.0 / beta
            elif name in self.areal_features:
                scaled[i] = planet_vec[i] * beta**2
                scaling_map[name] = beta**2
        return scaled, scaling_map

    # ------------------------------------------------------------------
    # Normalização e distâncias
    # ------------------------------------------------------------------

    def _normalize_pair(self, e: np.ndarray, p: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """MinMax (ajustado em fit/match_many). Sem scaler: normaliza pelo máximo do par."""
        if self._scaler is not None:
            X = self._scaler.transform(np.vstack([e.reshape(1, -1), p.reshape(1, -1)]))
            return X[0], X[1]
        mx = np.fmax(np.abs(e), np.abs(p)) + 1e-10
        return e / mx, p / mx

    def _cosine_weighted(self, a: np.ndarray, b: np.ndarray, used: np.ndarray) -> float:
        """Similaridade de cosseno ponderada, só nos atributos ``used``."""
        w = np.where(used, self.weights, 0.0)
        wa, wb = a * w, b * w
        den = float(np.linalg.norm(wa) * np.linalg.norm(wb))
        if den < 1e-12:
            return 0.0
        return max(0.0, min(1.0, float(np.dot(wa, wb)) / den))

    def _ref_to_array(self, ref: dict) -> np.ndarray:
        """Referência -> array; atributo ausente vira NaN (com aviso), nunca 0."""
        vals, faltando = [], []
        for n in self.feature_names:
            v = ref.get(n)
            if n in ref.get('non_comparable_features', []):
                v = None
            if isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v):
                vals.append(float(v))
            else:
                vals.append(np.nan)
                faltando.append(n)
        if faltando:
            log.warning(f"referência '{ref.get('id')}': atributos ausentes {faltando}")
        return np.array(vals, dtype=np.float64)
