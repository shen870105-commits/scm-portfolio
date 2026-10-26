"""使用虛構測試資料；測試資料不輸出至訪客介面。"""
import unittest
from unittest.mock import patch
from server import market

class MarketTests(unittest.TestCase):
    def test_reject_invalid_numbers(self):
        for value in [None, True, 0, -1, 'NaN', 'Infinity', 'login required']:
            with self.subTest(value=value), self.assertRaises(market.SourceError):
                market.number(value)
    def test_cross_uses_latest_not_bid_or_offshore(self):
        raw={'statusCode':200,'data':{'USDCNY':{'0':'FX:USDCNY:FOREX','200026':'7.1','200032':'7.0'},'USDCNH':{'0':'FX:USDCNH:FOREX','200026':'7.3'}}}
        result=market.parse_cross(raw)
        self.assertEqual(result['fx-usdcny']['value'],7.1)
        self.assertEqual(result['fx-usdtwd']['status'],'unavailable')
    def test_cross_symbol_must_match(self):
        raw={'statusCode':200,'data':{'USDCNY':{'0':'FX:USDCNH:FOREX','200026':'7.3'}}}
        self.assertEqual(market.parse_cross(raw)['fx-usdcny']['status'],'unavailable')
    def test_nanhai_uses_average_not_yesterday(self):
        result=market.parse_nanhai({'spot':{'10':{'classid':'10','createtime':'1704067200','average':'20000','yaverage':'19000'}}})
        self.assertEqual(result['value'],20000)
        self.assertEqual(result['marketDate'],'2024-01-01')
    def test_copper_requires_label_and_date(self):
        text='<div class="hero-metal-data"><div><span class="hero-metal-data__number">9000</span></div><div>3-month Closing Price (day-delayed)</div></div><day-delayed-data-table header="LME Copper Closing Prices" valid-for-text="Data valid for 01/01/2024">'
        self.assertEqual(market.parse_copper(text)['value'],9000)
        with self.assertRaises(market.SourceError):market.parse_copper(text.replace('day-delayed','spot'))
        with self.assertRaises(market.SourceError):market.parse_copper(text.replace('01/01/2024','unknown'))
    def test_one_source_failure_does_not_hide_success(self):
        def fail():raise market.SourceError('access_denied')
        with patch.object(market,'LOADERS',[(['cu-lme'],lambda:{'cu-lme':market.quote(9000)}),(['al-cash'],fail)]):
            rows={r['id']:r for r in market.collect()['quotes']}
        self.assertEqual(rows['cu-lme']['value'],9000)
        self.assertIsNone(rows['al-cash']['value'])
    def test_requests_do_not_reuse_previous_values(self):
        with patch.object(market,'LOADERS',[(['cu-lme'],lambda:{'cu-lme':market.quote(9000)})]):
            self.assertEqual(next(r for r in market.collect()['quotes'] if r['id']=='cu-lme')['value'],9000)
        with patch.object(market,'LOADERS',[]):
            self.assertIsNone(next(r for r in market.collect()['quotes'] if r['id']=='cu-lme')['value'])

if __name__=='__main__':unittest.main()
