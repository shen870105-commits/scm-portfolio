# 發布紀錄

## 最新確認結果（2026-11-03）

- 儲存庫：https://github.com/shen870105-commits/scm-portfolio
- 正式網站：https://shen870105-commits.github.io/scm-portfolio/
- 行情頁：https://shen870105-commits.github.io/scm-portfolio/modules/market-cost/
- 使用者已授權本次推送與發布，並確認 Pages Source 已切換為 GitHub Actions。
- 功能提交：ef57d03d73a20a6e4269e4b9d8b4b5ea8b3e2d58。
- 首次每日行情工作流程：https://github.com/shen870105-commits/scm-portfolio/actions/runs/41644162683 。build 與 deploy 均成功。

## 每日發布方式

台灣時間每日 18:17，Actions 重新向來源取得當下展示值，產生單一 JSON，再打包與部署 Pages。亦可在 Actions 的「每日行情與 Pages 發布」按 Run workflow 手動執行。不需要開著本機電腦；排程可能因 GitHub 負載延遲，長期無儲存庫活動的公開庫排程可能停用，屆時需在 Actions 重新啟用。

快照不每日提交回 main；同一工作流程直接部署網站產物，不依賴機器人提交觸發另一次發布。產物採檔案白名單，排除 Python 服務、測試、授權紀錄與來源原始回應。

公開版只讀最新已發布快照；「重新讀取最新發布」重新載入 JSON，不會啟動來源抓取。單一來源失敗時數值為 null；超過產生時間 30 小時後，前端隱藏全部數值並顯示逾期狀態。若整個部署失敗，既有網站仍保留前次產物，其前端期限檢查仍有效。

## 首次公開結果

- 公開 JSON、行情 HTML 與 snapshot.js 均 HTTP 200。
- 快照產生：2026-11-03T13:25:23+00:00（台灣 21:25）。
- 有效期限：2026-11-04T19:25:23+00:00（台灣 11 月 5 日 03:25）。
- 共 15 項，9 項成功：南海鋁均價與鉅亨八組交叉匯率。
- LME 鋁 Cash／3M 與 LME 銅：access_denied；SMM、Mysteel、WantGoo：adapter_pending。失敗六項無數值，不讀前次結果替代。
- 瀏覽器已確認 15 張卡片、中文／英文切換、八項匯率篩選與重新讀取。771px 視窗未水平溢出；截圖保存在本機 screenshots/market-daily-public.png。
- 目前成功的是首次 push 觸發執行；每日排程已配置，尚未等到下一次定時觸發。

## 權限與未完成範圍

2026-11-03 使用者確認指定來源允許自動取得與公開展示，來源／授權說明稍後補交。此為本人確認紀錄，不代表已完成獨立授權查核。對應設定見 data/publication-policy.json。

本機 Python 服務仍可按次抓取；公開版沒有常駐後端。成本情境計算與跨國專案互動仍未完成。推送、工作流程成功與公開網站驗證分開記錄，不將任一項視為其他項的自動證明。

## 歷史版本

2026-10-26 首次以 Deploy from a branch → main → /(root) 發布靜態作品集；當時行情限本機使用。2026-11-03 起由上述 Actions 架構取代。


## 接入與雲端發布結果（2026-11-03；優先於先前待實作記錄）

- 使用者已明確同意 Playwright／Chromium 接入及雲端發布驗證。
- 功能提交：961e5d0bde2b1fffd936a058b6f84525d144fa9a。工作流程：https://github.com/shen870105-commits/scm-portfolio/actions/runs/41655688547 。build／deploy 成功，包含瀏覽器安裝、21 項 Python 與 6 項 Node 測試。
- 公開 JSON 產生於 2026-11-03T14:39:00+00:00（台灣 22:39），共 10/15 成功。
- 沪銅當月連昨收成功：107300 CNY；文章為 https://hq.smm.cn/futures/104202631 ，文章時間 2026-11-03 22:02。畫面保留單位待確認與文章時間標籤，成功來源連結指向實際文章。
- 布蘭特瀏覽器已安裝且適配器已執行；來源在雲端回傳 HTTP 403，狀態 access_denied、value null。未加入偽裝、反偵測或繞過限制，未以本機觀察值回填。程式接入不代表雲端已能取得數字。
- LME 解析函式與來源設定維持不變；Mysteel 仍待接入。
- 公開頁已在真實瀏覽器核對沪銅數值、文章時間及來源連結、布蘭特拒絕狀態、英文切換與原物料篩選；本機畫面證據 screenshots/smm-brent-public.png。不宣稱已完成全尺寸或實體手機驗收。
- 本機來源曾出現 TLS 連線逾時；失敗時清空且不回填。雲端本輪成功不代表未來每輪來源必定可用。
- 後續布蘭特若持續拒絕，須取得來源支援的介面／雲端存取方式或另行確認資料來源，不以無限重試或繞過措施當作完成。
