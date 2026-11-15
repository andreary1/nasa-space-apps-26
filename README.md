# GeoEcos - The Universe Closer to the Ground

<img width="934" height="888" alt="image" src="https://github.com/user-attachments/assets/fcf578f4-8ec5-4f48-811a-7da3c91bc14a" />

**NASA Space Apps Challenge 2026** · Finding places on Earth that look like Mars and the Moon.

GeoEcos compares the shape of the terrain at Brazilian sites, mostly in the
Northeast, with **Martian dune fields** and **lunar impact craters**. Each site gets a similarity
score against every planetary reference, a breakdown of which measurements match and which
don't, and an AI-written report suggesting how NASA could use the site (astronaut training,
rover testing, instrument calibration and more).

## Highlights

- **Interactive 3D globe** (Three.js) with 24 Earth sites, 9 lunar crater references and
  7 Martian dune references.
- **Morphometric comparison**: 11 crater metrics and 7 dune metrics, weighted Euclidean distance
  plus cosine similarity, and Bagnold scaling to account for Mars' lower gravity and thinner air.
- **Charts and profiles**: bar, radar and parametric profile views for each comparison.
- **Geographic context panel** with NASA POWER climatology and site notes.
- **AI analysis reports** generated on demand from the page, grounded in the measured metrics:
  similarities, differences, suggestions for NASA, limitations and a confidence level.
- **Session catalog**: register a new site in the browser and compare it immediately.
- **Real planetary data**: HiRISE DTMs of 8 Martian dune fields and LOLA/SLDEM2015 DEMs of
  lunar craters.

## Quick start

Requirements: [Node.js](https://nodejs.org) 18 or newer. Nothing to install with npm.

1. Copy `.env.example` to `.env` and add your AI API key (a free Gemini key from
   [Google AI Studio](https://aistudio.google.com) works). Without a key the demo still runs;
   only the **Generate report** button is disabled.
2. Start the demo:
   - **Windows:** double-click `iniciar-demo.bat`.
   - **macOS/Linux:** run `./iniciar-demo.sh`.
   - **Any system:** run `npm start`.

The local server starts and the demo opens at <http://localhost:8000/>. Close the window (or
press Ctrl+C) to stop it.

> Static-only alternative: `python -m http.server 8000` at the repository root, then open
> <http://localhost:8000/deliverables/demo/>. Saved reports are shown, but new ones can't be
> generated.

## How the comparison works

| Feature | Earth data | Planetary reference | Metrics |
|---|---|---|---|
| Craters | SRTM / Copernicus GLO-30 DEMs | Moon (LOLA, SLDEM2015) | diameter, depth, depth/diameter, rim height, rim height/diameter, rim variation, rim radius CV, mean wall slope, wall slope P90, circularity, rim coherence |
| Dunes | SRTM / Copernicus GLO-30 DEMs | Mars (HiRISE DTMs) | mean height, height P90, wavelength, crest azimuth, dune density, mean spacing, aridity index |

1. **Physical scaling.** For dunes, the Martian scale metrics (height, wavelength, spacing) are
   multiplied by the Bagnold factor β ≈ 2.82, derived from the gravity and atmospheric density
   ratios between Earth and Mars.
2. **Normalization.** Each metric pair is normalized by its maximum absolute value.
3. **Score.** `0.6 × exp(−2.2 × WED) + 0.4 × cosine similarity`, where WED is the weighted
   Euclidean distance. Weights live in `deliverables/demo/js/data/constants.js`.
4. **Missing data is never zero.** If a weighted metric is missing, the score is reported as
   unavailable instead of being recomputed with fewer metrics.

The full data contract (field names, units and definitions) is in
[`docs/methodology/data-contract.md`](docs/methodology/data-contract.md).

## AI analysis reports

The **Reports** page has an **AI analysis** section for the selected site. Clicking
**Generate report** sends the site's comparison data to the local server, which calls the AI
model and saves the result to `deliverables/demo/js/data/ai-reports.json`.

- **The API key never reaches the browser.** It stays in `.env`, read only by the local server,
  which listens on `127.0.0.1` and serves only the demo folder.
- **Grounded output.** The model receives only the project's data: metrics, best match,
  scores, geographic context and catalog notes, flagged as unverified. Every similarity and
  difference cites the metrics behind it. Invented metrics and suggestion types outside an
  allowed list are discarded.
- **NASA suggestion types:** astronaut field training, rover and robotics testing, instrument
  calibration, process studies, algorithm validation, education and outreach.
- **Staleness check.** The page warns when a site's metrics changed after its report was
  generated.
- **Resilient calls.** Retries, a 90 s timeout, and automatic fallback to backup models when
  the main model is overloaded (HTTP 503).

Supported providers (OpenAI-compatible): **Gemini** (default), **Groq** and **OpenRouter**.
Options such as model, fallbacks, reasoning effort and timeout are documented in
[`.env.example`](.env.example).

Command-line tools:

```bash
npm run check-ai                                                  # diagnose key, model and latency
node scripts/ai_reports/generate_reports.mjs                      # generate all missing reports
node scripts/ai_reports/generate_reports.mjs --site lencois       # one site
node scripts/ai_reports/generate_reports.mjs --force              # regenerate everything
node scripts/ai_reports/generate_reports.mjs --dry-run            # show what would be sent
```

More details: [`scripts/ai_reports/README.md`](scripts/ai_reports/README.md).

## Data sources

| Body | Dataset | Location in repo |
|---|---|---|
| Mars | HiRISE controlled DTMs (USGS Astrogeology ARD): Nili Patera, Bagnold/Gale, Proctor, Kaiser A and B, Rabe, Hellespontus, Olympia Undae | `data/mars/dunes/` (+ `fontes.json`) |
| Moon | LOLA RDR and SLDEM2015 (LRO/Kaguya): Cabeus, Tycho, Copernicus, Shackleton, de Gerlache | `data/moon/craters/` (+ `fontes.json`) |
| Earth | SRTM elevation, ASTER L1T imagery, EMIT L2B mineralogy | `data/earth/` |
| Earth | NASA POWER climatology | `deliverables/demo/js/data/geographical-context.json` |

Each `fontes.json` records the product ID, download URL, native resolution, bounding box and
valid-pixel fraction for every raster.

## Repository structure

```
├── deliverables/demo/       Web demo (globe, map, comparisons, charts, reports)
│   ├── js/components/       UI components (globe, panels, charts, aiReport, …)
│   ├── js/data/             Site catalog, references, weights, context, ai-reports.json
│   └── js/services/         Similarity, scaling and comparison model
├── scripts/
│   ├── ai_reports/          Local server, AI client, prompt, report generator, diagnostics
│   ├── verify_html.py       Static checks for the demo
│   └── build_*demo.py       Legacy HTML builders (overwrite the current demo; do not run)
├── src/                     Python pipeline: ingestion → processing → matching → ranking
├── data/                    Raw rasters (Earth, Mars, Moon) and processed comparisons
├── docs/                    Methodology, data contract and research notes
├── tests/integration/       Pipeline and demo tests (Python, Node, Playwright)
├── iniciar-demo.bat / .sh   One-click demo launchers
└── package.json             npm shortcuts (start, reports, check-ai)
```

## Python pipeline

The pipeline in `src/` gets the shape attributes of each Earth site, matches them against the
planetary references and writes a ranked report to `data/processed/comparisons/`.

```
site DEM ──► attributes ──► comparison ──► JSON report + log ──► demo
(OpenTopography)  (raster or     (Mars: dunes    (matching_report_v2)
                   catalog)       Moon: craters)
```

1. **Ingestion** (`src/ingestion/earth/`): downloads the Copernicus 30 m DEM for any point through the
   OpenTopography API and registers the site in `sitios.json`.
2. **Processing** (`src/processing/`): for each site, gets the matching attributes.
   - With a raster, it **computes** the terrain attributes (11 for craters, 6 for dunes).
   - Without one, it uses catalog values (`sitios.json` / `sites.json`).
   - **Nothing is filled with zero or a default.** A missing attribute stays `None`, with its origin recorded
     (`raster`, `catalogo`, `derivado` or `ausente`) and an `INDISPONÍVEL` warning in the log and report.
3. **Matching** (`src/matching/`): weighted Euclidean distance + cosine between the site and each reference.
   Only attributes present on both sides count and weights are renormalized. Below 60% of the total weight, the
   pair gets no score (and that is reported). Bagnold scaling is applied for Martian dunes, and crest azimuth uses
   circular angular difference.
4. **Report** (`data/processed/comparisons/`): ranking, attributes used, warnings and methodology notes.

Crater matching only includes sites with a detected crater. Sites classified `no_crater` are **excluded with the
reason** (to avoid a false analog); `partial_ring` sites enter with low confidence and a warning.

```bash
pip install -r requirements.txt     # rasterio, numpy, scipy, scikit-learn, requests
python -m src.application.pipeline --filename matching_report_v2.json
```

| Option | What it does |
|---|---|
| `--output` | report folder (default `data/processed/comparisons`) |
| `--filename` | report name (default `matching_report.json`) |
| `--log` | log file (default: `<filename>.log` next to the report; `none` disables it) |
| `--no-scaling` | turns off Bagnold scaling |

### Downloading a new site from coordinates

Needs a free OpenTopography key (portal.opentopography.org, under *MyOpenTopo*):

```bash
export OPENTOPOGRAPHY_API_KEY=your_key      # PowerShell: $env:OPENTOPOGRAPHY_API_KEY = "your_key"
python -m src.ingestion.earth.opentopography -19.1719 127.7956
python -m src.ingestion.earth.opentopography 35.0275 -111.0228 --id barringer --diametro-km 1.186
python -m src.ingestion.earth.opentopography -2.6 -43.0 --tipo dunas --id lencois --lado-km 10
python -m src.ingestion.earth.opentopography --todos      # catalog sites that still have no raster
```

| Option | What it does | Default |
|---|---|---|
| `--tipo` | `dunas`, `cratera`, `afloramento` or `vulcanico` | `cratera` |
| `--id`, `--nome` | site identification | generated from coordinates |
| `--lado-km` | side of the downloaded area (1 to 400 km) | 10 (or 3× the diameter) |
| `--diametro-km` | crater diameter | — |

South and west are negative. The raster goes to `data/earth/dunes/` or `data/earth/craters/` as `<id>_dem.tif`,
and the site is only registered in `sitios.json` if the download is valid.

### Site catalogs

- `sitios.json` (root): Portuguese catalog read by the pipeline and the downloader. Wins on conflicts.
- `data/earth/sites.json`: English version with 6 extra impact craters; fills in whatever the other lacks.

### Pipeline known limitations

- Dune attributes measured from rasters use a new method validated only on a synthetic DEM; the computed crest
  density is not comparable with the catalog's.
- With β = 4.82 (what the data-contract formula gives with the project constants, not the ≈ 2.82 it cites),
  Martian dunes end up much smaller than Earth ones, which dominates the dune ranking.
- Crater wall-slope normalization by lunar gravity is not implemented; lake craters (e.g. Pingualuit) use the
  water surface for depth; very large or buried craters (Vredefort, Chicxulub) fall outside the 400 km window.
- The aridity index (P/ET0) cannot be computed from a DEM: it comes from the catalog (NASA POWER) or is unavailable.

## Testing

```bash
python scripts/verify_html.py                 # demo: IDs, imports, assets, module graph
node tests/integration/demo-modules.mjs       # demo: catalogs, scores, normalization
node tests/integration/context-panel.mjs      # geographic context panel
python tests/integration/test_pipeline_e2e.py # Python pipeline end to end
python tests/matching/test_missing_data_and_scaling.py
python tests/processing/test_provenance_and_metrics.py
python tests/ingestion/test_opentopography.py   # download tests mock the API; no key needed
```

The browser test (`tests/integration/demo-browser.cjs`) needs Playwright and a running server.
See [`deliverables/demo/README.md`](deliverables/demo/README.md).

## Deploy (Vercel)

Import the repository in Vercel with the root directory as is (Framework Preset: **Other**).
`vercel.json` serves `deliverables/demo/` as the site and `api/` as serverless functions;
`.vercelignore` keeps rasters and the Python pipeline out of the deploy. In Project Settings →
Environment Variables, add `AI_API_KEY` (and optionally `AI_PROVIDER`, `AI_MODEL`). Reports
generated online are not saved; commit `deliverables/demo/js/data/ai-reports.json` after
running `npm run reports` locally so every visitor sees them.

## Known limitations and next steps

- The demo computes scores in the browser from its own catalog. It does not yet load the Python
  pipeline report.
- In the current pipeline report, every crater site gets the same score with no matched lunar
  reference. This needs investigation before pipeline results are used.
- Planetary references are fixed values in code. The downloaded Mars and Moon DTMs are not yet
  processed by the pipeline.
- ASTER and EMIT data are downloaded but not used yet.
- Part of the site catalog uses generic data that will be replaced by complete measurements.
  After updating, regenerate the AI reports with `--force`.
- Profiles in the charts are parametric schematics, not measured DEM cross-sections.
- Public hosting (for example Vercel or Netlify with a serverless function for the AI reports)
  is planned so the demo can be used without running anything locally.
