"""Read-only DEM acquisition and general terrain analysis. JSON-lines worker for the local API.

Known sites require geographic evidence. Feature metrics come from a validated
DEM rim extractor or reviewed evidence registry; ROI radius is never a diameter.
"""
from __future__ import annotations
import hashlib
import json
import math
import os
from pathlib import Path
import sys
import tempfile
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path(os.environ.get("ANALYSIS_CACHE_DIR", str(Path(os.environ.get("LOCALAPPDATA", tempfile.gettempdir())) / "PlanetaryAnalogFinder" / "dem")))


class AnalysisError(ValueError):
    pass


def validate(data):
    if not isinstance(data, dict):
        raise AnalysisError("Entrada deve ser um objeto JSON.")
    name = data.get("nome")
    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 120:
        raise AnalysisError("Informe um nome com até 120 caracteres.")
    for key, lower, upper in [("latitude", -90, 90), ("longitude", -180, 180), ("raio_km", 2, 10)]:
        value = data.get(key)
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not lower <= value <= upper:
            raise AnalysisError(f"{key} deve estar entre {lower} e {upper}.")
    bodies = data.get("comparar_com")
    if not isinstance(bodies, list) or not bodies or any(not isinstance(b, str) or b not in ("lua", "marte") for b in bodies) or len(bodies) != len(set(bodies)):
        raise AnalysisError("Escolha Lua, Marte ou ambos, sem duplicações.")
    return {**{key: data[key] for key in ("latitude", "longitude", "raio_km", "comparar_com")}, "nome": name.strip()}


def area(data):
    from rasterio.crs import CRS
    from rasterio.warp import transform, transform_bounds
    lat, lon = data["latitude"], data["longitude"]
    if -80 <= lat <= 84:
        crs = CRS.from_epsg((32600 if lat >= 0 else 32700) + min(60, int((lon + 180) / 6) + 1))
    else:
        crs = CRS.from_epsg(3413 if lat > 0 else 3031)
    xs, ys = transform("EPSG:4326", crs, [lon], [lat])
    x, y, r = xs[0], ys[0], data["raio_km"] * 1000
    bbox = transform_bounds(crs, "EPSG:4326", x-r, y-r, x+r, y+r, densify_pts=21)
    if bbox[2] - bbox[0] > 5 or bbox[3] - bbox[1] > 5:
        raise AnalysisError("Região cruza o antimeridiano/polo; reduza o raio ou ajuste o centro.")
    return crs, (x-r, y-r, x+r, y+r), bbox


def download(url, destination, max_bytes=120_000_000):
    """Bounded, atomic downloads. Never log URLs (OpenTopography URLs contain a key)."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_suffix(f".{uuid.uuid4().hex}.part")
    try:
        with urllib.request.urlopen(url, timeout=45) as response, partial.open("wb") as out:
            total = 0
            while chunk := response.read(1_048_576):
                total += len(chunk)
                if total > max_bytes:
                    raise AnalysisError("O DEM excedeu o limite de download.")
                out.write(chunk)
        import rasterio
        with rasterio.open(partial) as src:
            if not src.crs or src.count != 1:
                raise AnalysisError("DEM recebido sem CRS ou com bandas incompatíveis.")
        partial.replace(destination)
    except AnalysisError:
        raise
    except Exception:
        raise AnalysisError("Não foi possível obter o DEM. Verifique rede, cobertura e credencial da fonte configurada.") from None
    finally:
        partial.unlink(missing_ok=True)


def sources(bbox, emit):
    import rasterio
    from rasterio.warp import transform_bounds
    local = os.environ.get("ANALYSIS_DEM_PATHS")
    paths = [Path(p) for p in local.split(os.pathsep)] if local else [
        ROOT / "data/earth/dem/srtm/S07W037.hgt",
        ROOT / "data/earth/craters/canion_apertados_dem.tif",
        ROOT / "data/earth/craters/vale_vulcanico_dem.tif",
    ]
    for path in paths:
        if not path.is_file():
            continue
        with rasterio.open(path) as src:
            if not src.crs or src.count != 1:
                continue
            bounds = transform_bounds(src.crs, "EPSG:4326", *src.bounds)
            if bounds[0] <= bbox[0] and bounds[1] <= bbox[1] and bounds[2] >= bbox[2] and bounds[3] >= bbox[3]:
                return [str(path)], {"id": "dem-local", "title": "DEM local: " + path.name,
                    "url": "", "kind": "DEM local em metros; procedência deve ser conferida pelo operador",
                    "files": [path.name], "cache_hit": False}
    provider = os.environ.get("ANALYSIS_DEM_PROVIDER", "copernicus-public")
    if provider == "local":
        raise AnalysisError("Nenhum DEM local cobre toda a região. Configure ANALYSIS_DEM_PATHS ou uma fonte remota.")
    if provider == "opentopography":
        from urllib.parse import urlencode
        key = os.environ.get("OPENTOPOGRAPHY_API_KEY")
        if not key:
            raise AnalysisError("Configure OPENTOPOGRAPHY_API_KEY ou use ANALYSIS_DEM_PROVIDER=copernicus-public.")
        digest = hashlib.sha256(json.dumps(["COP30", bbox], sort_keys=True).encode()).hexdigest()
        file = CACHE / (digest + ".tif")
        hit = file.exists()
        if not hit:
            download("https://portal.opentopography.org/API/globaldem?" + urlencode(dict(
                demtype="COP30", west=bbox[0], south=bbox[1], east=bbox[2], north=bbox[3], outputFormat="GTiff", API_Key=key)), file)
        return [str(file)], {"id": "cop30", "title": "Copernicus GLO-30 via OpenTopography", "url": "https://opentopography.org/developers", "kind": "DSM, EGM2008", "cache_hit": hit}
    if provider != "copernicus-public":
        raise AnalysisError("ANALYSIS_DEM_PROVIDER deve ser local, copernicus-public ou opentopography.")
    tiles, hit = [], True
    for lat in range(math.floor(bbox[1]), math.floor(bbox[3]) + 1):
        for lon in range(math.floor(bbox[0]), math.floor(bbox[2]) + 1):
            stem = f"Copernicus_DSM_COG_10_{'N' if lat >= 0 else 'S'}{abs(lat):02d}_00_{'E' if lon >= 0 else 'W'}{abs(lon):03d}_00_DEM"
            region_key = hashlib.sha256(json.dumps(bbox).encode()).hexdigest()[:20]
            file = CACHE / "tiles" / (stem + "_" + region_key + ".tif")
            if not file.exists():
                hit = False
                emit("obtendo_dem", "Obtendo tile Copernicus GLO-30 público…")
                public_cog_crop(f"https://copernicus-dem-30m.s3.amazonaws.com/{stem}/{stem}.tif", file, bbox)
            tiles.append(str(file))
    return tiles, {"id": "cop30", "title": "Copernicus GLO-30 Public / Sinergise", "url": "https://registry.opendata.aws/copernicus-dem/", "kind": "DSM, EGM2008; inclui vegetação e edificações", "cache_hit": hit, "files": [Path(p).name for p in tiles]}


def public_cog_crop(url, destination, bbox):
    """Read only intersecting COG blocks using HTTP ranges; cache a georeferenced crop."""
    import rasterio
    from rasterio.windows import Window, from_bounds
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_suffix(f".{uuid.uuid4().hex}.part")
    try:
        with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", GDAL_HTTP_TIMEOUT="35", GDAL_HTTP_MAX_RETRY="1"):
            with rasterio.open(url) as src:
                if src.crs.to_epsg() != 4326 or src.count != 1:
                    raise AnalysisError("COG público fora do contrato WGS84 de elevação.")
                raw = from_bounds(*bbox, transform=src.transform)
                window = Window(math.floor(raw.col_off)-2, math.floor(raw.row_off)-2, math.ceil(raw.width)+5, math.ceil(raw.height)+5).intersection(Window(0, 0, src.width, src.height))
                values = src.read(1, window=window)
                profile = src.profile.copy()
                profile.update(driver="GTiff", width=values.shape[1], height=values.shape[0], transform=src.window_transform(window), compress="deflate")
                with rasterio.open(partial, "w", **profile) as dst:
                    dst.write(values, 1)
        partial.replace(destination)
    except AnalysisError:
        raise
    except Exception:
        # Some networks/proxies fail GDAL range requests. Retry with a bounded full
        # tile download using urllib, then crop locally; still the same real DSM.
        full = CACHE / "fulltiles" / (hashlib.sha256(url.encode()).hexdigest() + ".tif")
        if not full.is_file():
            download(url, full)
        try:
            with rasterio.open(full) as src:
                raw = from_bounds(*bbox, transform=src.transform)
                window = Window(math.floor(raw.col_off)-2, math.floor(raw.row_off)-2, math.ceil(raw.width)+5, math.ceil(raw.height)+5).intersection(Window(0, 0, src.width, src.height))
                values = src.read(1, window=window)
                profile = src.profile.copy()
                profile.update(driver="GTiff", width=values.shape[1], height=values.shape[0], transform=src.window_transform(window), compress="deflate")
                with rasterio.open(partial, "w", **profile) as dst:
                    dst.write(values, 1)
            partial.replace(destination)
        except Exception:
            raise AnalysisError("Copernicus público indisponível para a região/rede. Configure DEM local ou OpenTopography; nenhum dado foi simulado.") from None
    finally:
        partial.unlink(missing_ok=True)


def terrain(data, emit=lambda *_: None, with_grid=False):
    import numpy as np
    import rasterio
    from rasterio.warp import reproject, Resampling
    from rasterio.transform import from_origin
    from scipy.ndimage import uniform_filter
    crs, bounds, bbox = area(data)
    paths, provenance = sources(bbox, emit)
    resolution = float(os.environ.get("ANALYSIS_RESOLUTION_M", "30"))
    if not math.isfinite(resolution) or not 10 <= resolution <= 100:
        raise AnalysisError("ANALYSIS_RESOLUTION_M deve estar entre 10 e 100 m.")
    signature = ["terrain-v2-native-resolution", bbox, data["latitude"], data["longitude"], data["raio_km"], resolution,
        provenance["id"], [(str(Path(p).resolve()), Path(p).stat().st_mtime_ns, Path(p).stat().st_size) for p in paths]]
    cache_key = hashlib.sha256(json.dumps(signature, sort_keys=True).encode()).hexdigest()
    cached = CACHE / "regions" / (cache_key + ".json")
    if cached.is_file() and not with_grid:
        result = json.loads(cached.read_text(encoding="utf-8"))
        result["source"]["cache_hit"] = True
        emit("processando_relevo", "Métricas do mesmo DEM, região e resolução recuperadas do cache…")
        return result
    emit("processando_relevo", "Reprojetando DEM e calculando métricas em metros…")
    n = math.ceil((bounds[2] - bounds[0]) / resolution)
    if n*n > 4_000_000:
        raise AnalysisError("Região excede o limite de pixels.")
    affine = from_origin(bounds[0], bounds[3], resolution, resolution)
    dem = np.full((n, n), np.nan, dtype="float32")
    inputs = []
    for path in paths:
        patch = np.full_like(dem, np.nan)
        with rasterio.open(path) as src:
            unit = (src.units[0] or "m").strip().lower()
            if unit not in ("m", "metre", "meter", "metres", "meters") or src.scales[0] != 1 or src.offsets[0] != 0:
                raise AnalysisError("DEM deve conter elevação diretamente em metros, sem fator de escala/offset. Converta o produto antes da análise.")
            if src.crs.is_geographic:
                native_m = max(src.res[0]*111320*math.cos(math.radians(data["latitude"])), src.res[1]*111320)
            else:
                native_m = max(src.res)*src.crs.linear_units_factor[1]
            inputs.append({"file": Path(path).name, "crs": str(src.crs), "resolution_native": list(src.res), "resolution_native_approx_m": native_m, "nodata": "NaN" if src.nodata is not None and not math.isfinite(src.nodata) else src.nodata})
            reproject(source=rasterio.band(src, 1), destination=patch,
                src_transform=src.transform, src_crs=src.crs, src_nodata=src.nodata,
                dst_transform=affine, dst_crs=crs, dst_nodata=np.nan, resampling=Resampling.bilinear)
        good = np.isfinite(patch)
        dem[good] = patch[good]
    yy, xx = np.indices(dem.shape)
    radius = data["raio_km"] * 1000
    disk = ((xx+.5)*resolution-radius)**2 + (radius-(yy+.5)*resolution)**2 <= radius**2
    valid = disk & np.isfinite(dem)
    coverage = float(valid.sum()/disk.sum())
    if valid.sum() < 100:
        raise AnalysisError("DEM sem cobertura válida suficiente (NoData).")
    z = dem[valid].astype(float)
    dy, dx = np.gradient(dem.astype(float), resolution)
    slope = np.degrees(np.arctan(np.hypot(dx, dy)))
    sv = slope[valid & np.isfinite(slope)]
    count = uniform_filter(np.isfinite(dem).astype(float), size=7)
    mean = uniform_filter(np.where(np.isfinite(dem), dem, 0).astype(float), size=7) / np.maximum(count, 1e-12)
    bins = [0, 5, 15, 30, 45, 90]
    histogram = np.histogram(sv, bins=bins)[0].tolist()
    metrics = {
        "elevation_min_m": float(z.min()), "elevation_max_m": float(z.max()),
        "elevation_mean_m": float(z.mean()), "relief_m": float(z.max()-z.min()),
        "slope_mean_deg": float(sv.mean()) if sv.size else None,
        "slope_p90_deg": float(np.percentile(sv, 90)) if sv.size else None,
        "roughness_rms_m": float(np.sqrt(np.mean((dem[valid]-mean[valid])**2))),
    }
    result = {"metrics": metrics, "coverage": coverage, "resolution_m": resolution,
        "metric_crs": str(crs), "bounds_wgs84": list(bbox), "valid_pixels": int(valid.sum()),
        "slope_valid_pixels": int(sv.size), "slope_distribution": {"bins_deg": bins, "counts": histogram},
        "source": {**provenance, "inputs": inputs},
        "method": "ROI circular; reamostragem bilinear em CRS métrico; gradiente central sem preenchimento de NoData; RMS do resíduo de média local 7×7; relevo máximo−mínimo.",
        "warnings": (["Cobertura DEM inferior a 80%; candidato bloqueado."] if coverage < .8 else []) + ["DEM/DSM não identifica crateras de impacto nem campos de dunas."]}
    cached.parent.mkdir(parents=True, exist_ok=True)
    partial = cached.with_suffix(f".{uuid.uuid4().hex}.part")
    try:
        partial.write_text(json.dumps(result, ensure_ascii=False, allow_nan=False), encoding="utf-8")
        partial.replace(cached)
    finally:
        partial.unlink(missing_ok=True)
    return (result, dem, affine, crs) if with_grid else result


def reviewed_feature(data):
    """Only server-managed evidence can identify a feature; never the name or target radio."""
    filename = os.environ.get("ANALYSIS_FEATURES_FILE")
    if not filename:
        return None
    from rasterio.warp import transform
    crs, bounds, _ = area(data)
    cx, cy = (bounds[0]+bounds[2])/2, (bounds[1]+bounds[3])/2
    radius = data["raio_km"]*1000
    matches = []
    registry = json.loads(Path(filename).read_text(encoding="utf-8-sig"))
    for feature in registry.get("features", []):
        if feature.get("reviewed") is not True or feature.get("kind") not in ("crater", "dune") or not feature.get("source") or not feature.get("method"):
            continue
        geometry = feature.get("geometry", {})
        if geometry.get("type") != "Polygon" or len(geometry.get("coordinates", [])) != 1:
            continue
        ring = geometry["coordinates"][0]
        if len(ring) < 4 or ring[0] != ring[-1] or any(len(p)!=2 or not all(isinstance(v,(int,float)) and math.isfinite(v) for v in p) or not -180<=p[0]<=180 or not -90<=p[1]<=90 for p in ring):
            continue
        xs, ys = transform("EPSG:4326", crs, [p[0] for p in ring], [p[1] for p in ring])
        if any(math.hypot(x-cx, y-cy)>radius for x,y in zip(xs,ys)):
            continue
        inside = False
        for i in range(len(xs)-1):
            if (ys[i]>cy)!=(ys[i+1]>cy) and cx < (xs[i+1]-xs[i])*(cy-ys[i])/(ys[i+1]-ys[i])+xs[i]:
                inside = not inside
        if inside:
            extent = max(max(xs)-min(xs), max(ys)-min(ys))
            if extent <= 0:
                continue
            matches.append({**{key: feature.get(key) for key in ("id", "kind", "source", "method", "geometry", "measurements", "measurement_resolution_m")}, "reviewed": True, "extent_m": extent})
    if len(matches)>1:
        raise AnalysisError("Mais de uma feição revisada contém o centro; delimitação ambígua.")
    return matches[0] if matches else None


def analyze(data, emit=lambda *_: None):
    data = validate(data)
    from src.application.feature_evidence import identify, locate_crater
    identification = identify(data)
    if os.environ.get('ANALYSIS_CATALOG_ENABLED','1') != '0' and identification.get('kind') is None:
        from src.application.geological_discovery import discover
        identification = discover(data, CACHE, emit)
    emit('feicao_identificada',identification['message'])
    emit("obtendo_dem", "Localizando DEM com cobertura para a região…")
    needs_grid = identification.get('kind') == 'crater' and bool(identification.get('seed')) and bool(identification.get('reference_diameter_m'))
    measured = terrain(data, emit, with_grid=needs_grid)
    topography = measured[0] if needs_grid else measured
    emit("dem_obtido", "DEM obtido com sucesso; cobertura calculada sobre a ROI circular.")
    emit("metricas_terreno", "Elevações, relevo, declividade e rugosidade calculados; não equivalem a medidas de uma cratera/duna.")
    emit("verificando_feicao", "Verificando evidências e delimitações geomorfológicas…")
    feature = reviewed_feature(data)
    if feature:
        identity=feature.get('id') or hashlib.sha256(json.dumps(feature['geometry'],sort_keys=True).encode()).hexdigest()[:20]
        identification = {"id":'reviewed-'+identity,"status": "reviewed", "kind": feature["kind"], "message": "Feição delimitada pelo registro revisado.", "sources": [{'id':'reviewed-evidence','title':feature['source'],'url':''}], 'verified_location':{'latitude':data['latitude'],'longitude':data['longitude']}}
    elif needs_grid:
        emit('delimitando_feicao','Delimitando borda no DEM; verificando resolução, contorno, piso, paredes e entorno…')
        feature, diagnosis = locate_crater(data, *measured[1:], topography, identification)
        identification.update(diagnosis)
        if feature:emit('metricas_feicao','Onze métricas da feição medidas no DEM, com contorno e perfis disponíveis para inspeção.')
    emit("identificacao", identification["message"])
    return {"localidade": data, "topography": topography, "feature": feature, "identification": identification}


def main():
    def emit(stage, message):
        print(json.dumps({"stage": stage, "message": message}, ensure_ascii=False), flush=True)
    try:
        result = analyze(json.loads(sys.stdin.read(20_000)), emit)
        print(json.dumps({"result": result}, ensure_ascii=False, allow_nan=False), flush=True)
    except ImportError:
        print(json.dumps({"error": "Dependências ausentes. Instale requirements.txt no Python configurado em ANALYSIS_PYTHON."}), flush=True)
    except AnalysisError as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), flush=True)
    except Exception:
        print(json.dumps({"error": "Falha ao ler/processar o DEM ou o registro de evidências. Confira CRS, banda de elevação em metros, NoData e configuração local."}), flush=True)


if __name__ == "__main__":
    main()
