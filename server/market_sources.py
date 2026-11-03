"""沪銅當月連與布蘭特：只讀本輪最新公開頁，不讀歷史或前次結果。"""
from datetime import datetime
from html.parser import HTMLParser
import re
from .market import SourceError, fetch, quote

SMM_LIST = 'https://hq.smm.cn/copper/list/13819'
BRENT_PAGE = 'https://www.wantgoo.com/global/brent'

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links=[]; self.rows=[]; self.link=None; self.row=None; self.cell=None
        self.text=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag=='a': self.link=[attrs.get('href',''),[]]
        if tag=='tr': self.row=[]
        if tag in ('td','th') and self.row is not None: self.cell=[]
    def handle_data(self, data):
        self.text.append(data)
        if self.link is not None:self.link[1].append(data)
        if self.cell is not None:self.cell.append(data)
    def handle_endtag(self, tag):
        if tag=='a' and self.link is not None:
            self.links.append((self.link[0],''.join(self.link[1]).strip())); self.link=None
        if tag in ('td','th') and self.cell is not None:
            self.row.append(''.join(self.cell).strip()); self.cell=None
        if tag=='tr' and self.row is not None:
            self.rows.append(self.row); self.row=None

def parse_page(text):
    parser=PageParser(); parser.feed(text); return parser

def latest_smm_article(text):
    candidates=[]
    for path,title in parse_page(text).links:
        if not re.fullmatch(r'/futures/[0-9]+',path) or '期货沪铜' not in title:continue
        stamp=re.search(r'(\d{4}-\d{2}-\d{2}).*?(\d{2}:\d{2})',title)
        if stamp:
            try:date=datetime.strptime(' '.join(stamp.groups()),'%Y-%m-%d %H:%M')
            except ValueError:continue
            candidates.append((date,path))
    if not candidates:raise SourceError('field_missing')
    newest=max(date for date,_ in candidates)
    paths={path for date,path in candidates if date==newest}
    if len(paths)!=1:raise SourceError('field_missing')
    return 'https://hq.smm.cn'+paths.pop(),newest

def parse_smm_article(text, expected_stamp):
    parser=parse_page(text)
    stamp=re.search(r'发布时间\s*[：:]\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})',' '.join(parser.text))
    if not stamp:raise SourceError('field_missing')
    try:published=datetime.strptime(' '.join(stamp.groups()),'%Y-%m-%d %H:%M')
    except ValueError as error:raise SourceError('field_missing') from error
    if published!=expected_stamp:raise SourceError('field_missing')
    # 表頭與指定列必須在同一表格序列，拒絕主連、單月合約及同名重複列。
    headers=None; matches=[]
    for row in parser.rows:
        if '沪铜合约' in row and '昨收' in row:
            if any(row.count(name)!=1 for name in ('沪铜合约','昨收','时间')):raise SourceError('field_missing')
            headers=row; continue
        if headers and len(row)==len(headers) and row[headers.index('沪铜合约')]=='沪铜当月连':
            matches.append((row[headers.index('昨收')],row[headers.index('时间')]))
    if len(matches)!=1:raise SourceError('field_missing')
    value,time=matches[0]
    if not re.fullmatch(r'\d{2}:\d{2}:\d{2}',time):raise SourceError('field_missing')
    try:datetime.strptime(time,'%H:%M:%S')
    except ValueError as error:raise SourceError('field_missing') from error
    result=quote(value)
    # 日期標示為文章日期，不冒充「昨收」本身所屬交易日。
    result.update(marketDate=published.date().isoformat(),marketTime=published.strftime('%H:%M'),timezone='Asia/Shanghai')
    return result

def load_smm():
    url,stamp=latest_smm_article(fetch(SMM_LIST))
    result=parse_smm_article(fetch(url),stamp)
    result['sourceArticleUrl']=url
    return {'cu-smm':result}

def parse_brent_display(price, source_time, delay):
    if not re.fullmatch(r'延遲報價\s*\d+\s*分鐘',delay.strip()):raise SourceError('field_missing')
    try:stamp=datetime.strptime(source_time.strip(),'%Y-%m-%d %H:%M')
    except ValueError as error:raise SourceError('field_missing') from error
    result=quote(price)
    result.update(marketDate=stamp.date().isoformat(),marketTime=stamp.strftime('%H:%M'),delay=delay.strip())
    return result

def load_brent():
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as BrowserTimeout, Error as BrowserError
    except ImportError as error:raise SourceError('browser_unavailable') from error
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(timeout=20000)
            try:
                page=browser.new_page()
                response=page.goto(BRENT_PAGE,wait_until='domcontentloaded',timeout=30000)
                if response and response.status in (401,403):raise SourceError('access_denied')
                if not response or response.status>=400:raise SourceError('source_http_error')
                price=page.locator('.quotes-info .deal').first
                time=page.locator('#lastQuoteTime')
                price.wait_for(state='visible',timeout=30000)
                page.wait_for_function("""() => /^\\d[\\d,.]*$/.test(document.querySelector('.quotes-info .deal')?.textContent.trim() || '') && /^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}$/.test(document.querySelector('#lastQuoteTime')?.textContent.trim() || '')""",timeout=30000)
                # 僅讀主報價容器的延遲標示，避免熱門指數或 K 線數字。
                scope=page.locator('#investrue-info-1')
                if scope.count()!=1:scope=time.locator('..')
                delay=scope.inner_text()
                match=re.search(r'延遲報價\s*\d+\s*分鐘',delay)
                if not match:raise SourceError('field_missing')
                return {'brent':parse_brent_display(price.inner_text(),time.inner_text(),match[0])}
            finally:browser.close()
    except SourceError:raise
    except BrowserTimeout as error:raise SourceError('browser_timeout') from error
    except BrowserError as error:raise SourceError('browser_unavailable') from error
