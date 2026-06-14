# 測試指南

## 1. 邏輯回歸測試（最快、無相依）

```bash
node test/logic.test.mjs
```

`test/logic.test.mjs` 會 mock `chrome.storage` 後直接 import `src/config.js`、`src/categorizer.js`，驗證：

- `loadConfig` 在空 storage 回傳預設值、會把已存設定疊在預設值之上
- `saveConfig` 寫入**單一鍵** `config`
- `onConfigChanged` 在 `sync` 變更時送出合併後的設定
- `resetConfig` 清除鍵並回傳預設值
- `categorize()` 依副檔名回傳資料夾（`mp3→music`、`pdf→document`、未知/空→`undefined`）
- `Categorizer` 為單例、`setMapping(null)` 不會壞

不需要 npm install，也不需要瀏覽器。改動 `config`/`categorizer`/`default` 後請先跑這支。

## 2. 瀏覽器自動化 E2E（chrome-devtools-mcp）

以 [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) 在真實 Chrome 驅動擴充功能。

### 設定（local scope，不會 commit）

```bash
claude mcp add chrome-devtools --scope local -- \
  npx -y chrome-devtools-mcp@latest --isolated --categoryExtensions
```

- `--categoryExtensions`：開啟擴充功能相關工具（需 Chrome 149+、pipe 連線）。
- `--isolated`：每次跑用全新暫時 profile。
- 新增/變更 MCP 設定後，**要重啟 Claude Code session** 才會生效。

### 載入擴充功能

用 `install_extension` 工具帶**專案根目錄絕對路徑**載入，載入後用 `reload_extension`/`list_extensions` 確認，再開
`chrome-extension://<id>/settings/settings.html`、`.../popup/popup.html` 操作。

### ⚠️ 已知陷阱（踩過的雷）

- **不要**用 `--chrome-arg=--load-extension=…` / `--disable-extensions-except=…` 來載入。Chrome 149 stable 已**忽略命令列 `--load-extension`**，而 `--disable-extensions-except` 會把其餘全部停用 → 變成零擴充，還會干擾 `install_extension`。一律改用 `install_extension` 工具。
- `install_extension` 即使失敗也會回傳一個（依路徑推算的）ID，**回傳 ID ≠ 真的載入**。要用 `reload_extension` 或 `trigger_extension_action` 驗證（沒載入會回 `not found`）。
- 受 Puppeteer 控制的 Chrome **會忽略** `chrome.downloads.download` 的 `filename` 參數。要在測試中變化副檔名，改用 data-URL 的 MIME 類型讓 Chrome 推導檔名：
  - `data:application/pdf` → `download.pdf` → `document/`
  - `data:audio/mpeg` → `download.mp3` → `music/`
  - `data:image/png` → `download.png` → `photo/`
- `install` 後再 `reload` 可能出現兩個 service worker target，是工具產物，非程式 bug。

### E2E 驗證項目（2026-06-14 全數通過）

1. 設定頁渲染、從 `storage.sync` 正確載入
2. 新增對應 + 副檔名正規化（小寫、去前置點、去空白、去重）
3. Save 寫入單一 `config` 鍵
4. 真實下載依副檔名導向資料夾；設定頁新增的對應由 SW 透過 `onConfigChanged` **即時**套用
5. popup 開關寫入 `enabled`；停用時不分類（檔案留在 Downloads 根目錄）
6. 重設移除鍵並還原預設；Service Worker console 無錯誤
