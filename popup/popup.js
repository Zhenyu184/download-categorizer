import { loadConfig, saveConfig } from '../src/config.js';

const statusEl = document.getElementById('status');
const switchBtn = document.getElementById('toggle-switch');
const settingsBtn = document.getElementById('settings-btn');

function render(enabled) {
    switchBtn.textContent = enabled ? 'Disable Categorizer' : 'Enable Categorizer';
    statusEl.textContent = enabled ? 'Categorizer is ON' : 'Categorizer is OFF';
    statusEl.style.color = enabled ? '#319795' : '#f27843';
}

render((await loadConfig()).enabled);

switchBtn.addEventListener('click', async () => {
    const config = await loadConfig();
    config.enabled = !config.enabled;
    await saveConfig(config);
    render(config.enabled);
});

settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings/settings.html') });
    window.close();
});
