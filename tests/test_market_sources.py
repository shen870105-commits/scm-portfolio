"""來源解析僅使用虛構行情；不把測試資料發布成市場價格。"""
from datetime import datetime
from unittest.mock import patch
import unittest
from server import market_sources as sources
from server.market import SourceError
from server.export_snapshot import build_snapshot
from tests.test_export import policy, NOW

STAMP=datetime(2026,11,3,22,2)
def article(value='12345',name='沪铜当月连'):
    return f'''<div>发布时间：2026-11-03 22:02</div><table><tr><th>沪铜合约</th><th>最新价</th><th>昨收</th><th>时间</th></tr><tr><td>沪铜主连</td><td>88888</td><td>77777</td><td>22:01:59</td></tr><tr><td>{name}</td><td>99999</td><td>{value}</td><td>22:01:59</td></tr></table>'''

class SourceTests(unittest.TestCase):
    def test_smm_latest_is_selected_by_timestamp_not_article_id(self):
        index='''<a href="/futures/900">2026-11-03上海期货沪铜夜盘(21:02)</a><a href="/futures/100">2026-11-03上海期货沪铜夜盘(22:02)</a><a href="https://evil.test/futures/101">2026-11-03期货沪铜(23:02)</a>'''
        self.assertEqual(sources.latest_smm_article(index),('https://hq.smm.cn/futures/100',STAMP))
    def test_smm_previous_close_not_latest_or_main_contract(self):
        q=sources.parse_smm_article(article(),STAMP)
        self.assertEqual(q['value'],12345)
        self.assertEqual(q['marketTime'],'22:02')
    def test_smm_missing_exact_contract_date_or_header_fails(self):
        for t in [article(name='沪铜2611'),article().replace('昨收','结算价'),article().replace('2026-11-03 22:02','2026-11-02 22:02'),article().replace('22:01:59','99:99:99')]:
            with self.subTest(text=t),self.assertRaises(SourceError):sources.parse_smm_article(t,STAMP)
    def test_latest_missing_field_does_not_try_an_older_article(self):
        index='<a href="/futures/100">2026-11-03期货沪铜(22:02)</a><a href="/futures/90">2026-11-03期货沪铜(21:02)</a>'
        with patch.object(sources,'fetch',side_effect=[index,article(name='沪铜主连')]) as fetch:
            with self.assertRaises(SourceError):sources.load_smm()
            self.assertEqual(fetch.call_count,2)
            self.assertEqual(fetch.call_args.args[0],'https://hq.smm.cn/futures/100')
    def test_brent_headline_date_delay_and_unknown_timezone(self):
        q=sources.parse_brent_display('88.25','2026-11-03 20:56','延遲報價 15 分鐘')
        self.assertEqual(q['value'],88.25)
        self.assertEqual(q['marketTime'],'20:56')
        self.assertEqual(q['delay'],'延遲報價 15 分鐘')
        self.assertIsNone(q['timezone'])
        for price,time,delay in [('—','2026-11-03 20:56','延遲報價 15 分鐘'),('88.25','not a date','延遲報價 15 分鐘'),('88.25','2026-11-03 20:56','live')]:
            with self.assertRaises(SourceError):sources.parse_brent_display(price,time,delay)
    def test_only_smm_valid_article_link_is_published(self):
        for url,expected in [('https://hq.smm.cn/futures/100',True),('https://evil.test/100',False),('javascript:alert(1)',False)]:
            item=dict(id='cu-smm',status='success',value=12345,sourceArticleUrl=url)
            q=next(r for r in build_snapshot({'quotes':[item]},policy(),NOW)['quotes'] if r['id']=='cu-smm')
            self.assertEqual('sourceArticleUrl' in q,expected)
    def test_browser_errors_survive_snapshot_without_numbers(self):
        for code in ['browser_unavailable','browser_timeout']:
            item=dict(id='brent',status='unavailable',value=88,errorCode=code)
            q=next(r for r in build_snapshot({'quotes':[item]},policy(),NOW)['quotes'] if r['id']=='brent')
            self.assertEqual(q['errorCode'],code);self.assertIsNone(q['value'])
