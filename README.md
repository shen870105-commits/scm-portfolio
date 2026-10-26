# 供應鏈管理作品集 — SCM Portfolio

Yvonne Shen 的互動作品集，連結製程理解、數據與成本、跨國專案協調。

## 已實作與狀態

| 模組 | 公開版 | 本機版 |
| --- | --- | --- |
| 鋁擠型製程 | 六步互動、補充分支、中英文切換、手機適配 | 同公開版 |
| 原物料與匯率 | 15 項指標、口徑與來源；不提供行情數字 | 按次抓取；本次驗證 10/15 成功，5 項未完成／受限 |
| 成本情境比較 | 尚未開發 | 尚未開發 |
| 跨國專案 | Coming Soon | Coming Soon |

GitHub Pages 僅承載靜態作品集。依作者確認，自動抓取暫留本機，不將本機報價快照當成公開即時資料。

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

- 每次進入數據頁或按更新，伺服器向來源重新請求；無歷史查詢或舊快取回填。
- 更新開始移除前次數字；失敗顯示缺值與原因，不以 0 或虛構價格替代。
- 保留來源本身的延遲與日期。抓取時間不等於行情時間；鉅亨交叉介面未提供每筆行情時間時，介面會明確說明。
- LME 鋁 Official 接口實測 403；SMM 當月連、Mysteel 3.0 及玩股網 BRENT 的確切資料接入尚未完成。
- 本次已驗證：南海（灵通）鋁均價、LME 銅主報價、鉅亨八組交叉匯率。可用性會隨來源改版或限制改變。
- 公開再發布行情的授權尚未確認，故公開版不傳送第三方行情數字，也不發布真實測試回應或快取。
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
```

測試使用虛構資料，包含數值驗證、口徑辨識、來源部分失敗與禁止舊資料回填；不連線第三方網站。實際檢查範圍與限制見 `docs/verification.md`。

## GitHub Pages 發布

本專案是無建置步驟的靜態網站。於儲存庫 Settings → Pages 選擇：

- Source：Deploy from a branch
- Branch：main
- Folder：/(root)

儲存後等待 GitHub Pages 部署成功。`.nojekyll` 保留原檔案結構。網站使用相對頁面與資源連結，適用 `/scm-portfolio/` 子路徑。

發布狀態與正式網址見 `docs/deployment.md`。把程式上傳 GitHub 不等於 Pages 已啟用，需確認實際部署結果。

## 素材與資料

首頁圖片由作者提供，並已確認有權公開使用。原始圖像不作任意轉授權；程式與其餘內容的開源授權尚未指定。素材紀錄見 `assets/README.md`。

一般製程說明不代表工廠 SOP，也不宣稱本人操作全部工序。實務心法與建議管理觀點分開標示；完整驗貨、出貨或批號查詢系統尚未開發。
