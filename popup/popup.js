const status = document.getElementById('status');
const switchBtn = document.getElementById('toggle-switch');
const settingsBtn = document.getElementById('settings-btn');

function updateUI(enabled) {
    switchBtn.textContent = enabled ? 'Disable' : 'Enable';
    status.textContent = enabled ? 'Categorizer is ON' : 'Categorizer is OFF';
    status.style.color = enabled ? '#319795' : '#f27843';
}

chrome.storage.local.get(['globalEnabled'], (result) => {
    const currentEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
    updateUI(currentEnabled);
});

switchBtn.addEventListener('click', () => {
    chrome.storage.local.get(['globalEnabled'], (result) => {
        const currentEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
        const newEnabled = !currentEnabled;
        
        chrome.storage.local.set({ globalEnabled: newEnabled }, () => {
            updateUI(newEnabled);
        });
    });
});

settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({url: chrome.runtime.getURL('settings/settings.html')});
    window.close();
});
