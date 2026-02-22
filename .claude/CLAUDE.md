# Download Categorizer — Claude 指令文件

## 專案簡介
Chrome 擴充功能（Manifest V3），監聽瀏覽器下載事件，根據副檔名自動將檔案分類到對應資料夾。

## 技術架構
- **平台**：Chrome Extension Manifest V3
- **背景腳本**：`src/background.js`（Service Worker）
- **分類邏輯**：`src/categorizer.js`（Singleton 模式）
- **預設設定**：`src/default.js`
- **彈出視窗**：`popup/`
- **設定頁面**：`settings/`

## 編碼規範
- 使用 ES Module（`import` / `export`），不使用 CommonJS
- Class 採用 Singleton 模式時，用 `static #instance` 私有欄位
- 變數與函式名稱使用 camelCase
- 資料夾名稱使用 kebab-case

## 禁止事項
- 不可引入外部 npm 套件（擴充功能需離線運作）
- 不可使用 `eval()` 或動態程式碼執行（CSP 限制）
- 不可修改 `manifest.json` 的 `content_security_policy`
- 不要自動 commit，需先確認

## Chrome Extension 注意事項
- Service Worker 無法使用 `window` 或 DOM API
- 儲存資料一律透過 `chrome.storage.sync` 或 `chrome.storage.local`
- 所有非同步 Chrome API 使用 Promise 而非 callback

## 測試方式
1. 開啟 `chrome://extensions/`
2. 啟用「開發人員模式」
3. 點選「載入未封裝項目」，選擇此專案根目錄
4. 在 Service Worker 頁面查看 console 輸出
