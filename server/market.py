"""本機來源適配器。每次請求重抓，無歷史查詢、磁碟行情或舊值回填。"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from zoneinfo import ZoneInfo
import html
import json
import math
import re

ROOT = Path(__file__).resolve().parents[1]
SERIES = json.loads((ROOT / 'modules/market-cost/series.json').read_text())
CROSS = 'https://ws.api.cnyes.com/ws/api/v1/forex/currency/comparison/TWD,USD,EUR,GBP,AUD,NZD,CAD,JPY,KRW,HKD,CNY'
NANHAI = 'https://market.cnal.com/api/php/index.php?m=market&a=GetNewJson'

class SourceError(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__(code)

def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')

def number(value):
    if isinstance(value, bool):
        raise SourceError('invalid_value')
    try:
        result = float(str(value).replace(',', '').strip())
    except (ValueError, TypeError):
        raise SourceError('invalid_value')
    if not math.isfinite(result) or result <= 0:
        raise SourceError('invalid_value')
    return result

def fetch(url):
    # URL 僅由程式內固定來源組成，不接受訪客任意傳入 URL。
    request = Request(url, headers={'User-Agent': 'SCMPortfolio/1.0 (local preview)', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'})
    try:
        with urlopen(request, timeout=12) as response:
            content = response.read(5_000_001)
            if len(content) > 5_000_000:
                raise SourceError('response_too_large')
            return content.decode(response.headers.get_content_charset() or 'utf-8')
    except HTTPError as error:
        raise SourceError('access_denied' if error.code in (401, 403) else 'source_http_error') from error
    except (TimeoutError, URLError, OSError) as error:
        raise SourceError('source_unreachable') from error

def fetch_json(url):
    try:
        return json.loads(fetch(url))
    except json.JSONDecodeError as error:
        raise SourceError('invalid_response') from error

def quote(value, **meta):
    return dict(value=number(value), status='success', errorCode=None,
                marketDate=None, marketTime=None, timezone=None, delay=None,
                isDerived=False, **meta)

def parse_cross(data):
    # 對應頁面原始欄位 0=商品代碼、200026=最新價。不得推算交叉值。
    if data.get('statusCode') != 200 or not isinstance(data.get('data'), dict):
        raise SourceError('invalid_response')
    result = {}
    for row in SERIES:
        if row['group'] != 'fx':
            continue
        pair = row['name']['en'].replace('/', '')
        raw = data['data'].get(pair)
        if not isinstance(raw, dict) or raw.get('0') != f'FX:{pair}:FOREX':
            result[row['id']] = {'status': 'unavailable', 'errorCode': 'field_missing'}
            continue
        try:
            result[row['id']] = quote(raw.get('200026'))
        except SourceError as error:
            result[row['id']] = {'status': 'unavailable', 'errorCode': error.code}
    return result

def parse_nanhai(data):
    # 來源頁的 selectid=10，現價顯示讀取 spot[10].average，不使用 nh30 歷史檔。
    try:
        raw = data['spot']['10']
        if str(raw['classid']) != '10':
            raise SourceError('field_missing')
        stamp = datetime.fromtimestamp(int(raw['createtime']), ZoneInfo('Asia/Shanghai'))
        result = quote(raw['average'])
        result.update(marketDate=stamp.date().isoformat(), timezone='Asia/Shanghai')
        return result
    except (KeyError, TypeError, ValueError, OverflowError) as error:
        raise SourceError('field_missing') from error

def parse_copper(text):
    hero = re.search(r'<div class="hero-metal-data">(.*?)</div>\s*</div>', text, re.S)
    if not hero or '3-month Closing Price (day-delayed)' not in hero[1]:
        raise SourceError('field_missing')
    value = re.search(r'class="hero-metal-data__number">\s*([\d,.]+)', hero[1])
    table = re.search(r'<day-delayed-data-table\b(?=[^>]*header="LME Copper Closing Prices")([^>]+)>', text, re.S)
    date = re.search(r'valid-for-text="Data valid for (\d{2}/\d{2}/\d{4})"', table[1]) if table else None
    if not value or not date:
        raise SourceError('field_missing')
    result = quote(value[1])
    result.update(marketDate=datetime.strptime(date[1], '%d/%m/%Y').date().isoformat(), timezone='Europe/London', delay='day-delayed')
    return result

def load_cross():
    return parse_cross(fetch_json(CROSS))

def load_nanhai():
    return {'al-nanhai': parse_nanhai(fetch_json(NANHAI))}

def load_copper():
    return {'cu-lme': parse_copper(fetch('https://www.lme.com/metals/non-ferrous/lme-copper'))}

def load_aluminium():
    text = fetch('https://www.lme.com/metals/non-ferrous/lme-aluminium')
    tag = re.search(r'<day-delayed-data-table\b(?=[^>]*header="LME Aluminium Official Prices")([^>]+)>', text, re.S)
    source = re.search(r'datasource-id="([a-f0-9-]+)"', tag[1]) if tag else None
    if not source:
        raise SourceError('field_missing')
    # 這是頁面使用的「目前」介面，不帶歷史日期參數。403 時直接回報，不加偽造憑證。
    fetch_json('https://www.lme.com/api/trading-data/day-delayed?datasourceId=' + source[1])
    # 目前實測介面拒絕存取；未取得成功樣本前不猜測表格資料結構。
    raise SourceError('adapter_pending')

LOADERS = [
    (['al-cash', 'al-3m'], load_aluminium),
    (['al-nanhai'], load_nanhai),
    (['cu-lme'], load_copper),
    ([r['id'] for r in SERIES if r['group'] == 'fx'], load_cross),
]

def collect():
    started = now()
    values = {r['id']: dict(status='unavailable', errorCode='adapter_pending') for r in SERIES}
    def run(item):
        ids, loader = item
        try:
            return loader()
        except SourceError as error:
            return {id: dict(status='unavailable', errorCode=error.code) for id in ids}
        except Exception:
            # 對外不回傳堆疊、檔案路徑或可能含秘密的來源回應。
            return {id: dict(status='unavailable', errorCode='invalid_response') for id in ids}
    with ThreadPoolExecutor(max_workers=4) as pool:
        for group in pool.map(run, LOADERS):
            values.update(group)
    completed = now()
    result=[]
    for item in SERIES:
        row = dict(item, value=None, marketDate=None, marketTime=None,
                   timezone=None, delay=None, fetchedAt=None, lastSuccessAt=None, isDerived=False)
        row.update(values[item['id']])
        if row['status'] == 'success':
            row.update(fetchedAt=completed, lastSuccessAt=completed)
        result.append(row)
    return dict(requestedAt=started, completedAt=completed, mode='local', quotes=result)
