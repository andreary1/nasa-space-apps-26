"""Fetch NASA POWER climatology for demo sites; preserve raw responses and provenance.

Run from any directory: python scripts/fetch_climate.py
Cached responses are reused. Use --refresh to fetch them again.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import runpy
import time
from urllib.parse import urlencode
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
PARAMETERS = ('T2M', 'PRECTOTCORR', 'RH2M', 'WS2M')
MONTHS = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC ANN'.split()


def normalize(response):
    fill = response['header']['fill_value']
    result = {}
    for key in PARAMETERS:
        values = response['properties']['parameter'][key]
        result[key] = {
            **response['parameters'][key],
            'values': {month: None if values.get(month) in (None, fill) else values[month]
                       for month in MONTHS},
        }
    return result


def main(refresh=False):
    builder = runpy.run_path(str(ROOT / 'scripts/build_world_demo.py'))
    template = builder['HTML_CONTENT']
    # Read only the demo's site catalog, not its planetary references.
    catalog = template.split('let SITES_DATA = [', 1)[1].split('let currentSiteIndex', 1)[0]
    sites = re.findall(r'id: "([^"]+)".*?lat: ([-\d.]+),\s*lon: ([-\d.]+)', catalog, re.S)
    context_path = ROOT / 'data/earth/geographical_context.json'
    context = json.loads(context_path.read_text(encoding='utf-8'))
    cache = ROOT / 'data/earth/climate/nasa_power'
    cache.mkdir(parents=True, exist_ok=True)
    failures = []
    for site_id, lat, lon in sites:
        if site_id not in context['sites']:
            continue
        url = 'https://power.larc.nasa.gov/api/temporal/climatology/point?' + urlencode({
            'parameters': ','.join(PARAMETERS), 'community': 'AG',
            'latitude': lat, 'longitude': lon, 'format': 'JSON',
        })
        try:
            file = cache / f'{site_id}.json'
            cached = json.loads(file.read_text(encoding='utf-8')) if file.exists() else None
            if refresh or not cached or cached['url'] != url:
                for attempt in range(3):
                    try:
                        with urlopen(url, timeout=45) as response:
                            raw = json.load(response)
                        normalize(raw)  # Validate before caching.
                        break
                    except Exception:
                        if attempt == 2:
                            raise
                        time.sleep(2 ** attempt)
                cached = {'url': url, 'retrieved_at': datetime.now(timezone.utc).isoformat(), 'response': raw}
                file.write_text(json.dumps(cached, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            raw = cached['response']
            parameters = normalize(raw)
            record = context['sites'][site_id]
            record['climatology'] = {
                'provider': 'NASA POWER', 'url': url, 'retrieved_at': cached['retrieved_at'],
                'period': raw['header']['range'], 'sources': raw['header']['sources'],
                'coordinates': raw['geometry']['coordinates'], 'parameters': parameters,
                'scope': 'Climatologia regional em grade; não é medição pontual nem previsão.',
            }
            labels = {'T2M': 'Temperatura a 2 m', 'PRECTOTCORR': 'Precipitação média diária',
                      'RH2M': 'Umidade relativa a 2 m', 'WS2M': 'Vento a 2 m'}
            parts = []
            for key, label in labels.items():
                value = parameters[key]['values']['ANN']
                if value is not None:
                    parts.append(f"{label}: {value:.2f} {parameters[key]['units']}")
            record['climate'] = ' · '.join(parts) or 'Dados indisponíveis para esta coordenada.'
            record['sources'] = [s for s in record['sources'] if s.get('provider') != 'NASA POWER']
            record['sources'].append({'provider': 'NASA POWER', 'title': 'NASA POWER — climatologia e dados originais', 'url': url})
            print(f'OK {site_id}', flush=True)
        except Exception as exc:
            failures.append(site_id)
            print(f'FAILED {site_id}: {exc}', flush=True)
    context_path.write_text(json.dumps(context, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'deliverables/demo/index.html').write_text(builder['render_html'](), encoding='utf-8')
    if failures:
        raise SystemExit('Failed sites: ' + ', '.join(failures))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true')
    main(parser.parse_args().refresh)
