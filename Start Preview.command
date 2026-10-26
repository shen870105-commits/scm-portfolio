#!/bin/bash
# 雙擊此檔啟動本機作品集與數據服務；關閉本視窗會停止服務。
cd "$(dirname "$0")" || exit 1
SCM_PYTHON="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [ ! -x "$SCM_PYTHON" ]; then
  SCM_PYTHON="$(command -v python3)"
fi
if [ -z "$SCM_PYTHON" ]; then
  echo "需要 Python 3。請先安裝 Python 3，再重新開啟。"
  read -r -p "按 Enter 結束。"
  exit 1
fi
echo "請在瀏覽器開啟 http://127.0.0.1:8766/"
echo "保持此視窗開啟；按 Control+C 停止。"
"$SCM_PYTHON" -m server.app --port 8766
read -r -p "服務已停止。按 Enter 結束。"
