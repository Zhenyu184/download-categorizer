---
description: 審查目前的程式碼品質與潛在問題
---

請審查這個 Chrome 擴充功能的程式碼，重點檢查以下幾點：

1. **安全性**：是否符合 Manifest V3 的 CSP 規範，有無潛在 XSS 風險
2. **儲存邏輯**：`chrome.storage` 的讀寫是否正確處理非同步
3. **Singleton 模式**：`Categorizer` 的單例實作是否有 race condition 問題
4. **錯誤處理**：各函式是否有適當的錯誤處理
5. **效能**：Service Worker 的生命週期管理是否正確

請列出發現的問題，並按嚴重程度（高 / 中 / 低）分類。
