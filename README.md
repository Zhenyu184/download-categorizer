# Download Categorizer
![GitHub license](https://img.shields.io/github/license/Zhenyu184/download-categorizer?style=flat-square) ![GitHub issues](https://img.shields.io/github/issues/Zhenyu184/download-categorizer?style=flat-square)

自動將下載檔案依副檔名分類存放的 Chrome 擴充功能

<br>

## 特色

- 🚀 **自動分類**：根據檔案副檔名，自動將下載檔案歸類到對應資料夾
- 🖱️ **一鍵啟用/停用**：可於 popup 介面快速切換功能開關
- 🗂️ **多種分類**：支援音樂、影片、圖片、程式、壓縮檔、文件等多種常見格式
- 💾 **儲存設定**：分類功能開關狀態會自動儲存於瀏覽器同步空間
- 🛡️ **開源自由**：採用 [GPLv3](LICENSE) 授權

<br>

## 安裝方式

1. 下載或 clone 此專案
2. 開啟 Chrome，進入 `chrome://extensions/`
3. 開啟右上角「開發人員模式」
4. 點擊「載入未封裝項目」，選擇專案資料夾

<br>

## 使用說明

1. 安裝擴充功能後，點擊瀏覽器右上角的 Download Categorizer 圖示
2. 於 popup 視窗可切換分類功能的啟用/停用
3. 當功能啟用時，下載檔案會自動依副檔名分類存放於對應資料夾（如 `music/`, `video/`, `document/` 等）

<br>

## 分類規則

分類規則定義於 [`src/default.js`](src/default.js)，預設支援以下類型：

| 分類      | 副檔名範例                                                                 |
|-----------|----------------------------------------------------------------------------|
| music     | mp3, wav, flac, aac, ogg, m4a, alac, aiff, wma, opus                       |
| video     | mp4, mkv, avi, mov, wmv, flv, webm, mpeg, mpg, ts, m4v                     |
| photo     | jpg, jpeg, png, gif, bmp, tiff, heic, heif, raw, cr2, nef, orf, sr2        |
| image     | img, iso, dmg                                                              |
| install   | exe, msi, apk, dmg, pkg, sh, deb, rpm, bat, run, jar, dpkg, qpkg           |
| program   | c, cpp, h, hpp, cc, cs, java, py, js, mjs, cjs, ts, rb, go, rs, swift, ... |
| document  | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, odt, ods, odp, rtf, tex, csv    |
| compress  | zip, rar, 7z, tar, gz, bz2, xz, iso, lz, lzma, zst, tgz, tar.gz, tar.bz2   |

<br>

## 開發與貢獻

1. Fork 本專案並 clone
2. 進行修改後，請送出 Pull Request
3. 歡迎 issue 回報錯誤或建議新功能

<br>

## 相關連結

- [GitHub Repository](https://github.com/Zhenyu184/download-collector)
- [GPLv3 授權條款](LICENSE)
- [FAQ](docs/FAQ.md)

<br>

## 聯絡方式

如有任何問題，歡迎於 [GitHub Issues](https://github.com/Zhenyu184/download-collector/issues) 留言。
感謝您的使用！🎉
