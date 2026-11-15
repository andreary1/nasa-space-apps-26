"""Merge catalogs by site id without overwriting higher-priority measurements."""
from __future__ import annotations

import copy
import json
import math
from pathlib import Path


def finite_number(value):
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) else None


def metric_value(name, value):
    value = finite_number(value)
    if value is None or value < 0:
        return None
    if name in {"diameter_m", "wavelength", "mean_spacing"} and value == 0:
        return None
    if name in {"circularity", "rim_coherence"} and value > 1:
        return None
    if name in {"mean_wall_slope", "wall_slope_p90"} and value > 90:
        return None
    if name == "crest_azimuth" and value > 180:
        return None
    return value


def load_catalogs(paths):
    """First finite value wins; missing attributes are complemented recursively.

    Raw records, units, sources and conflicts remain attached to every merged
    record. Portuguese/English field aliases are resolved by the processors.
    """
    result = {}
    for path in map(Path, paths):
        if not path.exists():
            continue
        document = json.loads(path.read_text(encoding="utf-8"))
        for record in document.get("sitios", document.get("sites", [])):
            site_id = record.get("id")
            if not site_id:
                continue
            merged = result.setdefault(site_id, {"_catalog_sources": [], "_catalog_field_sources": {}, "_catalog_conflicts": []})
            origin = {"path": str(path), "record": copy.deepcopy(record),
                      "units": document.get("unidades", document.get("units", {})),
                      "sources": document.get("fontes", document.get("sources", {}))}
            merged["_catalog_sources"].append(origin)

            def merge(target, incoming, prefix=""):
                for key, value in incoming.items():
                    field = f"{prefix}{key}"
                    previous = target.get(key)
                    if isinstance(value, dict):
                        if not isinstance(previous, dict):
                            if previous is not None:
                                merged["_catalog_conflicts"].append({"field": field, "retained": previous, "alternative": value, "source": str(path)})
                                continue
                            target[key] = {}
                        merge(target[key], value, field + ".")
                    elif previous is None or isinstance(previous, float) and not math.isfinite(previous):
                        target[key] = copy.deepcopy(value)
                        merged["_catalog_field_sources"][field] = str(path)
                    elif previous != value and value is not None:
                        merged["_catalog_conflicts"].append({"field": field, "retained": previous, "alternative": value, "source": str(path)})
            merge(merged, record)
    return result


def catalog_metric(meta, keys, *, block=None, feature):
    """Resolve aliases by source priority, even when sources use different names."""
    candidates = []
    containers = [(meta.get(block, {}), block + ".")] if block else []
    containers.append((meta, ""))
    sources = meta.get("_catalog_sources", [])
    order = {source["path"]: index for index, source in enumerate(sources)}
    origins = meta.get("_catalog_field_sources", {})
    for container, prefix in containers:
        if not isinstance(container, dict):
            continue
        for key in keys:
            value = metric_value(feature, container.get(key))
            if value is not None:
                field = prefix + key
                candidates.append((order.get(origins.get(field), -1), value, field))
    if not candidates:
        return None, None
    _, value, field = min(candidates, key=lambda entry: entry[0])
    return value, field


def provenance_for(meta, field):
    path = meta.get("_catalog_field_sources", {}).get(field, "catálogo informado")
    return f"catalogo:{field}@{path} (calculado fora deste repositório)"


def density_is_comparable(meta, field):
    """No alias inference from 'dunes' to 'ridges' without a unit definition."""
    if field == "dune_density":  # canonical contract: ridges/km²
        return True
    if meta.get("density_definition") == "ridge_count_per_km2":
        return True
    path = meta.get("_catalog_field_sources", {}).get(field)
    for source in meta.get("_catalog_sources", []):
        if source["path"] == path:
            unit = str(source["units"].get(field, "")).lower().replace(" ", "")
            return "cristas" in unit and ("km²" in unit or "km2" in unit or "km^2" in unit)
    return False
