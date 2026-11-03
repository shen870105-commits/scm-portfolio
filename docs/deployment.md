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
