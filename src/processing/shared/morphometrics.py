"""
src/processing/shared/morphometrics.py
=======================================
Extração de métricas morfométricas de DEMs (Digital Elevation Models).

Métricas calculadas
-------------------
- slope_mean_deg    : declividade média (graus)
- slope_p90_deg     : Slope P90 (percentil 90 da declividade)
- roughness_rms_m   : Rugosidade RMS (desvio padrão da elevação)
- tri               : Terrain Ruggedness Index (Riley et al. 1999)
- aspect_ratio      : Razão H/λ (amplitude / comprimento de onda espectral)
- relief_m          : Amplitude de relevo (max − min)
- curvature_mean    : Curvatura média laplaciana (proxy de forma)
- anisotropy        : Anisotropia direcional (via FFT 2D)
"""

from __future__ import annotations

from typing import Any

import numpy as np
from scipy.ndimage import uniform_filter, gaussian_filter, laplace


# ---------------------------------------------------------------------------
# Função principal
# ---------------------------------------------------------------------------


def extract_morphometrics(
    dem: np.ndarray,
    res_m: float = 30.0,
    *,
    smooth_sigma: float = 1.0,
) -> dict[str, Any]:
    """
    Calcula as métricas morfométricas de um DEM 2D.

    Parâmetros
    ----------
    dem      : array 2D float32 (NaN onde inválido)
    res_m    : resolução espacial em metros (default 30 m — SRTM1)
    smooth_sigma : sigma de suavização gaussiana antes de calcular slope/TRI
                   (reduz artefatos de pixel; 0 = sem suavização)

    Retorna
    -------
    dict com todas as métricas (floats escalares)
    """
    dem = dem.copy().astype(np.float64)
    # Preenche NaNs com interpolação simples (vizinho mais próximo via flood-fill)
    dem = _fill_nans(dem)

    if smooth_sigma > 0:
        dem_s = gaussian_filter(dem, sigma=smooth_sigma)
    else:
        dem_s = dem

    # --- Gradientes (Zevenbergen & Thorne 1987 / Sobel) ---
    dz_dy, dz_dx = np.gradient(dem_s, res_m, res_m)

    # Declividade em graus
    slope_rad = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
    slope_deg = np.degrees(slope_rad)

    # --- TRI (Riley et al. 1999) ---
    tri = _compute_tri(dem_s)

    # --- Rugosidade RMS ---
    # Desvio padrão da elevação em janela local 7×7
    local_mean = uniform_filter(dem_s, size=7)
    roughness_rms = float(np.std(dem_s - local_mean))

    # --- Curvatura (Laplaciano) ---
    curv = laplace(dem_s) / (res_m**2)

    # --- Aspecto (direção de maior declividade) ---
    aspect_rad = np.arctan2(-dz_dx, dz_dy)  # convenção geográfica
    aspect_deg = np.degrees(aspect_rad) % 360

    # --- Comprimento de onda dominante via FFT 2D ---
    wavelength_m = _dominant_wavelength_fft(dem_s, res_m)

    # --- Razão de aspecto H/λ ---
    relief = float(np.nanmax(dem_s) - np.nanmin(dem_s))
    aspect_ratio = relief / wavelength_m if wavelength_m > 0 else np.nan

    # --- Anisotropia direcional (razão de variância espectral) ---
    anisotropy = _spectral_anisotropy(dem_s)

    return {
        "slope_mean_deg":     float(np.nanmean(slope_deg)),
        "slope_p90_deg":      float(np.nanpercentile(slope_deg, 90)),
        "roughness_rms_m":    float(roughness_rms),
        "tri":                float(np.nanmean(tri)),
        "aspect_ratio":       float(aspect_ratio),
        "relief_m":           float(relief),
        "curvature_mean":     float(np.nanmean(np.abs(curv))),
        "wavelength_m":       float(wavelength_m),
        "anisotropy":         float(anisotropy),
        "aspect_mean_deg":    float(np.nanmean(aspect_deg)),
        "dem_mean_m":         float(np.nanmean(dem_s)),
        "dem_std_m":          float(np.nanstd(dem_s)),
        "n_pixels":           int(np.sum(~np.isnan(dem))),
        "res_m":              float(res_m),
    }


# ---------------------------------------------------------------------------
# Funções auxiliares
# ---------------------------------------------------------------------------


def _fill_nans(arr: np.ndarray) -> np.ndarray:
    """Substitui NaN pelo valor médio global (simples, sem distorção)."""
    mask = np.isnan(arr)
    if mask.any():
        arr[mask] = np.nanmean(arr)
    return arr


def _compute_tri(dem: np.ndarray) -> np.ndarray:
    """
    Terrain Ruggedness Index (Riley et al. 1999).
    TRI = sqrt(sum((z_center - z_neighbor)^2))  para 8 vizinhos.
    """
    # Pad com reflexão para manter dimensões
    p = np.pad(dem, 1, mode="reflect")
    center = p[1:-1, 1:-1]
    tri = np.zeros_like(center)
    for di in [-1, 0, 1]:
        for dj in [-1, 0, 1]:
            if di == 0 and dj == 0:
                continue
            neighbor = p[1 + di : dem.shape[0] + 1 + di, 1 + dj : dem.shape[1] + 1 + dj]
            tri += (center - neighbor) ** 2
    return np.sqrt(tri)


def _dominant_wavelength_fft(dem: np.ndarray, res_m: float) -> float:
    """
    Estima o comprimento de onda dominante via FFT 2D radial.

    Retorna comprimento de onda em metros do pico de potência espectral.
    """
    # Apodiza com janela de Hann 2D
    ny, nx = dem.shape
    wy = np.hanning(ny)
    wx = np.hanning(nx)
    window = np.outer(wy, wx)

    dem_w = (dem - dem.mean()) * window
    F = np.fft.fft2(dem_w)
    psd = np.abs(np.fft.fftshift(F)) ** 2

    # Espectro radial — frequências em ciclos/pixel
    cy, cx = ny // 2, nx // 2
    yy, xx = np.mgrid[-cy : ny - cy, -cx : nx - cx]
    rr = np.sqrt(xx**2 + yy**2).astype(int)

    max_r = min(cy, cx)
    radial_psd = np.zeros(max_r)
    for r in range(1, max_r):
        mask = rr == r
        if mask.any():
            radial_psd[r] = psd[mask].mean()

    if radial_psd.max() == 0:
        return 0.0

    # Pico radial → frequência espacial → comprimento de onda
    peak_r = np.argmax(radial_psd[1:]) + 1
    freq_per_pixel = peak_r / (min(ny, nx))  # ciclos/pixel
    if freq_per_pixel == 0:
        return 0.0
    return res_m / freq_per_pixel  # metros


def _spectral_anisotropy(dem: np.ndarray) -> float:
    """
    Razão de anisotropia direcional: variância no eixo X / variância no eixo Y.
    Valor ~1 = isotrópico; >1 = feições predominantemente E-O; <1 = N-S.
    """
    var_x = float(np.var(np.diff(dem, axis=1)))
    var_y = float(np.var(np.diff(dem, axis=0)))
    if var_y == 0:
        return 1.0
    return var_x / var_y
