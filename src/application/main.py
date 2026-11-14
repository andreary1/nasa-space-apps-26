"""Start with python -m uvicorn src.application.main:app --reload."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from .repository import SiteRepository
from .schemas import ErrorResponse, Site, SiteCatalog


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.repository = SiteRepository()
    yield


app = FastAPI(
    title="NASA Space Apps 26 - Site Catalog",
    version="0.1.0",
    description="Experimental Earth site catalog. Metrics are unvalidated pipeline estimates.",
    lifespan=lifespan,
)


@app.get("/api/sites", response_model=SiteCatalog, summary="Get the site catalog")
async def list_sites(request: Request):
    """Return sites together with sources, units and methodological warnings."""
    return request.app.state.repository.catalog


@app.get(
    "/api/sites/{site_id}", response_model=Site,
    responses={404: {"model": ErrorResponse, "description": "Site not found"}},
    summary="Get a site by ID",
)
async def get_site(site_id: str, request: Request):
    site = request.app.state.repository.get_site(site_id)
    if site is None:
        raise HTTPException(status_code=404, detail="Site not found")
    return site
