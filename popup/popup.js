const btn = document.getElementById('toggle-switch');
const status = document.getElementById('status');

function updateUI(enabled) {
    btn.textContent = enabled ? 'Disable' : 'Enable';
    status.textContent = enabled ? 'Categorizer is ON' : 'Categorizer is OFF';
    status.style.color = enabled ? '#319795' : '#f27843';
}

chrome.storage.sync.get({ categorizerEnabled: true }, (data) => {
    console.log('[Popup] init toggle button clicked');
    updateUI(data.categorizerEnabled);
});

btn.addEventListener('click', () => {
    console.log('[Popup] toggle button clicked 2');
    chrome.storage.sync.get({ categorizerEnabled: true }, (data) => {
        const newValue = !data.categorizerEnabled;
        chrome.storage.sync.set({ categorizerEnabled: newValue }, () => {
            updateUI(newValue);
        });
    });
});
