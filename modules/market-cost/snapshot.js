// 公開快照的格式及有效期限檢查；獨立於畫面，方便測試。
export const MAX_AGE_MS=30*60*60*1000;
export function readSnapshot(data,series,now=Date.now()){
 if(data?.schemaVersion!==1||data.mode!=='snapshot'||!Array.isArray(data.quotes))throw Error('invalid_snapshot');
 const generated=Date.parse(data.generatedAt),expires=Date.parse(data.expiresAt);
 if(!Number.isFinite(generated)||!Number.isFinite(expires)||expires<=generated||expires-generated>MAX_AGE_MS||generated>now+5*60*1000)throw Error('invalid_snapshot');
 const expected=new Set(series.map(s=>s.id)),seen=new Set();
 if(data.quotes.length!==expected.size)throw Error('invalid_snapshot');
 for(const row of data.quotes){
  if(!expected.has(row.id)||seen.has(row.id)||!['success','unavailable'].includes(row.status))throw Error('invalid_snapshot');
  seen.add(row.id);
  if(row.status==='success'&&(typeof row.value!=='number'||!Number.isFinite(row.value)||row.value<=0))throw Error('invalid_snapshot');
  if(row.status!=='success'&&row.value!==null)throw Error('invalid_snapshot');
 }
 return {quotes:data.quotes,generatedAt:data.generatedAt,expiresAt:data.expiresAt,isStale:now>=expires||now-generated>=MAX_AGE_MS};
}
export function snapshotURL(moduleURL){return new URL('../../data/market-latest.json',moduleURL);}
