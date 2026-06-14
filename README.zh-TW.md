# Download Categorizer

[English](README.md) | **繁體中文**

![GitHub license](https://img.shields.io/github/license/Zhenyu184/download-categorizer?style=flat-square) ![GitHub issues](https://img.shields.io/github/issues/Zhenyu184/download-categorizer?style=flat-square)

一款 Chrome 擴充功能，會依檔案副檔名自動將下載的檔案分類到對應資料夾。

<br>

## 功能特色

- 🚀 **自動分類**：依副檔名自動把下載的檔案歸類到對應資料夾
- 🗂️ **多種類別**：支援音樂、影片、圖片、程式、壓縮檔、文件等多種常見格式
- ⚙️ **設定頁面**：可新增、編輯、刪除資料夾對應規則，並選擇檔名衝突的處理方式
- 🔀 **一鍵開關**：隨時可在彈出視窗中啟用或停用自動分類
- 🔍 **衝突偵測**：設定頁會偵測同時對應到多個資料夾的副檔名，並標示實際生效的資料夾
- 📦 **匯入 / 匯出**：可將設定備份或分享為 JSON 檔，也可隨時還原為預設值
- 💾 **設定持久化**：設定儲存於 `chrome.storage.sync`，可在多個瀏覽器間同步
- 🛡️ **開放原始碼**：採用 [GPLv3](LICENSE) 授權

<br>

## 安裝方式

1. 下載或 clone 此儲存庫
2. 開啟 Chrome 並前往 `chrome://extensions/`
3. 開啟右上角的 **開發人員模式**
4. 點選 **載入未封裝項目**，選擇本專案資料夾

![Chrome Extensions page](readme_img/img1.png)

<br>

## 使用說明

- 點擊擴充功能圖示開啟彈出視窗，可**啟用／停用**分類功能或開啟設定頁面。
- 在**設定**頁面中可以：
  - 新增、編輯、刪除**資料夾對應規則**
  - 選擇**檔名衝突的處理方式**（自動重新命名／覆寫／詢問使用者）
  - 將設定**匯入／匯出**為 JSON，或**還原為預設值**
  - 當某個副檔名對應到多個資料夾時，顯示**衝突提示**

> 當同一個副檔名屬於多個資料夾時，會套用對應清單中**由上而下第一個符合**的資料夾。

<br>

## 分類規則

分類規則定義於 [`src/default.js`](src/default.js)，預設支援以下類別：

| 類別      | 副檔名範例                                                                               |
|-----------|------------------------------------------------------------------------------------------|
| music     | mp3, wav, flac, aac, ogg, m4a, alac, aiff, wma, opus                                      |
| video     | mp4, mkv, avi, mov, wmv, flv, webm, mpeg, mpg, m4v                                        |
| photo     | jpg, jpeg, png, gif, bmp, tiff, heic, heif, raw, cr2, nef, orf, sr2                       |
| image     | img, iso, dmg                                                                             |
| program   | c, cpp, h, hpp, cc, cs, java, py, js, mjs, cjs, ts, rb, go, rs, swift, kt, sql, md, ...   |
| install   | exe, msi, apk, pkg, sh, deb, rpm, bat, run, jar, dpkg, qpkg, bpkg                         |
| document  | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, odt, ods, odp, rtf, tex, csv, log              |
| compress  | zip, rar, 7z, tar, gz, bz2, xz, lz, lzma, zst, tgz, tar.gz, tar.bz2                       |

<br>

## 開發與貢獻

1. Fork 並 clone 此儲存庫
2. 完成修改後送出 Pull Request
3. 歡迎開 issue 回報問題或提出新功能建議

<br>

## 相關連結

- [GitHub 儲存庫](https://github.com/Zhenyu184/download-categorizer)
- [GPLv3 授權](LICENSE)
- [常見問題 FAQ](docs/faq.md)

<br>

## 聯絡方式

如有任何問題，歡迎在 [GitHub Issues](https://github.com/Zhenyu184/download-categorizer/issues) 留言。
感謝你使用 Download Categorizer！🎉
