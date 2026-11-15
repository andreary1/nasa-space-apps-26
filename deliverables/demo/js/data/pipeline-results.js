// GERADO por scripts/export_pipeline_to_demo.py — não edite à mão.
// O demo só exibe estes resultados; nenhum score é calculado no navegador.
export const PIPELINE = {
 "meta": {
  "source_file": "matching_report_v2.json",
  "generated_at": "2026-11-15 16:12:04 UTC",
  "pipeline_version": "1.0.0",
  "beta": 4.82,
  "min_coverage": 0.6,
  "feature_keys": {
   "dune": [
    "mean_height",
    "height_p90",
    "wavelength",
    "crest_azimuth",
    "dune_density",
    "mean_spacing",
    "aridity_index"
   ],
   "crater": [
    "diameter_m",
    "depth_m",
    "depth_diameter_ratio",
    "rim_height_m",
    "rim_height_diameter_ratio",
    "rim_variation_m",
    "rim_radius_cv",
    "mean_wall_slope",
    "wall_slope_p90",
    "circularity",
    "rim_coherence"
   ]
  },
  "notes": [
   "Atributos de origem 'catalogo' foram calculados fora deste repositório (o script gerador não está nele) e não são reproduzíveis aqui.",
   "O índice de aridez (P/ET0) não é calculável de um DEM: vem sempre do catálogo (NASA POWER) e, se ausente, o atributo fica indisponível.",
   "Referências de Marte usam aridity_index = 0.0 por convenção (P/ET0 não é definido para Marte; assume-se hiperárido).",
   "Métricas de dunas calculadas de raster (método novo) foram validadas apenas com DEM sintético; ainda não há raster de dunas no repositório.",
   "Crateras: a normalização das declividades pela gravidade lunar NÃO está implementada (o contrato não define a fórmula); a geometria é preservada.",
   "Escalonamento de Bagnold aplicado a Marte com β = 4.82 (comprimentos ÷ β; densidade × β²). O contrato cita β ≈ 2,82, mas a fórmula do próprio contrato com as constantes do projeto resulta em ≈ 4,82."
  ]
 },
 "moon_refs": [
  {
   "id": "shackleton",
   "name": "Shackleton (Polo Sul Lunar - Artemis)",
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
   "rim_coherence": 0.972
  },
  {
   "id": "de_gerlache",
   "name": "De Gerlache (Polo Sul)",
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
   "rim_coherence": 0.917
  },
  {
   "id": "haworth",
   "name": "Haworth (Polo Sul)",
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
   "rim_coherence": 0.931
  },
  {
   "id": "faustini",
   "name": "Faustini (Polo Sul)",
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
   "rim_coherence": 0.944
  },
  {
   "id": "shoemaker",
   "name": "Shoemaker (Polo Sul)",
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
   "rim_coherence": 0.944
  },
  {
   "id": "censorinus",
   "name": "Censorinus (Cratera Simples Jovem)",
   "diameter_m": 4139.0,
   "depth_m": 984.0,
   "depth_diameter_ratio": 0.2378,
   "rim_height_m": 298.2,
   "rim_height_diameter_ratio": 0.072,
   "rim_variation_m": 121.2,
   "rim_radius_cv": 0.012,
   "mean_wall_slope": 36.8,
   "wall_slope_p90": 41.9,
   "circularity": 0.998,
   "rim_coherence": 1.0
  },
  {
   "id": "bessel",
   "name": "Bessel (Mare Serenitatis)",
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
   "rim_coherence": 1.0
  },
  {
   "id": "alfraganus",
   "name": "Alfraganus",
   "diameter_m": 20591.0,
   "depth_m": 3500.6,
   "depth_diameter_ratio": 0.17,
   "rim_height_m": 935.2,
   "rim_height_diameter_ratio": 0.0454,
   "rim_variation_m": 584.6,
   "rim_radius_cv": 0.013,
   "mean_wall_slope": 31.6,
   "wall_slope_p90": 34.9,
   "circularity": 0.996,
   "rim_coherence": 1.0
  },
  {
   "id": "aristarchus",
   "name": "Aristarchus (Cratera Complexa Jovem)",
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
   "rim_coherence": 0.944
  },
  {
   "id": "cabeus",
   "name": "Cabeus (Polo Sul - LCROSS)",
   "diameter_m": 100600.0,
   "depth_m": 3751.8,
   "depth_diameter_ratio": 0.0373,
   "rim_height_m": 484.8,
   "rim_height_diameter_ratio": 0.0048,
   "rim_variation_m": 1633.6,
   "rim_radius_cv": 0.035,
   "mean_wall_slope": 12.4,
   "wall_slope_p90": 35.0,
   "circularity": 0.94,
   "rim_coherence": 0.88
  },
  {
   "id": "copernicus",
   "name": "Copernicus (Cratera Complexa)",
   "diameter_m": 96100.0,
   "depth_m": 3525.2,
   "depth_diameter_ratio": 0.0367,
   "rim_height_m": 759.2,
   "rim_height_diameter_ratio": 0.0079,
   "rim_variation_m": 235.0,
   "rim_radius_cv": 0.035,
   "mean_wall_slope": 13.7,
   "wall_slope_p90": 29.3,
   "circularity": 0.94,
   "rim_coherence": 0.88
  },
  {
   "id": "tycho",
   "name": "Tycho (Cratera com Raios de Ejecta)",
   "diameter_m": 85300.0,
   "depth_m": 4348.0,
   "depth_diameter_ratio": 0.051,
   "rim_height_m": 657.5,
   "rim_height_diameter_ratio": 0.0077,
   "rim_variation_m": 470.0,
   "rim_radius_cv": 0.035,
   "mean_wall_slope": 15.3,
   "wall_slope_p90": 31.1,
   "circularity": 0.94,
   "rim_coherence": 0.88
  }
 ],
 "mars_refs": [
  {
   "id": "namib_dune_gale",
   "name": "Namib Dune — Gale Crater",
   "mean_height": 5.0,
   "height_p90": 8.0,
   "wavelength": 85.0,
   "crest_azimuth": 170.0,
   "dune_density": 8.5,
   "mean_spacing": 90.0,
   "aridity_index": 0.0
  },
  {
   "id": "bagnold_dunes_gale",
   "name": "Bagnold Dunes Field (MSL)",
   "mean_height": 6.5,
   "height_p90": 12.0,
   "wavelength": 90.0,
   "crest_azimuth": 165.0,
   "dune_density": 11.0,
   "mean_spacing": 95.0,
   "aridity_index": 0.0
  },
  {
   "id": "nili_patera",
   "name": "Nili Patera Dune Field",
   "mean_height": 22.4,
   "height_p90": 31.0,
   "wavelength": 120.0,
   "crest_azimuth": 155.0,
   "dune_density": 7.0,
   "mean_spacing": 130.0,
   "aridity_index": 0.0
  },
  {
   "id": "meroe_patera",
   "name": "Meroe Patera Dunes",
   "mean_height": 17.5,
   "height_p90": 24.0,
   "wavelength": 110.0,
   "crest_azimuth": 160.0,
   "dune_density": 6.5,
   "mean_spacing": 115.0,
   "aridity_index": 0.0
  },
  {
   "id": "proctor_crater",
   "name": "Proctor Crater Dark Dunes",
   "mean_height": 15.0,
   "height_p90": 26.0,
   "wavelength": 180.0,
   "crest_azimuth": 140.0,
   "dune_density": 4.5,
   "mean_spacing": 190.0,
   "aridity_index": 0.0
  },
  {
   "id": "olympia_undae",
   "name": "Olympia Undae (Erg Circumpolar Norte)",
   "mean_height": 12.0,
   "height_p90": 18.0,
   "wavelength": 120.0,
   "crest_azimuth": 85.0,
   "dune_density": 14.5,
   "mean_spacing": 125.0,
   "aridity_index": 0.0
  },
  {
   "id": "kaiser_crater",
   "name": "Kaiser Crater (Megadunas com Ravinas)",
   "mean_height": 25.0,
   "height_p90": 38.0,
   "wavelength": 180.0,
   "crest_azimuth": 135.0,
   "dune_density": 6.0,
   "mean_spacing": 190.0,
   "aridity_index": 0.0
  },
  {
   "id": "hellespontus",
   "name": "Hellespontus Montes (Dunas Barcanoides)",
   "mean_height": 16.0,
   "height_p90": 24.0,
   "wavelength": 140.0,
   "crest_azimuth": 150.0,
   "dune_density": 8.0,
   "mean_spacing": 145.0,
   "aridity_index": 0.0
  }
 ],
 "sites": {
  "erg_chebbi": {
   "kind": "dune",
   "name": "erg_chebbi",
   "category": null,
   "lat": 31.15,
   "lon": -3.983,
   "metrics": {
    "mean_height": 26.389140021504115,
    "height_p90": 62.72071951180619,
    "wavelength": 1631.8229510704678,
    "crest_azimuth": 80.61143331379179,
    "dune_density": 0.16117484648242877,
    "mean_spacing": 1564.1709231713926,
    "aridity_index": null
   },
   "dq": {
    "source": "raster",
    "provenance": {
     "mean_height": "raster:dune_morphometrics",
     "height_p90": "raster:dune_morphometrics",
     "wavelength": "raster:dune_morphometrics",
     "crest_azimuth": "raster:dune_morphometrics",
     "dune_density": "raster:dune_morphometrics",
     "mean_spacing": "raster:dune_morphometrics",
     "aridity_index": "ausente"
    },
    "issues": [
     "aridity_index: INDISPONÍVEL — índice de aridez (P/ET0) exige climatologia (ex.: NASA POWER), não um DEM"
    ],
    "features_missing": [
     "aridity_index"
    ]
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "kaiser_crater",
     "rank": 1,
     "score": 0.374558,
     "wed": 0.591124,
     "cosine": 0.16904,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 26.3891,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 0.028166
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 62.7207,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 0.062204
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1631.823,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.103861
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 80.6114,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.040578
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1612,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.028478
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1564.1709,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.086141
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "proctor_crater",
     "rank": 2,
     "score": 0.362505,
     "wed": 0.596922,
     "cosine": 0.143936,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 26.3891,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.033946
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 62.7207,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.067979
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1631.823,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.103861
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 80.6114,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.048381
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1612,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.016007
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1564.1709,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.086141
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 3,
     "score": 0.335816,
     "wed": 0.634731,
     "cosine": 0.109206,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 26.3891,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.029617
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 62.7207,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.065542
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1631.823,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.105489
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 80.6114,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.075908
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1612,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.038775
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1564.1709,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.087553
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 4,
     "score": 0.322391,
     "wed": 0.644181,
     "cosine": 0.083426,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 26.3891,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 0.032451
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 62.7207,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.068967
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1631.823,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.105761
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 80.6114,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 0.086455
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1612,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.033428
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1564.1709,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.087908
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.318461,
     "wed": 0.641216,
     "cosine": 0.071169,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 26.3891,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.033344
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 62.7207,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.068967
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1631.823,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.104945
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 80.6114,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.066046
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1612,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.050657
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1564.1709,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.087199
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "ibiraba": {
   "kind": "dune",
   "name": "ibiraba",
   "category": null,
   "lat": -10.71,
   "lon": -42.8,
   "metrics": {
    "mean_height": 6.7,
    "height_p90": 13.1,
    "wavelength": 345.0,
    "crest_azimuth": 115.0,
    "dune_density": 4.56,
    "mean_spacing": 488.0,
    "aridity_index": 0.237
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "mean_height": "catalogo:altura_media (calculado fora deste repositório)",
     "height_p90": "catalogo:altura_p90 (calculado fora deste repositório)",
     "wavelength": "catalogo:comprimento_onda (calculado fora deste repositório)",
     "crest_azimuth": "catalogo:orientacao_azimute (calculado fora deste repositório)",
     "dune_density": "catalogo:densidade_dunas (calculado fora deste repositório)",
     "mean_spacing": "catalogo:espacamento_medio (calculado fora deste repositório)",
     "aridity_index": "catalogo:indice_aridez (calculado fora deste repositório)"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "proctor_crater",
     "rank": 1,
     "score": 0.533152,
     "wed": 0.206347,
     "cosine": 0.145808,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.7,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.000726
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 13.1,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.001106
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 345.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.00348
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 115.0,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.007716
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.56,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.013218
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 488.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.00671
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.237,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.009623
      }
     ]
    },
    {
     "ref_id": "kaiser_crater",
     "rank": 2,
     "score": 0.531606,
     "wed": 0.222317,
     "cosine": 0.163244,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.7,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 0.000129
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 13.1,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 0.000507
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 345.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.00348
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 115.0,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.004938
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.56,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.024037
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 488.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.00671
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.237,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.009623
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 3,
     "score": 0.487155,
     "wed": 0.272637,
     "cosine": 0.116772,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.7,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.000238
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 13.1,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.000828
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 345.0,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.003767
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 115.0,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.019753
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.56,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.033034
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 488.0,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.007088
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.237,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.009623
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 4,
     "score": 0.478064,
     "wed": 0.275208,
     "cosine": 0.09725,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.7,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 0.000531
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 13.1,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.001228
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 345.0,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.003816
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 115.0,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 0.025
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.56,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.028357
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 488.0,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.007184
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.237,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.009623
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.470204,
     "wed": 0.284148,
     "cosine": 0.088671,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.7,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.000645
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 13.1,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.001228
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 345.0,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.00367
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 115.0,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.015123
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.56,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.043458
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 488.0,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.006993
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.237,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.009623
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "jericoacoara": {
   "kind": "dune",
   "name": "jericoacoara",
   "category": null,
   "lat": -2.825,
   "lon": -40.49,
   "metrics": {
    "mean_height": 6.0,
    "height_p90": 10.7,
    "wavelength": 297.0,
    "crest_azimuth": 173.0,
    "dune_density": 3.99,
    "mean_spacing": 392.0,
    "aridity_index": 0.468
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "mean_height": "catalogo:altura_media (calculado fora deste repositório)",
     "height_p90": "catalogo:altura_p90 (calculado fora deste repositório)",
     "wavelength": "catalogo:comprimento_onda (calculado fora deste repositório)",
     "crest_azimuth": "catalogo:orientacao_azimute (calculado fora deste repositório)",
     "dune_density": "catalogo:densidade_dunas (calculado fora deste repositório)",
     "mean_spacing": "catalogo:espacamento_medio (calculado fora deste repositório)",
     "aridity_index": "catalogo:indice_aridez (calculado fora deste repositório)"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "proctor_crater",
     "rank": 1,
     "score": 0.48174,
     "wed": 0.268247,
     "cosine": 0.097739,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.0,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.00047
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 10.7,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.000524
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 297.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.002479
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 173.0,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.013444
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 3.99,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.013369
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 392.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.004146
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.468,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.037524
      }
     ]
    },
    {
     "ref_id": "kaiser_crater",
     "rank": 2,
     "score": 0.473795,
     "wed": 0.293941,
     "cosine": 0.109652,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.0,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 3.7e-05
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 10.7,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 0.000148
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 297.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.002479
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 173.0,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.017827
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 3.99,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.024241
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 392.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.004146
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.468,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.037524
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 3,
     "score": 0.464973,
     "wed": 0.276401,
     "cosine": 0.066007,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.0,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 0.000317
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 10.7,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000609
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 297.0,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.002764
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 173.0,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 0.002086
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 3.99,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.028578
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 392.0,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.004519
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.468,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.037524
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 4,
     "score": 0.464895,
     "wed": 0.287062,
     "cosine": 0.078985,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.0,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.000103
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 10.7,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.000339
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 297.0,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.002722
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 173.0,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.004
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 3.99,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.033273
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 392.0,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.004443
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.468,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.037524
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.446453,
     "wed": 0.30953,
     "cosine": 0.060129,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.0,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.000405
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 10.7,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000609
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 297.0,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.00264
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 173.0,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.006531
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 3.99,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.043732
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 392.0,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.004368
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.468,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.037524
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "lencois": {
   "kind": "dune",
   "name": "lencois",
   "category": null,
   "lat": -2.6,
   "lon": -43.0,
   "metrics": {
    "mean_height": 6.3,
    "height_p90": 11.0,
    "wavelength": 312.0,
    "crest_azimuth": 161.0,
    "dune_density": 6.58,
    "mean_spacing": 367.0,
    "aridity_index": 0.764
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "mean_height": "catalogo:altura_media (calculado fora deste repositório)",
     "height_p90": "catalogo:altura_p90 (calculado fora deste repositório)",
     "wavelength": "catalogo:comprimento_onda (calculado fora deste repositório)",
     "crest_azimuth": "catalogo:orientacao_azimute (calculado fora deste repositório)",
     "dune_density": "catalogo:densidade_dunas (calculado fora deste repositório)",
     "mean_spacing": "catalogo:espacamento_medio (calculado fora deste repositório)",
     "aridity_index": "catalogo:indice_aridez (calculado fora deste repositório)"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "proctor_crater",
     "rank": 1,
     "score": 0.432902,
     "wed": 0.354463,
     "cosine": 0.078707,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.000573
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.0,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.000585
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 312.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.002774
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 161.0,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.005444
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 6.58,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.012689
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 367.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.003579
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.764,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.1
      }
     ]
    },
    {
     "ref_id": "kaiser_crater",
     "rank": 2,
     "score": 0.42852,
     "wed": 0.371848,
     "cosine": 0.087342,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 7e-05
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.0,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 0.000181
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 312.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.002774
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 161.0,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.008346
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 6.58,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.023322
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 367.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.003579
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.764,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.1
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 3,
     "score": 0.418908,
     "wed": 0.374258,
     "cosine": 0.065996,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.000154
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.0,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.000389
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 312.0,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.003031
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 161.0,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.000444
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 6.58,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.032195
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 367.0,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.003856
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.764,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.1
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 4,
     "score": 0.417895,
     "wed": 0.368335,
     "cosine": 0.056852,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 0.000402
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.0,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000675
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 312.0,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.003075
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 161.0,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 1.2e-05
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 6.58,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.02758
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 367.0,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.003927
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.764,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.1
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.406702,
     "wed": 0.389736,
     "cosine": 0.052554,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.000501
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.0,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000675
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 312.0,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.002944
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 161.0,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.001494
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 6.58,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.042495
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 367.0,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.003785
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.764,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.1
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "rosado": {
   "kind": "dune",
   "name": "rosado",
   "category": null,
   "lat": -5.03,
   "lon": -36.845,
   "metrics": {
    "mean_height": 6.3,
    "height_p90": 11.7,
    "wavelength": 335.0,
    "crest_azimuth": 167.0,
    "dune_density": 4.79,
    "mean_spacing": 377.0,
    "aridity_index": 0.322
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "mean_height": "catalogo:altura_media (calculado fora deste repositório)",
     "height_p90": "catalogo:altura_p90 (calculado fora deste repositório)",
     "wavelength": "catalogo:comprimento_onda (calculado fora deste repositório)",
     "crest_azimuth": "catalogo:orientacao_azimute (calculado fora deste repositório)",
     "dune_density": "catalogo:densidade_dunas (calculado fora deste repositório)",
     "mean_spacing": "catalogo:espacamento_medio (calculado fora deste repositório)",
     "aridity_index": "catalogo:indice_aridez (calculado fora deste repositório)"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "proctor_crater",
     "rank": 1,
     "score": 0.520341,
     "wed": 0.219755,
     "cosine": 0.131692,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.000573
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.7,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.00074
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 335.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.003258
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 167.0,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.009
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.79,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.013157
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 377.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.0038
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.322,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.017763
      }
     ]
    },
    {
     "ref_id": "kaiser_crater",
     "rank": 2,
     "score": 0.511654,
     "wed": 0.248515,
     "cosine": 0.147486,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 7e-05
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.7,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 0.000271
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 335.0,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.003258
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 167.0,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.012642
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.79,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.023955
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 377.0,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.0038
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.322,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.017763
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 3,
     "score": 0.496633,
     "wed": 0.246519,
     "cosine": 0.107369,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.000154
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.7,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.000517
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 335.0,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.003536
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 167.0,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.001778
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.79,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.032938
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 377.0,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.004086
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.322,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.017763
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 4,
     "score": 0.495352,
     "wed": 0.235842,
     "cosine": 0.090351,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 0.000402
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.7,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000841
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 335.0,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.003583
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 167.0,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 0.000605
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.79,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.028268
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 377.0,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.004159
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.322,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.017763
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.474252,
     "wed": 0.271065,
     "cosine": 0.082552,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 6.3,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.000501
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 11.7,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000841
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 335.0,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.003442
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 167.0,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.003568
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 4.79,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.043348
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 377.0,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.004013
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": true,
       "earth": 0.322,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": 0.017763
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "rub_al_khali": {
   "kind": "dune",
   "name": "rub_al_khali",
   "category": null,
   "lat": 20.0,
   "lon": 50.0,
   "metrics": {
    "mean_height": 11.317800378305574,
    "height_p90": 19.62301254964052,
    "wavelength": 792.3675825036651,
    "crest_azimuth": 61.60001367939148,
    "dune_density": 0.20193224805883195,
    "mean_spacing": 678.8200755914056,
    "aridity_index": null
   },
   "dq": {
    "source": "raster",
    "provenance": {
     "mean_height": "raster:dune_morphometrics",
     "height_p90": "raster:dune_morphometrics",
     "wavelength": "raster:dune_morphometrics",
     "crest_azimuth": "raster:dune_morphometrics",
     "dune_density": "raster:dune_morphometrics",
     "mean_spacing": "raster:dune_morphometrics",
     "aridity_index": "ausente"
    },
    "issues": [
     "aridity_index: INDISPONÍVEL — índice de aridez (P/ET0) exige climatologia (ex.: NASA POWER), não um DEM"
    ],
    "features_missing": [
     "aridity_index"
    ]
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "kaiser_crater",
     "rank": 1,
     "score": 0.447489,
     "wed": 0.382111,
     "cosine": 0.146147,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 11.3178,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 0.002356
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 19.623,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 0.002851
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 792.3676,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.023288
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 61.6,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.073903
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.2019,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.028462
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 678.8201,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.015148
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "proctor_crater",
     "rank": 2,
     "score": 0.439217,
     "wed": 0.383605,
     "cosine": 0.127114,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 11.3178,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.004219
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 19.623,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.004188
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 792.3676,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.023288
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 61.6,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.084315
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.2019,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.015994
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 678.8201,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.015148
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 3,
     "score": 0.40427,
     "wed": 0.433387,
     "cosine": 0.093035,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 11.3178,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.002788
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 19.623,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.0036
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 792.3676,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.024063
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 61.6,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.102875
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.2019,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.038756
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 678.8201,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.015744
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 4,
     "score": 0.402937,
     "wed": 0.415902,
     "cosine": 0.071326,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 11.3178,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 0.003703
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 19.623,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.004436
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 792.3676,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.024193
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 61.6,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 0.091338
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.2019,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.03341
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 678.8201,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.015894
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.383628,
     "wed": 0.453511,
     "cosine": 0.062132,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 11.3178,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.004008
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 19.623,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.004436
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 792.3676,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.023803
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 61.6,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.107196
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.2019,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.050635
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 678.8201,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.015594
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "sossusvlei": {
   "kind": "dune",
   "name": "sossusvlei",
   "category": null,
   "lat": -24.727,
   "lon": 15.34,
   "metrics": {
    "mean_height": 52.615404221638926,
    "height_p90": 91.4227337391938,
    "wavelength": 1945.063509298793,
    "crest_azimuth": 78.78294939562693,
    "dune_density": 0.10087050919341231,
    "mean_spacing": 2139.5694530690535,
    "aridity_index": null
   },
   "dq": {
    "source": "raster",
    "provenance": {
     "mean_height": "raster:dune_morphometrics",
     "height_p90": "raster:dune_morphometrics",
     "wavelength": "raster:dune_morphometrics",
     "crest_azimuth": "raster:dune_morphometrics",
     "dune_density": "raster:dune_morphometrics",
     "mean_spacing": "raster:dune_morphometrics",
     "aridity_index": "ausente"
    },
    "issues": [
     "aridity_index: INDISPONÍVEL — índice de aridez (P/ET0) exige climatologia (ex.: NASA POWER), não um DEM"
    ],
    "features_missing": [
     "aridity_index"
    ]
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "kaiser_crater",
     "rank": 1,
     "score": 0.31573,
     "wed": 0.818075,
     "cosine": 0.196077,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 52.6154,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 0.140933
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 91.4227,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 0.144358
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1945.0635,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.148677
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 78.7829,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.043352
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1009,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.028503
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 2139.5695,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.163422
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "proctor_crater",
     "rank": 2,
     "score": 0.298728,
     "wed": 0.828342,
     "cosine": 0.16044,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 52.6154,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.15353
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 91.4227,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.153089
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1945.0635,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.148677
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 78.7829,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.051406
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1009,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.016025
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 2139.5695,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.163422
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 3,
     "score": 0.28032,
     "wed": 0.853261,
     "cosine": 0.130755,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 52.6154,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.144156
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 91.4227,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.14942
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1945.0635,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.150623
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 78.7829,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.079685
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1009,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.038804
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 2139.5695,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.165365
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 4,
     "score": 0.265444,
     "wed": 0.863504,
     "cosine": 0.100149,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 52.6154,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 0.15033
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 91.4227,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.15457
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1945.0635,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.150949
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 78.7829,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 0.090483
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1009,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.033455
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 2139.5695,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.165853
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.25891,
     "wed": 0.861354,
     "cosine": 0.082438,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 52.6154,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.152246
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 91.4227,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.15457
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 1945.0635,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.149973
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 78.7829,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.069573
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.1009,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.05069
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 2139.5695,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.164878
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "white_sands": {
   "kind": "dune",
   "name": "white_sands",
   "category": null,
   "lat": 32.78,
   "lon": -106.32,
   "metrics": {
    "mean_height": 4.716688217531248,
    "height_p90": 9.051339199592062,
    "wavelength": 2349.94816099621,
    "crest_azimuth": 45.22410229726452,
    "dune_density": 0.04023996868055533,
    "mean_spacing": 1593.7874733038466,
    "aridity_index": null
   },
   "dq": {
    "source": "raster",
    "provenance": {
     "mean_height": "raster:dune_morphometrics",
     "height_p90": "raster:dune_morphometrics",
     "wavelength": "raster:dune_morphometrics",
     "crest_azimuth": "raster:dune_morphometrics",
     "dune_density": "raster:dune_morphometrics",
     "mean_spacing": "raster:dune_morphometrics",
     "aridity_index": "ausente"
    },
    "issues": [
     "aridity_index: INDISPONÍVEL — índice de aridez (P/ET0) exige climatologia (ex.: NASA POWER), não um DEM"
    ],
    "features_missing": [
     "aridity_index"
    ]
   },
   "crater_class": null,
   "confidence": null,
   "matches": [
    {
     "ref_id": "proctor_crater",
     "rank": 1,
     "score": 0.310361,
     "wed": 0.651242,
     "cosine": 0.059114,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 4.7167,
       "target": 15.0,
       "target_scaled": 3.1115,
       "scale": 0.20743651432414,
       "contribution": 0.000161
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 9.0513,
       "target": 26.0,
       "target_scaled": 5.3933,
       "scale": 0.20743651432414,
       "contribution": 0.000277
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 2349.9482,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.218483
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 45.2241,
       "target": 140.0,
       "target_scaled": 140.0,
       "scale": 1.0,
       "contribution": 0.099632
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.0402,
       "target": 4.5,
       "target_scaled": 104.5784,
       "scale": 23.23965024982155,
       "contribution": 0.016044
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1593.7875,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.08952
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "kaiser_crater",
     "rank": 2,
     "score": 0.301735,
     "wed": 0.668679,
     "cosine": 0.051581,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 4.7167,
       "target": 25.0,
       "target_scaled": 5.1859,
       "scale": 0.20743651432414,
       "contribution": 1.4e-05
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 9.0513,
       "target": 38.0,
       "target_scaled": 7.8826,
       "scale": 0.20743651432414,
       "contribution": 2.8e-05
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 2349.9482,
       "target": 180.0,
       "target_scaled": 37.3386,
       "scale": 0.20743651432414,
       "contribution": 0.218483
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 45.2241,
       "target": 135.0,
       "target_scaled": 135.0,
       "scale": 1.0,
       "contribution": 0.110558
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.0402,
       "target": 6.0,
       "target_scaled": 139.4379,
       "scale": 23.23965024982155,
       "contribution": 0.028528
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1593.7875,
       "target": 190.0,
       "target_scaled": 39.4129,
       "scale": 0.20743651432414,
       "contribution": 0.08952
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "meroe_patera",
     "rank": 3,
     "score": 0.298795,
     "wed": 0.636248,
     "cosine": 0.017908,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 4.7167,
       "target": 17.5,
       "target_scaled": 3.6301,
       "scale": 0.20743651432414,
       "contribution": 7.4e-05
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 9.0513,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000343
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 2349.9482,
       "target": 110.0,
       "target_scaled": 22.818,
       "scale": 0.20743651432414,
       "contribution": 0.221235
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 45.2241,
       "target": 160.0,
       "target_scaled": 160.0,
       "scale": 1.0,
       "contribution": 0.058356
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.0402,
       "target": 6.5,
       "target_scaled": 151.0577,
       "scale": 23.23965024982155,
       "contribution": 0.033482
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1593.7875,
       "target": 115.0,
       "target_scaled": 23.8552,
       "scale": 0.20743651432414,
       "contribution": 0.091321
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "nili_patera",
     "rank": 4,
     "score": 0.297634,
     "wed": 0.646855,
     "cosine": 0.023721,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 4.7167,
       "target": 22.4,
       "target_scaled": 4.6466,
       "scale": 0.20743651432414,
       "contribution": 0.0
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 9.0513,
       "target": 31.0,
       "target_scaled": 6.4305,
       "scale": 0.20743651432414,
       "contribution": 0.000142
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 2349.9482,
       "target": 120.0,
       "target_scaled": 24.8924,
       "scale": 0.20743651432414,
       "contribution": 0.220841
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 45.2241,
       "target": 155.0,
       "target_scaled": 155.0,
       "scale": 1.0,
       "contribution": 0.067646
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.0402,
       "target": 7.0,
       "target_scaled": 162.6776,
       "scale": 23.23965024982155,
       "contribution": 0.038833
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1593.7875,
       "target": 130.0,
       "target_scaled": 26.9667,
       "scale": 0.20743651432414,
       "contribution": 0.090959
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    },
    {
     "ref_id": "hellespontus",
     "rank": 5,
     "score": 0.291847,
     "wed": 0.66292,
     "cosine": 0.022257,
     "coverage": 0.9,
     "missing_earth": [
      "aridity_index"
     ],
     "missing_reference": [],
     "features": [
      {
       "key": "mean_height",
       "weight": 0.15,
       "used": true,
       "earth": 4.7167,
       "target": 16.0,
       "target_scaled": 3.319,
       "scale": 0.20743651432414,
       "contribution": 0.000122
      },
      {
       "key": "height_p90",
       "weight": 0.15,
       "used": true,
       "earth": 9.0513,
       "target": 24.0,
       "target_scaled": 4.9785,
       "scale": 0.20743651432414,
       "contribution": 0.000343
      },
      {
       "key": "wavelength",
       "weight": 0.2,
       "used": true,
       "earth": 2349.9482,
       "target": 140.0,
       "target_scaled": 29.0411,
       "scale": 0.20743651432414,
       "contribution": 0.220053
      },
      {
       "key": "crest_azimuth",
       "weight": 0.1,
       "used": true,
       "earth": 45.2241,
       "target": 150.0,
       "target_scaled": 150.0,
       "scale": 1.0,
       "contribution": 0.077622
      },
      {
       "key": "dune_density",
       "weight": 0.15,
       "used": true,
       "earth": 0.0402,
       "target": 8.0,
       "target_scaled": 185.9172,
       "scale": 23.23965024982155,
       "contribution": 0.050723
      },
      {
       "key": "mean_spacing",
       "weight": 0.15,
       "used": true,
       "earth": 1593.7875,
       "target": 145.0,
       "target_scaled": 30.0783,
       "scale": 0.20743651432414,
       "contribution": 0.090598
      },
      {
       "key": "aridity_index",
       "weight": 0.1,
       "used": false,
       "earth": null,
       "target": 0.0,
       "target_scaled": 0.0,
       "scale": 1.0,
       "contribution": null
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 8
  },
  "barringer": {
   "kind": "crater",
   "name": "Barringer Meteor Crater",
   "category": "crater",
   "lat": 35.0275,
   "lon": -111.0228,
   "metrics": {
    "diameter_m": 1231.0706769299127,
    "depth_m": 159.9457887600388,
    "depth_diameter_ratio": 0.12992413169885358,
    "rim_height_m": 34.47965217667388,
    "rim_height_diameter_ratio": 0.028007857568876915,
    "rim_variation_m": 6.237867420119466,
    "rim_radius_cv": 0.050550851337241465,
    "mean_wall_slope": 29.091377115305093,
    "wall_slope_p90": 37.83737040284501,
    "circularity": 0.9247794320799606,
    "rim_coherence": 1.0
   },
   "dq": {
    "source": "raster",
    "provenance": {
     "diameter_m": "raster:crater_morphometrics",
     "depth_m": "raster:crater_morphometrics",
     "depth_diameter_ratio": "raster:crater_morphometrics",
     "rim_height_m": "raster:crater_morphometrics",
     "rim_height_diameter_ratio": "raster:crater_morphometrics",
     "rim_variation_m": "raster:crater_morphometrics",
     "rim_radius_cv": "raster:crater_morphometrics",
     "mean_wall_slope": "raster:crater_morphometrics",
     "wall_slope_p90": "raster:crater_morphometrics",
     "circularity": "raster:crater_morphometrics",
     "rim_coherence": "raster:crater_morphometrics"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": "crater",
   "confidence": "alta",
   "matches": [
    {
     "ref_id": "bessel",
     "rank": 1,
     "score": 0.871089,
     "wed": 0.202469,
     "cosine": 0.928744,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 1231.0707,
       "target": 15311.0,
       "target_scaled": 15311.0,
       "scale": 1.0,
       "contribution": 0.002008
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 159.9458,
       "target": 1747.6,
       "target_scaled": 1747.6,
       "scale": 1.0,
       "contribution": 0.016282
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.1299,
       "target": 0.1141,
       "target_scaled": 0.1141,
       "scale": 1.0,
       "contribution": 0.000713
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 34.4797,
       "target": 427.3,
       "target_scaled": 427.3,
       "scale": 1.0,
       "contribution": 0.007426
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.028,
       "target": 0.0279,
       "target_scaled": 0.0279,
       "scale": 1.0,
       "contribution": 0.0
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 6.2379,
       "target": 255.3,
       "target_scaled": 255.3,
       "scale": 1.0,
       "contribution": 0.001638
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.0506,
       "target": 0.009,
       "target_scaled": 0.009,
       "scale": 1.0,
       "contribution": 0.0083
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 29.0914,
       "target": 25.9,
       "target_scaled": 25.9,
       "scale": 1.0,
       "contribution": 0.001033
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 37.8374,
       "target": 35.1,
       "target_scaled": 35.1,
       "scale": 1.0,
       "contribution": 0.000522
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.9248,
       "target": 0.997,
       "target_scaled": 0.997,
       "scale": 1.0,
       "contribution": 0.003073
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.0
      }
     ]
    },
    {
     "ref_id": "censorinus",
     "rank": 2,
     "score": 0.833668,
     "wed": 0.305078,
     "cosine": 0.945896,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 1231.0707,
       "target": 4139.0,
       "target_scaled": 4139.0,
       "scale": 1.0,
       "contribution": 8.6e-05
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 159.9458,
       "target": 984.0,
       "target_scaled": 984.0,
       "scale": 1.0,
       "contribution": 0.004386
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.1299,
       "target": 0.2378,
       "target_scaled": 0.2378,
       "scale": 1.0,
       "contribution": 0.033142
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 34.4797,
       "target": 298.2,
       "target_scaled": 298.2,
       "scale": 1.0,
       "contribution": 0.003347
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.028,
       "target": 0.072,
       "target_scaled": 0.072,
       "scale": 1.0,
       "contribution": 0.034285
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 6.2379,
       "target": 121.2,
       "target_scaled": 121.2,
       "scale": 1.0,
       "contribution": 0.000349
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.0506,
       "target": 0.012,
       "target_scaled": 0.012,
       "scale": 1.0,
       "contribution": 0.007145
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 29.0914,
       "target": 36.8,
       "target_scaled": 36.8,
       "scale": 1.0,
       "contribution": 0.006026
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 37.8374,
       "target": 41.9,
       "target_scaled": 41.9,
       "scale": 1.0,
       "contribution": 0.001149
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.9248,
       "target": 0.998,
       "target_scaled": 0.998,
       "scale": 1.0,
       "contribution": 0.003158
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.0
      }
     ]
    },
    {
     "ref_id": "alfraganus",
     "rank": 3,
     "score": 0.761447,
     "wed": 0.380389,
     "cosine": 0.840303,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 1231.0707,
       "target": 20591.0,
       "target_scaled": 20591.0,
       "scale": 1.0,
       "contribution": 0.003796
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 159.9458,
       "target": 3500.6,
       "target_scaled": 3500.6,
       "scale": 1.0,
       "contribution": 0.072086
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.1299,
       "target": 0.17,
       "target_scaled": 0.17,
       "scale": 1.0,
       "contribution": 0.004574
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 34.4797,
       "target": 935.2,
       "target_scaled": 935.2,
       "scale": 1.0,
       "contribution": 0.039045
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.028,
       "target": 0.0454,
       "target_scaled": 0.0454,
       "scale": 1.0,
       "contribution": 0.005359
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 6.2379,
       "target": 584.6,
       "target_scaled": 584.6,
       "scale": 1.0,
       "contribution": 0.008831
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.0506,
       "target": 0.013,
       "target_scaled": 0.013,
       "scale": 1.0,
       "contribution": 0.006779
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 29.0914,
       "target": 31.6,
       "target_scaled": 31.6,
       "scale": 1.0,
       "contribution": 0.000638
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 37.8374,
       "target": 34.9,
       "target_scaled": 34.9,
       "scale": 1.0,
       "contribution": 0.000601
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.9248,
       "target": 0.996,
       "target_scaled": 0.996,
       "scale": 1.0,
       "contribution": 0.002988
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.0
      }
     ]
    },
    {
     "ref_id": "de_gerlache",
     "rank": 4,
     "score": 0.746482,
     "wed": 0.344979,
     "cosine": 0.768283,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 1231.0707,
       "target": 32612.0,
       "target_scaled": 32612.0,
       "scale": 1.0,
       "contribution": 0.009973
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 159.9458,
       "target": 2797.3,
       "target_scaled": 2797.3,
       "scale": 1.0,
       "contribution": 0.044929
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.1299,
       "target": 0.0858,
       "target_scaled": 0.0858,
       "scale": 1.0,
       "contribution": 0.005545
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 34.4797,
       "target": 688.5,
       "target_scaled": 688.5,
       "scale": 1.0,
       "contribution": 0.020586
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.028,
       "target": 0.0211,
       "target_scaled": 0.0211,
       "scale": 1.0,
       "contribution": 0.000845
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 6.2379,
       "target": 589.4,
       "target_scaled": 589.4,
       "scale": 1.0,
       "contribution": 0.008978
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.0506,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.005739
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 29.0914,
       "target": 21.0,
       "target_scaled": 21.0,
       "scale": 1.0,
       "contribution": 0.006639
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 37.8374,
       "target": 25.0,
       "target_scaled": 25.0,
       "scale": 1.0,
       "contribution": 0.011473
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.9248,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.002662
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 0.917,
       "target_scaled": 0.917,
       "scale": 1.0,
       "contribution": 0.001642
      }
     ]
    },
    {
     "ref_id": "aristarchus",
     "rank": 5,
     "score": 0.707938,
     "wed": 0.387567,
     "cosine": 0.713412,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 1231.0707,
       "target": 40481.0,
       "target_scaled": 40481.0,
       "scale": 1.0,
       "contribution": 0.015602
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 159.9458,
       "target": 3109.0,
       "target_scaled": 3109.0,
       "scale": 1.0,
       "contribution": 0.056176
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.1299,
       "target": 0.0768,
       "target_scaled": 0.0768,
       "scale": 1.0,
       "contribution": 0.008037
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 34.4797,
       "target": 837.6,
       "target_scaled": 837.6,
       "scale": 1.0,
       "contribution": 0.031042
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.028,
       "target": 0.0207,
       "target_scaled": 0.0207,
       "scale": 1.0,
       "contribution": 0.000946
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 6.2379,
       "target": 577.5,
       "target_scaled": 577.5,
       "scale": 1.0,
       "contribution": 0.008615
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.0506,
       "target": 0.011,
       "target_scaled": 0.011,
       "scale": 1.0,
       "contribution": 0.00752
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 29.0914,
       "target": 17.5,
       "target_scaled": 17.5,
       "scale": 1.0,
       "contribution": 0.013625
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 37.8374,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.005074
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.9248,
       "target": 0.994,
       "target_scaled": 0.994,
       "scale": 1.0,
       "contribution": 0.002823
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.000748
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 12
  },
  "lonar": {
   "kind": "crater",
   "name": "Lonar Crater",
   "category": "crater",
   "lat": 19.976,
   "lon": 76.508,
   "metrics": {
    "diameter_m": 2042.5432524243681,
    "depth_m": 115.94147904578278,
    "depth_diameter_ratio": 0.056763291993042336,
    "rim_height_m": 23.60393712251397,
    "rim_height_diameter_ratio": 0.011556150448465464,
    "rim_variation_m": 5.2435176839611035,
    "rim_radius_cv": 0.11650673623017,
    "mean_wall_slope": 16.34736018054536,
    "wall_slope_p90": 29.124714452821348,
    "circularity": 0.7325140466866931,
    "rim_coherence": 0.9166666666666666
   },
   "dq": {
    "source": "raster",
    "provenance": {
     "diameter_m": "raster:crater_morphometrics",
     "depth_m": "raster:crater_morphometrics",
     "depth_diameter_ratio": "raster:crater_morphometrics",
     "rim_height_m": "raster:crater_morphometrics",
     "rim_height_diameter_ratio": "raster:crater_morphometrics",
     "rim_variation_m": "raster:crater_morphometrics",
     "rim_radius_cv": "raster:crater_morphometrics",
     "mean_wall_slope": "raster:crater_morphometrics",
     "wall_slope_p90": "raster:crater_morphometrics",
     "circularity": "raster:crater_morphometrics",
     "rim_coherence": "raster:crater_morphometrics"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": "crater",
   "confidence": "alta",
   "matches": [
    {
     "ref_id": "bessel",
     "rank": 1,
     "score": 0.713204,
     "wed": 0.390814,
     "cosine": 0.729675,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 2042.5433,
       "target": 15311.0,
       "target_scaled": 15311.0,
       "scale": 1.0,
       "contribution": 0.001783
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 115.9415,
       "target": 1747.6,
       "target_scaled": 1747.6,
       "scale": 1.0,
       "contribution": 0.017197
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0568,
       "target": 0.1141,
       "target_scaled": 0.1141,
       "scale": 1.0,
       "contribution": 0.009362
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 23.6039,
       "target": 427.3,
       "target_scaled": 427.3,
       "scale": 1.0,
       "contribution": 0.007843
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0116,
       "target": 0.0279,
       "target_scaled": 0.0279,
       "scale": 1.0,
       "contribution": 0.004732
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 5.2435,
       "target": 255.3,
       "target_scaled": 255.3,
       "scale": 1.0,
       "contribution": 0.001651
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1165,
       "target": 0.009,
       "target_scaled": 0.009,
       "scale": 1.0,
       "contribution": 0.055563
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 16.3474,
       "target": 25.9,
       "target_scaled": 25.9,
       "scale": 1.0,
       "contribution": 0.009254
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.1247,
       "target": 35.1,
       "target_scaled": 35.1,
       "scale": 1.0,
       "contribution": 0.002486
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7325,
       "target": 0.997,
       "target_scaled": 0.997,
       "scale": 1.0,
       "contribution": 0.04121
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.9167,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.001655
      }
     ]
    },
    {
     "ref_id": "de_gerlache",
     "rank": 2,
     "score": 0.649778,
     "wed": 0.426395,
     "cosine": 0.604471,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 2042.5433,
       "target": 32612.0,
       "target_scaled": 32612.0,
       "scale": 1.0,
       "contribution": 0.009464
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 115.9415,
       "target": 2797.3,
       "target_scaled": 2797.3,
       "scale": 1.0,
       "contribution": 0.04644
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0568,
       "target": 0.0858,
       "target_scaled": 0.0858,
       "scale": 1.0,
       "contribution": 0.002401
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 23.6039,
       "target": 688.5,
       "target_scaled": 688.5,
       "scale": 1.0,
       "contribution": 0.021276
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0116,
       "target": 0.0211,
       "target_scaled": 0.0211,
       "scale": 1.0,
       "contribution": 0.001614
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 5.2435,
       "target": 589.4,
       "target_scaled": 589.4,
       "scale": 1.0,
       "contribution": 0.009009
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1165,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.048562
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 16.3474,
       "target": 21.0,
       "target_scaled": 21.0,
       "scale": 1.0,
       "contribution": 0.002195
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.1247,
       "target": 25.0,
       "target_scaled": 25.0,
       "scale": 1.0,
       "contribution": 0.001184
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7325,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.039667
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.9167,
       "target": 0.917,
       "target_scaled": 0.917,
       "scale": 1.0,
       "contribution": 0.0
      }
     ]
    },
    {
     "ref_id": "censorinus",
     "rank": 3,
     "score": 0.642945,
     "wed": 0.562512,
     "cosine": 0.705548,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 2042.5433,
       "target": 4139.0,
       "target_scaled": 4139.0,
       "scale": 1.0,
       "contribution": 4.5e-05
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 115.9415,
       "target": 984.0,
       "target_scaled": 984.0,
       "scale": 1.0,
       "contribution": 0.004867
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0568,
       "target": 0.2378,
       "target_scaled": 0.2378,
       "scale": 1.0,
       "contribution": 0.093338
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 23.6039,
       "target": 298.2,
       "target_scaled": 298.2,
       "scale": 1.0,
       "contribution": 0.003629
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0116,
       "target": 0.072,
       "target_scaled": 0.072,
       "scale": 1.0,
       "contribution": 0.064723
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 5.2435,
       "target": 121.2,
       "target_scaled": 121.2,
       "scale": 1.0,
       "contribution": 0.000355
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1165,
       "target": 0.012,
       "target_scaled": 0.012,
       "scale": 1.0,
       "contribution": 0.052505
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 16.3474,
       "target": 36.8,
       "target_scaled": 36.8,
       "scale": 1.0,
       "contribution": 0.042419
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.1247,
       "target": 41.9,
       "target_scaled": 41.9,
       "scale": 1.0,
       "contribution": 0.011362
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7325,
       "target": 0.998,
       "target_scaled": 0.998,
       "scale": 1.0,
       "contribution": 0.041522
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.9167,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.001655
      }
     ]
    },
    {
     "ref_id": "aristarchus",
     "rank": 4,
     "score": 0.624633,
     "wed": 0.458363,
     "cosine": 0.57068,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 2042.5433,
       "target": 40481.0,
       "target_scaled": 40481.0,
       "scale": 1.0,
       "contribution": 0.014963
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 115.9415,
       "target": 3109.0,
       "target_scaled": 3109.0,
       "scale": 1.0,
       "contribution": 0.057865
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0568,
       "target": 0.0768,
       "target_scaled": 0.0768,
       "scale": 1.0,
       "contribution": 0.001143
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 23.6039,
       "target": 837.6,
       "target_scaled": 837.6,
       "scale": 1.0,
       "contribution": 0.031888
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0116,
       "target": 0.0207,
       "target_scaled": 0.0207,
       "scale": 1.0,
       "contribution": 0.001481
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 5.2435,
       "target": 577.5,
       "target_scaled": 577.5,
       "scale": 1.0,
       "contribution": 0.008645
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1165,
       "target": 0.011,
       "target_scaled": 0.011,
       "scale": 1.0,
       "contribution": 0.053514
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 16.3474,
       "target": 17.5,
       "target_scaled": 17.5,
       "scale": 1.0,
       "contribution": 0.000135
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.1247,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 2e-06
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7325,
       "target": 0.994,
       "target_scaled": 0.994,
       "scale": 1.0,
       "contribution": 0.040281
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.9167,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.000178
      }
     ]
    },
    {
     "ref_id": "alfraganus",
     "rank": 5,
     "score": 0.62077,
     "wed": 0.550561,
     "cosine": 0.640309,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 2042.5433,
       "target": 20591.0,
       "target_scaled": 20591.0,
       "scale": 1.0,
       "contribution": 0.003484
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 115.9415,
       "target": 3500.6,
       "target_scaled": 3500.6,
       "scale": 1.0,
       "contribution": 0.073997
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0568,
       "target": 0.17,
       "target_scaled": 0.17,
       "scale": 1.0,
       "contribution": 0.036517
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 23.6039,
       "target": 935.2,
       "target_scaled": 935.2,
       "scale": 1.0,
       "contribution": 0.039994
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0116,
       "target": 0.0454,
       "target_scaled": 0.0454,
       "scale": 1.0,
       "contribution": 0.020291
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 5.2435,
       "target": 584.6,
       "target_scaled": 584.6,
       "scale": 1.0,
       "contribution": 0.008861
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1165,
       "target": 0.013,
       "target_scaled": 0.013,
       "scale": 1.0,
       "contribution": 0.051505
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 16.3474,
       "target": 31.6,
       "target_scaled": 31.6,
       "scale": 1.0,
       "contribution": 0.023591
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.1247,
       "target": 34.9,
       "target_scaled": 34.9,
       "scale": 1.0,
       "contribution": 0.002322
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7325,
       "target": 0.996,
       "target_scaled": 0.996,
       "scale": 1.0,
       "contribution": 0.040899
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.9167,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.001655
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 12
  },
  "pingualuit": {
   "kind": "crater",
   "name": "Pingualuit Crater",
   "category": "crater",
   "lat": 61.278,
   "lon": -73.667,
   "metrics": {
    "diameter_m": 3486.300872719278,
    "depth_m": 109.92151839121857,
    "depth_diameter_ratio": 0.03152955594032851,
    "rim_height_m": 70.96455034340494,
    "rim_height_diameter_ratio": 0.020355257028649206,
    "rim_variation_m": 22.257636840493532,
    "rim_radius_cv": 0.10564210162770724,
    "mean_wall_slope": 10.23694407446918,
    "wall_slope_p90": 29.808586694464395,
    "circularity": 0.7066696214385901,
    "rim_coherence": 1.0
   },
   "dq": {
    "source": "raster",
    "provenance": {
     "diameter_m": "raster:crater_morphometrics",
     "depth_m": "raster:crater_morphometrics",
     "depth_diameter_ratio": "raster:crater_morphometrics",
     "rim_height_m": "raster:crater_morphometrics",
     "rim_height_diameter_ratio": "raster:crater_morphometrics",
     "rim_variation_m": "raster:crater_morphometrics",
     "rim_radius_cv": "raster:crater_morphometrics",
     "mean_wall_slope": "raster:crater_morphometrics",
     "wall_slope_p90": "raster:crater_morphometrics",
     "circularity": "raster:crater_morphometrics",
     "rim_coherence": "raster:crater_morphometrics"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": "crater",
   "confidence": "alta",
   "matches": [
    {
     "ref_id": "bessel",
     "rank": 1,
     "score": 0.681245,
     "wed": 0.409993,
     "cosine": 0.667893,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3486.3009,
       "target": 15311.0,
       "target_scaled": 15311.0,
       "scale": 1.0,
       "contribution": 0.001416
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 109.9215,
       "target": 1747.6,
       "target_scaled": 1747.6,
       "scale": 1.0,
       "contribution": 0.017324
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0315,
       "target": 0.1141,
       "target_scaled": 0.1141,
       "scale": 1.0,
       "contribution": 0.019417
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 70.9646,
       "target": 427.3,
       "target_scaled": 427.3,
       "scale": 1.0,
       "contribution": 0.006111
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0204,
       "target": 0.0279,
       "target_scaled": 0.0279,
       "scale": 1.0,
       "contribution": 0.001008
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 22.2576,
       "target": 255.3,
       "target_scaled": 255.3,
       "scale": 1.0,
       "contribution": 0.001434
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1056,
       "target": 0.009,
       "target_scaled": 0.009,
       "scale": 1.0,
       "contribution": 0.0449
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 10.2369,
       "target": 25.9,
       "target_scaled": 25.9,
       "scale": 1.0,
       "contribution": 0.024878
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.8086,
       "target": 35.1,
       "target_scaled": 35.1,
       "scale": 1.0,
       "contribution": 0.001949
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7067,
       "target": 0.997,
       "target_scaled": 0.997,
       "scale": 1.0,
       "contribution": 0.049657
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.0
      }
     ]
    },
    {
     "ref_id": "de_gerlache",
     "rank": 2,
     "score": 0.625444,
     "wed": 0.438263,
     "cosine": 0.554527,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3486.3009,
       "target": 32612.0,
       "target_scaled": 32612.0,
       "scale": 1.0,
       "contribution": 0.008591
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 109.9215,
       "target": 2797.3,
       "target_scaled": 2797.3,
       "scale": 1.0,
       "contribution": 0.046649
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0315,
       "target": 0.0858,
       "target_scaled": 0.0858,
       "scale": 1.0,
       "contribution": 0.008388
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 70.9646,
       "target": 688.5,
       "target_scaled": 688.5,
       "scale": 1.0,
       "contribution": 0.018353
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0204,
       "target": 0.0211,
       "target_scaled": 0.0211,
       "scale": 1.0,
       "contribution": 1e-05
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 22.2576,
       "target": 589.4,
       "target_scaled": 589.4,
       "scale": 1.0,
       "contribution": 0.008491
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1056,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.038631
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 10.2369,
       "target": 21.0,
       "target_scaled": 21.0,
       "scale": 1.0,
       "contribution": 0.011747
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.8086,
       "target": 25.0,
       "target_scaled": 25.0,
       "scale": 1.0,
       "contribution": 0.00161
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7067,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.047962
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 0.917,
       "target_scaled": 0.917,
       "scale": 1.0,
       "contribution": 0.001642
      }
     ]
    },
    {
     "ref_id": "aristarchus",
     "rank": 3,
     "score": 0.615009,
     "wed": 0.460471,
     "cosine": 0.548509,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3486.3009,
       "target": 40481.0,
       "target_scaled": 40481.0,
       "scale": 1.0,
       "contribution": 0.01386
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 109.9215,
       "target": 3109.0,
       "target_scaled": 3109.0,
       "scale": 1.0,
       "contribution": 0.058098
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0315,
       "target": 0.0768,
       "target_scaled": 0.0768,
       "scale": 1.0,
       "contribution": 0.005837
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 70.9646,
       "target": 837.6,
       "target_scaled": 837.6,
       "scale": 1.0,
       "contribution": 0.028285
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0204,
       "target": 0.0207,
       "target_scaled": 0.0207,
       "scale": 1.0,
       "contribution": 2e-06
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 22.2576,
       "target": 577.5,
       "target_scaled": 577.5,
       "scale": 1.0,
       "contribution": 0.008139
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1056,
       "target": 0.011,
       "target_scaled": 0.011,
       "scale": 1.0,
       "contribution": 0.043061
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 10.2369,
       "target": 17.5,
       "target_scaled": 17.5,
       "scale": 1.0,
       "contribution": 0.005349
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.8086,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 1.8e-05
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7067,
       "target": 0.994,
       "target_scaled": 0.994,
       "scale": 1.0,
       "contribution": 0.048636
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.000748
      }
     ]
    },
    {
     "ref_id": "censorinus",
     "rank": 4,
     "score": 0.599133,
     "wed": 0.591599,
     "cosine": 0.619435,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3486.3009,
       "target": 4139.0,
       "target_scaled": 4139.0,
       "scale": 1.0,
       "contribution": 4e-06
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 109.9215,
       "target": 984.0,
       "target_scaled": 984.0,
       "scale": 1.0,
       "contribution": 0.004935
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0315,
       "target": 0.2378,
       "target_scaled": 0.2378,
       "scale": 1.0,
       "contribution": 0.121171
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 70.9646,
       "target": 298.2,
       "target_scaled": 298.2,
       "scale": 1.0,
       "contribution": 0.002485
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0204,
       "target": 0.072,
       "target_scaled": 0.072,
       "scale": 1.0,
       "contribution": 0.04725
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 22.2576,
       "target": 121.2,
       "target_scaled": 121.2,
       "scale": 1.0,
       "contribution": 0.000258
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1056,
       "target": 0.012,
       "target_scaled": 0.012,
       "scale": 1.0,
       "contribution": 0.042155
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 10.2369,
       "target": 36.8,
       "target_scaled": 36.8,
       "scale": 1.0,
       "contribution": 0.071552
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.8086,
       "target": 41.9,
       "target_scaled": 41.9,
       "scale": 1.0,
       "contribution": 0.010178
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7067,
       "target": 0.998,
       "target_scaled": 0.998,
       "scale": 1.0,
       "contribution": 0.05
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.0
      }
     ]
    },
    {
     "ref_id": "alfraganus",
     "rank": 5,
     "score": 0.586781,
     "wed": 0.570873,
     "cosine": 0.571931,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3486.3009,
       "target": 20591.0,
       "target_scaled": 20591.0,
       "scale": 1.0,
       "contribution": 0.002963
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 109.9215,
       "target": 3500.6,
       "target_scaled": 3500.6,
       "scale": 1.0,
       "contribution": 0.074261
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0315,
       "target": 0.17,
       "target_scaled": 0.17,
       "scale": 1.0,
       "contribution": 0.054606
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 70.9646,
       "target": 935.2,
       "target_scaled": 935.2,
       "scale": 1.0,
       "contribution": 0.035946
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0204,
       "target": 0.0454,
       "target_scaled": 0.0454,
       "scale": 1.0,
       "contribution": 0.011112
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 22.2576,
       "target": 584.6,
       "target_scaled": 584.6,
       "scale": 1.0,
       "contribution": 0.008348
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.1056,
       "target": 0.013,
       "target_scaled": 0.013,
       "scale": 1.0,
       "contribution": 0.04126
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 10.2369,
       "target": 31.6,
       "target_scaled": 31.6,
       "scale": 1.0,
       "contribution": 0.04628
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 29.8086,
       "target": 34.9,
       "target_scaled": 34.9,
       "scale": 1.0,
       "contribution": 0.001805
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.7067,
       "target": 0.996,
       "target_scaled": 0.996,
       "scale": 1.0,
       "contribution": 0.049316
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 1.0,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.0
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 12
  },
  "riachao": {
   "kind": "crater",
   "name": "Anel de Riachão",
   "category": "impact_crater",
   "lat": -7.71667,
   "lon": -46.65,
   "metrics": {
    "diameter_m": 3600.0,
    "depth_m": 37.8,
    "depth_diameter_ratio": 0.0105,
    "rim_height_m": 26.8,
    "rim_height_diameter_ratio": 0.0074,
    "rim_variation_m": 48.9,
    "rim_radius_cv": 0.058,
    "mean_wall_slope": 2.4,
    "wall_slope_p90": 4.0,
    "circularity": 0.893,
    "rim_coherence": 0.583
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "diameter_m": "catalogo:craters.diameter_m (calculado fora deste repositório)",
     "depth_m": "catalogo:craters.depth_m (calculado fora deste repositório)",
     "depth_diameter_ratio": "catalogo:craters.depth_diameter_ratio (calculado fora deste repositório)",
     "rim_height_m": "catalogo:craters.rim_height_m (calculado fora deste repositório)",
     "rim_height_diameter_ratio": "catalogo:craters.rim_height_diameter_ratio (calculado fora deste repositório)",
     "rim_variation_m": "catalogo:craters.rim_variation_m (calculado fora deste repositório)",
     "rim_radius_cv": "catalogo:craters.rim_radius_cv (calculado fora deste repositório)",
     "mean_wall_slope": "catalogo:craters.mean_wall_slope (calculado fora deste repositório)",
     "wall_slope_p90": "catalogo:craters.wall_slope_p90 (calculado fora deste repositório)",
     "circularity": "catalogo:craters.circularity (calculado fora deste repositório)",
     "rim_coherence": "catalogo:craters.rim_coherence (calculado fora deste repositório)"
    },
    "issues": [
     "anel de borda parcial: confiança baixa na comparação com crateras",
     "diâmetro no limite da faixa de busca do catálogo: pode estar subestimado"
    ],
    "features_missing": []
   },
   "crater_class": "partial_ring",
   "confidence": "baixa",
   "matches": [
    {
     "ref_id": "faustini",
     "rank": 1,
     "score": 0.530745,
     "wed": 0.448363,
     "cosine": 0.326958,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3600.0,
       "target": 45982.0,
       "target_scaled": 45982.0,
       "scale": 1.0,
       "contribution": 0.018191
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 37.8,
       "target": 3048.0,
       "target_scaled": 3048.0,
       "scale": 1.0,
       "contribution": 0.05853
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0105,
       "target": 0.0663,
       "target_scaled": 0.0663,
       "scale": 1.0,
       "contribution": 0.008867
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 26.8,
       "target": 792.8,
       "target_scaled": 792.8,
       "scale": 1.0,
       "contribution": 0.028239
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0074,
       "target": 0.0172,
       "target_scaled": 0.0172,
       "scale": 1.0,
       "contribution": 0.001701
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 48.9,
       "target": 564.8,
       "target_scaled": 564.8,
       "scale": 1.0,
       "contribution": 0.007026
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.058,
       "target": 0.015,
       "target_scaled": 0.015,
       "scale": 1.0,
       "contribution": 0.008889
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 2.4,
       "target": 15.3,
       "target_scaled": 15.3,
       "scale": 1.0,
       "contribution": 0.016875
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 4.0,
       "target": 19.1,
       "target_scaled": 19.1,
       "scale": 1.0,
       "contribution": 0.015874
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.893,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.005774
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.583,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.031064
      }
     ]
    },
    {
     "ref_id": "de_gerlache",
     "rank": 2,
     "score": 0.520802,
     "wed": 0.461083,
     "cosine": 0.313537,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3600.0,
       "target": 32612.0,
       "target_scaled": 32612.0,
       "scale": 1.0,
       "contribution": 0.008524
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 37.8,
       "target": 2797.3,
       "target_scaled": 2797.3,
       "scale": 1.0,
       "contribution": 0.049187
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0105,
       "target": 0.0858,
       "target_scaled": 0.0858,
       "scale": 1.0,
       "contribution": 0.016148
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 26.8,
       "target": 688.5,
       "target_scaled": 688.5,
       "scale": 1.0,
       "contribution": 0.021072
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0074,
       "target": 0.0211,
       "target_scaled": 0.0211,
       "scale": 1.0,
       "contribution": 0.003325
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 48.9,
       "target": 589.4,
       "target_scaled": 589.4,
       "scale": 1.0,
       "contribution": 0.007712
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.058,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.00848
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 2.4,
       "target": 21.0,
       "target_scaled": 21.0,
       "scale": 1.0,
       "contribution": 0.035082
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 4.0,
       "target": 25.0,
       "target_scaled": 25.0,
       "scale": 1.0,
       "contribution": 0.030702
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.893,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.005774
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.583,
       "target": 0.917,
       "target_scaled": 0.917,
       "scale": 1.0,
       "contribution": 0.026591
      }
     ]
    },
    {
     "ref_id": "shoemaker",
     "rank": 3,
     "score": 0.502357,
     "wed": 0.497638,
     "cosine": 0.299575,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3600.0,
       "target": 61200.0,
       "target_scaled": 61200.0,
       "scale": 1.0,
       "contribution": 0.0336
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 37.8,
       "target": 3737.5,
       "target_scaled": 3737.5,
       "scale": 1.0,
       "contribution": 0.088414
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0105,
       "target": 0.0611,
       "target_scaled": 0.0611,
       "scale": 1.0,
       "contribution": 0.007292
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 26.8,
       "target": 883.7,
       "target_scaled": 883.7,
       "scale": 1.0,
       "contribution": 0.035338
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0074,
       "target": 0.0144,
       "target_scaled": 0.0144,
       "scale": 1.0,
       "contribution": 0.000868
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 48.9,
       "target": 605.3,
       "target_scaled": 605.3,
       "scale": 1.0,
       "contribution": 0.008173
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.058,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.00848
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 2.4,
       "target": 14.2,
       "target_scaled": 14.2,
       "scale": 1.0,
       "contribution": 0.01412
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 4.0,
       "target": 18.5,
       "target_scaled": 18.5,
       "scale": 1.0,
       "contribution": 0.014637
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.893,
       "target": 0.991,
       "target_scaled": 0.991,
       "scale": 1.0,
       "contribution": 0.005658
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.583,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.031064
      }
     ]
    },
    {
     "ref_id": "aristarchus",
     "rank": 4,
     "score": 0.499585,
     "wed": 0.494717,
     "cosine": 0.290114,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3600.0,
       "target": 40481.0,
       "target_scaled": 40481.0,
       "scale": 1.0,
       "contribution": 0.013775
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 37.8,
       "target": 3109.0,
       "target_scaled": 3109.0,
       "scale": 1.0,
       "contribution": 0.060926
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0105,
       "target": 0.0768,
       "target_scaled": 0.0768,
       "scale": 1.0,
       "contribution": 0.012519
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 26.8,
       "target": 837.6,
       "target_scaled": 837.6,
       "scale": 1.0,
       "contribution": 0.031638
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0074,
       "target": 0.0207,
       "target_scaled": 0.0207,
       "scale": 1.0,
       "contribution": 0.003134
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 48.9,
       "target": 577.5,
       "target_scaled": 577.5,
       "scale": 1.0,
       "contribution": 0.007377
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.058,
       "target": 0.011,
       "target_scaled": 0.011,
       "scale": 1.0,
       "contribution": 0.01062
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 2.4,
       "target": 17.5,
       "target_scaled": 17.5,
       "scale": 1.0,
       "contribution": 0.023122
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 4.0,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.044562
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.893,
       "target": 0.994,
       "target_scaled": 0.994,
       "scale": 1.0,
       "contribution": 0.00601
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.583,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.031064
      }
     ]
    },
    {
     "ref_id": "bessel",
     "rank": 5,
     "score": 0.493927,
     "wed": 0.499828,
     "cosine": 0.280392,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 3600.0,
       "target": 15311.0,
       "target_scaled": 15311.0,
       "scale": 1.0,
       "contribution": 0.001389
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 37.8,
       "target": 1747.6,
       "target_scaled": 1747.6,
       "scale": 1.0,
       "contribution": 0.018883
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0105,
       "target": 0.1141,
       "target_scaled": 0.1141,
       "scale": 1.0,
       "contribution": 0.030566
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 26.8,
       "target": 427.3,
       "target_scaled": 427.3,
       "scale": 1.0,
       "contribution": 0.00772
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0074,
       "target": 0.0279,
       "target_scaled": 0.0279,
       "scale": 1.0,
       "contribution": 0.007445
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 48.9,
       "target": 255.3,
       "target_scaled": 255.3,
       "scale": 1.0,
       "contribution": 0.001125
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.058,
       "target": 0.009,
       "target_scaled": 0.009,
       "scale": 1.0,
       "contribution": 0.011543
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 2.4,
       "target": 25.9,
       "target_scaled": 25.9,
       "scale": 1.0,
       "contribution": 0.056002
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 4.0,
       "target": 35.1,
       "target_scaled": 35.1,
       "scale": 1.0,
       "contribution": 0.067335
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.893,
       "target": 0.997,
       "target_scaled": 0.997,
       "scale": 1.0,
       "contribution": 0.006372
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.583,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.041449
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 12
  },
  "serra_cangalha": {
   "kind": "crater",
   "name": "Serra da Cangalha",
   "category": "impact_crater",
   "lat": -8.08333,
   "lon": -46.86667,
   "metrics": {
    "diameter_m": 14337.0,
    "depth_m": 119.1,
    "depth_diameter_ratio": 0.0083,
    "rim_height_m": 83.3,
    "rim_height_diameter_ratio": 0.0058,
    "rim_variation_m": 84.1,
    "rim_radius_cv": 0.06,
    "mean_wall_slope": 4.0,
    "wall_slope_p90": 9.3,
    "circularity": 0.92,
    "rim_coherence": 0.542
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "diameter_m": "catalogo:craters.diameter_m (calculado fora deste repositório)",
     "depth_m": "catalogo:craters.depth_m (calculado fora deste repositório)",
     "depth_diameter_ratio": "catalogo:craters.depth_diameter_ratio (calculado fora deste repositório)",
     "rim_height_m": "catalogo:craters.rim_height_m (calculado fora deste repositório)",
     "rim_height_diameter_ratio": "catalogo:craters.rim_height_diameter_ratio (calculado fora deste repositório)",
     "rim_variation_m": "catalogo:craters.rim_variation_m (calculado fora deste repositório)",
     "rim_radius_cv": "catalogo:craters.rim_radius_cv (calculado fora deste repositório)",
     "mean_wall_slope": "catalogo:craters.mean_wall_slope (calculado fora deste repositório)",
     "wall_slope_p90": "catalogo:craters.wall_slope_p90 (calculado fora deste repositório)",
     "circularity": "catalogo:craters.circularity (calculado fora deste repositório)",
     "rim_coherence": "catalogo:craters.rim_coherence (calculado fora deste repositório)"
    },
    "issues": [
     "anel de borda parcial: confiança baixa na comparação com crateras",
     "diâmetro no limite da faixa de busca do catálogo: pode estar subestimado"
    ],
    "features_missing": []
   },
   "crater_class": "partial_ring",
   "confidence": "baixa",
   "matches": [
    {
     "ref_id": "faustini",
     "rank": 1,
     "score": 0.605015,
     "wed": 0.422736,
     "cosine": 0.489182,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14337.0,
       "target": 45982.0,
       "target_scaled": 45982.0,
       "scale": 1.0,
       "contribution": 0.010142
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 119.1,
       "target": 3048.0,
       "target_scaled": 3048.0,
       "scale": 1.0,
       "contribution": 0.055411
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0083,
       "target": 0.0663,
       "target_scaled": 0.0663,
       "scale": 1.0,
       "contribution": 0.00958
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 83.3,
       "target": 792.8,
       "target_scaled": 792.8,
       "scale": 1.0,
       "contribution": 0.024226
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0172,
       "target_scaled": 0.0172,
       "scale": 1.0,
       "contribution": 0.002302
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 84.1,
       "target": 564.8,
       "target_scaled": 564.8,
       "scale": 1.0,
       "contribution": 0.0061
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.06,
       "target": 0.015,
       "target_scaled": 0.015,
       "scale": 1.0,
       "contribution": 0.009735
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 4.0,
       "target": 15.3,
       "target_scaled": 15.3,
       "scale": 1.0,
       "contribution": 0.012949
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 9.3,
       "target": 19.1,
       "target_scaled": 19.1,
       "scale": 1.0,
       "contribution": 0.006686
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.92,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.003054
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.542,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.03852
      }
     ]
    },
    {
     "ref_id": "de_gerlache",
     "rank": 2,
     "score": 0.599447,
     "wed": 0.433221,
     "cosine": 0.484923,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14337.0,
       "target": 32612.0,
       "target_scaled": 32612.0,
       "scale": 1.0,
       "contribution": 0.003382
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 119.1,
       "target": 2797.3,
       "target_scaled": 2797.3,
       "scale": 1.0,
       "contribution": 0.046331
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0083,
       "target": 0.0858,
       "target_scaled": 0.0858,
       "scale": 1.0,
       "contribution": 0.017105
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 83.3,
       "target": 688.5,
       "target_scaled": 688.5,
       "scale": 1.0,
       "contribution": 0.017627
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0211,
       "target_scaled": 0.0211,
       "scale": 1.0,
       "contribution": 0.004147
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 84.1,
       "target": 589.4,
       "target_scaled": 589.4,
       "scale": 1.0,
       "contribution": 0.006741
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.06,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.009307
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 4.0,
       "target": 21.0,
       "target_scaled": 21.0,
       "scale": 1.0,
       "contribution": 0.029306
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 9.3,
       "target": 25.0,
       "target_scaled": 25.0,
       "scale": 1.0,
       "contribution": 0.01716
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.92,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.003054
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.542,
       "target": 0.917,
       "target_scaled": 0.917,
       "scale": 1.0,
       "contribution": 0.03352
      }
     ]
    },
    {
     "ref_id": "copernicus",
     "rank": 3,
     "score": 0.596915,
     "wed": 0.485247,
     "cosine": 0.525191,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14337.0,
       "target": 96100.0,
       "target_scaled": 96100.0,
       "scale": 1.0,
       "contribution": 0.067704
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 119.1,
       "target": 3525.2,
       "target_scaled": 3525.2,
       "scale": 1.0,
       "contribution": 0.074938
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0083,
       "target": 0.0367,
       "target_scaled": 0.0367,
       "scale": 1.0,
       "contribution": 0.002297
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 83.3,
       "target": 759.2,
       "target_scaled": 759.2,
       "scale": 1.0,
       "contribution": 0.021986
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0079,
       "target_scaled": 0.0079,
       "scale": 1.0,
       "contribution": 7.8e-05
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 84.1,
       "target": 235.0,
       "target_scaled": 235.0,
       "scale": 1.0,
       "contribution": 0.000601
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.06,
       "target": 0.035,
       "target_scaled": 0.035,
       "scale": 1.0,
       "contribution": 0.003005
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 4.0,
       "target": 13.7,
       "target_scaled": 13.7,
       "scale": 1.0,
       "contribution": 0.009541
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 9.3,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.027847
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.92,
       "target": 0.94,
       "target_scaled": 0.94,
       "scale": 1.0,
       "contribution": 0.000236
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.542,
       "target": 0.88,
       "target_scaled": 0.88,
       "scale": 1.0,
       "contribution": 0.027232
      }
     ]
    },
    {
     "ref_id": "aristarchus",
     "rank": 4,
     "score": 0.586564,
     "wed": 0.464099,
     "cosine": 0.480636,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14337.0,
       "target": 40481.0,
       "target_scaled": 40481.0,
       "scale": 1.0,
       "contribution": 0.006922
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 119.1,
       "target": 3109.0,
       "target_scaled": 3109.0,
       "scale": 1.0,
       "contribution": 0.057743
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0083,
       "target": 0.0768,
       "target_scaled": 0.0768,
       "scale": 1.0,
       "contribution": 0.013363
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 83.3,
       "target": 837.6,
       "target_scaled": 837.6,
       "scale": 1.0,
       "contribution": 0.027382
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0207,
       "target_scaled": 0.0207,
       "scale": 1.0,
       "contribution": 0.003933
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 84.1,
       "target": 577.5,
       "target_scaled": 577.5,
       "scale": 1.0,
       "contribution": 0.006427
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.06,
       "target": 0.011,
       "target_scaled": 0.011,
       "scale": 1.0,
       "contribution": 0.011543
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 4.0,
       "target": 17.5,
       "target_scaled": 17.5,
       "scale": 1.0,
       "contribution": 0.018481
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 9.3,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.027847
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.92,
       "target": 0.994,
       "target_scaled": 0.994,
       "scale": 1.0,
       "contribution": 0.003226
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.542,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.03852
      }
     ]
    },
    {
     "ref_id": "shoemaker",
     "rank": 5,
     "score": 0.579219,
     "wed": 0.470431,
     "cosine": 0.467902,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14337.0,
       "target": 61200.0,
       "target_scaled": 61200.0,
       "scale": 1.0,
       "contribution": 0.022241
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 119.1,
       "target": 3737.5,
       "target_scaled": 3737.5,
       "scale": 1.0,
       "contribution": 0.084571
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0083,
       "target": 0.0611,
       "target_scaled": 0.0611,
       "scale": 1.0,
       "contribution": 0.00794
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 83.3,
       "target": 883.7,
       "target_scaled": 883.7,
       "scale": 1.0,
       "contribution": 0.030832
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0144,
       "target_scaled": 0.0144,
       "scale": 1.0,
       "contribution": 0.00131
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 84.1,
       "target": 605.3,
       "target_scaled": 605.3,
       "scale": 1.0,
       "contribution": 0.007171
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.06,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.009307
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 4.0,
       "target": 14.2,
       "target_scaled": 14.2,
       "scale": 1.0,
       "contribution": 0.01055
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 9.3,
       "target": 18.5,
       "target_scaled": 18.5,
       "scale": 1.0,
       "contribution": 0.005892
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.92,
       "target": 0.991,
       "target_scaled": 0.991,
       "scale": 1.0,
       "contribution": 0.00297
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.542,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.03852
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 12
  },
  "serra_verde": {
   "kind": "crater",
   "name": "Serra Verde (Cerro Corá)",
   "category": "afloramento",
   "lat": -5.93611,
   "lon": -36.36306,
   "metrics": {
    "diameter_m": 6995.0,
    "depth_m": 128.0,
    "depth_diameter_ratio": 0.0183,
    "rim_height_m": 118.5,
    "rim_height_diameter_ratio": 0.0169,
    "rim_variation_m": 190.0,
    "rim_radius_cv": 0.138,
    "mean_wall_slope": 5.6,
    "wall_slope_p90": 10.5,
    "circularity": 0.81,
    "rim_coherence": 0.792
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "diameter_m": "catalogo:craters.diameter_m (calculado fora deste repositório)",
     "depth_m": "catalogo:craters.depth_m (calculado fora deste repositório)",
     "depth_diameter_ratio": "catalogo:craters.depth_diameter_ratio (calculado fora deste repositório)",
     "rim_height_m": "catalogo:craters.rim_height_m (calculado fora deste repositório)",
     "rim_height_diameter_ratio": "catalogo:craters.rim_height_diameter_ratio (calculado fora deste repositório)",
     "rim_variation_m": "catalogo:craters.rim_variation_m (calculado fora deste repositório)",
     "rim_radius_cv": "catalogo:craters.rim_radius_cv (calculado fora deste repositório)",
     "mean_wall_slope": "catalogo:craters.mean_wall_slope (calculado fora deste repositório)",
     "wall_slope_p90": "catalogo:craters.wall_slope_p90 (calculado fora deste repositório)",
     "circularity": "catalogo:craters.circularity (calculado fora deste repositório)",
     "rim_coherence": "catalogo:craters.rim_coherence (calculado fora deste repositório)"
    },
    "issues": [],
    "features_missing": []
   },
   "crater_class": "crater",
   "confidence": "alta",
   "matches": [
    {
     "ref_id": "de_gerlache",
     "rank": 1,
     "score": 0.548696,
     "wed": 0.468277,
     "cosine": 0.389684,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 6995.0,
       "target": 32612.0,
       "target_scaled": 32612.0,
       "scale": 1.0,
       "contribution": 0.006646
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 128.0,
       "target": 2797.3,
       "target_scaled": 2797.3,
       "scale": 1.0,
       "contribution": 0.046024
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0858,
       "target_scaled": 0.0858,
       "scale": 1.0,
       "contribution": 0.012976
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 118.5,
       "target": 688.5,
       "target_scaled": 688.5,
       "scale": 1.0,
       "contribution": 0.015636
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0169,
       "target": 0.0211,
       "target_scaled": 0.0211,
       "scale": 1.0,
       "contribution": 0.000313
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 190.0,
       "target": 589.4,
       "target_scaled": 589.4,
       "scale": 1.0,
       "contribution": 0.004211
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.138,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.071553
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 5.6,
       "target": 21.0,
       "target_scaled": 21.0,
       "scale": 1.0,
       "contribution": 0.024049
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 10.5,
       "target": 25.0,
       "target_scaled": 25.0,
       "scale": 1.0,
       "contribution": 0.014637
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.81,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.019514
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.792,
       "target": 0.917,
       "target_scaled": 0.917,
       "scale": 1.0,
       "contribution": 0.003724
      }
     ]
    },
    {
     "ref_id": "faustini",
     "rank": 2,
     "score": 0.543022,
     "wed": 0.46375,
     "cosine": 0.371471,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 6995.0,
       "target": 45982.0,
       "target_scaled": 45982.0,
       "scale": 1.0,
       "contribution": 0.015394
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 128.0,
       "target": 3048.0,
       "target_scaled": 3048.0,
       "scale": 1.0,
       "contribution": 0.055075
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0663,
       "target_scaled": 0.0663,
       "scale": 1.0,
       "contribution": 0.006562
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 118.5,
       "target": 792.8,
       "target_scaled": 792.8,
       "scale": 1.0,
       "contribution": 0.021882
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0169,
       "target": 0.0172,
       "target_scaled": 0.0172,
       "scale": 1.0,
       "contribution": 2e-06
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 190.0,
       "target": 564.8,
       "target_scaled": 564.8,
       "scale": 1.0,
       "contribution": 0.003708
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.138,
       "target": 0.015,
       "target_scaled": 0.015,
       "scale": 1.0,
       "contribution": 0.072731
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 5.6,
       "target": 15.3,
       "target_scaled": 15.3,
       "scale": 1.0,
       "contribution": 0.009541
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 10.5,
       "target": 19.1,
       "target_scaled": 19.1,
       "scale": 1.0,
       "contribution": 0.005149
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.81,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.019514
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.792,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.005507
      }
     ]
    },
    {
     "ref_id": "bessel",
     "rank": 3,
     "score": 0.539482,
     "wed": 0.495437,
     "cosine": 0.390481,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 6995.0,
       "target": 15311.0,
       "target_scaled": 15311.0,
       "scale": 1.0,
       "contribution": 0.0007
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 128.0,
       "target": 1747.6,
       "target_scaled": 1747.6,
       "scale": 1.0,
       "contribution": 0.016943
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.1141,
       "target_scaled": 0.1141,
       "scale": 1.0,
       "contribution": 0.026137
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 118.5,
       "target": 427.3,
       "target_scaled": 427.3,
       "scale": 1.0,
       "contribution": 0.004589
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0169,
       "target": 0.0279,
       "target_scaled": 0.0279,
       "scale": 1.0,
       "contribution": 0.002144
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 190.0,
       "target": 255.3,
       "target_scaled": 255.3,
       "scale": 1.0,
       "contribution": 0.000113
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.138,
       "target": 0.009,
       "target_scaled": 0.009,
       "scale": 1.0,
       "contribution": 0.08
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 5.6,
       "target": 25.9,
       "target_scaled": 25.9,
       "scale": 1.0,
       "contribution": 0.041788
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 10.5,
       "target": 35.1,
       "target_scaled": 35.1,
       "scale": 1.0,
       "contribution": 0.04213
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.81,
       "target": 0.997,
       "target_scaled": 0.997,
       "scale": 1.0,
       "contribution": 0.020601
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.792,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.010313
      }
     ]
    },
    {
     "ref_id": "aristarchus",
     "rank": 4,
     "score": 0.529428,
     "wed": 0.499565,
     "cosine": 0.368917,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 6995.0,
       "target": 40481.0,
       "target_scaled": 40481.0,
       "scale": 1.0,
       "contribution": 0.011356
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 128.0,
       "target": 3109.0,
       "target_scaled": 3109.0,
       "scale": 1.0,
       "contribution": 0.0574
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0768,
       "target_scaled": 0.0768,
       "scale": 1.0,
       "contribution": 0.009746
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 118.5,
       "target": 837.6,
       "target_scaled": 837.6,
       "scale": 1.0,
       "contribution": 0.024886
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0169,
       "target": 0.0207,
       "target_scaled": 0.0207,
       "scale": 1.0,
       "contribution": 0.000256
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 190.0,
       "target": 577.5,
       "target_scaled": 577.5,
       "scale": 1.0,
       "contribution": 0.003964
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.138,
       "target": 0.011,
       "target_scaled": 0.011,
       "scale": 1.0,
       "contribution": 0.077539
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 5.6,
       "target": 17.5,
       "target_scaled": 17.5,
       "scale": 1.0,
       "contribution": 0.01436
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 10.5,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.024606
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.81,
       "target": 0.994,
       "target_scaled": 0.994,
       "scale": 1.0,
       "contribution": 0.019945
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.792,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.005507
      }
     ]
    },
    {
     "ref_id": "copernicus",
     "rank": 5,
     "score": 0.523968,
     "wed": 0.520794,
     "cosine": 0.373425,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 6995.0,
       "target": 96100.0,
       "target_scaled": 96100.0,
       "scale": 1.0,
       "contribution": 0.080409
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 128.0,
       "target": 3525.2,
       "target_scaled": 3525.2,
       "scale": 1.0,
       "contribution": 0.074547
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0367,
       "target_scaled": 0.0367,
       "scale": 1.0,
       "contribution": 0.000964
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 118.5,
       "target": 759.2,
       "target_scaled": 759.2,
       "scale": 1.0,
       "contribution": 0.019756
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0169,
       "target": 0.0079,
       "target_scaled": 0.0079,
       "scale": 1.0,
       "contribution": 0.001435
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 190.0,
       "target": 235.0,
       "target_scaled": 235.0,
       "scale": 1.0,
       "contribution": 5.3e-05
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.138,
       "target": 0.035,
       "target_scaled": 0.035,
       "scale": 1.0,
       "contribution": 0.051002
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 5.6,
       "target": 13.7,
       "target_scaled": 13.7,
       "scale": 1.0,
       "contribution": 0.006653
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 10.5,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.024606
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.81,
       "target": 0.94,
       "target_scaled": 0.94,
       "scale": 1.0,
       "contribution": 0.009956
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.792,
       "target": 0.88,
       "target_scaled": 0.88,
       "scale": 1.0,
       "contribution": 0.001846
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 12
  },
  "vargeao": {
   "kind": "crater",
   "name": "Domo de Vargeão",
   "category": "impact_crater",
   "lat": -26.83333,
   "lon": -52.11667,
   "metrics": {
    "diameter_m": 14400.0,
    "depth_m": 263.3,
    "depth_diameter_ratio": 0.0183,
    "rim_height_m": 84.2,
    "rim_height_diameter_ratio": 0.0058,
    "rim_variation_m": 118.5,
    "rim_radius_cv": 0.087,
    "mean_wall_slope": 8.0,
    "wall_slope_p90": 16.1,
    "circularity": 0.867,
    "rim_coherence": 0.597
   },
   "dq": {
    "source": "catalogo",
    "provenance": {
     "diameter_m": "catalogo:craters.diameter_m (calculado fora deste repositório)",
     "depth_m": "catalogo:craters.depth_m (calculado fora deste repositório)",
     "depth_diameter_ratio": "catalogo:craters.depth_diameter_ratio (calculado fora deste repositório)",
     "rim_height_m": "catalogo:craters.rim_height_m (calculado fora deste repositório)",
     "rim_height_diameter_ratio": "catalogo:craters.rim_height_diameter_ratio (calculado fora deste repositório)",
     "rim_variation_m": "catalogo:craters.rim_variation_m (calculado fora deste repositório)",
     "rim_radius_cv": "catalogo:craters.rim_radius_cv (calculado fora deste repositório)",
     "mean_wall_slope": "catalogo:craters.mean_wall_slope (calculado fora deste repositório)",
     "wall_slope_p90": "catalogo:craters.wall_slope_p90 (calculado fora deste repositório)",
     "circularity": "catalogo:craters.circularity (calculado fora deste repositório)",
     "rim_coherence": "catalogo:craters.rim_coherence (calculado fora deste repositório)"
    },
    "issues": [
     "anel de borda parcial: confiança baixa na comparação com crateras",
     "diâmetro no limite da faixa de busca do catálogo: pode estar subestimado"
    ],
    "features_missing": []
   },
   "crater_class": "partial_ring",
   "confidence": "baixa",
   "matches": [
    {
     "ref_id": "de_gerlache",
     "rank": 1,
     "score": 0.654078,
     "wed": 0.407292,
     "cosine": 0.597443,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14400.0,
       "target": 32612.0,
       "target_scaled": 32612.0,
       "scale": 1.0,
       "contribution": 0.003359
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 263.3,
       "target": 2797.3,
       "target_scaled": 2797.3,
       "scale": 1.0,
       "contribution": 0.041476
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0858,
       "target_scaled": 0.0858,
       "scale": 1.0,
       "contribution": 0.012976
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 84.2,
       "target": 688.5,
       "target_scaled": 688.5,
       "scale": 1.0,
       "contribution": 0.017575
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0211,
       "target_scaled": 0.0211,
       "scale": 1.0,
       "contribution": 0.004147
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 118.5,
       "target": 589.4,
       "target_scaled": 589.4,
       "scale": 1.0,
       "contribution": 0.005854
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.087,
       "target": 0.016,
       "target_scaled": 0.016,
       "scale": 1.0,
       "contribution": 0.024234
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 8.0,
       "target": 21.0,
       "target_scaled": 21.0,
       "scale": 1.0,
       "contribution": 0.017138
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 16.1,
       "target": 25.0,
       "target_scaled": 25.0,
       "scale": 1.0,
       "contribution": 0.005514
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.867,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.009205
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.597,
       "target": 0.917,
       "target_scaled": 0.917,
       "scale": 1.0,
       "contribution": 0.024408
      }
     ]
    },
    {
     "ref_id": "bessel",
     "rank": 2,
     "score": 0.64889,
     "wed": 0.436724,
     "cosine": 0.611736,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14400.0,
       "target": 15311.0,
       "target_scaled": 15311.0,
       "scale": 1.0,
       "contribution": 8e-06
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 263.3,
       "target": 1747.6,
       "target_scaled": 1747.6,
       "scale": 1.0,
       "contribution": 0.014231
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.1141,
       "target_scaled": 0.1141,
       "scale": 1.0,
       "contribution": 0.026137
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 84.2,
       "target": 427.3,
       "target_scaled": 427.3,
       "scale": 1.0,
       "contribution": 0.005665
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0279,
       "target_scaled": 0.0279,
       "scale": 1.0,
       "contribution": 0.008652
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 118.5,
       "target": 255.3,
       "target_scaled": 255.3,
       "scale": 1.0,
       "contribution": 0.000494
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.087,
       "target": 0.009,
       "target_scaled": 0.009,
       "scale": 1.0,
       "contribution": 0.029248
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 8.0,
       "target": 25.9,
       "target_scaled": 25.9,
       "scale": 1.0,
       "contribution": 0.032492
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 16.1,
       "target": 35.1,
       "target_scaled": 35.1,
       "scale": 1.0,
       "contribution": 0.025132
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.867,
       "target": 0.997,
       "target_scaled": 0.997,
       "scale": 1.0,
       "contribution": 0.009956
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.597,
       "target": 1.0,
       "target_scaled": 1.0,
       "scale": 1.0,
       "contribution": 0.038712
      }
     ]
    },
    {
     "ref_id": "aristarchus",
     "rank": 3,
     "score": 0.636242,
     "wed": 0.439326,
     "cosine": 0.582493,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14400.0,
       "target": 40481.0,
       "target_scaled": 40481.0,
       "scale": 1.0,
       "contribution": 0.006889
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 263.3,
       "target": 3109.0,
       "target_scaled": 3109.0,
       "scale": 1.0,
       "contribution": 0.052308
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0768,
       "target_scaled": 0.0768,
       "scale": 1.0,
       "contribution": 0.009746
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 84.2,
       "target": 837.6,
       "target_scaled": 837.6,
       "scale": 1.0,
       "contribution": 0.027317
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0207,
       "target_scaled": 0.0207,
       "scale": 1.0,
       "contribution": 0.003933
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 118.5,
       "target": 577.5,
       "target_scaled": 577.5,
       "scale": 1.0,
       "contribution": 0.005562
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.087,
       "target": 0.011,
       "target_scaled": 0.011,
       "scale": 1.0,
       "contribution": 0.027768
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 8.0,
       "target": 17.5,
       "target_scaled": 17.5,
       "scale": 1.0,
       "contribution": 0.009152
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 16.1,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.01213
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.867,
       "target": 0.994,
       "target_scaled": 0.994,
       "scale": 1.0,
       "contribution": 0.009502
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.597,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.028701
      }
     ]
    },
    {
     "ref_id": "faustini",
     "rank": 4,
     "score": 0.635214,
     "wed": 0.409067,
     "cosine": 0.551949,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14400.0,
       "target": 45982.0,
       "target_scaled": 45982.0,
       "scale": 1.0,
       "contribution": 0.010101
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 263.3,
       "target": 3048.0,
       "target_scaled": 3048.0,
       "scale": 1.0,
       "contribution": 0.050089
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0663,
       "target_scaled": 0.0663,
       "scale": 1.0,
       "contribution": 0.006562
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 84.2,
       "target": 792.8,
       "target_scaled": 792.8,
       "scale": 1.0,
       "contribution": 0.024165
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0172,
       "target_scaled": 0.0172,
       "scale": 1.0,
       "contribution": 0.002302
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 118.5,
       "target": 564.8,
       "target_scaled": 564.8,
       "scale": 1.0,
       "contribution": 0.005258
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.087,
       "target": 0.015,
       "target_scaled": 0.015,
       "scale": 1.0,
       "contribution": 0.024922
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 8.0,
       "target": 15.3,
       "target_scaled": 15.3,
       "scale": 1.0,
       "contribution": 0.005404
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 16.1,
       "target": 19.1,
       "target_scaled": 19.1,
       "scale": 1.0,
       "contribution": 0.000627
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.867,
       "target": 0.992,
       "target_scaled": 0.992,
       "scale": 1.0,
       "contribution": 0.009205
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.597,
       "target": 0.944,
       "target_scaled": 0.944,
       "scale": 1.0,
       "contribution": 0.028701
      }
     ]
    },
    {
     "ref_id": "copernicus",
     "rank": 5,
     "score": 0.63508,
     "wed": 0.458594,
     "cosine": 0.597005,
     "coverage": 1.0,
     "missing_earth": [],
     "missing_reference": [],
     "features": [
      {
       "key": "diameter_m",
       "weight": 0.1,
       "used": true,
       "earth": 14400.0,
       "target": 96100.0,
       "target_scaled": 96100.0,
       "scale": 1.0,
       "contribution": 0.067599
      },
      {
       "key": "depth_m",
       "weight": 0.12,
       "used": true,
       "earth": 263.3,
       "target": 3525.2,
       "target_scaled": 3525.2,
       "scale": 1.0,
       "contribution": 0.068727
      },
      {
       "key": "depth_diameter_ratio",
       "weight": 0.15,
       "used": true,
       "earth": 0.0183,
       "target": 0.0367,
       "target_scaled": 0.0367,
       "scale": 1.0,
       "contribution": 0.000964
      },
      {
       "key": "rim_height_m",
       "weight": 0.08,
       "used": true,
       "earth": 84.2,
       "target": 759.2,
       "target_scaled": 759.2,
       "scale": 1.0,
       "contribution": 0.021928
      },
      {
       "key": "rim_height_diameter_ratio",
       "weight": 0.08,
       "used": true,
       "earth": 0.0058,
       "target": 0.0079,
       "target_scaled": 0.0079,
       "scale": 1.0,
       "contribution": 7.8e-05
      },
      {
       "key": "rim_variation_m",
       "weight": 0.07,
       "used": true,
       "earth": 118.5,
       "target": 235.0,
       "target_scaled": 235.0,
       "scale": 1.0,
       "contribution": 0.000358
      },
      {
       "key": "rim_radius_cv",
       "weight": 0.08,
       "used": true,
       "earth": 0.087,
       "target": 0.035,
       "target_scaled": 0.035,
       "scale": 1.0,
       "contribution": 0.012999
      },
      {
       "key": "mean_wall_slope",
       "weight": 0.12,
       "used": true,
       "earth": 8.0,
       "target": 13.7,
       "target_scaled": 13.7,
       "scale": 1.0,
       "contribution": 0.003295
      },
      {
       "key": "wall_slope_p90",
       "weight": 0.1,
       "used": true,
       "earth": 16.1,
       "target": 29.3,
       "target_scaled": 29.3,
       "scale": 1.0,
       "contribution": 0.01213
      },
      {
       "key": "circularity",
       "weight": 0.05,
       "used": true,
       "earth": 0.867,
       "target": 0.94,
       "target_scaled": 0.94,
       "scale": 1.0,
       "contribution": 0.003139
      },
      {
       "key": "rim_coherence",
       "weight": 0.05,
       "used": true,
       "earth": 0.597,
       "target": 0.88,
       "target_scaled": 0.88,
       "scale": 1.0,
       "contribution": 0.01909
      }
     ]
    }
   ],
   "status": "ok",
   "n_references_compared": 12
  },
  "araguainha": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.028)",
   "name": "Domo de Araguainha",
   "category": "impact_crater",
   "lat": -16.78333,
   "lon": -52.98333,
   "metrics": null,
   "matches": []
  },
  "canion_apertados": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (medido no raster: class=no_crater, rim_coherence=0.2222222222222222)",
   "name": "Cânion dos Apertados",
   "category": "afloramento",
   "lat": -6.34194,
   "lon": -36.50194,
   "metrics": null,
   "matches": []
  },
  "fazenda_tanque": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.778)",
   "name": "Estromatólitos da Fazenda Tanque (Morro do Chapéu)",
   "category": "afloramento",
   "lat": -11.54306,
   "lon": -41.28583,
   "metrics": null,
   "matches": []
  },
  "pedra_cariri": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.583)",
   "name": "Pedra Cariri (Geopark Araripe)",
   "category": "afloramento",
   "lat": -7.09,
   "lon": -39.7,
   "metrics": null,
   "matches": []
  },
  "pedreira_mdc": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.444)",
   "name": "Pedreira de Morro do Chapéu (BA-052)",
   "category": "afloramento",
   "lat": -11.55889,
   "lon": -41.15278,
   "metrics": null,
   "matches": []
  },
  "pico_cabugi": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.611)",
   "name": "Pico do Cabugi (Lajes/Angicos)",
   "category": "vulcanico",
   "lat": -5.71,
   "lon": -36.32,
   "metrics": null,
   "matches": []
  },
  "santa_marta": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.472)",
   "name": "Santa Marta",
   "category": "impact_crater",
   "lat": -10.16667,
   "lon": -45.25,
   "metrics": null,
   "matches": []
  },
  "serra_tombador": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.819)",
   "name": "Serra do Tombador (BR-324)",
   "category": "afloramento",
   "lat": -11.09611,
   "lon": -40.66639,
   "metrics": null,
   "matches": []
  },
  "vale_vulcanico": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.5694444444444444)",
   "name": "Vale Vulcânico (Cerro Corá)",
   "category": "vulcanico",
   "lat": -6.08056,
   "lon": -36.40278,
   "metrics": null,
   "matches": []
  },
  "vista_alegre": {
   "kind": "crater",
   "status": "excluded",
   "reason": "sem cratera detectada (catálogo: class=no_crater, rim_coherence=0.417)",
   "name": "Vista Alegre",
   "category": "impact_crater",
   "lat": -25.95,
   "lon": -52.68333,
   "metrics": null,
   "matches": []
  }
 }
};
