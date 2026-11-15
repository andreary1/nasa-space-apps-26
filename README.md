# Planetary Analog Finder

**NASA Space Apps Challenge 2026** · Finding places on Earth that look like Mars and the Moon.

Planetary Analog Finder compares the shape of the terrain at Brazilian sites, mostly in the
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

The pipeline in `src/` audits the rasters, extracts dune and crater morphometrics, matches them
against the planetary references and writes a ranked report to
`data/processed/comparisons/matching_report.json`.

```bash
pip install -r requirements.txt     # rasterio, numpy, scipy, scikit-learn
python -m src.application.pipeline
```

## Testing

```bash
python scripts/verify_html.py                 # demo: IDs, imports, assets, module graph
node tests/integration/demo-modules.mjs       # demo: catalogs, scores, normalization
node tests/integration/context-panel.mjs      # geographic context panel
python tests/integration/test_pipeline_e2e.py # Python pipeline end to end
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
