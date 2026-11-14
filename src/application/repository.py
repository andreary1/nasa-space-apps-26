"""Read the local dataset without modifying pipeline results."""
from pathlib import Path
from .schemas import Site, SiteCatalog

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "sites.json"


class SiteRepository:
    def __init__(self, path: Path = DATA_PATH):
        self.catalog = SiteCatalog.model_validate_json(path.read_text(encoding="utf-8-sig"))
        self._by_id = {site.id: site for site in self.catalog.sites}

    def get_site(self, site_id: str) -> Site | None:
        return self._by_id.get(site_id)
