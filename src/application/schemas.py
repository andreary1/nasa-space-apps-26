"""Validated pipeline records and API responses."""
from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class Site(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    id: str = Field(min_length=1)
    name: str
    state: str
    category: Literal["dune_field", "outcrop", "volcanic"]
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    side_length_km: float = Field(gt=0)
    coordinate_source: str
    coordinate_accuracy: str
    dunes_detected: bool
    status: str
    dune_type: str | None
    dune_type_is_estimate: bool
    dune_type_reason: str | None
    mean_height: float | None = Field(ge=0)
    height_p90: float | None = Field(ge=0)
    wavelength: float | None = Field(gt=0)
    crest_azimuth: float | None = Field(ge=0, le=180)
    probable_wind_direction: float | None = Field(ge=0, le=360)
    wind_direction_confidence: str | None
    dune_density: float | None = Field(ge=0)
    mean_spacing: float | None = Field(gt=0)
    median_spacing: float | None = Field(gt=0)
    distribution_pattern: str | None
    clark_evans_R: float | None = Field(ge=0)
    aridity_index: float | None = Field(ge=0)
    aridity_class: str | None
    aridity_source: str
    figure: str
    diagnostics: dict[str, Any]


class SiteCatalog(BaseModel):
    model_config = ConfigDict(extra="forbid")
    generated_at: datetime
    method_version: str
    sources: dict[str, str]
    units: dict[str, str]
    warnings: list[str]
    sites: list[Site]

    @model_validator(mode="after")
    def unique_site_ids(self):
        ids = [site.id for site in self.sites]
        if len(ids) != len(set(ids)):
            raise ValueError("Site IDs must be unique")
        return self


class ErrorResponse(BaseModel):
    detail: str
