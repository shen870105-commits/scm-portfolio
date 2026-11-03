# 供應鏈管理作品集 — SCM Portfolio

Yvonne Shen 的互動作品集，連結製程理解、數據與成本、跨國專案協調。

## 已實作與狀態

| 模組 | 公開版 | 本機版 |
| --- | --- | --- |
| 鋁擠型製程 | 六步互動、補充分支、中英文切換、手機適配 | 同公開版 |
| 原物料與匯率 | 15 項指標、每日排程行情快照、來源與時間、逾期隱藏 | 按次抓取；來源可用性以當輪結果為準 |
| 成本情境比較 | 尚未開發 | 尚未開發 |
| 跨國專案 | Coming Soon | Coming Soon |

GitHub Actions 預定於台灣時間每日 18:17 取得行情並發布靜態快照；GitHub Pages 展示最新發布資料。排程可能延遲，不是訪客開頁即時抓價。本機仍可使用即抓服務。

## 啟動本機網站與行情服務

需要 Python 3.9 以上，無需安裝額外 Python 套件。

macOS 可在本機專案資料夾雙擊 `Start Preview.command`，保持終端機視窗開啟，然後瀏覽 `http://127.0.0.1:8766/`。

也可在專案目錄執行：

```bash
python3 -m server.app --port 8766
```

若目前的電腦沒有 `python3` 指令，`Start Preview.command` 會嘗試使用 Codex 已提供的 Python。若連接埠被占用，可改成 `--port 8767`，網址同步改用 8767。按 Control+C 停止。

僅使用 `python3 -m http.server` 可預覽靜態頁，但不會啟動行情 API。請勿直接雙擊 HTML，以免 file:// 模式阻擋 JavaScript 模組。

## 數據規則與限制

- 本機每次進入／更新向來源請求；公開版進入／更新只讀最近部署 JSON，來源抓取由每日 Actions 執行。每輪不讀歷史、不回填之前快照。
- 更新開始移除前次數字；本輪失敗輸出缺值，不以 0、虛構值或前一輪價格替代。公開快照超過 30 小時後隱藏數字並標示逾期。
- 保留來源本身的延遲與日期。抓取時間不等於行情時間；鉅亨交叉介面未提供每筆行情時間時，介面會明確說明。
- LME 鋁 Official 接口實測 403；SMM 當月連、Mysteel 3.0 及玩股網 BRENT 的確切資料接入尚未完成。
- 本次已驗證：南海（灵通）鋁均價、LME 銅主報價、鉅亨八組交叉匯率。可用性會隨來源改版或限制改變。
- 指定來源的自動取得及公開展示權已由作者於 2026-11-03 確認，來源或授權說明待補；不冒充已驗證授權文件。`data/publication-policy.json` 記錄狀態，未確認的新來源不輸出數字。
- 詳細來源證據及限制見 `docs/market-data-sources.md`。

## 修改位置

| 想修改 | 檔案 |
| --- | --- |
| 首頁雙語簡介、標題、卡片 | content/profile.js |
| 六步製程文字 | modules/processes/data/extrusion.js |
| 製程補充分支與管理心法 | modules/processes/process.js |
| 行情指標清單與口徑 | modules/market-cost/series.json |
| 行情頁雙語文案與狀態顯示 | modules/market-cost/market.js |
| 本機抓取與解析 | server/market.py |
| 本機頁面與 API 服務 | server/app.py |
| 共用版面與色彩 | shared/styles.css |

所有說明與程式註解採中文，畫面內容採中英文。未知經歷不自行補寫。示範業務資料使用虛構值，不代表任何公司實績。

## 檢查

```bash
python3 -m unittest discover -s tests -v
node --test tests/test_snapshot.mjs
```

測試使用虛構資料，包含數值驗證、口徑辨識、來源部分失敗與禁止舊資料回填；不連線第三方網站。實際檢查範圍與限制見 `docs/verification.md`。

## GitHub Pages + Actions 發布

在儲存庫 Settings → Pages 將 Source 設為 **GitHub Actions**。首次修改 workflow 推送 main 會觸發測試與部署；之後每天台灣時間 18:17 自動執行，也可在 Actions →「每日行情與 Pages 發布」→ Run workflow 手動觸發。

`.github/workflows/update-market.yml` 流程：測試 → `python -m server.export_snapshot` → `python scripts/build_site.py` → 上傳 `dist` → deploy-pages。只需內建 GITHUB_TOKEN 的 contents:read、pages:write、id-token:write；不需要個人權杖，不將憑證放進前端。

JSON 放在部署產物的 `data/market-latest.json`，不每天提交到 Git。原始回應與 `.private` 不上傳；Pages 產物保留 1 天供部署，不作歷史值回填。一般程式或資料來源變更仍需推送到 main。

每次只發布一輪資料；整輪來源失敗也發布缺值。若 Actions 自身失敗，上一版站可能仍在線，前端會在快照超過 30 小時時停止顯示數字。若來源未更新但仍展示延遲價格，照實保留來源日期。

公開版「重新讀取最新發布」只是重新載入 JSON，不會啟動 GitHub Actions。排程執行及公開部署成功是分開狀態，請查看 Actions 記錄及網站快照時間。

### 本機預覽每日快照模式

```bash
python3 -m server.export_snapshot --output .private/market-latest.json
python3 scripts/build_site.py --output dist --snapshot .private/market-latest.json
python3 -m http.server 8770 --directory dist --bind 127.0.0.1
```

開啟 `http://127.0.0.1:8770/modules/market-cost/index.html?mode=snapshot`。打包工具拒絕覆蓋已存在的輸出資料夾；再次測試請用新的 `--output` 名稱，預覽伺服器的 `--directory` 同步更改。

正式網址及驗證結果見 `docs/deployment.md`。GitHub 公開儲存庫若長期無活動，排程可能被停用；排程也可能延遲。不能將設定檔存在等同於已成功執行。

## 素材與資料

首頁圖片由作者提供，並已確認有權公開使用。原始圖像不作任意轉授權；程式與其餘內容的開源授權尚未指定。素材紀錄見 `assets/README.md`。

一般製程說明不代表工廠 SOP，也不宣稱本人操作全部工序。實務心法與建議管理觀點分開標示；完整驗貨、出貨或批號查詢系統尚未開發。
