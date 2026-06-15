import { loadConfig, saveConfig } from '../src/config.js';
import { localizePage, t } from '../src/i18n.js';

// 先翻譯靜態畫面（標題、說明、連結等）。
localizePage();

const statusEl = document.getElementById('status');
const switchBtn = document.getElementById('toggle-switch');
const settingsBtn = document.getElementById('settings-btn');

function render(enabled) {
    if (switchBtn) switchBtn.textContent = enabled ? t('disableCategorizer') : t('enableCategorizer');
    if (statusEl) {
        statusEl.textContent = enabled ? t('statusOn') : t('statusOff');
        statusEl.style.color = enabled ? '#319795' : '#f27843';
    }
}

render((await loadConfig()).enabled);

switchBtn?.addEventListener('click', async () => {
    const config = await loadConfig();
    config.enabled = !config.enabled;
    await saveConfig(config);
    render(config.enabled);
});

settingsBtn?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings/settings.html') });
    window.close();
});
