import { localizePage } from '../src/i18n.js';

// 翻譯靜態畫面（標題、說明、連結等）。啟用/停用整體擴充功能交由
// Chrome 瀏覽器層級控制（chrome://extensions），本擴充功能不再內建開關。
localizePage();

const settingsBtn = document.getElementById('settings-btn');

settingsBtn?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings/settings.html') });
    window.close();
});
