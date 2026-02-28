/* 取得 DOM 元素 */
const settingsBtn = document.getElementById('settings-btn'); /* 設定頁面按鈕 */

/* 點擊設定按鈕：開啟設定頁面並關閉彈出視窗 */
settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({url: chrome.runtime.getURL('settings/settings.html')});
    window.close();
});
