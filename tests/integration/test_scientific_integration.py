"""Regression tests for the selective backend integration; no visual files written."""
from __future__ import annotations

import json
import math
import subprocess
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
import numpy as np
from src.matching.engine import MatchingEngine
from src.matching.dunes.dune_matcher import DuneMatcher
from src.matching.ranking.ranker import MatchingRanker
from src.processing.dunes.dune_processor import DuneProcessor, DuneFeatureVector
from src.processing.craters.crater_processor import CraterProcessor, CraterFeatureVector
from src.processing.shared.catalog import load_catalogs
from src.processing.shared.morphometrics import extract_morphometrics, dune_morphometrics, crater_morphometrics
from src.processing.shared.raster_io import resolution_m, load_dem
from src.shared.constants import MARS_DUNE_REFERENCES
from src.ingestion.earth import opentopography as ot


class ScientificIntegrationTests(unittest.TestCase):
    def test_complete_linear_formula_matches_previous_main(self):
        source = subprocess.check_output(['git', 'show', '05a0028:src/matching/engine.py'], cwd=ROOT).decode()
        legacy = types.ModuleType('_paf_legacy_engine')
        sys.modules[legacy.__name__] = legacy
        exec(source, legacy.__dict__)
        weights = {'a': 0.2, 'b': 0.3, 'c': 0.5}
        vectors = [np.array([2., 8., 3.]), np.array([5., 6., 7.]), np.array([0., 4., 1.])]
        before = legacy.MatchingEngine(weights, physical_scaling=False).fit(vectors)
        after = MatchingEngine(weights, physical_scaling=False).fit(vectors)
        args = (vectors[0], vectors[1], 'earth', 'planet', 'moon', 'crater')
        first, second = before.match_one(*args), after.match_one(*args)
        for key in ('weighted_euclidean_dist', 'cosine_similarity', 'similarity_score'):
            self.assertAlmostEqual(getattr(first, key), getattr(second, key), places=12)

    def test_coverage_boundary_and_no_zero_division(self):
        engine = MatchingEngine({'a': .3, 'b': .3, 'c': .4}, physical_scaling=False)
        args = ('earth', 'ref', 'moon', 'crater')
        match = engine.match_one(np.array([1., 2., np.nan]), np.array([1., 2., 3.]), *args)
        self.assertAlmostEqual(match.coverage, .6)
        self.assertEqual(match.effective_weights, {'a': .5, 'b': .5})
        self.assertIsNone(engine.match_one(np.array([1., np.inf, np.nan]), np.array([1., 2., 3.]), *args))
        zero = MatchingEngine({'a': 1.}, physical_scaling=False, min_coverage=0)
        self.assertIsNone(zero.match_one(np.array([np.nan]), np.array([np.nan]), *args))
        zero.fit([np.array([np.nan])])
        self.assertIsNone(zero.match_one(np.array([1.]), np.array([2.]), *args))
        self.assertIsNone(zero.match_one(np.array([True]), np.array([2.]), *args))

    def test_invalid_configuration_and_reusable_engine(self):
        for weights in ({'a': -1}, {'a': 0}, {'a': np.inf}):
            with self.assertRaises(ValueError): MatchingEngine(weights)
        engine = MatchingEngine({'a': 1.}, physical_scaling=False)
        first = engine.match_many([('s', np.array([1.]))], [{'id': 'r', 'a': 2.}], 'moon', 'crater')[0]
        second = engine.match_many([('s', np.array([100.]))], [{'id': 'r', 'a': 101.}], 'moon', 'crater')[0]
        self.assertAlmostEqual(first.similarity_score, second.similarity_score)

    def test_conventional_mars_aridity_is_not_a_measurement(self):
        matcher = DuneMatcher()
        ref = MARS_DUNE_REFERENCES[0]
        self.assertEqual(ref['aridity_index'], 0.0)  # raw convention preserved
        self.assertTrue(np.isnan(matcher.engine._ref_to_array(ref)[-1]))
        fv = DuneFeatureVector('site', 'catalogo', mean_height=6, height_p90=10,
                               wavelength=300, crest_azimuth=170, dune_density=4,
                               mean_spacing=350, aridity_index=.4)
        result = matcher.run([fv])[0]
        self.assertAlmostEqual(result.coverage, .9)
        self.assertNotIn('aridity_index', result.features_used)
        fv.aridity_index = 100.
        self.assertAlmostEqual(matcher.run([fv])[0].similarity_score, result.similarity_score)

    def test_circular_only_result_is_strict_json_compatible(self):
        engine = MatchingEngine({'angle': 1.}, circular_features={'angle': 180.}, physical_scaling=False)
        result = engine.match_one(np.array([179.]), np.array([1.]), 'a', 'b', 'mars', 'dune')
        self.assertIsNone(result.cosine_similarity)
        self.assertAlmostEqual(result.weighted_euclidean_dist, 2 / 90)
        with tempfile.TemporaryDirectory() as directory:
            ranker = MatchingRanker(directory)
            report = ranker.generate_report([result], [], audit_meta=[{'value': np.inf}])
            text = json.dumps(report, allow_nan=False)
            self.assertIn('null', text)
            ranker.save_report(report)

    def test_catalog_priority_aliases_and_partial_nested_fields(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            primary, extra = root / 'a.json', root / 'b.json'
            primary.write_text(json.dumps({'sitios': [{'id': 'x', 'categoria': 'afloramento', 'lat': 0, 'lon': 2,
                                                     'craters': {'diametro_m': 4000, 'depth_m': None, 'class': 'partial_ring'}}]}))
            extra.write_text(json.dumps({'sites': [{'id': 'x', 'category': 'outcrop', 'lat': 9, 'lon': 8,
                                                    'craters': {'diameter_m': 9000, 'depth_m': 200}}]}))
            merged = load_catalogs([primary, extra])['x']
            self.assertEqual(merged['lat'], 0)
            self.assertEqual(merged['craters']['depth_m'], 200)
            self.assertTrue(merged['_catalog_conflicts'])
            feature = CraterProcessor(root / 'rasters', sitios_json=[primary, extra]).process_all()[0]
            self.assertEqual(feature.diameter_m, 4000)
            self.assertEqual(feature.depth_m, 200)
            self.assertEqual(feature.confidence, 'baixa')
            self.assertIn(str(primary), feature.provenance['diameter_m'])
            self.assertIn(str(extra), feature.provenance['depth_m'])

    def test_density_requires_definition_and_invalid_values_do_not_score(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); catalog = root / 'sites.json'
            data = {'sitios': [{'id': 'a', 'categoria': 'campo_de_dunas', 'altura_media': True,
                               'densidade_dunas': 3.0, 'indice_aridez': 0.0}]}
            catalog.write_text(json.dumps(data))
            feature = DuneProcessor(root / 'none', catalog).process_all()[0]
            self.assertIsNone(feature.mean_height)
            self.assertIsNone(feature.dune_density)
            self.assertEqual(feature.aridity_index, 0)
            data['unidades'] = {'densidade_dunas': 'cristas por km²'}
            catalog.write_text(json.dumps(data))
            self.assertEqual(DuneProcessor(root / 'none', catalog).process_all()[0].dune_density, 3)
            invalid = CraterFeatureVector('a', 'catalogo', diameter_m=-1, circularity=np.inf)
            self.assertTrue(np.isnan(invalid.to_array()).all())
            json.dumps(invalid.to_dict(), allow_nan=False)

    def test_missing_pixels_are_not_imputed_as_mean(self):
        dem = np.ones((100, 100)); dem[50, 50] = np.nan
        values, notes = dune_morphometrics(dem, 30)
        self.assertTrue(all(value is None for value in values.values()))
        self.assertIn('sem preenchimento', notes['wavelength'])
        values, notes = crater_morphometrics(dem, 30)
        self.assertIsNone(values['crater_class'])
        with self.assertRaises(ValueError): extract_morphometrics(dem)

    def test_projected_crs_units_and_unknown_crs(self):
        rx, ry, _ = resolution_m({'res': (.001, .002), 'crs': 'EPSG:3857'})
        self.assertEqual((rx, ry), (.001, .002))  # tiny metres are not degrees
        rx, ry, _ = resolution_m({'res': (1, 1), 'crs': 'EPSG:2263'})
        self.assertAlmostEqual(rx, .3048006096)
        with self.assertRaises(ValueError): resolution_m({'res': (30, 30), 'crs': None})
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / 'S07W037.hgt'; file.write_bytes(b'x')
            with self.assertRaises(ValueError): load_dem(file)

    def test_conservative_classification_and_catalog_density_not_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            proc = CraterProcessor(directory, sitios_json=Path(directory) / 'none.json')
            meta = {'craters': {'class': 'no_crater', 'diameter_m': 1000}}
            with patch('src.processing.craters.crater_processor.load_dem', return_value=(np.zeros((100, 100)), {})), \
                 patch('src.processing.craters.crater_processor.resolution_m', return_value=(30, 30, [])), \
                 patch('src.processing.craters.crater_processor.crater_morphometrics', return_value=({'crater_class': 'crater'}, {})):
                fv, reason = proc._build('x', meta, Path(directory) / 'x.tif')
                self.assertIsNone(fv); self.assertIn('no_crater', reason)

    def test_ingestion_redacts_key_and_rejects_invalid_windows(self):
        import requests
        with patch('requests.get', side_effect=requests.HTTPError('secret-key-in-url')):
            with self.assertRaises(ValueError) as caught:
                ot.baixar_dem({'id': 'x', 'lat': 0, 'lon': 0, 'lado_km': 10}, Path('unused.tif'), 'secret-key-in-url')
            self.assertNotIn('secret-key-in-url', str(caught.exception))
        with self.assertRaises(ValueError): ot.calcular_limites(0, 180, 10)
        with self.assertRaises(ValueError): ot.cadastrar_local({}, 0, 0, diametro_km=-1)

    def test_raster_density_remains_diagnostic(self):
        with tempfile.TemporaryDirectory() as directory:
            proc = DuneProcessor(directory, Path(directory) / 'missing.json')
            meta = {'lat': 0, 'lon': 0, 'dune_density': 3.0}
            computed = {'mean_height': 5., 'height_p90': 10., 'wavelength': 300.,
                        'crest_azimuth': 170., 'mean_spacing': 320., 'dune_density': 999.}
            with patch('src.processing.dunes.dune_processor.load_dem', return_value=(np.zeros((100, 100)), {})), \
                 patch('src.processing.dunes.dune_processor.resolution_m', return_value=(30, 30, [])), \
                 patch('src.processing.dunes.dune_processor.dune_morphometrics', return_value=(computed, {})):
                feature = proc._build('x', meta, Path(directory) / 'raster.tif')
            self.assertEqual(feature.dune_density, 3.)
            self.assertTrue(feature.provenance['dune_density'].startswith('catalogo:'))
            self.assertEqual(feature.extra['raster_metrics']['dune_density'], 999.)

    def test_bare_array_does_not_silently_assume_resolution(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            np.save(root / 'x_dem.npy', np.zeros((100, 100)))
            feature = DuneProcessor(root, root / 'missing.json').process_all()[0]
            self.assertIsNone(feature.wavelength)
            self.assertTrue(any('resolução desconhecida' in issue for issue in feature.issues))

    def test_pipeline_contract_and_visual_sentinels(self):
        from src.application.pipeline import run_pipeline
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'sitios.json').write_text(json.dumps({'sitios': [
                {'id': 'dune', 'categoria': 'campo_de_dunas', 'lat': 0, 'lon': 0,
                 'mean_height': 6, 'height_p90': 10, 'wavelength': 300, 'crest_azimuth': 160,
                 'dune_density': 3, 'mean_spacing': 320, 'aridity_index': .4},
                {'id': 'excluded', 'categoria': 'afloramento', 'craters': {'class': 'no_crater'}},
            ]}))
            visual = root / 'deliverables' / 'demo' / 'index.html'
            visual.parent.mkdir(parents=True)
            visual.write_bytes(b'original-visual-content')
            report = run_pipeline(root, 'reports', 'report.json', verbose=False, log_file=None)
            self.assertEqual(visual.read_bytes(), b'original-visual-content')
            self.assertTrue({'metadata', 'data_audit', 'earth_features', 'results', 'data_quality', 'global_ranking'} <= report.keys())
            self.assertEqual(report['data_quality']['craters_excluded'][0]['site_id'], 'excluded')
            match = report['results']['dunes_mars']['site_summaries'][0]['best_match']
            self.assertAlmostEqual(match['coverage'], .9)
            self.assertAlmostEqual(sum(match['effective_weights'].values()), 1.)
            json.dumps(report, allow_nan=False)
            saved = json.loads((root / 'reports/report.json').read_text(encoding='utf-8'))
            self.assertEqual(saved, report)

    def test_imported_rasters_match_manifest_and_site_coordinates(self):
        import hashlib
        import rasterio
        manifest = json.loads((ROOT / 'data/earth/manifesto_opentopography.json').read_text(encoding='utf-8'))
        catalog = json.loads((ROOT / 'sitios.json').read_text(encoding='utf-8'))
        sites = {site['id']: site for site in catalog['sitios']}
        self.assertEqual(len(manifest), 7)
        for site_id, entry in manifest.items():
            path = ROOT / entry['arquivo']
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), entry['integracao']['sha256'])
            with rasterio.open(path) as dataset:
                self.assertTrue(dataset.crs.is_geographic)
                self.assertTrue(np.isfinite(dataset.read(1, masked=True).compressed()).any())
                self.assertTrue(dataset.bounds.left <= sites[site_id]['lon'] <= dataset.bounds.right)
                self.assertTrue(dataset.bounds.bottom <= sites[site_id]['lat'] <= dataset.bounds.top)


if __name__ == '__main__':
    unittest.main()
