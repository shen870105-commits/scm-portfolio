import {languageController} from '../../shared/language.js';
import {profile} from '../../content/profile.js';
import {readSnapshot,snapshotURL} from './snapshot.js';
// 本機可即抓；公開版讀每日快照，?mode=snapshot 可在本機驗證公開模式。
const local=['127.0.0.1','localhost'].includes(location.hostname)&&new URLSearchParams(location.search).get('mode')!=='snapshot';
const copy={
zh:{title:'原物料與匯率觀察',intro:'把價格口徑、資料來源與更新狀態放在一起，讓每個數字都有可追溯的依據。',back:'← 返回首頁',localTitle:'本機數據服務',localDescription:'進入頁面即向指定來源取得本輪數據。部分介面尚未接入或可能限制存取；未取得數據不會以舊值、0 或模擬值替代。',publicTitle:'每日行情快照 · GitHub Actions 更新',publicDescription:'GitHub Actions 預定於台灣時間每日 18:17 抓取並發布；排程可能延遲。網頁顯示最近發布的快照，不是開頁即時行情。超過 30 小時未更新，數字將隱藏。',all:'全部指標',materials:'原物料',fx:'交叉匯率',refresh:'更新本輪數據',reloadSnapshot:'重新讀取最新發布',snapshotAt:'快照產生時間',expiresAt:'有效期限',noSnapshot:'尚無已發布快照',loading:'正在更新資料；完成前不顯示先前數字。',publicStatus:'準備讀取最新發布快照',idle:'準備取得本輪數據',summary:'本輪成功 {n} / 15；其餘項目請查看狀態。',freshness:'只取來源目前展示值。day-delayed 與來源延遲保留原標示；抓取時間不代表市場成交時間。',source:'查看來源 ↗',success:'本輪取得',pending:'待接入',unavailable:'暫無法取得',public:'本機功能',marketTime:'來源資料時間',fetchTime:'本次成功抓取',unknown:'來源未提供',none:'尚無',methodTitle:'數字之前，先確認定義。',methods:[['固定報價口徑','LME 鋁使用 Official bid；銅使用三個月 Closing Price。最新價與買賣價分開，不混用 USD/CNY 與 USD/CNH。'],['失敗不回填','更新開始先移除先前數字；失敗顯示缺值與原因。沒有歷史回填，也沒有用模擬值冒充行情。'],['來源與時間分開','保留來源本身的市場日期與延遲。若來源沒有提供行情時間，直接註明，不用抓取時間取代。']],costNote:'成本情境比較仍在後續開發範圍；本頁不提供正式報價或投資建議。',errors:{browser_unavailable:'瀏覽器服務未就緒或無法啟動，本輪未取得數據。',browser_timeout:'來源頁未能在期限內完成報價載入，本輪顯示缺值。',adapter_pending:'此指定欄位的資料介面尚未完成確認。',access_denied:'來源拒絕自動存取，不繞過限制。',source_unreachable:'來源逾時或無法連線；請稍後再試。',source_http_error:'來源回應錯誤，本次未取得數據。',invalid_response:'來源回應格式異常，已停止顯示數字。',field_missing:'無法確認指定欄位、單位或日期，未採用其他數字替代。',invalid_value:'來源數值未通過檢查。',backend_unavailable:'本機數據服務未啟動或回應異常，請依 README 啟動 python3 -m server.app。',busy:'已有抓取作業進行中，請稍後重試。',publication_pending:'此來源的公開使用權待確認，暫不展示數字。',snapshot_expired:'更新逾期：已隱藏過期數字，請查看排程狀態。',snapshot_missing:'尚未發布每日快照，請等待首次 Actions 部署。',snapshot_unavailable:'目前無法讀取快照；不回填舊值。',invalid_snapshot:'快照格式或時間異常，暫不展示數字。',collection_failed:'本輪抓取失敗，未使用前次數字。'}},
en:{title:'Materials & exchange rates',intro:'Bring quote definitions, sources, and update status together so every number has a traceable context.',back:'← Back to home',localTitle:'Local data service',localDescription:'Each visit requests the values currently displayed by the selected sources. Some adapters remain incomplete or sources may restrict access. Missing data is never replaced with old values, zeroes, or simulations.',publicTitle:'Daily market snapshot · Updated by GitHub Actions',publicDescription:'GitHub Actions is scheduled to fetch and publish daily at 18:17 Asia/Taipei; runs may be delayed. This is the latest published snapshot, not live pricing on page load. Values are hidden after 30 hours without an update.',all:'All indicators',materials:'Materials',fx:'Cross rates',refresh:'Refresh current request',reloadSnapshot:'Reload published snapshot',snapshotAt:'Snapshot generated',expiresAt:'Valid until',noSnapshot:'No published snapshot yet',loading:'Loading data. Previous values are cleared until this request completes.',publicStatus:'Preparing to read the published snapshot',idle:'Preparing a fresh request',summary:'Retrieved {n} / 15 in this request. Check the remaining statuses below.',freshness:'Only current source-displayed values are requested. Source delays remain labelled; retrieval time is not market time.',source:'View source ↗',success:'Retrieved this request',pending:'Adapter pending',unavailable:'Unavailable',public:'Local feature',marketTime:'Source market time',fetchTime:'Successful retrieval',unknown:'Not provided by source',none:'None yet',methodTitle:'Define the quote before using the number.',methods:[['Consistent definitions','LME aluminium uses Official bid; copper uses the 3-month Closing Price. Latest quotes are distinct from bid/ask, and USD/CNY is not USD/CNH.'],['No stale fallback','Previous values are cleared on refresh. Failures show missing data and a reason, never historical values or simulated prices.'],['Separate time fields','Preserve source dates and delays. If market time is unavailable, say so instead of substituting retrieval time.']],costNote:'Cost scenario comparisons remain planned. This page does not provide formal quotations or investment advice.',errors:{browser_unavailable:'The browser service is unavailable. No value was retrieved.',browser_timeout:'The source page did not load its quote in time. No value is shown.',adapter_pending:'The data interface for this exact field is not yet verified.',access_denied:'The source denied automated access. Restrictions are not bypassed.',source_unreachable:'The source timed out or could not be reached. Try again later.',source_http_error:'The source returned an error. No data was retrieved.',invalid_response:'Unexpected source response. No number is displayed.',field_missing:'The requested field, unit, or date could not be verified. No substitute was used.',invalid_value:'The source value did not pass validation.',backend_unavailable:'Start the local data service with python3 -m server.app as described in the README.',busy:'A fetch is already in progress. Try again shortly.',publication_pending:'Public display permission is pending; no value is shown.',snapshot_expired:'Update overdue: expired values are hidden. Check the workflow status.',snapshot_missing:'No daily snapshot is published yet. Wait for the first Actions deployment.',snapshot_unavailable:'The snapshot could not be loaded. No previous values are substituted.',invalid_snapshot:'Invalid snapshot format or timestamp. No values are shown.',collection_failed:'This fetch failed. Previous values were not reused.'}}
};
let language='zh',filter='all',series=[],quotes=[],loading=false,globalError=null,snapshot=null;
function formatTime(value){return new Intl.DateTimeFormat(language==='zh'?'zh-TW':'en',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Taipei'}).format(new Date(value))+' (Asia/Taipei)';}
const set=(id,text)=>document.getElementById(id).textContent=text;
function escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){
 const c=copy[language],p=profile[language];
 document.title=`${c.title} — SCM Portfolio`;
 [['brand-title',p.name],['skip',p.skip],['footer-copy',p.footer],['title',c.title],['intro',c.intro],['back',c.back],['mode-title',local?c.localTitle:c.publicTitle],['mode-description',local?c.localDescription:c.publicDescription],['refresh',local?c.refresh:c.reloadSnapshot],['freshness',c.freshness],['method-title',c.methodTitle],['cost-note',c.costNote]].forEach(([id,text])=>set(id,text));
 document.querySelectorAll('[data-filter]').forEach(b=>{b.textContent=c[b.dataset.filter];b.setAttribute('aria-pressed',String(filter===b.dataset.filter));});
 document.getElementById('filters').setAttribute('aria-label',language==='zh'?'指標分類':'Indicator categories');
 document.getElementById('quotes').setAttribute('aria-label',language==='zh'?'報價清單':'Quotes');
 document.getElementById('refresh').hidden=false;
 document.getElementById('refresh').disabled=loading;
 set('request-status',loading?c.loading:globalError?(c.errors[globalError]||c.errors.invalid_response):quotes.length?c.summary.replace('{n}',quotes.filter(q=>q.status==='success').length):local?c.idle:c.publicStatus);
 set('snapshot-time',local?'':snapshot?`${c.snapshotAt}: ${formatTime(snapshot.generatedAt)} · ${c.expiresAt}: ${formatTime(snapshot.expiresAt)}`:c.noSnapshot);
 document.getElementById('methods').innerHTML=c.methods.map(([title,description])=>`<article><h3>${escape(title)}</h3><p>${escape(description)}</p></article>`).join('');
 document.getElementById('quotes').innerHTML=series.filter(s=>filter==='all'||s.group===filter).map(s=>{
  const q=quotes.find(q=>q.id===s.id),ok=q?.status==='success'&&Number.isFinite(q.value)&&q.value>0;
  const error=globalError||q?.errorCode||'adapter_pending';
  const status=loading?c.loading:ok?c.success:error==='adapter_pending'?c.pending:c.unavailable;
  const sourceTime=q?.marketDate?[q.marketDate,q.marketTime,q.timezone,q.delay].filter(Boolean).join(' · '):c.unknown;
  return `<article class="quote-card"><div class="quote-top"><span>${escape(s.source)}</span><span>${escape(status)}</span></div><h2>${escape(s.name[language])}</h2><div class="quote-value">${ok?new Intl.NumberFormat(language==='zh'?'zh-TW':'en',{maximumFractionDigits:s.group==='fx'?6:2}).format(q.value):'—'}</div><p class="quote-unit">${escape(s.currency)} / ${escape(s.unit==='unverified'?(language==='zh'?'單位待確認':'Unit unverified'):s.unit)}</p><p class="quote-definition">${escape(s.quoteType.split(' / ')[language==='zh'?0:1]||s.quoteType)}</p><dl><dt>${s.id==='cu-smm'?(language==='zh'?'文章發布時間':'Article publication time'):c.marketTime}</dt><dd>${ok?escape(sourceTime):c.none}</dd><dt>${c.fetchTime}</dt><dd>${ok?escape(q.fetchedAt):c.none}</dd></dl><p class="quote-definition">${escape(s.note?.[language]||'')}</p><p class="reason">${ok||loading?'':escape(c.errors[error]||c.errors.invalid_response)}</p><a href="${escape(s.id==='cu-smm'&&/^https:\/\/hq\.smm\.cn\/futures\/[0-9]+$/.test(q?.sourceArticleUrl||'')?q.sourceArticleUrl:s.sourceUrl)}">${c.source}</a></article>`;
 }).join('');
}
async function refresh(){
 if(loading)return;
 loading=true;quotes=[];globalError=null;snapshot=null;render();
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),35000);
 try{
  const url=local?'/api/market-quotes':snapshotURL(import.meta.url);
  const response=await fetch(url,{cache:'no-store',signal:controller.signal});
  if(response.status===429&&local){globalError='busy';return;}
  if(response.status===404&&!local){globalError='snapshot_missing';return;}
  if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw Error('response');
  const data=await response.json();
  if(local){
   if(!Array.isArray(data.quotes)||data.mode!=='local')throw Error('response');
   quotes=data.quotes;
  }else{
   try{snapshot=readSnapshot(data,series);}catch{globalError='invalid_snapshot';return;}
   if(snapshot.isStale){globalError='snapshot_expired';return;}
   quotes=snapshot.quotes;
  }
 }catch{quotes=[];globalError=local?'backend_unavailable':'snapshot_unavailable';}
 finally{clearTimeout(timer);loading=false;render();}
}
// 已開啟的分頁也會停止顯示逾期值；此計時器不會重新抓來源。
function checkExpiry(){
 if(!local&&snapshot&&Date.now()>=Date.parse(snapshot.expiresAt)&&globalError!=='snapshot_expired'){
  quotes=[];globalError='snapshot_expired';render();
 }
}
setInterval(checkExpiry,60000);
window.addEventListener('pageshow',checkExpiry);
languageController(next=>{language=next;render();});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();}));
document.getElementById('refresh').addEventListener('click',refresh);
try{
 const response=await fetch('./series.json',{cache:'no-store'});
 if(!response.ok)throw Error('manifest');
 series=await response.json();render();await refresh();
}catch{globalError='invalid_response';render();set('request-status',copy[language].errors.invalid_response);}
