"""只打包網站所需靜態檔；不發布後端、測試、授權備註或原始行情。"""
from pathlib import Path
import argparse
import json
import shutil

ROOT=Path(__file__).resolve().parents[1]

def build(output,snapshot):
    output=Path(output).resolve()
    if output.exists():
        raise ValueError('輸出資料夾已存在，請使用新的資料夾，避免覆蓋既有檔案。')
    data=json.loads(Path(snapshot).read_text(encoding='utf-8'))
    if data.get('mode')!='snapshot' or data.get('schemaVersion')!=1:
        raise ValueError('快照格式錯誤')
    output.mkdir(parents=True)
    for name in ('index.html','.nojekyll'):
        shutil.copyfile(ROOT/name,output/name)
    for directory in ('assets','shared','content','modules'):
        for source in (ROOT/directory).rglob('*'):
            if source.is_symlink():
                raise ValueError('不打包符號連結')
            if not source.is_file() or source.suffix.lower() not in ('.html','.css','.js','.json','.png','.svg','.webp','.jpg','.jpeg'):
                continue
            target=output/source.relative_to(ROOT)
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(source,target)
    (output/'data').mkdir(exist_ok=True)
    shutil.copyfile(snapshot,output/'data/market-latest.json')
    print('已建立靜態網站；未包含 server、tests、.private 或 publication-policy。')

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',default='dist')
    parser.add_argument('--snapshot',default='.private/market-latest.json')
    args=parser.parse_args()
    build(args.output,args.snapshot)
