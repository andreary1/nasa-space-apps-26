"""Independent source contract tests, all artificial fixtures clearly isolated."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from src.application.geological_discovery import parse_catalog,parse_dune_regions,discover


class DiscoveryTests(unittest.TestCase):
    def test_pdf_table_units_and_coordinates(self):
        # Mock text extraction only; test real parser on synthetic rows.
        rows='\n'.join(f'Numerical {i}    Unit test region    10.0S     20.0E    < 1      0.875' for i in range(101))
        class Page:
            def extract_text(self,**kwargs):return rows
        class Reader:
            pages=[Page()]
        with patch('pypdf.PdfReader',return_value=Reader()):records=parse_catalog(b'not-a-production-document')
        self.assertEqual(len(records),101)
        self.assertEqual(records[0]['diameter_m'],875)
        self.assertEqual(records[0]['latitude'],-10)
        self.assertEqual(records[0]['longitude'],20)
        with self.assertRaises(Exception):parse_catalog(b'<html>Login page</html>')

    def test_xml_rejects_external_entities_and_unrelated_names(self):
        xml=b'<query><row><site>Numerical Sand Sea</site><latitude>-20</latitude><longitude>30</longitude><id_number>123</id_number></row><row><site>Residual massif</site><latitude>-20</latitude><longitude>30</longitude><id_number>124</id_number></row></query>'
        self.assertEqual(len(parse_dune_regions(xml)),1)
        self.assertEqual(parse_dune_regions(xml)[0]['name'],'Numerical Sand Sea')
        with self.assertRaises(ValueError):parse_dune_regions(b'<!DOCTYPE a [<!ENTITY b SYSTEM "file:///secret">]><query/>')

    def test_unknown_and_ambiguous_catalog_not_a_verified_discovery(self):
        input=dict(nome='Wolfe Creek is only a label here',latitude=0,longitude=0,raio_km=3)
        record=dict(name='Synthetic only',latitude=0,longitude=0,diameter_m=875,page=1,raw='synthetic')
        with tempfile.TemporaryDirectory() as temp:
            with patch('src.application.geological_discovery.catalog_bytes',return_value=(b'fixture',True)),patch('src.application.geological_discovery.parse_catalog',return_value=[record,record]):
                result=discover(input,Path(temp))
                self.assertIsNone(result['kind'])
            with patch('src.application.geological_discovery.catalog_bytes',return_value=(b'fixture',True)),patch('src.application.geological_discovery.parse_catalog',return_value=[record]):
                result=discover(input,Path(temp))
                self.assertEqual(result['status'],'source_verified')
                self.assertEqual(result['reference_diameter_m'],875)
                self.assertEqual(result['fields']['depth']['value'],None)
                self.assertEqual(result['coordinate_cell'],[-.05,-.05,.05,.05])
                # Same catalog entity despite input name and small rounding changes.
                other=discover({**input,'nome':'unrelated label','latitude':.00001},Path(temp))
                self.assertEqual(other['id'],result['id'])
                far=discover({**input,'latitude':50},Path(temp))
                self.assertIsNone(far['kind'])


if __name__=='__main__':unittest.main()
