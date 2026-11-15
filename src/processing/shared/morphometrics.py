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
from scipy.ndimage import uniform_filter, gaussian_filter, laplace, correlate1d


# ---------------------------------------------------------------------------
# Função principal
# ---------------------------------------------------------------------------


def extract_morphometrics(
    dem: np.ndarray,
    res_m: float = 30.0,
    *,
    res_y_m: float | None = None,
    smooth_sigma: float = 1.0,
) -> dict[str, Any]:
    """
    Calcula as métricas morfométricas de um DEM 2D.

    Parâmetros
    ----------
    dem      : array 2D float32 (NaN onde inválido)
    res_m    : resolução em metros no eixo x (default 30 m — SRTM1)
    res_y_m  : resolução em metros no eixo y (padrão: igual a res_m)
    smooth_sigma : sigma de suavização gaussiana antes de calcular slope/TRI
                   (reduz artefatos de pixel; 0 = sem suavização)

    Retorna
    -------
    dict com todas as métricas (floats escalares)
    """
    dem = dem.copy().astype(np.float64)
    res_y = res_y_m if res_y_m is not None else res_m
    _validate_grid(dem, res_m, res_y)
    nan_fraction = float(np.mean(~np.isfinite(dem)))
    if nan_fraction:
        raise ValueError(f'DEM com {nan_fraction:.1%} de pixels inválidos; não se preenchem elevações com média')

    if smooth_sigma > 0:
        dem_s = gaussian_filter(dem, sigma=smooth_sigma)
    else:
        dem_s = dem

    # --- Gradientes (Zevenbergen & Thorne 1987 / Sobel) ---
    dz_dy, dz_dx = np.gradient(dem_s, res_y, res_m)

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
    curv = (correlate1d(dem_s, [1, -2, 1], axis=1) / res_m**2
            + correlate1d(dem_s, [1, -2, 1], axis=0) / res_y**2)

    # --- Aspecto (direção de maior declividade) ---
    aspect_rad = np.arctan2(-dz_dx, dz_dy)  # convenção geográfica
    aspect_deg = np.degrees(aspect_rad) % 360

    # --- Comprimento de onda dominante via FFT 2D ---
    wavelength_m = _dominant_wavelength_fft(dem_s, res_m)

    # --- Razão de aspecto H/λ ---
    relief = float(np.nanmax(dem_s) - np.nanmin(dem_s))
    aspect_ratio = relief / wavelength_m if wavelength_m else None

    # --- Anisotropia direcional (razão de variância espectral) ---
    anisotropy = _spectral_anisotropy(dem_s)

    return {
        "slope_mean_deg":     float(np.nanmean(slope_deg)),
        "slope_p90_deg":      float(np.nanpercentile(slope_deg, 90)),
        "roughness_rms_m":    float(roughness_rms),
        "tri":                float(np.nanmean(tri)),
        "aspect_ratio":       float(aspect_ratio) if aspect_ratio is not None else None,
        "relief_m":           float(relief),
        "curvature_mean":     float(np.nanmean(np.abs(curv))),
        "wavelength_m":       float(wavelength_m) if wavelength_m is not None else None,
        "anisotropy":         float(anisotropy) if anisotropy is not None else None,
        "aspect_mean_deg":    float(np.nanmean(aspect_deg)),
        "dem_mean_m":         float(np.nanmean(dem_s)),
        "dem_std_m":          float(np.nanstd(dem_s)),
        "n_pixels":           int(np.sum(~np.isnan(dem))),
        "res_m":              float(res_m),
        "res_y_m":            float(res_y),
        "nan_fraction":       nan_fraction,
    }


# ---------------------------------------------------------------------------
# Funções auxiliares
# ---------------------------------------------------------------------------


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


def _dominant_wavelength_fft(dem: np.ndarray, res_m: float) -> float | None:
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
        return None  # sem sinal espectral: não há comprimento de onda mensurável

    # Pico radial → frequência espacial → comprimento de onda
    peak_r = np.argmax(radial_psd[1:]) + 1
    freq_per_pixel = peak_r / (min(ny, nx))  # ciclos/pixel
    if freq_per_pixel == 0:
        return None
    return res_m / freq_per_pixel  # metros


def _spectral_anisotropy(dem: np.ndarray) -> float | None:
    """
    Razão de anisotropia direcional: variância no eixo X / variância no eixo Y.
    Valor ~1 = isotrópico; >1 = feições predominantemente E-O; <1 = N-S.
    """
    var_x = float(np.var(np.diff(dem, axis=1)))
    var_y = float(np.var(np.diff(dem, axis=0)))
    if var_y == 0:
        return None  # relevo plano na direção y: razão indefinida
    return var_x / var_y


# ===========================================================================
# Métricas de DUNAS calculadas a partir do DEM
# ===========================================================================
#
# Método (validado apenas com DEM sintético; não há raster de dunas no repo):
#   1. passa-alta gaussiana (σ = 300 m) remove o relevo regional;
#   2. espectro 2D (janela de Hann): o pico na banda λ∈[4 px, janela/3] dá o
#      comprimento de onda e a direção de propagação; a crista é perpendicular;
#   3. perfis paralelos ao vetor de onda: cada crista tem uma proeminência
#      (altura sobre as depressões vizinhas) e o espaçamento até a próxima;
#   4. densidade = nº de regiões de resíduo positivo (segmentos de crista) / km².
# Se o sinal é fraco demais, o atributo vem como None COM o motivo.

DUNE_METRICS = ("mean_height", "height_p90", "wavelength", "crest_azimuth",
                "dune_density", "mean_spacing")

# Em ruído branco o maior bin da banda já é ~log2(N) vezes a mediana (N = nº de
# bins). O pico só vale como periodicidade se superar isso por este fator.
_SPECTRAL_PEAK_MARGIN = 4.0


def _to_square(z: np.ndarray, res_x: float, res_y: float) -> tuple[np.ndarray, float]:
    """Reamostra para pixels quadrados quando res_x e res_y diferem >5%."""
    if abs(res_x - res_y) / max(res_x, res_y) < 0.05:
        return z, (res_x + res_y) / 2.0
    from scipy.ndimage import zoom
    return zoom(z, (res_y / res_x, 1.0), order=1), res_x


def _validate_grid(dem, res_x, res_y):
    if np.ndim(dem) != 2 or min(np.shape(dem), default=0) < 3:
        raise ValueError('DEM deve ser uma matriz 2D com pelo menos 3 pixels por eixo')
    if not np.isfinite([res_x, res_y]).all() or min(res_x, res_y) <= 0:
        raise ValueError('resoluções devem ser positivas e finitas')


def dune_morphometrics(
    dem: np.ndarray,
    res_x_m: float,
    res_y_m: float | None = None,
    *,
    sigma_highpass_m: float = 300.0,
) -> tuple[dict[str, float | None], dict[str, str]]:
    """Retorna ({métrica: valor|None}, {métrica: motivo de ausência})."""
    from scipy.ndimage import label, map_coordinates
    from scipy.signal import find_peaks

    out: dict[str, float | None] = {k: None for k in DUNE_METRICS}
    notes: dict[str, str] = {}

    def fail(why: str):
        for k in DUNE_METRICS:
            if out[k] is None:
                notes[k] = why
        return out, notes

    _validate_grid(dem, res_x_m, res_y_m if res_y_m is not None else res_x_m)
    valid = np.isfinite(dem)
    nan_frac = 1.0 - float(valid.mean())
    if nan_frac > 0:
        return fail(f"{nan_frac:.1%} do raster sem dados; métricas espectrais indisponíveis, sem preenchimento por média")

    z = dem.astype(np.float64)
    z, res = _to_square(z, res_x_m, res_y_m or res_x_m)
    ny, nx = z.shape
    if min(ny, nx) * res < 1000.0:
        return fail(f"janela de {min(ny, nx) * res:.0f} m é pequena demais (mínimo 1 km)")

    resid = z - gaussian_filter(z, sigma_highpass_m / res)

    # --- espectro 2D ---
    win = np.outer(np.hanning(ny), np.hanning(nx))
    psd = np.abs(np.fft.fft2(resid * win)) ** 2
    fy = np.fft.fftfreq(ny, d=res)[:, None]
    fx = np.fft.fftfreq(nx, d=res)[None, :]
    fr = np.hypot(fx, fy)
    lam_min, lam_max = 4.0 * res, min(ny, nx) * res / 3.0
    band = (fr >= 1.0 / lam_max) & (fr <= 1.0 / lam_min)
    if not band.any():
        return fail("banda espectral vazia para essa janela/resolução")

    psd_b = np.where(band, psd, 0.0)
    iy, ix = np.unravel_index(np.argmax(psd_b), psd.shape)
    base = float(np.median(psd[band]))
    ratio = float(psd_b[iy, ix] / base) if base > 0 else np.inf
    min_ratio = _SPECTRAL_PEAK_MARGIN * np.log2(max(int(band.sum()), 2))
    if ratio < min_ratio:
        return fail(f"sem periodicidade dominante (pico espectral {ratio:.0f}x a mediana; "
                    f"mínimo {min_ratio:.0f}x para distinguir de ruído)")

    kx, ky = float(fx[0, ix]), float(fy[iy, 0])
    k = float(np.hypot(kx, ky))
    wavelength = 1.0 / k
    prop_az = np.degrees(np.arctan2(kx, -ky)) % 360.0   # norte = -linhas
    out["wavelength"] = wavelength
    out["crest_azimuth"] = float((prop_az + 90.0) % 180.0)

    # --- perfis paralelos ao vetor de onda ---
    d_row, d_col = ky / k, kx / k
    half = 0.5 * min(ny, nx) * 0.95
    s = np.arange(-half, half, 1.0)
    heights: list[float] = []
    spacings: list[float] = []
    thr = 0.5 * float(np.std(resid))
    for t in np.linspace(-0.9 * half, 0.9 * half, 25):
        rows = ny / 2.0 + s * d_row - t * d_col
        cols = nx / 2.0 + s * d_col + t * d_row
        inside = (rows >= 0) & (rows <= ny - 1) & (cols >= 0) & (cols <= nx - 1)
        if inside.sum() < 3 * wavelength / res:
            continue
        prof = map_coordinates(resid, [rows[inside], cols[inside]], order=1)
        pk, props = find_peaks(prof, prominence=thr, distance=max(1, int(0.5 * wavelength / res)))
        heights.extend(props["prominences"].tolist())
        if len(pk) > 1:
            spacings.extend((np.diff(pk) * res).tolist())

    if len(heights) < 5 or not spacings:
        why = f"menos de 5 cristas detectáveis nos perfis ({len(heights)})"
        for key in ("mean_height", "height_p90", "mean_spacing"):
            notes[key] = why
    else:
        out["mean_height"] = float(np.mean(heights))
        out["height_p90"] = float(np.percentile(heights, 90))
        out["mean_spacing"] = float(np.mean(spacings))

    # --- densidade de cristas (segmentos de resíduo positivo) ---
    sm = gaussian_filter(resid, max(1.0, wavelength / res / 8.0))
    labels, n = label(sm > 0)
    if n:
        areas = np.bincount(labels.ravel())[1:] * res * res
        n_valid = int(np.sum(areas >= (wavelength / 2.0) ** 2))
        out["dune_density"] = n_valid / (ny * nx * res * res / 1e6)
    else:
        notes["dune_density"] = "nenhum segmento de crista identificado"
    return out, notes


# ===========================================================================
# Métricas de CRATERAS calculadas a partir do DEM (contrato de dados, seção 1)
# ===========================================================================
#
# Método: centro = mínimo do relevo suavizado na metade central da janela; 72
# raios; em cada raio a borda é o máximo de elevação até metade do raio
# inscrito (para o entorno 1,5–2 R caber na janela). Um raio "conta" se a borda
# está acima do piso e do entorno. Círculo ajustado por mínimos quadrados
# (Kasa) nos pontos de borda. Nomes e definições seguem docs/methodology.

CRATER_METRICS = ("diameter_m", "depth_m", "depth_diameter_ratio", "rim_height_m",
                  "rim_height_diameter_ratio", "rim_variation_m", "rim_radius_cv",
                  "mean_wall_slope", "wall_slope_p90", "circularity", "rim_coherence")


def crater_morphometrics(
    dem: np.ndarray,
    res_x_m: float,
    res_y_m: float | None = None,
    *,
    n_rays: int = 72,
    min_coherence: dict[str, float] | None = None,
) -> tuple[dict[str, Any], dict[str, str]]:
    """Retorna ({métrica: valor|None, 'crater_class': ...}, {métrica: motivo})."""
    from scipy.ndimage import map_coordinates
    from src.shared.constants import CRATER_CLASS_MIN_COHERENCE

    min_coh = min_coherence or CRATER_CLASS_MIN_COHERENCE
    out: dict[str, Any] = {k: None for k in CRATER_METRICS}
    out["crater_class"] = "no_crater"
    notes: dict[str, str] = {}

    def fail(why: str):
        out['crater_class'] = None  # insufficient data does not prove absence of a crater
        for k in CRATER_METRICS:
            if out[k] is None:
                notes[k] = why
        return out, notes

    _validate_grid(dem, res_x_m, res_y_m if res_y_m is not None else res_x_m)
    valid = np.isfinite(dem)
    nan_frac = 1.0 - float(valid.mean())
    if nan_frac > 0:
        return fail(f"{nan_frac:.1%} do raster sem dados; não é possível inferir anel sem preencher elevações")

    z = dem.astype(np.float64)
    z, res = _to_square(z, res_x_m, res_y_m or res_x_m)
    ny, nx = z.shape
    zs = gaussian_filter(z, 1.0)

    # centro: mínimo do relevo suavizado na metade central
    zc = gaussian_filter(z, max(1.0, 0.03 * min(ny, nx)))
    y0, y1, x0, x1 = ny // 4, 3 * ny // 4, nx // 4, 3 * nx // 4
    iy, ix = np.unravel_index(np.argmin(zc[y0:y1, x0:x1]), (y1 - y0, x1 - x0))
    cy, cx = y0 + iy, x0 + ix
    r_max = int(min(cy, ny - 1 - cy, cx, nx - 1 - cx))
    if r_max < 12:
        return fail("janela pequena demais para procurar uma cratera")
    r_search = r_max // 2

    th = np.linspace(0.0, 2 * np.pi, n_rays, endpoint=False)
    radii = np.arange(1, r_max + 1, dtype=float)
    rows = cy - radii[None, :] * np.cos(th)[:, None]
    cols = cx + radii[None, :] * np.sin(th)[:, None]
    prof = map_coordinates(zs, [rows, cols], order=1)

    r_lo = 3
    seg = prof[:, r_lo - 1: r_search]
    i_rim = np.argmax(seg, axis=1) + (r_lo - 1)
    r_rim = radii[i_rim]
    z_rim = prof[np.arange(n_rays), i_rim]
    at_limit = i_rim >= r_search - 2

    yy, xx = np.mgrid[0:ny, 0:nx]
    r0 = float(np.median(r_rim))
    inside0 = (yy - cy) ** 2 + (xx - cx) ** 2 <= (0.9 * r0) ** 2
    floor0 = float(np.percentile(zs[inside0], 5))

    z_out = np.empty(n_rays)
    for i in range(n_rays):
        a, b = int(round(1.5 * r_rim[i])), int(round(2.0 * r_rim[i]))
        z_out[i] = prof[i, a - 1: min(b, r_max)].mean()
    ok = (z_rim > floor0) & (z_rim > z_out) & ~at_limit
    coherence = float(ok.mean())
    out["rim_coherence"] = coherence

    def classify() -> str:
        if coherence >= min_coh["crater"]:
            return "crater"
        if coherence >= min_coh["partial_ring"]:
            return "partial_ring"
        return "no_crater"

    if ok.sum() < 12:
        out["crater_class"] = "no_crater"
        for k in CRATER_METRICS:
            if out[k] is None:
                notes[k] = f"anel de borda incompleto: só {int(ok.sum())} de {n_rays} direções têm borda"
        return out, notes

    # círculo ajustado (Kasa) nos pontos de borda
    px = cx + r_rim[ok] * np.sin(th[ok])
    py = cy - r_rim[ok] * np.cos(th[ok])
    A = np.column_stack([2 * px, 2 * py, np.ones(ok.sum())])
    sol, *_ = np.linalg.lstsq(A, px**2 + py**2, rcond=None)
    ccx, ccy = sol[0], sol[1]
    R = float(np.sqrt(sol[2] + ccx**2 + ccy**2))
    d_m = 2.0 * R * res

    inside = (yy - ccy) ** 2 + (xx - ccx) ** 2 <= (0.9 * R) ** 2
    floor = float(np.percentile(zs[inside], 5))
    rim_med = float(np.median(z_rim[ok]))
    depth = rim_med - floor

    gy, gx = np.gradient(zs, res, res)
    slope = np.degrees(np.arctan(np.hypot(gx, gy)))
    dist = np.hypot(yy - ccy, xx - ccx)
    wall = (dist >= 0.6 * R) & (dist <= 0.95 * R)

    # circularidade 4πA/P² do polígono da borda
    order = np.argsort(th[ok])
    qx, qy = px[order], py[order]
    area = 0.5 * abs(np.dot(qx, np.roll(qy, -1)) - np.dot(qy, np.roll(qx, -1)))
    perim = float(np.sum(np.hypot(qx - np.roll(qx, -1), qy - np.roll(qy, -1))))

    out.update({
        "diameter_m": d_m,
        "depth_m": depth,
        "depth_diameter_ratio": depth / d_m,
        "rim_height_m": float(np.median((z_rim - z_out)[ok])),
        "rim_variation_m": float(np.std(z_rim[ok])),
        "rim_radius_cv": float(np.std(r_rim[ok]) / np.mean(r_rim[ok])),
        "mean_wall_slope": float(slope[wall].mean()),
        "wall_slope_p90": float(np.percentile(slope[wall], 90)),
        "circularity": float(4 * np.pi * area / perim**2) if perim > 0 else None,
    })
    out["rim_height_diameter_ratio"] = out["rim_height_m"] / d_m

    cls = classify()
    if depth <= 0:
        cls = "no_crater"
        notes["depth_m"] = "piso não está abaixo da borda"
    if 2 * R < 8:
        cls = "no_crater"
        notes["diameter_m"] = "diâmetro menor que 8 pixels: não resolvido"
    out["crater_class"] = cls
    out["fit_center_offset_px"] = float(np.hypot(ccx - cx, ccy - cy))
    return out, notes
