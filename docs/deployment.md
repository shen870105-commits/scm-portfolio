# 發布紀錄

## 已確認結果（2026-10-26）

- GitHub 儲存庫：https://github.com/shen870105-commits/scm-portfolio
- 正式網站：https://shen870105-commits.github.io/scm-portfolio/
- 功能版本提交：aca39bcfe495a71e8e37cec50ae3daa1a5365910。
- 使用者已授權公開推送與發布，確認首頁圖片可公開使用，並完成 Pages 設定。
- 來源：Deploy from a branch → main → /(root)。

## 公開網址驗證

使用匿名 HTTPS 請求，以下均為 HTTP 200：

- 首頁。
- modules/processes/index.html 製程頁。
- modules/market-cost/index.html 數據說明頁。
- content/profile.js 雙語內容。
- modules/market-cost/series.json 指標清單。
- assets/supply-chain-hero.png 首頁圖片。

本次瀏覽器自動控制不可用，因此上述為 HTTP 與資源可達性驗證，不宣稱已對公開版完成瀏覽器視覺驗收。

## 公開版與本機版的差別

- 公開版：第一階段互動作品集與第二階段指標、口徑、來源說明。
- 本機版：Python 服務提供按次行情抓取，本次實測 10/15 項成功；5 項受限／未接入。
- 公開版沒有即時行情後端，不發布本機取得的行情快照或原始回應；成本計算與跨國專案互動仍未完成。

若之後修改 main 分支，GitHub Pages 需重新部署，應另外檢查最新部署是否成功，不將程式推送等同於當下已更新公開網站。
