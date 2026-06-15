// 以 Chrome 標準 chrome.i18n API 為基礎的輕量 i18n 工具。
//
// 語言選擇完全交給瀏覽器：chrome.i18n.getMessage() 會依照瀏覽器的 UI
// 語言，自動解析到對應的 _locales/<uiLang>/messages.json，找不到時再
// fallback 到 manifest 的 default_locale。因此不需要自製語言選單。

export function t(key, substitutions) {
    return chrome.i18n.getMessage(key, substitutions);
}

// 將帶有 data-i18n* 屬性的元素就地翻譯：
//   data-i18n             -> textContent
//   data-i18n-placeholder -> placeholder
//   data-i18n-title       -> title
// 找不到對應訊息（空字串）時保留原本內容，避免畫面變空白。
export function localizePage(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
        const msg = t(el.dataset.i18n);
        if (msg) el.textContent = msg;
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const msg = t(el.dataset.i18nPlaceholder);
        if (msg) el.placeholder = msg;
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const msg = t(el.dataset.i18nTitle);
        if (msg) el.title = msg;
    });
    // 讓 <html lang> 反映實際 UI 語言（無障礙與斷字行為）。
    document.documentElement.lang = chrome.i18n.getUILanguage();
}
