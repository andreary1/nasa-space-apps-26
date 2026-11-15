"""Synthetic fixtures ONLY for numerical/validation tests, never served as real results."""
import json
import math
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import numpy as np
import rasterio
from rasterio.transform import from_origin
from rasterio.warp import transform
import src.application.intelligent_analysis as service
from src.application.feature_evidence import identify, measure_crater, locate_crater


class TerrainTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.folder = Path(self.temp.name)
        self.file = self.folder / 'synthetic-test-only.tif'
        self.input = dict(nome='Fixture numérica, não é local real', latitude=-3.97, longitude=-38.63, raio_km=2, comparar_com=['lua','marte'])
        crs, bounds, _ = service.area(self.input)
        self.crs = crs
        self.x, self.y = (bounds[0]+bounds[2])/2, (bounds[1]+bounds[3])/2
        self.affine = from_origin(self.x-3000,self.y+3000,10,10)
        self.env = patch.dict(os.environ, {'ANALYSIS_DEM_PATHS':str(self.file),'ANALYSIS_DEM_PROVIDER':'local','ANALYSIS_RESOLUTION_M':'30','ANALYSIS_FEATURES_FILE':'','ANALYSIS_DISCOVERY_ENABLED':'0','ANALYSIS_CATALOG_ENABLED':'0'})
        self.env.start()
        self.cache = patch.object(service,'CACHE',self.folder/'cache')
        self.cache.start()

    def tearDown(self):
        self.env.stop(); self.cache.stop(); self.temp.cleanup()

    def write(self, values):
        with rasterio.open(self.file,'w',driver='GTiff',width=600,height=600,count=1,dtype='float32',crs=self.crs,transform=self.affine,nodata=-9999) as dst:
            dst.write(values.astype('float32'),1)

    def test_plane_slope_units_no_invented_feature_and_cache(self):
        yy,xx=np.indices((600,600)); self.write(100+xx*10*.1-yy*10*.2)
        result=service.analyze(self.input)
        self.assertIsNone(result['feature'])
        topo=result['topography']
        self.assertAlmostEqual(topo['metrics']['slope_mean_deg'],math.degrees(math.atan(math.hypot(.1,.2))),places=3)
        self.assertAlmostEqual(topo['coverage'],1,places=3)
        self.assertEqual(sum(topo['slope_distribution']['counts']),topo['slope_valid_pixels'])
        again=service.analyze(self.input)['topography']
        self.assertTrue(again['source']['cache_hit'])
        self.assertEqual(again['metrics'],topo['metrics'])
        changed=service.analyze({**self.input,'raio_km':2.5})['topography']
        self.assertNotEqual(changed['valid_pixels'],topo['valid_pixels'])

    def test_real_zeros_and_nodata_mask(self):
        values=np.zeros((600,600)); values[250:350,250:350]=-9999; self.write(values)
        topo=service.terrain(self.input)
        self.assertLess(topo['coverage'],1)
        self.assertEqual(topo['metrics']['elevation_mean_m'],0)
        self.assertEqual(topo['metrics']['slope_mean_deg'],0)
        self.assertLess(topo['slope_valid_pixels'],topo['valid_pixels'])

    def test_all_nodata_is_not_zero(self):
        self.write(np.full((600,600),-9999))
        with self.assertRaises(service.AnalysisError): service.terrain(self.input)

    def test_nonmetric_elevation_is_rejected(self):
        self.write(np.ones((600,600)))
        with rasterio.open(self.file,'r+') as dst:
            dst.set_band_unit(1,'ft')
        with self.assertRaises(service.AnalysisError): service.terrain(self.input)

    def test_validation(self):
        for extra in [dict(latitude=91),dict(longitude=-181),dict(raio_km=100),dict(latitude=True),dict(latitude=float('nan')),dict(comparar_com=[]),dict(comparar_com=[{}]),dict(nome=' '),dict(comparar_com=['lua','lua'])]:
            with self.subTest(extra=extra), self.assertRaises(service.AnalysisError):service.validate({**self.input,**extra})

    def test_identification_uses_geography_not_name(self):
        self.assertEqual(identify({**self.input,'nome':'Erg Chebbi'})['status'],'unidentified')
        self.assertEqual(identify({**self.input,'nome':'outro nome','latitude':31.1381,'longitude':-3.9761})['kind'],'dune')
        self.assertEqual(identify({**self.input,'nome':'outro nome','latitude':35.0333,'longitude':-111.0167})['kind'],'crater')

    def test_measured_rim_and_flat_failure_no_default_metrics(self):
        # Synthetic analytical crater ONLY. Known ring radius 600 m, not catalog data.
        yy,xx=np.indices((600,600))
        rr=np.hypot((xx+.5)*10-3000,3000-(yy+.5)*10)
        dem=100-100*np.exp(-(rr/300)**2)+30*np.exp(-((rr-600)/60)**2)
        topo={'resolution_m':10,'source':{'title':'Numerical test only','inputs':[{'resolution_native_approx_m':30}]}}
        identity={'seed':[self.input['latitude'],self.input['longitude']],'reference_diameter_m':1200}
        feature,diagnosis=measure_crater(self.input,dem,self.affine,self.crs,topo,identity)
        self.assertEqual(diagnosis['boundary_status'],'measured')
        self.assertEqual(len(feature['measurements']),11)
        self.assertAlmostEqual(feature['measurements']['diameter_m']['value'],1200,delta=30)
        self.assertGreater(feature['measurements']['depth_m']['value'],100)
        self.assertGreater(feature['measurements']['circularity']['value'],.95)
        self.assertEqual(feature['measurement_resolution_m'],30)
        self.assertEqual(len(feature['geometry']['coordinates'][0]),73)
        flat,reason=measure_crater(self.input,np.ones_like(dem),self.affine,self.crs,topo,identity)
        self.assertIsNone(flat)
        self.assertEqual(reason['boundary_status'],'unavailable')

    def test_reviewed_geometry_required_not_name_or_radio(self):
        xs=[self.x-300,self.x+300,self.x+300,self.x-300,self.x-300]
        ys=[self.y-300,self.y-300,self.y+300,self.y+300,self.y-300]
        lon,lat=transform(self.crs,'EPSG:4326',xs,ys)
        feature=dict(id='unit-test',kind='crater',source='Synthetic unit test, not scientific evidence',method='Numerical fixture',reviewed=True,geometry={'type':'Polygon','coordinates':[list(map(list,zip(lon,lat)))]},measurements={},measurement_resolution_m=10)
        registry=self.folder/'features.json';registry.write_text(json.dumps({'features':[feature]}),encoding='utf-8')
        with patch.dict(os.environ,{'ANALYSIS_FEATURES_FILE':str(registry)}):
            self.assertEqual(service.reviewed_feature(self.input)['id'],'unit-test')
            feature['reviewed']=False;registry.write_text(json.dumps({'features':[feature]}),encoding='utf-8')
            self.assertIsNone(service.reviewed_feature(self.input))

    def test_unknown_crater_offset_seed_search_without_catalog_name(self):
        # Synthetic numerical bowl centered 700 m away from the requested point.
        yy,xx=np.indices((600,600));rr=np.hypot((xx+.5)*10-3000,3000-(yy+.5)*10)
        dem=100-100*np.exp(-(rr/300)**2)+30*np.exp(-((rr-600)/60)**2)
        lon,lat=transform(self.crs,'EPSG:4326',[self.x+700],[self.y])
        data={**self.input,'nome':'Synthetic test only','longitude':lon[0],'latitude':lat[0],'raio_km':3}
        identity={'id':'test-only','status':'source_verified','seed':[lat[0],lon[0]],'reference_diameter_m':1200}
        topo={'resolution_m':10,'source':{'title':'Numerical test only','inputs':[]}}
        direct,_=measure_crater(data,dem,self.affine,self.crs,topo,identity)
        self.assertIsNone(direct)
        found,reason=locate_crater(data,dem,self.affine,self.crs,topo,identity)
        self.assertIsNotNone(found,reason['message'])
        self.assertAlmostEqual(found['measurements']['diameter_m']['value'],1200,delta=30)
        self.assertGreater(len(found['diagnostics']['search_hypotheses']),0)

    def test_distinct_measured_depressions_are_ambiguous(self):
        yy,xx=np.indices((600,600));x=(xx+.5)*10-3000;y=3000-(yy+.5)*10
        dem=np.full((600,600),100.)
        for cx in [-1000,1000]:
            rr=np.hypot(x-cx,y)
            dem+=-100*np.exp(-(rr/150)**2)+30*np.exp(-((rr-300)/30)**2)
        identity={'id':'synthetic-test-only','status':'source_verified','seed':[self.input['latitude'],self.input['longitude']],'reference_diameter_m':600}
        topo={'resolution_m':10,'source':{'title':'Synthetic tests only','inputs':[]}}
        found,reason=locate_crater({**self.input,'raio_km':3},dem,self.affine,self.crs,topo,identity)
        self.assertIsNone(found)
        self.assertIn('ambígua',reason['message'])


if __name__=='__main__': unittest.main()
