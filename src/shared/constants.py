"""
Constantes físicas e parâmetros planetários para normalização e matching.

Contrato de Métricas de Crateras:
  - diametro_m / diameter_m
  - profundidade_m / depth_m
  - razao_dD / depth_diameter_ratio
  - altura_borda_m / rim_height_m
  - razao_borda_D / rim_height_diameter_ratio
  - borda_variacao_m / rim_variation_m
  - borda_raio_cv / rim_radius_cv
  - declividade_parede_media / mean_wall_slope
  - declividade_parede_p90 / wall_slope_p90
  - circularidade / circularity
  - coerencia_borda / rim_coherence

Referências:
  - NASA Planetary Data System (PDS) / LOLA & SLDEM2015
  - Williams, D.R. (2024). Mars & Moon Fact Sheets. NASA NSSDCA.
  - Bagnold, R.A. (1941). The Physics of Blown Sand and Desert Dunes.
"""

from __future__ import annotations
import json
from pathlib import Path

# ---------------------------------------------------------------------------
# Corpos celestes
# ---------------------------------------------------------------------------

EARTH = {
    "name": "Earth",
    "gravity_ms2": 9.807,
    "atm_pressure_pa": 101_325,
    "atm_density_kgm3": 1.225,
    "mean_radius_km": 6_371.0,
}

MARS = {
    "name": "Mars",
    "gravity_ms2": 3.721,
    "atm_pressure_pa": 636,
    "atm_density_kgm3": 0.020,
    "mean_radius_km": 3_389.5,
    "gravity_ratio": 3.721 / 9.807,       # ≈ 0.3794
    "atm_pressure_ratio": 636 / 101_325,  # ≈ 0.00628
    "atm_density_ratio": 0.020 / 1.225,  # ≈ 0.0163
}

MOON = {
    "name": "Moon",
    "gravity_ms2": 1.620,
    "atm_pressure_pa": 3e-10,
    "atm_density_kgm3": 2e-14,
    "mean_radius_km": 1_737.4,
    "gravity_ratio": 1.620 / 9.807,
    "atm_pressure_ratio": 3e-10 / 101_325,
    "atm_density_ratio": 2e-14 / 1.225,
}

# ---------------------------------------------------------------------------
# Pesos padrão para matching de DUNAS (Terra ↔ Marte)
# ---------------------------------------------------------------------------
DUNE_FEATURE_WEIGHTS = {
    "mean_height":               0.15,   # altura_media
    "height_p90":                0.15,   # altura_p90
    "wavelength":                0.20,   # comprimento_onda
    "crest_azimuth":             0.10,   # orientacao_azimute
    "dune_density":              0.15,   # densidade_dunas
    "mean_spacing":              0.15,   # espacamento_medio
    "aridity_index":             0.10,   # indice_aridez
}

# Aliases de nomes de campos de dunas (português -> canônico)
DUNE_FIELD_ALIASES = {
    "altura_media": "mean_height",
    "altura_p90": "height_p90",
    "comprimento_onda": "wavelength",
    "orientacao_azimute": "crest_azimuth",
    "sentido_vento_provavel": "probable_wind_direction",
    "densidade_dunas": "dune_density",
    "espacamento_medio": "mean_spacing",
    "indice_aridez": "aridity_index",
}

# ---------------------------------------------------------------------------
# Pesos padrão para matching de CRATERAS (Terra ↔ Lua)
# Baseado nos 11 atributos morfométricos oficiais
# ---------------------------------------------------------------------------
CRATER_FEATURE_WEIGHTS = {
    "diameter_m":                0.10,   # diametro_m
    "depth_m":                   0.12,   # profundidade_m
    "depth_diameter_ratio":      0.15,   # razao_dD
    "rim_height_m":              0.08,   # altura_borda_m
    "rim_height_diameter_ratio": 0.08,   # razao_borda_D
    "rim_variation_m":           0.07,   # borda_variacao_m
    "rim_radius_cv":             0.08,   # borda_raio_cv
    "mean_wall_slope":           0.12,   # declividade_parede_media
    "wall_slope_p90":            0.10,   # declividade_parede_p90
    "circularity":               0.05,   # circularidade
    "rim_coherence":             0.05,   # coerencia_borda
}

# Mapeamento oficial dos campos da tabela do usuário -> canônico em inglês
CRATER_FIELD_ALIASES = {
    "diametro_m": "diameter_m",
    "profundidade_m": "depth_m",
    "razao_dD": "depth_diameter_ratio",
    "altura_borda_m": "rim_height_m",
    "razao_borda_D": "rim_height_diameter_ratio",
    "borda_variacao_m": "rim_variation_m",
    "borda_raio_cv": "rim_radius_cv",
    "declividade_parede_media": "mean_wall_slope",
    "declividade_parede_p90": "wall_slope_p90",
    "circularidade": "circularity",
    "coerencia_borda": "rim_coherence",
}

# ---------------------------------------------------------------------------
# Referências marcianas — Campos de Dunas (Marte)
# Compilação científica: HiRISE, CTX, Gale Curiosity & MGS TES
# ---------------------------------------------------------------------------
MARS_DUNE_REFERENCES = [
    {
        "id": "namib_dune_gale",
        "name": "Namib Dune — Gale Crater",
        "source": "Curiosity Mastcam / Day & Zimbelman 2017",
        "dune_type": "barchan",
        "mean_height": 5.0,
        "height_p90": 8.0,
        "wavelength": 85.0,
        "crest_azimuth": 170.0,
        "dune_density": 8.5,
        "mean_spacing": 90.0,
        "aridity_index": 0.0,
        "gravity_ratio": MARS["gravity_ratio"],
        "atm_density_ratio": MARS["atm_density_ratio"],
    },
    {
        "id": "bagnold_dunes_gale",
        "name": "Bagnold Dunes Field (MSL)",
        "source": "Bridges et al. 2017; Ewing et al. 2017",
        "dune_type": "barchanoid",
        "mean_height": 6.5,
        "height_p90": 12.0,
        "wavelength": 90.0,
        "crest_azimuth": 165.0,
        "dune_density": 11.0,
        "mean_spacing": 95.0,
        "aridity_index": 0.0,
        "gravity_ratio": MARS["gravity_ratio"],
        "atm_density_ratio": MARS["atm_density_ratio"],
    },
    {
        "id": "nili_patera",
        "name": "Nili Patera Dune Field",
        "source": "NASA/HiRISE; Ayoub et al. 2014; S21",
        "dune_type": "barchanoid_ridge",
        "mean_height": 22.4,
        "height_p90": 31.0,
        "wavelength": 120.0,
        "crest_azimuth": 155.0,
        "dune_density": 7.0,
        "mean_spacing": 130.0,
        "aridity_index": 0.0,
        "gravity_ratio": MARS["gravity_ratio"],
        "atm_density_ratio": MARS["atm_density_ratio"],
    },
    {
        "id": "meroe_patera",
        "name": "Meroe Patera Dunes",
        "source": "UK Space Agency / MRO CTX / S21",
        "dune_type": "barchanoid",
        "mean_height": 17.5,
        "height_p90": 24.0,
        "wavelength": 110.0,
        "crest_azimuth": 160.0,
        "dune_density": 6.5,
        "mean_spacing": 115.0,
        "aridity_index": 0.0,
        "gravity_ratio": MARS["gravity_ratio"],
        "atm_density_ratio": MARS["atm_density_ratio"],
    },
    {
        "id": "proctor_crater",
        "name": "Proctor Crater Dark Dunes",
        "source": "Fenton et al. 2005; USGS S15",
        "dune_type": "transverse_complex",
        "mean_height": 15.0,
        "height_p90": 26.0,
        "wavelength": 180.0,
        "crest_azimuth": 140.0,
        "dune_density": 4.5,
        "mean_spacing": 190.0,
        "aridity_index": 0.0,
        "gravity_ratio": MARS["gravity_ratio"],
        "atm_density_ratio": MARS["atm_density_ratio"],
    },
]

# ---------------------------------------------------------------------------
# Referências lunares — 9 Alvos Oficiais (LOLA RDR / SLDEM2015)
# ---------------------------------------------------------------------------
MOON_CRATER_REFERENCES = [
    {
        "id": "shackleton",
        "name": "Shackleton (Polo Sul Lunar - Artemis)",
        "source": "LOLA RDR (89.67°S 129.78°E)",
        "diameter_m": 20924.0,
        "depth_m": 3970.8,
        "depth_diameter_ratio": 0.1898,
        "rim_height_m": 1312.9,
        "rim_height_diameter_ratio": 0.0627,
        "rim_variation_m": 660.8,
        "rim_radius_cv": 0.019,
        "mean_wall_slope": 30.3,
        "wall_slope_p90": 33.6,
        "circularity": 0.994,
        "rim_coherence": 0.972,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "de_gerlache",
        "name": "De Gerlache (Polo Sul)",
        "source": "LOLA RDR (88.48°S 88.34°W)",
        "diameter_m": 32612.0,
        "depth_m": 2797.3,
        "depth_diameter_ratio": 0.0858,
        "rim_height_m": 688.5,
        "rim_height_diameter_ratio": 0.0211,
        "rim_variation_m": 589.4,
        "rim_radius_cv": 0.016,
        "mean_wall_slope": 21.0,
        "wall_slope_p90": 25.0,
        "circularity": 0.992,
        "rim_coherence": 0.917,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "haworth",
        "name": "Haworth (Polo Sul)",
        "source": "LOLA RDR (87.45°S 5.17°W)",
        "diameter_m": 61374.0,
        "depth_m": 3921.2,
        "depth_diameter_ratio": 0.0639,
        "rim_height_m": 1059.7,
        "rim_height_diameter_ratio": 0.0173,
        "rim_variation_m": 684.1,
        "rim_radius_cv": 0.019,
        "mean_wall_slope": 14.5,
        "wall_slope_p90": 18.9,
        "circularity": 0.991,
        "rim_coherence": 0.931,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "faustini",
        "name": "Faustini (Polo Sul)",
        "source": "LOLA RDR (87.18°S 84.31°E)",
        "diameter_m": 45982.0,
        "depth_m": 3048.0,
        "depth_diameter_ratio": 0.0663,
        "rim_height_m": 792.8,
        "rim_height_diameter_ratio": 0.0172,
        "rim_variation_m": 564.8,
        "rim_radius_cv": 0.015,
        "mean_wall_slope": 15.3,
        "wall_slope_p90": 19.1,
        "circularity": 0.992,
        "rim_coherence": 0.944,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "shoemaker",
        "name": "Shoemaker (Polo Sul)",
        "source": "LOLA RDR (88.14°S 44.98°E)",
        "diameter_m": 61200.0,
        "depth_m": 3737.5,
        "depth_diameter_ratio": 0.0611,
        "rim_height_m": 883.7,
        "rim_height_diameter_ratio": 0.0144,
        "rim_variation_m": 605.3,
        "rim_radius_cv": 0.016,
        "mean_wall_slope": 14.2,
        "wall_slope_p90": 18.5,
        "circularity": 0.991,
        "rim_coherence": 0.944,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "censorinus",
        "name": "Censorinus (Cratera Simples Jovem)",
        "source": "SLDEM2015 (0.42°S 32.69°E)",
        "diameter_m": 4139.0,
        "depth_m": 984.0,
        "depth_diameter_ratio": 0.2378,
        "rim_height_m": 298.2,
        "rim_height_diameter_ratio": 0.0720,
        "rim_variation_m": 121.2,
        "rim_radius_cv": 0.012,
        "mean_wall_slope": 36.8,
        "wall_slope_p90": 41.9,
        "circularity": 0.998,
        "rim_coherence": 1.000,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "bessel",
        "name": "Bessel (Mare Serenitatis)",
        "source": "SLDEM2015 (21.73°N 17.92°E)",
        "diameter_m": 15311.0,
        "depth_m": 1747.6,
        "depth_diameter_ratio": 0.1141,
        "rim_height_m": 427.3,
        "rim_height_diameter_ratio": 0.0279,
        "rim_variation_m": 255.3,
        "rim_radius_cv": 0.009,
        "mean_wall_slope": 25.9,
        "wall_slope_p90": 35.1,
        "circularity": 0.997,
        "rim_coherence": 1.000,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "alfraganus",
        "name": "Alfraganus",
        "source": "SLDEM2015 (5.42°S 18.97°E)",
        "diameter_m": 20591.0,
        "depth_m": 3500.6,
        "depth_diameter_ratio": 0.1700,
        "rim_height_m": 935.2,
        "rim_height_diameter_ratio": 0.0454,
        "rim_variation_m": 584.6,
        "rim_radius_cv": 0.013,
        "mean_wall_slope": 31.6,
        "wall_slope_p90": 34.9,
        "circularity": 0.996,
        "rim_coherence": 1.000,
        "gravity_ratio": MOON["gravity_ratio"],
    },
    {
        "id": "aristarchus",
        "name": "Aristarchus (Cratera Complexa Jovem)",
        "source": "SLDEM2015 (23.73°N 47.49°W)",
        "diameter_m": 40481.0,
        "depth_m": 3109.0,
        "depth_diameter_ratio": 0.0768,
        "rim_height_m": 837.6,
        "rim_height_diameter_ratio": 0.0207,
        "rim_variation_m": 577.5,
        "rim_radius_cv": 0.011,
        "mean_wall_slope": 17.5,
        "wall_slope_p90": 29.3,
        "circularity": 0.994,
        "rim_coherence": 0.944,
        "gravity_ratio": MOON["gravity_ratio"],
    },
]
