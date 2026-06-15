# Download Categorizer — Claude 指令文件

## 專案簡介
Chrome 擴充功能（Manifest V3），監聽瀏覽器下載事件，根據副檔名自動將檔案分類到對應資料夾。

## 技術架構
- **平台**：Chrome Extension Manifest V3
- **背景腳本**：`src/background.js`（Service Worker，攔截 `onDeterminingFilename` 改寫下載路徑）
- **分類邏輯**：`src/categorizer.js`（Singleton；`setMapping()` 餵入對應表，`categorize()` 依副檔名回傳資料夾）
- **設定存取層**：`src/config.js`（Promise 化的 `loadConfig`/`saveConfig`/`resetConfig`/`onConfigChanged`）
- **預設設定**：`src/default.js`（`defaultConfig` 與單一儲存鍵 `STORAGE_KEY = 'config'`）
- **共用工具**：`src/misc.js`（`Logger`、`FileUtils`）
- **彈出視窗**：`popup/`（簡介與設定入口；不含啟用/停用開關——整體啟用/停用交由 Chrome 瀏覽器層級 `chrome://extensions` 控制）
- **設定頁面**：`settings/`（對應表 CRUD、conflict action、匯入/匯出、重設）
- **多國語言**：`_locales/<locale>/messages.json`（標準 `chrome.i18n`，依瀏覽器 UI 語言自動選擇；目前 `en`/`zh_TW`/`zh_CN`，`en` 為 `default_locale`）；HTML 用 `data-i18n*` 屬性 + `src/i18n.js` 的 `localizePage()`/`t()`

## 設定資料模型
- 整份設定存在 `chrome.storage.sync` 的**單一鍵** `config`，形狀為 `{ conflictAction, folderExtensionMapping }`。
  - 採單一鍵是為了避免多個鍵名各自漂移而對不上（曾發生過的 bug 類型）。
- **唯一的存取入口是 `src/config.js`**；popup、settings、background 一律透過它讀寫，不要各自呼叫 `chrome.storage`。
- 資料流：`settings`/`popup` 寫入 → `storage.sync` → `background` 透過 `onConfigChanged` **即時**更新記憶體中的設定與 categorizer 對應表。
- MV3 Service Worker 是短命的：監聽器要在 import 階段同步註冊（不要等 `await` 之後），設定改用 `await loadConfig()` 惰性載入，**不要在啟動時把預設值寫回 storage**（否則每次喚醒都會覆蓋使用者設定）。

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
**邏輯回歸測試（免安裝、無外部套件）**
- `node test/logic.test.mjs` —— 以 mock 的 `chrome.storage` 驗證 `config.js` 與 `categorizer.js`（設定讀寫/合併/變更通知、副檔名分類）。

**手動載入**
1. 開啟 `chrome://extensions/`，啟用「開發人員模式」
2. 點選「載入未封裝項目」，選擇此專案根目錄
3. 在 Service Worker 頁面查看 console 輸出

**瀏覽器自動化 E2E**：見 `docs/TESTING.md`（chrome-devtools-mcp 設定與已知陷阱）。
