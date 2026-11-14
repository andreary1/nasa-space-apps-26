# nasa-space-apps-26

An experimental planetary analog project. The initial backend serves 12 Earth sites from a local pipeline dataset. Planetary comparisons and a frontend are not implemented yet.

## Run locally

Use Python 3.10 or later. Open PowerShell in the project folder:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn src.application.main:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/docs to try the API. Stop with Ctrl+C.

## API

- `GET /api/sites`: catalog object containing `sites`, `generated_at`, `method_version`, `sources`, `units` and `warnings`.
- `GET /api/sites/lencois`: one site object.
- Unknown IDs return HTTP 404 with `{"detail": "Site not found"}`.
- `GET /openapi.json`: generated OpenAPI contract.

The list is inside the `sites` field, not a bare array. Nullable measurements remain null, not zero. Figure paths are pipeline references; image files are not served by this API.

## Backend files

- `src/application/main.py`: routes and startup.
- `src/application/schemas.py`: record validation and response models.
- `src/application/repository.py`: dataset loading and lookup.
- `data/processed/sites.json`: English pipeline output.
- `docs/methodology/data-contract.md`: data conventions and limitations.

The dataset is loaded and validated at startup. Missing or invalid data and duplicate IDs prevent startup. Restart after editing the JSON. No database, external API calls or API keys are required.

Other folders retain the project structure: `src/ingestion`, `src/processing`, `src/matching`, `src/shared`, `tests`, `assets`, `deliverables` and `docs`. Backend code currently lives in `src/application`.
