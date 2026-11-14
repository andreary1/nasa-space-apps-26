# Data contract - initial Earth catalog

Source: `data/processed/sites.json`. Field names and descriptive values are English; proper names, IDs, image references and measurements are preserved from the supplied dataset.

## Structure

The root contains `generated_at`, `method_version`, `sources`, `units`, `warnings` and `sites`. The list endpoint preserves this envelope so clients can show limitations with the results.

Each site has a unique ID, name, state, category, coordinates, square analysis-window side length, coordinate provenance, detection status, nullable morphological measurements, climate information and diagnostics. Supported categories are `dune_field`, `outcrop` and `volcanic`. All current sites are on Earth; extending this to other bodies requires a body identifier and revised schemas.

## Conventions

- `lat` and `lon`: geographic degrees. The source datum remains to be documented.
- Heights, wavelengths and spacing: meters; `side_length_km`: kilometers.
- `crest_azimuth`: degrees from north along the crest, 0-180.
- `probable_wind_direction`: degrees from north toward which wind blows, 0-360.
- `dune_density`: crests per square kilometer as declared by the pipeline; effective area and counting method still need clarification.
- `aridity_index`: dimensionless P/ET0 from the source pipeline.
- Null means no value supplied, not zero. Missing, unmeasured and inapplicable values are not consistently distinguished in the source.
- `dunes_detected: false` indicates non-detection by this method, not proven absence.

## Validation and remaining limitations

The backend validates required fields, categories, coordinate and measurement ranges, finite numeric measurements and unique IDs. Diagnostics are preserved as provided, without scientific validation.

The estimates need independent validation; detection thresholds were calibrated on the same 12 sites. Diagnostic dune coverage is also reported at sites without detections, so its meaning requires clarification. Climatology period, source raster identifiers, coordinate datum and effective analyzed area remain undocumented. Figure paths do not imply that the images are included. No crater measurements or planetary similarity scores are available yet.
