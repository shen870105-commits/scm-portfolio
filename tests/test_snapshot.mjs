// 以虛構值驗證瀏覽器端過期規則，不使用真實市場資料。
import test from 'node:test';
import assert from 'node:assert/strict';
import {readSnapshot,snapshotURL} from '../modules/market-cost/snapshot.js';
const now=Date.parse('2026-11-03T10:17:00Z');
const series=[{id:'one'},{id:'two'}];
function fixture(){return {schemaVersion:1,mode:'snapshot',generatedAt:'2026-11-03T10:17:00Z',expiresAt:'2026-11-04T16:17:00Z',quotes:[{id:'one',status:'success',value:12},{id:'two',status:'unavailable',value:null}]};}
test('有效快照與邊界過期',()=>{assert.equal(readSnapshot(fixture(),series,now).isStale,false);assert.equal(readSnapshot(fixture(),series,now+30*3600000).isStale,true);});
test('未知、重複、缺少指標皆拒絕',()=>{for(const quotes of [[fixture().quotes[0],fixture().quotes[0]],[{id:'bad',status:'success',value:1},fixture().quotes[1]],[]]){assert.throws(()=>readSnapshot({...fixture(),quotes},series,now));}});
test('來源失敗不能藏有前次數字',()=>{const data=fixture();data.quotes[1].value=12;assert.throws(()=>readSnapshot(data,series,now));});
test('不接受虛假數值及未來時間',()=>{for(const value of [0,-1,NaN,Infinity,'12']){const data=fixture();data.quotes[0].value=value;assert.throws(()=>readSnapshot(data,series,now));}assert.throws(()=>readSnapshot({...fixture(),generatedAt:'2026-11-03T11:00:00Z'},series,now));});
test('不能自行延長有效期限或使用錯誤模式',()=>{assert.throws(()=>readSnapshot({...fixture(),expiresAt:'2027-01-01T00:00:00Z'},series,now));assert.throws(()=>readSnapshot({...fixture(),mode:'local'},series,now));});
test('GitHub 專案子路徑正確',()=>{assert.equal(snapshotURL('https://example.github.io/scm-portfolio/modules/market-cost/market.js').href,'https://example.github.io/scm-portfolio/data/market-latest.json');});
