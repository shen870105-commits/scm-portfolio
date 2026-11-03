"""快照與打包測試只使用虛構數據。"""
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import unittest
from server.export_snapshot import build_snapshot
from server.market import SERIES
from scripts.build_site import build

NOW=datetime(2026,11,3,10,17,tzinfo=timezone.utc)
def policy():
    return {'sources':{row['source']:{'status':'user-confirmed','evidence':'test only'} for row in SERIES}}
def success(id='cu-lme',value=9000):
    return dict(id=id,status='success',value=value,fetchedAt='2026-11-03T10:17:00+00:00',marketDate='2026-11-02')

class ExportTests(unittest.TestCase):
    def test_expiry_and_missing_rows(self):
        data=build_snapshot({'quotes':[success()]},policy(),NOW)
        self.assertEqual(data['expiresAt'],'2026-11-04T16:17:00+00:00')
        self.assertEqual(len(data['quotes']),15)
        self.assertEqual(data['summary']['published'],1)
        self.assertTrue(all(r['value'] is None for r in data['quotes'] if r['status']!='success'))
    def test_permission_gate_does_not_publish_values_or_timestamps(self):
        data=build_snapshot({'quotes':[success()]},{},NOW)
        row=next(r for r in data['quotes'] if r['id']=='cu-lme')
        self.assertIsNone(row['value']);self.assertIsNone(row['marketDate'])
        self.assertEqual(row['errorCode'],'publication_pending')
    def test_no_evidence_means_not_approved(self):
        p=policy();p['sources']['LME']['evidence']=''
        self.assertEqual(build_snapshot({'quotes':[success()]},p,NOW)['summary']['published'],0)
    def test_duplicate_or_unknown_id_rejected(self):
        for rows in [[success(),success()],[success('unknown')]]:
            with self.assertRaises(ValueError):build_snapshot({'quotes':rows},policy(),NOW)
    def test_invalid_numbers_and_error_fields_not_published(self):
        for value in [True,0,-1,float('nan'),float('inf'),'9000']:
            data=build_snapshot({'quotes':[success(value=value)]},policy(),NOW)
            self.assertEqual(data['summary']['published'],0)
        raw=success();raw['privateResponse']='secret'
        data=build_snapshot({'quotes':[raw]},policy(),NOW)
        self.assertNotIn('secret',json.dumps(data))
    def test_source_failure_never_reuses_values(self):
        first=build_snapshot({'quotes':[success()]},policy(),NOW)
        second=build_snapshot({'quotes':[dict(id='cu-lme',status='unavailable',value=9000,errorCode='access_denied')]},policy(),NOW)
        self.assertEqual(first['summary']['published'],1)
        self.assertEqual(second['summary']['published'],0)
        self.assertIsNone(next(r for r in second['quotes'] if r['id']=='cu-lme')['value'])
    def test_bundle_contains_only_public_assets(self):
        with TemporaryDirectory() as tmp:
            path=Path(tmp);snapshot=path/'snapshot.json'
            snapshot.write_text(json.dumps(build_snapshot({'quotes':[]},policy(),NOW)))
            build(path/'site',snapshot)
            self.assertTrue((path/'site/data/market-latest.json').exists())
            self.assertTrue((path/'site/modules/market-cost/snapshot.js').exists())
            for name in ['server','tests','.private','AGENTS.md','data/publication-policy.json']:
                self.assertFalse((path/'site'/name).exists())
            with self.assertRaises(ValueError):build(path/'site',snapshot)
