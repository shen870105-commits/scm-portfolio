"""從本輪抓取建立可公開的每日快照，不載入先前行情檔。"""
from datetime import datetime, timezone, timedelta
from pathlib import Path
import argparse
import json
import math
import os
import re
from .market import SERIES, collect

MAX_AGE_HOURS = 30
ERROR_CODES = {'adapter_pending','access_denied','source_unreachable','source_http_error','invalid_response','field_missing','invalid_value','response_too_large','collection_failed','browser_unavailable','browser_timeout'}

def iso(value):
    return value.astimezone(timezone.utc).isoformat(timespec='seconds')

def build_snapshot(result, policy, generated=None):
    generated = generated or datetime.now(timezone.utc)
    if generated.tzinfo is None:
        raise ValueError('產生時間必須包含時區')
    raw = result.get('quotes', [])
    if not isinstance(raw, list):
        raise ValueError('quotes 格式錯誤')
    expected = {row['id'] for row in SERIES}
    seen=set()
    for row in raw:
        if row.get('id') not in expected or row['id'] in seen:
            raise ValueError('未知或重複的指標')
        seen.add(row['id'])
    by_id={row['id']:row for row in raw}
    rows=[]
    for definition in SERIES:
        item=by_id.get(definition['id'], {})
        source_policy=policy.get('sources', {}).get(definition['source'], {})
        allowed=source_policy.get('status') in ('user-confirmed','verified') and bool(source_policy.get('evidence'))
        row=dict(definition, value=None, status='unavailable', errorCode='field_missing',
                 marketDate=None, marketTime=None, timezone=None, delay=None,
                 fetchedAt=None, lastSuccessAt=None, isDerived=False,
                 permissionStatus=source_policy.get('status', 'pending'))
        if not allowed:
            row['errorCode']='publication_pending'
        elif item.get('status') == 'success':
            value=item.get('value')
            if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or value<=0:
                row['errorCode']='invalid_value'
            else:
                # 僅採白名單欄位，不公開來源原始回應、堆疊或額外資料。
                row.update(value=value,status='success',errorCode=None)
                for field in ('marketDate','marketTime','timezone','delay','fetchedAt','lastSuccessAt'):
                    value=item.get(field)
                    row[field]=value if isinstance(value,str) and len(value)<=100 else None
                article=item.get('sourceArticleUrl')
                if definition['id']=='cu-smm' and isinstance(article,str) and re.fullmatch(r'https://hq\.smm\.cn/futures/[0-9]+',article):
                    row['sourceArticleUrl']=article
        else:
            code=item.get('errorCode')
            row['errorCode']=code if code in ERROR_CODES else 'invalid_response'
        rows.append(row)
    return dict(schemaVersion=1,mode='snapshot',generatedAt=iso(generated),
                expiresAt=iso(generated+timedelta(hours=MAX_AGE_HOURS)),maxAgeHours=MAX_AGE_HOURS,
                schedule={'timezone':'Asia/Taipei','time':'18:17','frequency':'daily'},
                quotes=rows,summary={'published':sum(r['status']=='success' for r in rows),'total':len(rows)})

def export(output, policy_path):
    policy=json.loads(Path(policy_path).read_text(encoding='utf-8'))
    try:
        result=collect()
    except Exception:
        # 本輪全失敗也產生缺值快照，正常部署時移除前一輪數字。
        result={'quotes':[dict(r,status='unavailable',errorCode='collection_failed') for r in SERIES]}
    snapshot=build_snapshot(result,policy)
    output=Path(output)
    output.parent.mkdir(parents=True,exist_ok=True)
    temporary=output.with_suffix(output.suffix+'.tmp')
    temporary.write_text(json.dumps(snapshot,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')
    os.replace(temporary,output)
    print(f"本輪可公開數值：{snapshot['summary']['published']} / {len(SERIES)}；未取得或未確認項目皆為缺值。")
    return snapshot

if __name__=='__main__':
    parser=argparse.ArgumentParser(description='取得本輪行情並產生公開快照')
    parser.add_argument('--output',default='.private/market-latest.json')
    parser.add_argument('--policy',default='data/publication-policy.json')
    args=parser.parse_args()
    export(args.output,args.policy)
