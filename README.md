# Planetary Analog Finder

**NASA Space Apps Challenge 2026** · Finding places on Earth that look like Mars and the Moon.

Planetary Analog Finder compares the terrain of Brazilian sites with **Martian dune fields**
and **lunar impact craters**. Each site gets a similarity score against every planetary
reference, a metric-by-metric breakdown, and an AI-written report suggesting how NASA could use
it (astronaut training, rover testing, instrument calibration and more).

**Features:** interactive 3D globe with 24 Earth sites, 9 lunar and 7 Martian references ·
crater and dune morphometrics with Bagnold scaling · charts and profiles · geographic context
with NASA POWER climatology · on-demand AI reports · in-browser site registration.

## Quick start

Requires [Node.js](https://nodejs.org) 18+.

1. Copy `.env.example` to `.env` and add an AI API key (a free
   [Gemini key](https://aistudio.google.com) works). Without it, only report generation is off.
2. Double-click `iniciar-demo.bat` (Windows), or run `./iniciar-demo.sh` or `npm start`.

The demo opens at <http://localhost:8000/>. Close the window to stop it.

## How it works

- **Metrics:** 11 for craters (diameter, depth, d/D, rim height, wall slope, circularity…) and
  7 for dunes (height, wavelength, crest azimuth, density, spacing, aridity). See the
  [data contract](docs/methodology/data-contract.md).
- **Scaling:** Martian dune height, wavelength and spacing are multiplied by the Bagnold factor
  β ≈ 2.82 (gravity and air density ratios).
- **Score:** `0.6 × exp(−2.2 × WED) + 0.4 × cosine`, with per-pair max normalization. Missing
  metrics make the score unavailable instead of counting as zero.
- **AI reports:** the local server sends the site's metrics and matches to the model (Gemini by
  default; Groq and OpenRouter also supported) and saves the result to `ai-reports.json`.
  The key stays in `.env` and never reaches the browser. Every claim must cite the metrics behind
  it. Details in [`scripts/ai_reports/README.md`](scripts/ai_reports/README.md).

## Data

- **Mars:** HiRISE DTMs of 8 dune fields (Nili Patera, Gale, Proctor, Kaiser, Rabe,
  Hellespontus, Olympia Undae). Stored in `data/mars/dunes/`.
- **Moon:** LOLA and SLDEM2015 DEMs of Cabeus, Tycho, Copernicus, Shackleton and de Gerlache.
  Stored in `data/moon/craters/`.
- **Earth:** SRTM, ASTER, EMIT and NASA POWER. Stored in `data/earth/`.

Each `fontes.json` lists product IDs and download URLs.

## Structure

```
deliverables/demo/   Web demo (globe, comparisons, charts, reports)
scripts/ai_reports/  Local server and AI report generator
src/                 Python pipeline: ingestion → processing → matching → ranking
data/                Raw rasters and processed comparisons
docs/                Methodology and research
tests/               Pipeline and demo tests
```

## Development

```bash
npm run check-ai                     # test AI key, model and latency
npm run reports -- --force           # regenerate all AI reports
python scripts/verify_html.py        # static checks for the demo
node tests/integration/demo-modules.mjs
pip install -r requirements.txt && python -m src.application.pipeline
```

## Known limitations

- The demo scores in the browser and does not yet use the Python pipeline report.
- The pipeline currently gives every crater site the same score. This needs a fix.
- Mars and Moon DTMs, ASTER and EMIT are downloaded but not processed yet.
- Some catalog data is generic and will be replaced. Regenerate reports afterwards.
